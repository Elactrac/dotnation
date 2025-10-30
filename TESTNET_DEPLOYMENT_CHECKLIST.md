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
- ✅ Backend API integration complete (AI + Captcha)

### Backend
- ✅ API key authentication implemented
- ✅ Two-tier rate limiting (100 general, 10 AI per 15min)
- ✅ Redis persistence with fallback
- ✅ Winston structured logging
- ✅ Input validation on all endpoints
- ✅ Security headers (Helmet + CORS)
- ✅ Health check endpoint
- ✅ Gemini AI integration (gemini-2.0-flash-exp)
- ✅ Multiple captcha types (image, slider, pattern)
- ✅ Fraud detection system

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

# Backend API (if using AI/Captcha features)
VITE_BACKEND_URL=http://localhost:3001
VITE_BACKEND_API_KEY=dev_api_key_12345

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

# Backend API (production URL)
VITE_BACKEND_URL=https://your-backend.up.railway.app
VITE_BACKEND_API_KEY=<your_secure_production_key>
```

### 3. Configure Backend Environment (Optional but Recommended)

Create `gemini-backend/.env` (for local testing):
```bash
NODE_ENV=development
PORT=3001
BACKEND_API_KEY=dev_api_key_12345
GEMINI_API_KEY=<your_google_gemini_api_key>
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000
```

For production deployment, see **Backend Deployment** section below.

### 4. Test Locally with Testnet

#### Start Backend (Optional - for AI/Captcha features)
```bash
# Terminal 1
cd gemini-backend
npm install
npm start
# Should show: "Server running on port 3001" and "✅ Redis connected"
```

#### Start Frontend
```bash
# Terminal 2
cd frontend
npm run dev
```

#### Test Application
- Open http://localhost:5174
- Connect Polkadot.js wallet
- Switch wallet to Rococo Contracts network
- Test creating a campaign (with AI generation if backend running)
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

### Backend Features (if deployed)
- [ ] AI campaign generation works
- [ ] Captcha generation/verification works
- [ ] Rate limiting prevents abuse (10 AI req/15min)
- [ ] Health check endpoint returns 200
- [ ] Fraud detection flags suspicious campaigns

### UI/UX
- [ ] Dark blue background displays (#0A0B1A)
- [ ] All text readable
- [ ] Buttons work and have correct colors (blue theme)
- [ ] Loading states show properly
- [ ] Error messages display clearly
- [ ] Mobile responsive

---

## 🚀 Deployment Options

### Backend Deployment (Optional - Required for AI/Captcha features)

#### Why Deploy the Backend?
The backend provides:
- AI-powered campaign content generation (via Google Gemini)
- Fraud detection for campaigns
- Multiple captcha types for bot prevention
- Rate limiting and security

#### 100% FREE Backend Deployment (Perfect for Hackathons!)

**Stack**: Render (FREE) + Upstash Redis (FREE) + Gemini API (FREE) = **$0/month**

**Step 1: Deploy Backend on Render (FREE)**

1. Create account: https://render.com (no credit card!)
2. Click "New +" → "Web Service"
3. Connect GitHub: `Elactrac/dotnation`
4. Configure:
   - Root Directory: `gemini-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - **Instance Type: Free** ⭐
5. Add environment variables:
   ```bash
   NODE_ENV=production
   PORT=3001
   BACKEND_API_KEY=<generate_with_crypto.randomBytes>
   GEMINI_API_KEY=<from_google_ai_studio>
   REDIS_URL=<from_upstash_below>
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
6. Deploy (takes 3-5 minutes)
7. Copy backend URL: e.g., `https://dotnation-backend.onrender.com`

**⚠️ Render Free Tier**: Sleeps after 15min inactivity, first request takes 30-60s to wake up. Perfect for hackathon demos!

**Step 2: Setup Free Redis with Upstash**

1. Create account: https://upstash.com (no credit card!)
2. Create database:
   - Name: `dotnation-redis`
   - Type: Regional
   - Region: Closest to Render region
3. Copy Redis URL from "Details" tab
4. Add to Render environment: `REDIS_URL=rediss://...`
5. Redeploy Render service

**✅ Upstash Free Tier**: 10K commands/day, 256MB storage (more than enough!)

**Step 3: Get Gemini API Key (FREE Forever)**

1. Visit: https://aistudio.google.com/app/apikey
2. Create API Key (no credit card!)
3. Add to Render: `GEMINI_API_KEY=your_key`
4. **Free tier**: 15 requests/minute (21,600/day!)

**Step 4: Generate API Key**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use output for both:
- Render: `BACKEND_API_KEY`
- Vercel: `VITE_BACKEND_API_KEY`

**💰 Total Cost: $0/month** 🎉

---

#### Alternative: Railway ($5/month - Easier, No Sleep Mode)

If you prefer paid but simpler deployment (no sleep mode):

1. **Create Railway Account**: https://railway.app
2. **New Project** → "Deploy from GitHub"
3. **Select Repository**: `Elactrac/dotnation`
4. **Configure Service**:
   - Root Directory: `gemini-backend`
   - Start Command: `npm start`
5. **Add Redis Plugin**:
   - In Railway project → "New" → "Database" → "Redis"
   - Railway auto-configures `REDIS_URL`
6. **Add Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=3001
   BACKEND_API_KEY=<generate_secure_random_key>
   GEMINI_API_KEY=<your_google_gemini_api_key>
   ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
   ```
7. **Deploy**: Automatic on git push
8. **Copy Backend URL**: e.g., `https://your-app.up.railway.app`

**Cost: $5/month** (always-on, no sleep mode, includes Redis)

For detailed backend deployment, see `gemini-backend/README.md`

---

### Frontend Deployment

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
   - `VITE_BACKEND_URL` (if using backend)
   - `VITE_BACKEND_API_KEY` (must match backend's `BACKEND_API_KEY`)
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
- [ ] Document backend URL (if deployed)
- [ ] Create user guide for testnet testing
- [ ] Set up monitoring/alerts (via Sentry)
- [ ] Test backend health checks
- [ ] Monitor backend logs for errors
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
- **Railway Dashboard**: https://railway.app/dashboard
- **Google Gemini API**: https://aistudio.google.com/app/apikey
- **Backend Documentation**: `gemini-backend/README.md`

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
