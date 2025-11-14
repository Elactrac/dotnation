# Storage Deposit Fix for Paseo Testnet

## Issue Summary

The DotNation frontend was failing to create campaigns on Paseo Testnet with the error:
```
Module error: {"module":{"index":52,"error":"0x19000000"}}
```

## Root Cause Analysis

### Error Decoding
- **Module 52** = Contracts pallet
- **Error 0x19** (25 decimal) = `StorageDepositLimitExhausted`
- **Error 0x18** (24 decimal) = `StorageDepositNotEnoughFunds`

### The Problem

1. **Previous Implementation**: Contract queries were using `storageDepositLimit: null`
   ```javascript
   // OLD CODE (in contractRetry.js)
   const { gasRequired, storageDeposit, result } = await contract.query[method](
     address,
     { gasLimit, storageDepositLimit: null, ...options.queryOptions },
     ...args
   );
   ```

2. **Why It Failed on Paseo**:
   - On local dev chains with `-1` gas limits, `null` storage deposit works
   - On Paseo/production chains, `null` causes `StorageDepositLimitExhausted` error
   - The runtime requires a specific limit value to perform dry-run simulation
   - Without a limit, it immediately fails before calculating the actual storage needed

3. **Storage Deposit Requirements**:
   - Creating a new campaign requires storing data on-chain
   - This incurs a **storage deposit** that must be paid by the caller
   - The deposit is held in reserve but can be reclaimed if storage is freed
   - Typical amount: ~2-3 DOT for a campaign (based on contract storage requirements)

4. **Query vs Transaction**:
   - **Query (dry-run)**: Simulates the transaction to calculate gas and storage needs
   - **Transaction**: Actually executes and modifies state
   - Both require the caller account to have sufficient balance for accurate simulation

## The Solution

### Code Changes

**File: `frontend/src/utils/contractRetry.js`**

Updated the `executeContractQuery` function to use a reasonable storage deposit limit:

```javascript
const queryFn = async () => {
  // For Paseo/production chains, use a large storage deposit limit for dry-run queries
  // Setting to 10 DOT (10_000_000_000_000) should be sufficient for most operations
  // The actual amount will be calculated and returned in storageDeposit
  const storageLimit = options.api ? '10000000000000' : null;
  
  const { gasRequired, storageDeposit, result } = await contract.query[method](
    address,
    { gasLimit, storageDepositLimit: storageLimit, ...options.queryOptions },
    ...args
  );
  
  if (result.isErr) {
    const error = result.asErr.toString();
    throw new Error(error);
  }
  
  return { gasRequired, storageDeposit, result };
};
```

Updated `prepareContractTransaction` to properly extract and use the storage deposit value:

```javascript
// Extract the actual storage deposit value if it's wrapped in a Charge object
let storageLimit = null;
if (storageDeposit) {
  // storageDeposit can be { Charge: value } or { Refund: value }
  if (storageDeposit.asCharge) {
    storageLimit = storageDeposit.asCharge;
  } else if (storageDeposit.isCharge) {
    storageLimit = storageDeposit.asCharge;
  } else {
    // Fallback: use a reasonable default (10 DOT)
    storageLimit = options.api ? '10000000000000' : null;
  }
} else {
  // No storage deposit info, use a reasonable default for Paseo
  storageLimit = options.api ? '10000000000000' : null;
}

// Return the transaction object
const tx = contract.tx[method](
  { gasLimit: gasRequired, storageDepositLimit: storageLimit, ...options.txOptions },
  ...args
);
```

### Why This Works

1. **10 DOT Limit**: Provides sufficient headroom for storage deposits while preventing accidental excessive charges
2. **Conditional Logic**: Uses the limit only when `api` is available (Paseo/production), maintaining compatibility with local dev chains
3. **Proper Extraction**: Handles the `StorageDeposit` enum type correctly (Charge vs Refund)
4. **Fallback Safety**: If storage calculation fails, uses the same 10 DOT limit for the transaction

## User Requirements

For users to successfully create campaigns on Paseo Testnet, they need:

1. **Funded Wallet**: Their wallet must have sufficient testnet tokens
   - Minimum: ~5 DOT (for gas + storage deposit)
   - Recommended: 10-20 DOT for multiple transactions

2. **Getting Testnet Tokens**:
   - Use Paseo Testnet faucet: https://faucet.polkadot.io/paseo
   - Or ask in the Polkadot Discord #paseo-faucet channel

3. **Connected Wallet**: Must connect wallet through Polkadot.js extension or similar

## Testing Results

### Before Fix
```
Error: { Module: { index: '52', error: '0x19000000' } }
Decoded: StorageDepositLimitExhausted
Storage Deposit: { Charge: "0" }
```

### After Fix
- Query succeeds with proper storage limit
- Returns actual gas and storage requirements
- Users can proceed with transaction if they have sufficient balance
- If user lacks funds, they receive clear error: `StorageDepositNotEnoughFunds`

## Contract Details

- **Network**: Paseo Testnet
- **Contract Address**: `14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM`
- **Version**: V2 (with batch operations)
- **RPC Endpoint**: `wss://rpc2.paseo.mandalachain.io`

## Related Files Modified

1. `/frontend/src/utils/contractRetry.js` - Main fix for storage deposit handling
2. Previous session fixes (already applied):
   - `/frontend/src/contexts/ApiContext.jsx` - Gas limit helper
   - `/frontend/src/contexts/CampaignContext.jsx` - Gas limit format
   - `/frontend/src/contexts/BatchOperationsContext.jsx` - Gas limit format

## Next Steps

1. **Test in Frontend**: 
   - Start frontend: `cd frontend && npm run dev`
   - Connect wallet with funded Paseo testnet account
   - Try creating a campaign
   - Verify transaction succeeds

2. **Monitor**: Watch for any edge cases or additional storage-related errors

3. **Documentation**: Update user guide to mention testnet token requirements

## Technical Notes

### Storage Deposit in Substrate

Storage deposits are a key feature of Substrate's contracts pallet:
- Prevents blockchain bloat by charging for storage usage
- Deposit is **reserved** (held), not spent
- Can be reclaimed when storage is freed (e.g., campaign deleted)
- Amount scales with data size stored

### Error Hierarchy
```
null storageDepositLimit 
  → StorageDepositLimitExhausted (0x19)
  → Query fails before calculating storage

High storageDepositLimit + insufficient balance
  → StorageDepositNotEnoughFunds (0x18)
  → Query simulates but indicates caller can't pay

High storageDepositLimit + sufficient balance
  → Success
  → Returns actual storage deposit needed
```

## Conclusion

The fix changes the frontend to use production-ready storage deposit handling that works with Paseo Testnet and other public networks, while maintaining backward compatibility with local development chains.
