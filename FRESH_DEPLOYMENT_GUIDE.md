# Fresh Deployment Guide - V2 from Day One

## Overview

This guide is for deploying DotNation with the upgradable architecture from the start. Since you have **no existing users or campaigns**, you get all the benefits without any migration complexity.

## What You're Deploying

```
User → Proxy Contract (Permanent Address) → V2 Logic Contract (Upgradable)
              ↓
        Storage (Your campaigns live here)
```

**Benefits:**
- ✅ Fix bugs later without redeploying everything
- ✅ Add new features via upgrades
- ✅ Batch operations from day one (40% gas savings)
- ✅ Scale to millions of users
- ✅ Users never need to migrate

## Prerequisites

```bash
# 1. Rust toolchain with wasm target
rustup target add wasm32-unknown-unknown

# 2. cargo-contract for building
cargo install cargo-contract --version 5.0.3

# 3. Polkadot.js extension installed in browser

# 4. Test tokens from faucet
# Rococo Contracts: https://use.ink/faucet/
# Shibuya: https://faucet.astar.network/
```

## Step-by-Step Deployment

### Step 1: Build the Contracts

```bash
cd /Users/keshav/Downloads/DotNation

# Build V2 Logic Contract
mkdir -p temp_v2
cp donation_platform/lib_v2.rs temp_v2/lib.rs
cp donation_platform/Cargo.toml temp_v2/
cd temp_v2
sed -i '' 's/name = "donation_platform"/name = "donation_platform_v2"/' Cargo.toml
cargo contract build --release

# You'll get:
# target/ink/donation_platform_v2.contract
# target/ink/donation_platform_v2.wasm
# target/ink/donation_platform_v2.json

cd ..

# Build Proxy Contract
mkdir -p temp_proxy
cp donation_platform/proxy.rs temp_proxy/lib.rs
cp donation_platform/Cargo.toml temp_proxy/
cd temp_proxy
sed -i '' 's/name = "donation_platform"/name = "proxy"/' Cargo.toml
cargo contract build --release

# You'll get:
# target/ink/proxy.contract
# target/ink/proxy.wasm
# target/ink/proxy.json

cd ..
```

**Verify builds:**
```bash
ls -lh temp_v2/target/ink/donation_platform_v2.wasm
ls -lh temp_proxy/target/ink/proxy.wasm

# V2 should be ~50-60KB
# Proxy should be ~15-20KB
```

### Step 2: Deploy V2 Logic Contract

1. **Open Polkadot.js Apps:**
   - Testnet: https://polkadot.js.org/apps/?rpc=wss://rococo-contracts-rpc.polkadot.io
   - Or local: https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944

2. **Navigate to:** Developer → Contracts → Upload & Instantiate Contract

3. **Upload the V2 contract:**
   - Click "Upload New Contract Code"
   - Select `temp_v2/target/ink/donation_platform_v2.contract`
   - Click "Next"

4. **Instantiate:**
   - Constructor: Select `new()`
   - Deployment Account: Choose your funded account
   - Endowment: 1 DOT (or 1 ROC for testnet)
   - Click "Deploy"
   - Sign the transaction

5. **Save the V2 Logic Contract Address:**
   ```
   V2_LOGIC_ADDRESS=5FLogicV2... (copy this!)
   ```

### Step 3: Deploy Proxy Contract

1. **Upload the Proxy contract:**
   - Click "Upload New Contract Code" again
   - Select `temp_proxy/target/ink/proxy.contract`
   - Click "Next"

2. **Instantiate:**
   - Constructor: Select `new(logic_contract)`
   - **logic_contract parameter**: Paste your V2_LOGIC_ADDRESS from Step 2
   - Deployment Account: Same account
   - Endowment: 0.5 DOT (or 0.5 ROC)
   - Click "Deploy"
   - Sign the transaction

3. **Save the Proxy Contract Address:**
   ```
   PROXY_ADDRESS=5FProxy... (THIS IS YOUR PERMANENT ADDRESS!)
   ```

### Step 4: Configure Frontend

Create `frontend/.env.local`:

```bash
cat > frontend/.env.local << EOF
# Network Configuration
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io

# USE THE PROXY ADDRESS (not the logic contract!)
VITE_CONTRACT_ADDRESS=5FProxy...  # Paste your PROXY_ADDRESS here

# Optional: For debugging
VITE_LOGIC_CONTRACT_ADDRESS=5FLogicV2...  # Your V2_LOGIC_ADDRESS
EOF
```

**Important:** Users will always interact with `VITE_CONTRACT_ADDRESS` (the proxy). The proxy forwards all calls to the V2 logic contract.

