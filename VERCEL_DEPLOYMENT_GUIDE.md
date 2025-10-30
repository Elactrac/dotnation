# DotNation - Vercel Deployment Guide

## ✅ Prerequisites Complete

Your code has been pushed to GitHub: `Elactrac/dotnation` (commit `898100e`)

## 🚀 Vercel Deployment Steps

### Step 1: Connect GitHub to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### Step 2: Import Your Project

1. Click "Add New..." → "Project"
2. Find `Elactrac/dotnation` in the repository list
3. Click "Import"

### Step 3: Configure Build Settings

Vercel should auto-detect the framework, but verify these settings:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Add Environment Variables

⚠️ **IMPORTANT**: Add these environment variables in Vercel dashboard:

#### Required Variables (for Testnet):
```bash
# Rococo Contracts Testnet
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=<YOUR_CONTRACT_ADDRESS_HERE>
```

#### Backend Configuration (Required for AI/Captcha features):
```bash
# Gemini Backend API
VITE_BACKEND_URL=<your_backend_url>
VITE_BACKEND_API_KEY=<your_secure_api_key>
```

#### Optional Variables:
```bash
# Sentry Error Tracking (optional)
VITE_SENTRY_DSN=<your_sentry_dsn>

# App Version
VITE_APP_VERSION=1.0.0-testnet
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://<your-project>.vercel.app`

---

## 📋 Before You Deploy - Smart Contract Required

### Deploy Smart Contract First

Your frontend needs a deployed smart contract to work. Follow these steps:

#### 1. Get Testnet Tokens
- Join Polkadot Discord: https://discord.gg/polkadot
- Go to #rococo-faucet channel
- Request ROC tokens with your address

#### 2. Deploy Contract via Polkadot.js Apps
1. Go to: https://polkadot.js.org/apps/?rpc=wss://rococo-contracts-rpc.polkadot.io
2. Navigate: Developer → Contracts → "Upload & deploy code"
3. Upload file: `donation_platform/target/ink/donation_platform.contract` (52KB)
4. Set endowment: 1 ROC
5. Constructor: `new()` (no parameters)
6. Sign and deploy

#### 3. Save Contract Address
Copy the deployed contract address (e.g., `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`)

#### 4. Add to Vercel
Go to Vercel Project Settings → Environment Variables:
```
VITE_CONTRACT_ADDRESS=<paste_your_contract_address>
```

#### 5. Redeploy
Go to Deployments tab → Click "..." on latest deployment → "Redeploy"

---

## 🔧 Backend Deployment (Required for AI/Captcha Features)

### Overview

DotNation includes an optional backend server for AI-powered campaign generation and captcha verification. This backend must be deployed separately from the frontend.

### Backend Features
- AI campaign content generation (via Google Gemini)
- Fraud detection for campaigns
- Multiple captcha types (image, slider, pattern)
- Rate limiting and authentication

### Quick FREE Deployment (Perfect for Hackathons!)

#### Step 1: Deploy Backend on Render (FREE Tier)

1. **Create Render Account**: https://render.com (no credit card required)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Elactrac/dotnation`
4. **Configure Service**:
   - Name: `dotnation-backend`
   - Root Directory: `gemini-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - **Instance Type**: **Free** ⭐

5. **Add Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=3001
   BACKEND_API_KEY=<generate_secure_random_key>
   GEMINI_API_KEY=<your_google_gemini_api_key>
   REDIS_URL=<get_from_upstash_below>
   ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
   ```

6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment
8. **Copy your backend URL**: e.g., `https://dotnation-backend.onrender.com`

**⚠️ Render Free Tier Notes**:
- Spins down after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Perfect for hackathons and demos!

#### Step 2: Setup Free Redis with Upstash

1. **Create Upstash Account**: https://upstash.com (no credit card required)
2. Click **"Create Database"**
3. Configure:
   - Name: `dotnation-redis`
   - Type: **Regional** (cheaper)
   - Region: Choose closest to your Render region
   - TLS: ✅ Enabled
