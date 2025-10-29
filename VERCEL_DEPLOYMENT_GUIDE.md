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

## 🔧 Vercel Configuration (Optional)

Your project already has `vercel.json` configured with:
- Root directory: `frontend`
- Build output: `dist`
- SPA routing rewrites
- Security headers

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Verify site loads at your Vercel URL
- [ ] Connect Polkadot.js wallet extension
- [ ] Switch wallet to Rococo Contracts network
- [ ] Test campaign creation
- [ ] Test donation flow
- [ ] Test wallet connection/disconnection
- [ ] Check responsive design on mobile
- [ ] Verify dark theme loads correctly

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
