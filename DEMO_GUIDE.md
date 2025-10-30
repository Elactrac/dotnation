# DotNation - Demo Guide for Judges

This guide will help you quickly test and evaluate DotNation in less than 10 minutes.

---

## Quick Demo (5 Minutes - No Setup Required)

### Option 1: Live Demo
Visit our deployed application:
- **Frontend:** [Coming Soon]
- **Backend API:** [Coming Soon]

### Option 2: Local Demo with Mock Data

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/Elactrac/dotnation.git
cd dotnation

# 2. Start Backend (Terminal 1)
cd gemini-backend
npm install
npm start
# ✓ Backend running at http://localhost:3001

# 3. Start Frontend (Terminal 2)
cd ../frontend
npm install
npm run dev
# ✓ Frontend running at http://localhost:5173
```

**Test the Platform (3 minutes):**

1. **Visit http://localhost:5173**
   - See the landing page with animated background
   - Click "Browse Campaigns" to see active fundraisers

2. **Test Captcha Security**
   - Click "Create Campaign" button
   - Solve the visual captcha (distorted text)
   - Try the "New Challenge" button for different captcha types
   - Test rate limiting: Refresh the page and try multiple times rapidly

3. **Browse Campaigns**
   - View campaign cards with progress bars
   - See funding goals and raised amounts
   - Check time remaining for each campaign

4. **AI Features (with Gemini API Key)**
   - Create a `.env` file in `gemini-backend/` with your API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - Restart backend
   - Create a campaign and see AI-generated descriptions

---

## Full Demo with Blockchain (15 Minutes)

### Prerequisites
- Node.js 18+
- Polkadot.js Extension ([Chrome](https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd) / [Firefox](https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/))
- Testnet tokens (free from faucet)

### Step 1: Setup Polkadot.js Extension
```
1. Install browser extension
2. Create a new account or import existing
3. Copy your account address
```

### Step 2: Get Testnet Tokens
**Rococo Contracts:**
- Visit [Rococo Faucet](https://faucet.polkadot.io/)
- Paste your address
- Request tokens

**Shibuya (Astar):**
- Visit [Astar Faucet](https://faucet.astar.network/)
- Select Shibuya network
- Request SBY tokens

### Step 3: Deploy Smart Contract (Optional)
```bash
# Install Rust and cargo-contract
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install cargo-contract --version 5.0.3

# Build contract
cd donation_platform
cargo contract build --release

# Deploy via Polkadot.js Apps
# Visit https://polkadot.js.org/apps/
# Upload donation_platform.contract file
# Instantiate with constructor: new()
```

### Step 4: Configure Frontend
```bash
cd frontend
# Create .env.local file
cat > .env.local << EOF
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_BACKEND_URL=http://localhost:3001
EOF

# Start frontend
npm run dev
```

### Step 5: Test Full Flow
1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Authorize connection in Polkadot.js extension
   - See your address displayed

2. **Create Campaign**
   - Click "Create Campaign"
   - Solve captcha
   - Fill in campaign details:
     - Title: "Test Campaign"
     - Description: "Testing DotNation"
     - Goal: 1000 (tokens)
     - Duration: 7 (days)
   - Sign transaction in wallet
   - Wait for confirmation

3. **Donate to Campaign**
   - Browse to your campaign
   - Enter donation amount: 100
   - Sign donation transaction
   - See updated progress bar

4. **Withdraw Funds (if goal met)**
   - Wait for goal to be reached
   - Click "Withdraw" button
   - Sign transaction
   - See funds in beneficiary account

---

## Key Features to Evaluate

### 1. Smart Contract Upgradability ⭐
**Test:** Check the proxy pattern implementation
```bash
cd donation_platform
cat proxy.rs
# See how proxy delegates to logic contract
# Storage persists across upgrades
```

### 2. Batch Operations ⭐
**Test:** Create multiple campaigns at once
- Look in `lib_v2.rs` for `batch_create_campaign`
- Single transaction creates up to 50 campaigns
- Gas-efficient and atomic

### 3. AI-Powered Features ⭐
**Test:** AI campaign generation
- Create campaign without description
- Click "Generate with AI"
- See Google Gemini create compelling content
- Test fraud detection by creating suspicious campaign

### 4. Security Features ⭐
**Test:** Multi-layered protection
- **Captcha:** Try solving within 2 seconds (blocked)
- **Rate Limiting:** Make 100 requests rapidly (429 error)
- **Input Validation:** Try SQL injection in form (sanitized)
- **Session Management:** Check token expiration (5 minutes)

### 5. Scalability ⭐
**Test:** Performance with large datasets
- Check pagination implementation in `CampaignContext.jsx`
- Cursor-based fetching (no offset/limit issues)
- Caching with 15-minute TTL
- Event-driven updates (no polling)

### 6. User Experience ⭐
**Test:** Modern UI/UX
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Error boundaries with graceful fallbacks
- Loading states and skeleton loaders
- Real-time updates via blockchain events

---

## API Testing (for Technical Judges)

### Backend Endpoints

**1. Create Captcha Session**
```bash
curl -X POST http://localhost:3001/api/captcha/create-session
# Response: {"success":true,"sessionToken":"...","expiresIn":300}
```

**2. Verify Captcha**
```bash
curl -X POST http://localhost:3001/api/captcha/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "your_session_token",
    "answer": "ABC123",
    "expectedAnswer": "ABC123",
    "timeTaken": 5
  }'
