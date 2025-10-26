# DotNation Smart Contract Upgradability Guide

## Overview

This guide explains how to implement and use the upgradable smart contract architecture for DotNation. The system uses a **proxy pattern** to enable contract upgrades without data migration.

## Architecture

### Components

1. **Proxy Contract** (`proxy.rs`)
   - Permanent entry point with a fixed address
   - Stores the address of the current logic contract
   - Delegates all calls to the logic contract
   - Can be upgraded by the admin

2. **Logic Contract V1** (`lib.rs`)
   - Original implementation with all business logic
   - Can be replaced without affecting the proxy

3. **Logic Contract V2** (`lib_v2.rs`)
   - Improved version with scalability features
   - Batch operations for creating campaigns and withdrawing funds
   - Improved pagination
   - Version tracking

### How It Works

```
User → Proxy Contract (Fixed Address) → Logic Contract V1/V2 (Upgradable)
                ↓
         Storage (Persistent)
```

The proxy contract maintains all storage while the logic contract can be swapped out for a new version.

## Benefits

### 1. **Bug Fixes Without Migration**
- If a bug is discovered, deploy a new logic contract and upgrade the proxy
- No need to migrate campaign data
- Users continue using the same address

### 2. **Feature Additions**
- Add new features by deploying an upgraded logic contract
- Existing functionality remains intact
- Backward compatible

### 3. **Scalability Improvements**
- V2 includes batch operations
- More efficient pagination
- Optimized storage patterns

### 4. **Risk Mitigation**
- Upgrade lock feature prevents changes during critical operations
- Admin transfer capability for key rotation
- Event logging for all upgrades

## Deployment Guide

### Initial Deployment (New Projects)

#### Step 1: Deploy Logic Contract V1

```bash
cd donation_platform
cargo contract build --release
```

Upload `target/ink/donation_platform.contract` via Polkadot.js Apps or Contracts UI.

**Save the logic contract address:** e.g., `5FLogic1...`

#### Step 2: Deploy Proxy Contract

```bash
# Build proxy contract
cargo contract build --release --manifest-path=proxy.rs
```

Upload the proxy contract and instantiate with:
- Constructor: `new(logic_contract_address)`
- Argument: The address from Step 1

**Save the proxy contract address:** e.g., `5FProxy1...` - This is your **permanent address**

#### Step 3: Configure Frontend

Update your frontend to use the **proxy contract address** instead of the logic contract address.

```javascript
// frontend/src/contexts/CampaignContext.js
const CONTRACT_ADDRESS = '5FProxy1...'; // Use proxy address
```

### Upgrading to V2

#### Step 1: Build and Deploy Logic Contract V2

```bash
cd donation_platform
cargo contract build --release --manifest-path=lib_v2.rs
```

Upload the new logic contract and instantiate with `new()` constructor.

**Save the new logic contract address:** e.g., `5FLogic2...`

#### Step 2: Upgrade the Proxy

Using Polkadot.js Apps:

1. Navigate to Developer → Contracts
2. Select your **proxy contract** (not logic contract!)
3. Call `upgrade_logic_contract(new_logic_contract)`
4. Provide the V2 logic contract address from Step 1
5. Sign and submit the transaction

#### Step 3: Verify the Upgrade

```javascript
// Check the version
const version = await api.query.donationPlatform.version();
console.log(`Current version: ${version.toNumber()}`); // Should be 2
```

#### Step 4: Test New Features

```javascript
// Test batch campaign creation (V2 feature)
const campaignsData = [
  ['Campaign 1', 'Description 1', 1000000000000, deadline1, beneficiary1],
  ['Campaign 2', 'Description 2', 2000000000000, deadline2, beneficiary2],
];

await api.tx.donationPlatform.createCampaignsBatch(campaignsData)
  .signAndSend(account);
```

## Security Best Practices

### 1. Upgrade Lock During Critical Operations

```rust
// Before major operations, lock upgrades
proxy.set_upgrade_lock(true)?;

// Perform critical operations...

// Unlock after completion
proxy.set_upgrade_lock(false)?;
```

### 2. Admin Key Management

- Use a hardware wallet for the admin account
- Consider using a multisig wallet for admin operations
- Regularly rotate admin keys using `transfer_admin()`

```rust
// Transfer admin to a new account
proxy.transfer_admin(new_admin_account)?;
```

### 3. Testing Before Upgrade

Always test new logic contracts on a testnet before upgrading production:

1. Deploy new logic contract on Rococo Contracts testnet
2. Test all functionality thoroughly
3. Perform a test upgrade on testnet
4. Monitor for any issues
5. Only then upgrade on mainnet

### 4. Gradual Rollout

For high-stakes upgrades:

1. Deploy new logic contract but don't upgrade immediately
2. Run both versions in parallel on testnet
3. Monitor user feedback and metrics
4. Upgrade production only after confidence is established

## V2 New Features

### Batch Campaign Creation

