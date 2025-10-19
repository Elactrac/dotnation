# GitHub Workflows Setup Checklist

Use this checklist to ensure all workflows are properly configured and ready to use.

## ✅ Initial Setup

### 1. Repository Configuration

- [ ] Repository exists on GitHub (https://github.com/Elactrac/dotnation)
- [ ] All workflow files are in `.github/workflows/` directory
- [ ] Workflows are enabled (Settings → Actions → General → "Allow all actions")

### 2. Branch Protection (Optional but Recommended)

- [ ] Go to Settings → Branches
- [ ] Add rule for `main` branch
- [ ] Enable "Require status checks to pass before merging"
- [ ] Select: Contract CI, Frontend CI, Backend CI
- [ ] Enable "Require branches to be up to date before merging"

---

## 🔐 Configure Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

### Contract & Frontend Secrets

- [ ] `VITE_RPC_ENDPOINT_rococo`
  - Value: `wss://rococo-contracts-rpc.polkadot.io`

- [ ] `VITE_RPC_ENDPOINT_shibuya`
  - Value: `wss://rpc.shibuya.astar.network`

- [ ] `VITE_RPC_ENDPOINT_astar`
  - Value: `wss://rpc.astar.network`

- [ ] `VITE_CONTRACT_ADDRESS_rococo`
  - Value: (Deploy contract first, then add address)

- [ ] `VITE_CONTRACT_ADDRESS_shibuya`
  - Value: (Deploy contract first, then add address)

- [ ] `VITE_CONTRACT_ADDRESS_astar`
  - Value: (Deploy contract first, then add address)

### Backend Secrets

- [ ] `GEMINI_API_KEY`
  - Get from: https://ai.google.dev/
  - Value: Your Gemini API key (starts with `AIzaSy...`)

---

## 🧪 Test Workflows Locally

Before pushing, test components locally to ensure workflows will pass:

### Smart Contract

```bash
cd donation_platform
cargo test
cargo test --features e2e-tests
cargo contract build --release

# Check WASM size (should be < 50KB)
ls -lh target/ink/donation_platform.wasm
```

- [ ] All tests pass
- [ ] Contract builds successfully
- [ ] WASM size is acceptable

### Frontend

```bash
cd frontend
npm install
npm run lint
npm test -- --run
npm run build

# Check bundle size
du -sh dist
```

- [ ] No lint errors
- [ ] Tests pass (or no tests configured yet)
- [ ] Build succeeds

### Gemini Backend

```bash
cd gemini-backend
npm install
npm test
npm audit
node server.js  # Ctrl+C to stop
```

- [ ] Syntax check passes
- [ ] No critical security vulnerabilities
- [ ] Server starts without errors

---

## 🚀 Deploy Contract (First Time)

### Step 1: Run Deploy Workflow

- [ ] Go to Actions tab
- [ ] Select "Deploy to Network"
- [ ] Click "Run workflow"
- [ ] Choose:
  - Branch: `main`
  - Network: `rococo` (testnet)
  - Environment: `staging`
- [ ] Click "Run workflow" button

### Step 2: Download Contract Artifact

- [ ] Wait for workflow to complete
- [ ] Click on the workflow run
- [ ] Download `contract-deployment-rococo-*` artifact
- [ ] Extract the `.contract` file

### Step 3: Deploy via Polkadot.js Apps

- [ ] Go to https://polkadot.js.org/apps/
- [ ] Connect to network: Development → Custom → `wss://rococo-contracts-rpc.polkadot.io`
- [ ] Navigate to: Developer → Contracts
- [ ] Click "Upload & deploy code"
- [ ] Upload the `donation_platform.contract` file
- [ ] Set constructor: `new` (no parameters)
- [ ] Set endowment: 1000 (1 unit)
- [ ] Click "Upload and Instantiate"
- [ ] Sign transaction with Polkadot.js extension

### Step 4: Save Contract Address

- [ ] Copy the contract address from the success message (format: `5ABC123...`)
- [ ] Go to GitHub → Settings → Secrets → Actions
- [ ] Click "New repository secret"
- [ ] Name: `VITE_CONTRACT_ADDRESS_rococo`
- [ ] Value: (paste the contract address)
- [ ] Click "Add secret"

---

## 🌐 Deploy Frontend

### Option 1: Vercel (Recommended)

- [ ] Go to https://vercel.com/
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - Framework Preset: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variables:
  - `VITE_RPC_ENDPOINT` = `wss://rococo-contracts-rpc.polkadot.io`
  - `VITE_CONTRACT_ADDRESS` = (your contract address from above)
- [ ] Click "Deploy"

### Option 2: Manual Deployment

```bash
# Run deploy workflow (if not already done)
# Download frontend-deployment artifact

# Deploy to your hosting platform
cd dist
vercel --prod
# OR
netlify deploy --prod --dir=.
```

- [ ] Frontend deployed successfully
- [ ] Test in browser
- [ ] Wallet connection works
- [ ] Contract interactions work

---

## 🤖 Deploy Gemini Backend

### Option 1: Railway (Recommended)

```bash
cd gemini-backend
npm install -g @railway/cli
railway login
railway init
railway up
```

- [ ] Set environment variable:
  ```bash
  railway variables set GEMINI_API_KEY=your_key_here
  ```
- [ ] Note the deployment URL
- [ ] Test: `curl https://your-backend.railway.app/health`

### Option 2: Render

- [ ] Go to https://render.com/
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure:
  - Name: `dotnation-backend`
  - Root Directory: `gemini-backend`
  - Build Command: `npm install`
  - Start Command: `node server.js`
- [ ] Add Environment Variable:
  - Key: `GEMINI_API_KEY`
  - Value: (your Gemini API key)
- [ ] Click "Create Web Service"

### Update Frontend with Backend URL

- [ ] Note your backend URL (e.g., `https://dotnation-backend.railway.app`)
- [ ] Update frontend `.env`:
  ```
  VITE_GEMINI_BACKEND_URL=https://your-backend-url
  ```
- [ ] Redeploy frontend

---

## ✅ Verify Everything Works

### Test CI Workflows

- [ ] Create a new branch
  ```bash
  git checkout -b test-workflows
  ```

- [ ] Make a small change to each component
  ```bash
  # Contract
  echo "// Test" >> donation_platform/lib.rs
  
  # Frontend
  echo "// Test" >> frontend/src/App.jsx
  
  # Backend
  echo "// Test" >> gemini-backend/server.js
  ```

- [ ] Commit and push
  ```bash
  git add .
  git commit -m "Test: Verify CI workflows"
  git push origin test-workflows
  ```

- [ ] Go to GitHub Actions tab
- [ ] Verify these workflows run automatically:
  - [ ] Smart Contract CI ✅
  - [ ] Frontend CI ✅
  - [ ] Gemini Backend CI ✅

### Test Pull Request Workflow

- [ ] Create PR from `test-workflows` to `main`
- [ ] Verify all CI checks run
- [ ] Verify status checks appear in PR
- [ ] Close/delete the test PR

### Test Manual Deploy Workflow

- [ ] Go to Actions tab
- [ ] Select "Deploy to Network"
- [ ] Try running with different parameters
- [ ] Verify artifacts are created

### Test Security Audit

- [ ] Go to Actions tab
- [ ] Select "Security Audit"
- [ ] Click "Run workflow" (manual trigger)
- [ ] Verify both jobs complete

---

## 📊 Add Status Badges to README

- [ ] Verify badges work in README.md:
  - [ ] ![Contract CI](https://github.com/Elactrac/dotnation/workflows/Smart%20Contract%20CI/badge.svg)
  - [ ] ![Frontend CI](https://github.com/Elactrac/dotnation/workflows/Frontend%20CI/badge.svg)
  - [ ] ![Backend CI](https://github.com/Elactrac/dotnation/workflows/Gemini%20Backend%20CI/badge.svg)
  - [ ] ![Security Audit](https://github.com/Elactrac/dotnation/workflows/Security%20Audit/badge.svg)

---

## 📝 Documentation Review

- [ ] Read `.github/WORKFLOWS.md`
- [ ] Read `gemini-backend/README.md`
- [ ] Read `WORKFLOW_IMPROVEMENTS.md`
- [ ] Understand the deployment flow
- [ ] Know where to find troubleshooting info

---

## 🔄 Regular Maintenance Tasks

### Weekly
- [ ] Review Security Audit results (runs automatically on Sundays)
- [ ] Check for any failed workflow runs
- [ ] Update dependencies if vulnerabilities found

### Monthly
- [ ] Review and update Node.js/Rust versions in workflows
- [ ] Check for outdated packages: `npm outdated`, `cargo outdated`
- [ ] Review workflow run times and optimize if needed

### Per Deployment
- [ ] Test on testnet first (Rococo/Shibuya)
- [ ] Verify contract works as expected
- [ ] Then deploy to mainnet (Astar)
- [ ] Update documentation with new addresses

---

## 🆘 Troubleshooting

If you encounter issues:

1. **Check workflow logs**
   - Go to Actions tab
   - Click on failed workflow
   - Expand failed step to see error

2. **Common issues**:
   - Missing secrets → Add them in Settings
   - Contract too large → Optimize code
   - Lint errors → Run `npm run lint` locally
   - Test failures → Run tests locally first

3. **Get help**:
   - Check `.github/WORKFLOWS.md`
   - Review component READMEs
   - Check GitHub Actions documentation

---

## 🎉 All Done!

When all items are checked:

- [ ] All workflows are configured ✅
- [ ] All secrets are added ✅
- [ ] Contract deployed to testnet ✅
- [ ] Frontend deployed ✅
- [ ] Backend deployed ✅
- [ ] Everything tested and working ✅

**Congratulations! Your CI/CD pipeline is fully operational!** 🚀

---

**Next Steps**: Start developing features and let the workflows handle testing and deployment automatically!
