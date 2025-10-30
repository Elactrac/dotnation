# CI/CD Setup Guide

This guide explains how to set up the GitHub Actions CI/CD pipeline with AI-powered security features.

## Prerequisites

- GitHub repository with admin access
- Google AI Studio account (for Gemini API key)

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key (it starts with `AIza...`)

## Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GEMINI_API_KEY`
5. Value: Paste your Gemini API key
6. Click **Add secret**

## Step 3: Verify CI/CD Pipeline

The CI/CD pipeline is already configured in `.github/workflows/contract-ci.yml` and will automatically:

### Security Audit Job
- Run AI-powered security audits on smart contracts
- Check for vulnerabilities (integer overflow, reentrancy, access control, etc.)
- Generate detailed security reports
- **Thresholds:**
  - Score < 50: Build fails ❌
  - Score < 70: Warning ⚠️
  - Score ≥ 70: Pass ✅

### Build Jobs
- Build both the main contract and proxy contract
- Run unit tests
- Check contract sizes
- Upload compiled artifacts

### Integration Tests
- Verify artifact integrity
- Compare V1 vs V2 contract sizes

## Step 4: Test the Pipeline

1. Make a commit to your repository:
   ```bash
   git add .
   git commit -m "feat: add AI security features"
   git push origin main
   ```

2. Go to **Actions** tab in GitHub
3. Watch the pipeline run
4. Check the **Security Audit Summary** in the job output

## What Gets Audited?

The security audit checks for:

1. **Critical Issues** (Score impact: -20 each)
   - Integer overflow/underflow
   - Reentrancy vulnerabilities
   - Access control issues
   - Unchecked external calls

2. **High Severity** (Score impact: -10 each)
   - Missing input validation
   - Improper error handling
   - State management issues

3. **Medium Severity** (Score impact: -5 each)
   - Code quality issues
   - Missing documentation
   - Gas optimization opportunities

## Fraud Detection API

The fraud detection system is available at:
- **Endpoint:** `http://localhost:3001/api/fraud-detection/analyze`
- **Method:** POST
- **Frontend Integration:** `CreateCampaignForm.jsx`

### Fraud Risk Thresholds
- **Score > 80:** Campaign blocked ❌
- **Score > 40:** Warning shown ⚠️
- **Score ≤ 40:** Approved ✅

## Troubleshooting

### Pipeline Fails with "GEMINI_API_KEY not found"
- Verify you added the secret with the exact name `GEMINI_API_KEY`
- Check the secret is in the correct repository
- Ensure you have permissions to access secrets

### Security Audit Fails
- Review the audit report in the job artifacts
- Check the security score and identified issues
- Fix critical/high severity issues in your contracts
- Re-run the pipeline

### Fraud Detection API Not Working
1. Ensure the backend is running:
   ```bash
   cd gemini-backend
   npm install
   node server.js
   ```

2. Check the `.env` file has your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3001
   ```

3. Test the endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/fraud-detection/analyze \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Campaign","description":"Test","goal":1000}'
   ```

## Security Best Practices

1. **Never commit API keys** to the repository
2. Use GitHub Secrets for sensitive data
3. Review security audit reports before deploying
4. Address high/critical issues immediately
5. Keep fraud detection thresholds strict (>80 = block)

## Additional Resources

- [Security Features Documentation](./SECURITY_FEATURES.md)
- [Contract Audit Reports](./gemini-backend/README.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Gemini API Docs](https://ai.google.dev/docs)