4. Click **"Create"**
5. **Copy Connection URL**:
   - Go to your database → "Details" tab
   - Copy the **Redis URL** (looks like: `rediss://default:xxx@us1-xxx.upstash.io:6379`)
6. **Add to Render**:
   - Go back to Render dashboard
   - Your backend service → "Environment"
   - Update `REDIS_URL` with Upstash URL
   - Click "Save Changes" (will trigger redeploy)

**✅ Upstash Free Tier**:
- 10,000 commands/day (more than enough!)
- 256MB storage
- Persistent data
- TLS encryption included

#### Alternative: Railway ($5/month - if you prefer)

If you prefer Railway (easier but paid):
1. Create Railway account: https://railway.app
2. Deploy from GitHub with `gemini-backend` root directory
3. Add Redis plugin (automatic configuration)
4. Add environment variables
5. Railway auto-deploys on git push

**Cost**: $5/month (backend + Redis included)

#### Step 3: Get Google Gemini API Key (100% FREE)

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click **"Create API Key"**
4. Copy the key and add to Render environment variables
5. **Cost**: **FREE forever** - 15 requests/minute (perfect for hackathons!)

**No credit card required for Gemini API!**

#### Step 4: Generate Backend API Key

Create a secure random key for API authentication:

```bash
# Generate a secure 32-character key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output: `a1b2c3d4e5f6...` (use this for both backend and frontend)

**⚠️ Important**: Use the SAME key for:
- Backend: `BACKEND_API_KEY` in Render
- Frontend: `VITE_BACKEND_API_KEY` in Vercel

#### Step 5: Connect Frontend to Backend in Vercel

After deploying your backend to Render:

1. Go to **Vercel Project** → **Settings** → **Environment Variables**
2. Add these two variables:
   ```
   VITE_BACKEND_URL=https://dotnation-backend.onrender.com
   VITE_BACKEND_API_KEY=<same_key_from_step_4>
   ```
3. **⚠️ Critical**: `VITE_BACKEND_API_KEY` must match `BACKEND_API_KEY` in Render!
4. Click **"Save"**
5. Go to **Deployments** tab → Click **"..."** → **"Redeploy"**
6. Wait 2-3 minutes for redeployment

#### Step 6: Test Your Backend

After deployment, test these endpoints:

```bash
# Health check (no auth required)
curl https://dotnation-backend.onrender.com/health

# Generate captcha (requires API key)
curl -X POST https://dotnation-backend.onrender.com/api/captcha/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{"type":"image"}'
```

**Expected responses**:
- Health check: `{"status":"healthy","redis":"connected","uptime":123,...}`
- Captcha: `{"id":"abc123","question":"Select all images with...","options":[...]}`

**⚠️ First Request**: If backend was sleeping (Render free tier), first request may take 30-60 seconds. Subsequent requests are instant!

### Backend Troubleshooting

**"API key missing" error**:
- Verify `VITE_BACKEND_API_KEY` is set in Vercel
- Ensure it matches `BACKEND_API_KEY` in backend
- Redeploy frontend after adding variables

**"Redis connection failed"**:
- Verify Upstash Redis URL is correct in Render
- Check URL format: `rediss://...` (with double 's' for TLS)
- Test Upstash: Click "Connect" button in Upstash dashboard
- Backend will fall back to in-memory storage if Redis unavailable (okay for demos)

**"Invalid Gemini API key"**:
- Get new key from: https://aistudio.google.com/app/apikey
- Verify key has no extra spaces/newlines
- Check API key quotas in Google AI Studio

**CORS errors**:
- Add your Vercel domain to `ALLOWED_ORIGINS` in Render
- Format: `https://your-app.vercel.app` (no trailing slash)
- Redeploy backend from Render dashboard

**Backend is slow/timing out**:
- First request wakes up sleeping service (Render free tier)
- This is normal! Takes 30-60 seconds for first request
- Subsequent requests are fast (~100-200ms)
- For hackathon demos, make a test request 1-2 minutes before presenting

---