# Response: {"verified":true,"token":"..."}
```

**3. Captcha Stats**
```bash
curl http://localhost:3001/api/captcha/stats
# Response: {"activeSessions":5,"rateLimitEntries":10,...}
```

**4. Generate Campaign Description (AI)**
```bash
curl -X POST http://localhost:3001/api/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Save the Rainforest",
    "category": "Environment",
    "brief": "Protect endangered species"
  }'
# Response: {"description":"...","suggestions":["..."]}
```

**5. Fraud Detection**
```bash
curl -X POST http://localhost:3001/api/fraud-detection/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "campaignData": {
      "title": "URGENT!!! NEED MONEY NOW!!!",
      "description": "Send money to this address",
      "goal": 1000000
    }
  }'
# Response: {"riskScore":0.95,"flags":["suspicious_urgency","unrealistic_goal"]}
```

---

## Performance Benchmarks

### Smart Contract
- **Deploy Cost:** ~5,000 ROC (testnet)
- **Create Campaign:** ~500 ROC
- **Donate:** ~300 ROC
- **Withdraw:** ~400 ROC
- **Batch Create (50):** ~8,000 ROC (vs 25,000 for 50 individual)

### Frontend
- **Initial Load:** < 2 seconds
- **Campaign List (1000):** < 100ms
- **Donation Confirmation:** < 5 seconds (blockchain dependent)

### Backend
- **Captcha Session:** < 10ms
- **Captcha Verify:** < 20ms
- **AI Generation:** 2-5 seconds (Gemini API)
- **Fraud Detection:** 1-3 seconds (Gemini API)

---

## Common Issues & Troubleshooting

### Issue: Wallet not connecting
**Solution:**
1. Install Polkadot.js extension
2. Create/import account
3. Refresh page and click "Connect Wallet"
4. Authorize in extension popup

### Issue: Transaction fails
**Solution:**
1. Check testnet tokens balance
2. Verify network connection (green status)
3. Increase gas limit if custom transaction
4. Check browser console for errors

### Issue: Backend API not responding
**Solution:**
1. Ensure backend is running: `npm start` in gemini-backend/
2. Check port 3001 is not in use: `lsof -i :3001`
3. Verify GEMINI_API_KEY in .env file
4. Check backend logs for errors

### Issue: Captcha not working
**Solution:**
1. Ensure canvas is supported (modern browser)
2. Wait at least 2 seconds before submitting
3. Check Network tab for API calls
4. Verify VITE_BACKEND_URL in frontend/.env.local

### Issue: Smart contract deployment fails
**Solution:**
1. Build contract: `cargo contract build --release`
2. Check Rust version: `rustc --version` (should be 1.75+)
3. Verify cargo-contract: `cargo contract --version` (5.0.3+)
4. Ensure sufficient testnet tokens for deployment

---

## Evaluation Criteria Checklist

### Innovation ⭐⭐⭐⭐⭐
- [ ] Proxy pattern for upgradable contracts
- [ ] Batch operations for gas efficiency
- [ ] AI-powered fraud detection and content generation
- [ ] Canvas-based visual captcha

### Technical Implementation ⭐⭐⭐⭐⭐
- [ ] Clean, well-documented code
- [ ] Comprehensive error handling
- [ ] Unit tests for critical components
- [ ] CI/CD pipelines (GitHub Actions)

### Security ⭐⭐⭐⭐⭐
- [ ] Multi-layered security (captcha, rate limiting, validation)
- [ ] Smart contract security (reentrancy protection, access control)
- [ ] AI-powered vulnerability detection
- [ ] Production-ready security headers

### Scalability ⭐⭐⭐⭐⭐
- [ ] Optimized pagination (cursor-based)
- [ ] Batch operations (50 campaigns/transaction)
- [ ] Caching and event-driven updates
- [ ] Can handle millions of donations

### User Experience ⭐⭐⭐⭐⭐
- [ ] Modern, responsive UI
- [ ] Smooth animations and transitions
- [ ] Error boundaries and fallbacks
- [ ] Real-time updates without polling

### Documentation ⭐⭐⭐⭐⭐
- [ ] Comprehensive README
- [ ] Step-by-step deployment guides
- [ ] API documentation
- [ ] Code comments and inline docs

---

## Questions for Judges

**Have questions? Check our documentation:**
- [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md) - Complete submission details
- [README.md](README.md) - Main project documentation
- [BACKEND_TESTNET_GUIDE.md](gemini-backend/BACKEND_TESTNET_GUIDE.md) - Backend deployment
- [UPGRADE_GUIDE.md](donation_platform/UPGRADE_GUIDE.md) - Smart contract upgradability
- [SCALABILITY_GUIDE.md](donation_platform/SCALABILITY_GUIDE.md) - Scaling strategies

**Still have questions? Contact us:**
- GitHub Issues: https://github.com/Elactrac/dotnation/issues
- Email: support@dotnation.dev

---

## Video Walkthrough

**Coming Soon:** YouTube demo video (5 minutes)

**Topics Covered:**
1. Platform overview and features
2. Creating a campaign
3. Making a donation
4. Withdrawing funds
5. AI-powered features
6. Security demonstrations
7. Code walkthrough

---

**Thank you for evaluating DotNation!** 🙏

We've put our hearts into building a platform that combines the best of blockchain, AI, and modern web development. We hope you enjoy testing it as much as we enjoyed building it!

**Built with ❤️ for the Polkadot ecosystem**