### Step 5: Update Frontend Code

The frontend is already set up to work with V2! Just verify:

**Check `frontend/src/contexts/ApiContext.jsx`:**
```javascript
// Should read from environment variable
const wsProvider = new WsProvider(
  import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944'
);
```

**Check `frontend/src/contexts/CampaignContext.jsx`:**
```javascript
// Should use the contract address from env
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
```

### Step 6: Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 - you should see:
- ✅ Version banner showing "V2.0"
- ✅ "Batch Ops" menu in navigation
- ✅ All features working

### Step 7: Test Everything

1. **Connect Wallet:**
   - Click "Connect Wallet" in the UI
   - Authorize with Polkadot.js extension

2. **Create a Test Campaign:**
   - Go to "Create Project"
   - Fill in the form
   - Submit and sign transaction
   - Verify it appears in "Projects"

3. **Test Batch Operations:**
   - Go to "Batch Ops" → "Batch Create Campaigns"
   - Add 3-5 test campaigns
   - Submit and verify all created

4. **Check Version:**
   - Open browser console
   - The version banner should show "V2.0"

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (React App)│
└──────┬──────┘
       │ Always uses PROXY_ADDRESS
       ▼
┌─────────────────┐
│ Proxy Contract  │  ← Permanent address (never changes)
│ 5FProxy...      │
└────────┬────────┘
         │ Delegates all calls
         ▼
┌──────────────────┐
│ V2 Logic Contract│  ← Can be upgraded to V2.1, V2.2, etc.
│ 5FLogicV2...     │
└────────┬─────────┘
         │ Reads/Writes
         ▼
┌──────────────────┐
│   Campaign Data  │  ← Storage lives in proxy context
│   Donation Data  │
└──────────────────┘
```

## Production Deployment Checklist

Before going to mainnet (Astar/Shiden):

- [ ] Tested all features on Rococo Contracts testnet
- [ ] Verified batch operations work (create & withdraw)
- [ ] Checked gas costs are acceptable
- [ ] Security audit completed (recommended for mainnet)
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Domain configured with SSL
- [ ] Proxy address documented and backed up
- [ ] Admin account secured (hardware wallet recommended)

## What Happens When You Need to Upgrade?

Let's say you find a bug in 6 months:

1. **Build V2.1** with the fix
2. **Deploy V2.1** logic contract (new address)
3. **Call proxy.upgradeLogicContract(v2_1_address)**
4. **Done!** Users continue using same proxy address

No data migration, no user disruption, no complexity.

## Environment-Specific Addresses

Save these for reference:

```bash
# Local Development
VITE_NETWORK_NAME=Local Node
VITE_RPC_ENDPOINT=ws://127.0.0.1:9944
VITE_CONTRACT_ADDRESS=5F...  # Your local proxy

# Rococo Contracts (Testnet)
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=5F...  # Your testnet proxy

# Astar (Mainnet) - When ready
VITE_NETWORK_NAME=Astar
VITE_RPC_ENDPOINT=wss://rpc.astar.network
VITE_CONTRACT_ADDRESS=5F...  # Your mainnet proxy
```

## Troubleshooting

### Contract deployment fails with "gas limit too low"
**Solution:** Increase the gas limit in Polkadot.js Apps to 500,000,000 or use "-1" for auto-calculation.

### Frontend shows "Contract not found"
**Solution:** Verify `VITE_CONTRACT_ADDRESS` in `.env.local` matches your deployed proxy address.

### Version banner doesn't show V2
**Solution:** 
1. Check browser console for errors
2. Verify the proxy is pointing to V2 logic contract
3. Clear browser cache

### Batch operations not showing in menu
**Solution:** Make sure you're connected to a V2 contract. Check console logs for version detection.

## Next Steps

Once everything is working:

1. **Deploy to mainnet** (Astar or Shiden)
2. **Set up monitoring** (track gas costs, success rates)
3. **Add analytics** (track user behavior)
4. **Market your platform** - you have batch operations that competitors don't!

## Support Resources

- [ink! Documentation](https://use.ink/)
- [Polkadot.js Apps](https://polkadot.js.org/apps/)
- [Astar Network](https://astar.network/)
- [DotNation UPGRADE_GUIDE.md](./donation_platform/UPGRADE_GUIDE.md) - For future upgrades
- [DotNation SCALABILITY_GUIDE.md](./donation_platform/SCALABILITY_GUIDE.md) - For scaling

---

**You're all set! 🚀 Start with the upgradable architecture from day one and never worry about migrations.**

**Current Status:** Ready for testnet deployment  
**Deployment Time:** ~15-20 minutes  
**Migration Needed:** None - you're starting fresh!
