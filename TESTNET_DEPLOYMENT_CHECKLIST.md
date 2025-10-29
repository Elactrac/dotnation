# DotNation Testnet Deployment Checklist

**Status**: ✅ Ready for testnet deployment with some configuration needed

## ✅ Completed Items

### Smart Contract
- ✅ Contract builds successfully (`donation_platform.contract` - 52KB)
- ✅ All unit tests passing (3/3 tests)
- ✅ No compilation errors (only 1 clippy warning - cosmetic)
- ✅ Contract artifacts generated:
  - `donation_platform.contract` (for deployment)
  - `donation_platform.json` (ABI metadata)
  - `donation_platform.wasm` (compiled WASM)

### Frontend
- ✅ Production build successful
- ✅ All color theme updates applied (blue theme)
- ✅ Background color fixed (#0A0B1A)
- ✅ Dependencies installed:
  - `@polkadot/api` v16.4.9
  - `@polkadot/extension-dapp` v0.62.2
  - `@polkadot/api-contract` v16.4.9
- ✅ Sentry integration configured
- ✅ Logging system ready
- ✅ Error boundaries implemented
- ✅ Environment configuration templates exist

### Code Quality
- ✅ Purple/pink color references removed
- ✅ No TypeScript/ESLint errors blocking deployment
- ✅ Responsive design implemented
- ✅ Dark theme properly applied

---

## 🔧 Required Configuration (Before Deployment)

### 1. Deploy Smart Contract to Testnet

**Recommended Testnet**: Rococo Contracts

#### Steps:
```bash
# 1. Start with the built contract
cd donation_platform
ls -la target/ink/donation_platform.contract

# 2. Deploy via Polkadot.js Apps UI
# - Go to: https://polkadot.js.org/apps/?rpc=wss://rococo-contracts-rpc.polkadot.io
# - Navigate to: Developer → Contracts → Upload & deploy code
# - Upload: target/ink/donation_platform.contract
# - Set endowment: 1 ROC (minimum)
# - Call constructor: new()
# - Sign with funded account

# 3. SAVE THE CONTRACT ADDRESS (e.g., 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY)
```

**Get Testnet Tokens**:
- Rococo: Request ROC tokens via [Polkadot Discord](https://discord.gg/polkadot) #rococo-faucet channel
- Alternative: Use Element chat faucet

### 2. Configure Frontend Environment

Create `frontend/.env.local` (for local testnet testing):
```bash
# Rococo Contracts Testnet
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE

# Optional: Sentry (for error tracking)
VITE_SENTRY_DSN=
VITE_APP_VERSION=1.0.0-testnet
```

Create `frontend/.env.production` (for production deployment):
```bash
# Copy from .env.production.example and fill in
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE
```

### 3. Test Locally with Testnet

```bash
cd frontend
npm run dev
```

- Open http://localhost:5174
- Connect Polkadot.js wallet
- Switch wallet to Rococo Contracts network
- Test creating a campaign
- Test donating to a campaign
- Test withdrawing funds (if goal reached)

---

## 🧪 Testing Checklist on Testnet

Once deployed, verify these functionalities:

### Wallet Connection
- [ ] Can connect Polkadot.js extension
- [ ] Can switch between accounts
- [ ] Wallet shows correct network (Rococo Contracts)
- [ ] Account balance displays correctly

### Campaign Creation
- [ ] Can create a new campaign
- [ ] Campaign appears in campaigns list
- [ ] Campaign details display correctly
- [ ] Owner address matches creator

### Donations
- [ ] Can donate to active campaigns
- [ ] Donation amount updates raised total
- [ ] Transaction confirms on-chain
- [ ] Donor list updates

### Withdrawals
- [ ] Owner can withdraw when goal reached
- [ ] Non-owners cannot withdraw
- [ ] Withdrawal updates campaign state
- [ ] Funds transfer correctly

### Edge Cases
- [ ] Cannot donate 0 DOT
- [ ] Cannot create campaign with 0 goal
- [ ] Cannot create campaign with past deadline
- [ ] Cannot withdraw before goal/deadline
- [ ] Campaign state transitions correctly

### UI/UX
- [ ] Dark blue background displays (#0A0B1A)
- [ ] All text readable
- [ ] Buttons work and have correct colors (blue theme)
- [ ] Loading states show properly
- [ ] Error messages display clearly
- [ ] Mobile responsive

---

## 🚀 Deployment Options

### Option A: Vercel (Recommended for Frontend)

1. **Connect GitHub repo to Vercel**
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Add environment variables** in Vercel dashboard:
   - `VITE_NETWORK_NAME`
   - `VITE_RPC_ENDPOINT`
   - `VITE_CONTRACT_ADDRESS`
4. **Deploy**: Vercel auto-deploys on git push

### Option B: Netlify

1. **Connect GitHub repo**
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. **Environment variables**: Add in Netlify dashboard
4. **Deploy**

### Option C: IPFS (Fully Decentralized)

```bash
cd frontend
npm run build
npx ipfs-deploy dist
```

---

## ⚠️ Known Issues to Monitor

1. **Bundle Size Warning**: Main chunk is 1.6MB (581KB gzipped)
   - Consider code splitting if load times are slow
   - Not blocking, but could be optimized

2. **Clippy Warning**: `new_without_default` suggestion
   - Cosmetic only, not blocking deployment
   - Can fix with: `cargo clippy --fix --lib`

3. **Sentry Initialization**: Currently active
   - Requires VITE_SENTRY_DSN to be set
   - Gracefully degrades if not configured

---

## 📋 Post-Deployment Tasks

After successful testnet deployment:

- [ ] Update README.md with testnet URL
- [ ] Document contract address in repo
- [ ] Create user guide for testnet testing
- [ ] Set up monitoring/alerts (via Sentry)
- [ ] Collect feedback from testers
- [ ] Log any bugs/issues in GitHub Issues
- [ ] Prepare mainnet deployment plan

---

## 🔗 Useful Resources

- **Polkadot.js Apps**: https://polkadot.js.org/apps/
- **Contracts UI**: https://contracts-ui.substrate.io
- **Rococo Faucet**: Discord #rococo-faucet channel
- **ink! Documentation**: https://use.ink/
- **Substrate Contracts Node**: https://github.com/paritytech/substrate-contracts-node

---

## 📝 Quick Start Command Summary

```bash
# 1. Deploy contract (via UI at polkadot.js.org)
# 2. Configure environment
cd frontend
cp .env.example .env.local
# Edit .env.local with contract address

# 3. Test locally
npm run dev

# 4. Build for production
npm run build

# 5. Deploy to Vercel/Netlify
# (via their dashboards or CLI)
```

---

## ✅ Ready to Deploy?

**YES** - Your project is ready for testnet deployment once you:
1. Deploy the smart contract to Rococo Contracts
2. Configure the contract address in `.env.local`
3. Test the app locally against testnet
4. Deploy frontend to hosting service

**Current Status**: All code is production-ready. Only configuration needed! 🎉
