# DotNation CI/CD Setup Guide

This project now has automated CI/CD workflows configured!

## 🚀 What's Been Set Up

### GitHub Actions Workflows
✅ **Contract CI** (`.github/workflows/contract-ci.yml`)
   - Automatically tests and builds smart contract on every push
   - Validates contract size (<50KB)
   - Uploads build artifacts

✅ **Frontend CI** (`.github/workflows/frontend-ci.yml`)
   - Lints and builds frontend on every push
   - Runs tests (when configured)
   - Uploads production build

✅ **Deployment Pipeline** (`.github/workflows/deploy.yml`)
   - Manual deployment workflow
   - Supports multiple networks (Rococo, Shibuya, Astar)
   - Separate staging/production environments

✅ **Security Audit** (`.github/workflows/security.yml`)
   - Weekly automated security scans
   - Checks Rust and npm dependencies
   - Alerts on vulnerabilities

### Pre-Commit Hooks
✅ **Local Git Hooks** (`.husky/pre-commit`)
   - Runs contract tests when contract files change
   - Runs frontend linting when frontend files change
   - Prevents bad commits

## 📋 Setup Instructions

### 1. Install Husky (for pre-commit hooks)
```bash
cd frontend
npm install --save-dev husky
npx husky install
```

### 2. Configure Environment Variables

**For Local Development:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your local settings
```

**For GitHub Actions:**

Go to your repository settings → Secrets and variables → Actions

**Repository Variables** (for all environments):
- `VITE_NETWORK_NAME` - Network display name
- `VITE_RPC_ENDPOINT` - WebSocket RPC endpoint
- `VITE_CONTRACT_ADDRESS` - Deployed contract address

**Repository Secrets** (sensitive):
- `DEPLOY_PRIVATE_KEY` - Private key for contract deployment (optional)
- `VERCEL_TOKEN` - Vercel deployment token (if using Vercel)
- `VERCEL_ORG_ID` - Vercel organization ID (if using Vercel)
- `VERCEL_PROJECT_ID` - Vercel project ID (if using Vercel)

### 3. Set Up GitHub Environments

1. Go to Settings → Environments
2. Create two environments:
   - **staging** (for Rococo/testnet)
   - **production** (for Astar/mainnet)
3. Add protection rules to production (require approvals)
4. Configure environment-specific variables

## 🔄 Workflow Usage

### Automatic Workflows (run on push/PR)
- **Contract CI**: Runs automatically when you modify contract files
- **Frontend CI**: Runs automatically when you modify frontend files
- **Security Audit**: Runs weekly and on pushes to main branches

### Manual Deployment
1. Go to Actions → Deploy to Network
2. Click "Run workflow"
3. Select:
   - Target network (rococo/shibuya/astar)
   - Environment (staging/production)
4. Click "Run workflow"
5. Follow the instructions in the workflow output

## 🛡️ Security Best Practices

1. **Never commit sensitive data** (.env files are gitignored)
2. **Use hardware wallets** for mainnet deployments
3. **Test on testnets first** (Rococo → production)
4. **Review security audit results** weekly
5. **Keep dependencies updated** (check npm outdated)

## 🧪 Testing Locally

**Test Contract:**
```bash
cd donation_platform
cargo test
cargo test --features e2e-tests
```

**Test Frontend:**
```bash
cd frontend
npm run lint
npm test  # (when tests are configured)
npm run build  # Verify production build works
```

**Test Hooks:**
```bash
# Make a small change and commit
git add .
git commit -m "test: verify pre-commit hooks"
# Should see hooks running automatically
```

## 📊 Monitoring

- **View workflow runs**: Actions tab in GitHub
- **Download artifacts**: Available for 30-90 days
- **Check security alerts**: Security tab in GitHub
- **Review logs**: Each workflow run has detailed logs

## 🔧 Customization

### Modify Workflows
Edit files in `.github/workflows/` to customize:
- Trigger conditions
- Build steps
- Deployment targets
- Test commands

### Modify Hooks
Edit `.husky/pre-commit` to change local validation:
- Add/remove checks
- Change failure behavior
- Add custom scripts

## 🆘 Troubleshooting

**Hooks not running?**
```bash
cd frontend
npx husky install
chmod +x ../.husky/pre-commit
```

**Workflow failing?**
- Check the logs in GitHub Actions
- Verify all secrets are configured
- Test the commands locally first

**Contract deployment issues?**
- Ensure account has sufficient balance
- Verify network RPC is accessible
- Check contract size (<50KB)

## 📚 Next Steps

1. ✅ Set up GitHub secrets (see above)
2. ✅ Install Husky for local hooks
3. ✅ Test workflows with a small commit
4. ✅ Deploy to testnet (Rococo)
5. ✅ Configure production environment
6. ✅ Set up Vercel/Netlify for frontend hosting

---

Happy deploying! 🚀