### 💰 Cost Breakdown (100% FREE for Hackathons!)

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Vercel** (Frontend) | Free | **$0** | 100GB bandwidth/mo |
| **Render** (Backend) | Free | **$0** | Sleeps after 15min inactivity |
| **Upstash** (Redis) | Free | **$0** | 10K commands/day |
| **Gemini API** | Free | **$0** | 15 requests/minute |
| **Rococo Testnet** | Testnet | **$0** | Free test tokens |
| | | |
| **TOTAL** | | **$0/month** | Perfect for hackathons! 🎉 |

**✅ No credit card required for any service!**

**Limitations (acceptable for hackathons)**:
- Backend sleeps after 15min → First request takes 30-60s to wake
- 10K Redis commands/day → ~400 commands/hour (more than enough)
- 15 Gemini requests/min → ~21,600 AI generations/day

**For production after hackathon**: Upgrade to Railway ($5/mo) or Render paid ($7/mo)

---

## 🔧 Vercel Configuration (Optional)

Your project already has `vercel.json` configured with:
- Root directory: `frontend`
- Build output: `dist`
- SPA routing rewrites
- Security headers

---

## ✅ Post-Deployment Checklist

After deployment:

### Frontend Tests
- [ ] Verify site loads at your Vercel URL
- [ ] Connect Polkadot.js wallet extension
- [ ] Switch wallet to Rococo Contracts network
- [ ] Test campaign creation
- [ ] Test donation flow
- [ ] Test wallet connection/disconnection
- [ ] Check responsive design on mobile
- [ ] Verify dark theme loads correctly

### Backend Tests (if deployed)
- [ ] Backend health check returns 200 OK
- [ ] AI campaign generation works
- [ ] Captcha generation/verification works
- [ ] Rate limiting prevents abuse
- [ ] Error logging captures issues

---

## 🎯 Testing on Testnet

1. **Get Testnet Tokens**: Discord #rococo-faucet
2. **Create Campaign**: Test the full flow
3. **Donate**: From a different account
4. **Withdraw**: After goal is reached or deadline passes
5. **Monitor**: Check Sentry for errors (if configured)

---

## 🔗 Useful Links

- **Polkadot.js Apps**: https://polkadot.js.org/apps/
- **Rococo Contracts Explorer**: https://polkadot.js.org/apps/?rpc=wss://rococo-contracts-rpc.polkadot.io#/explorer
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Discord Faucet**: https://discord.gg/polkadot (#rococo-faucet)
- **Render Dashboard**: https://dashboard.render.com
- **Upstash Console**: https://console.upstash.com
- **Google Gemini API**: https://aistudio.google.com/app/apikey

---

## 🐛 Troubleshooting

### "Contract not loaded" Error
- Verify `VITE_CONTRACT_ADDRESS` is set in Vercel
- Redeploy after adding environment variables
- Check contract is deployed on correct network

### Wallet Connection Issues
- Ensure Polkadot.js extension is installed
- Switch extension network to "Rococo Contracts"
- Refresh page after switching networks

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Root directory should be `frontend`

### Bundle Size Warning
- This is expected (1.6MB main chunk)
- Can be optimized later with code splitting
- Does not block deployment

---

## 📊 Deployment Summary

**Repository**: https://github.com/Elactrac/dotnation
**Latest Commit**: `898100e` - Blue theme + tests + deployment checklist
**Build Command**: `npm run build`
**Framework**: Vite 5.1 + React 18.2
**Smart Contract**: ink! 5.0.2 (ready to deploy)
**Target Network**: Rococo Contracts (testnet)

---

## 🎉 Next Steps

1. **Deploy Now**: Follow Step 1-5 above
2. **Deploy Contract**: See "Before You Deploy" section
3. **Test**: Complete post-deployment checklist
4. **Share**: Get feedback from the community
5. **Monitor**: Check Sentry for issues
6. **Iterate**: Fix bugs, add features
7. **Mainnet**: When ready, deploy to Astar or Shiden

---

## 💡 Pro Tips

- Set up Vercel Preview Deployments for branches
- Configure Vercel Production/Preview environment variables separately
- Use Vercel Analytics to track user engagement
- Enable automatic deployments on git push
- Set up a custom domain (free with Vercel)

**Good luck with your deployment! 🚀**