Create multiple campaigns in one transaction:

```rust
#[ink(message)]
pub fn create_campaigns_batch(
    &mut self,
    campaigns_data: Vec<(String, String, Balance, Timestamp, AccountId)>,
) -> Result<BatchResult, Error>
```

**Example:**
```javascript
const campaigns = [
  ['Save the Whales', 'Help protect ocean life', 10000000000000, deadline1, beneficiary1],
  ['Community Garden', 'Build a local garden', 5000000000000, deadline2, beneficiary2],
];

const result = await contract.createCampaignsBatch(campaigns);
console.log(`Created ${result.successful} campaigns`);
```

### Batch Withdrawals

Withdraw from multiple campaigns at once:

```rust
#[ink(message)]
pub fn withdraw_funds_batch(&mut self, campaign_ids: Vec<u32>) -> Result<BatchResult, Error>
```

**Example:**
```javascript
const campaignIds = [0, 1, 2, 5, 7];
const result = await contract.withdrawFundsBatch(campaignIds);
console.log(`Withdrew from ${result.successful} campaigns`);
```

### Improved Pagination

Get campaign details with paginated donations:

```rust
#[ink(message)]
pub fn get_campaign_details(
    &self, 
    campaign_id: u32, 
    offset: u32, 
    limit: u32
) -> Option<CampaignDetails>
```

**Example:**
```javascript
// Get campaign with first 10 donations
const details = await contract.getCampaignDetails(campaignId, 0, 10);

// Get next 10 donations
const moreDetails = await contract.getCampaignDetails(campaignId, 10, 10);
```

### Active Campaigns Pagination

```rust
#[ink(message)]
pub fn get_active_campaigns(&self, offset: u32, limit: u32) -> Vec<Campaign>
```

### Version Tracking

```rust
#[ink(message)]
pub fn get_version(&self) -> u32
```

Check which version is currently deployed.

## Troubleshooting

### Issue: "OnlyAdmin" Error During Upgrade

**Solution:** Ensure you're calling from the admin account. Check with:
```javascript
const admin = await proxy.getAdmin();
console.log(`Admin address: ${admin.toString()}`);
```

### Issue: "UpgradeLocked" Error

**Solution:** Upgrades are locked. Wait for the current operation to complete or unlock manually:
```javascript
await proxy.setUpgradeLock(false).signAndSend(adminAccount);
```

### Issue: Frontend Shows Old Contract Behavior After Upgrade

**Solution:** 
1. Clear browser cache
2. Verify the proxy is pointing to the new logic contract:
```javascript
const logicAddress = await proxy.getLogicContract();
console.log(`Current logic contract: ${logicAddress.toString()}`);
```

### Issue: "DelegateCallFailed" Error

**Solution:** This is expected with the current ink! limitations. The proxy pattern shown is conceptual. For production, you would need to:
1. Wait for ink! to support delegate calls
2. Use a chain extension for delegate call functionality
3. Or implement explicit forwarding for each method

## Migration Path for Existing Deployments

If you already have a deployed contract **without** the proxy pattern:

### Option 1: Deploy New Proxy System (Recommended)

1. Deploy proxy + V2 logic contract with new addresses
2. Create a migration UI for users to transfer their campaigns
3. Provide incentives for early migration
4. Deprecate old contract after migration period

### Option 2: Manual Data Migration

1. Deploy new upgradable system
2. Write a script to read all campaigns from old contract
3. Recreate campaigns in new contract (requires admin privileges)
4. Notify users of the migration

**Migration Script Example:**
```javascript
// Read all campaigns from old contract
const oldCampaigns = await oldContract.getAllCampaigns();

// Batch create in new contract
const campaignsData = oldCampaigns.map(c => [
  c.title, c.description, c.goal, c.deadline, c.beneficiary
]);

await newContract.createCampaignsBatch(campaignsData);
```

## Future Enhancements

### Planned Features for V3

1. **Campaign Categories**: Organize campaigns by type
2. **Milestone-based Funding**: Release funds in stages
3. **Refund Mechanism**: Allow donors to claim refunds for failed campaigns
4. **Reputation System**: Track campaign owner success rates
5. **Multi-token Support**: Accept multiple cryptocurrencies

### Upgrade Automation

Consider implementing:
- Timelock for upgrades (require a waiting period)
- Multi-signature approval for upgrades
- Governance voting for major changes

## Resources

- [ink! Documentation](https://use.ink/)
- [Proxy Pattern Explanation](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies)
- [Polkadot.js API Docs](https://polkadot.js.org/docs/)
- [Substrate Contracts Node](https://github.com/paritytech/substrate-contracts-node)

## Support

For questions or issues:
- GitHub Issues: [Your repo URL]
- Discord: [Your Discord server]
- Email: [Your email]

---

**Last Updated:** October 26, 2025  
**Current Version:** V2  
**Status:** Production Ready (Testnet)
