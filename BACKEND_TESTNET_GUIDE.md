# Backend Testnet Deployment Guide

This guide will help you deploy the DotNation backend to testnet with enhanced security features.

## Prerequisites

- Node.js 18+ installed
- A cloud hosting account (Heroku, Railway, Render, or similar)
- Gemini API key from https://aistudio.google.com/app/apikey
- Testnet frontend URL

## Security Features

The backend now includes:

1. **Enhanced Captcha System**
   - Canvas-based visual captchas with distorted text
   - Pattern recognition challenges
   - Server-side verification with session management
   - Rate limiting per IP
   - Automatic lockout after failed attempts

2. **Rate Limiting**
   - API endpoints: 100 requests per 15 minutes
   - Captcha endpoints: 50 requests per 15 minutes
   - Configurable per environment

3. **Security Headers**
   - Helmet middleware for HTTP security headers
   - CORS with whitelist
   - Content Security Policy
   - XSS protection

4. **Input Validation**
   - Express-validator for request validation
   - JSON payload size limits
   - SQL injection prevention

5. **Error Handling**
   - Comprehensive error logging
   - Safe error messages in production
   - Request logging with timestamps and IP

## Installation

1. **Install dependencies**
   ```bash
   cd gemini-backend
   npm install
   ```

2. **Configure environment**
   
   Copy the appropriate environment file:
   ```bash
   # For testnet
   cp .env.testnet .env
   
   # For production
   cp .env.production .env
   ```

3. **Update environment variables**
   
   Edit `.env` and update:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `ALLOWED_ORIGINS`: Your frontend URLs (comma-separated)
   - `PORT`: Backend port (default: 3001)

## Local Testing

1. **Start the backend**
   ```bash
   npm start
   ```

2. **Test health endpoint**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Test captcha endpoints**
   
   Create a session:
   ```bash
   curl -X POST http://localhost:3001/api/captcha/create-session
   ```
   
   Verify captcha:
   ```bash
   curl -X POST http://localhost:3001/api/captcha/verify \
     -H "Content-Type: application/json" \
     -d '{
       "sessionToken": "your-session-token",
       "answer": "ABC123",
       "expectedAnswer": "ABC123",
       "timeTaken": 5,
       "captchaType": "visual"
     }'
   ```

4. **Test fraud detection**
   ```bash
   curl -X POST http://localhost:3001/api/fraud-detection/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Campaign",
       "description": "This is a test campaign for fraud detection",
       "goal": 1000,
       "deadline": "2025-12-31",
       "beneficiary": "0x123..."
     }'
   ```

## Deployment to Testnet

### Option 1: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   railway init
   ```

3. **Set environment variables**
   ```bash
   railway variables set GEMINI_API_KEY=your_api_key
   railway variables set NODE_ENV=testnet
   railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Render

1. **Create `render.yaml`** (already provided in root)

2. **Connect GitHub repo** at https://render.com

3. **Set environment variables** in Render dashboard:
   - `GEMINI_API_KEY`
   - `NODE_ENV=testnet`
   - `ALLOWED_ORIGINS`

4. **Deploy** - Render will auto-deploy on push

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create dotnation-backend-testnet
   ```

3. **Set environment variables**
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key
   heroku config:set NODE_ENV=testnet
   heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t dotnation-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 3001:3001 \
     -e GEMINI_API_KEY=your_api_key \
     -e NODE_ENV=testnet \
     -e ALLOWED_ORIGINS=https://your-frontend.vercel.app \
     dotnation-backend
   ```

## Frontend Configuration

Update your frontend `.env` file:

```bash
# Testnet Backend URL
VITE_BACKEND_URL=https://your-backend.railway.app

# Testnet RPC Endpoint
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io

# Contract Address (after deployment)
VITE_CONTRACT_ADDRESS=your_contract_address
```

## Testing the Integration

1. **Test captcha flow**
   - Open your frontend
   - Trigger a captcha modal
   - Try solving visual and pattern captchas
   - Verify backend logs show verification attempts

2. **Test fraud detection**
   - Create a test campaign
   - Check backend logs for fraud analysis
   - Verify high-risk campaigns are flagged

3. **Test rate limiting**
   - Make multiple rapid requests
   - Verify rate limit responses (429 status)
   - Check rate limit headers in response

## Monitoring

1. **Check backend logs**
   ```bash
   # Railway
   railway logs
   
   # Heroku
   heroku logs --tail
   
   # Render
   # View logs in dashboard
   ```

2. **Monitor captcha stats**
   ```bash
   curl https://your-backend.railway.app/api/captcha/stats
   ```

3. **Check health**
   ```bash
   curl https://your-backend.railway.app/health
   ```

## Troubleshooting

### CORS Errors

- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that frontend is using correct backend URL
- Ensure no trailing slashes in URLs

### Captcha Verification Fails

- Check backend logs for specific error
- Verify timing is reasonable (> 2 seconds)
- Ensure session hasn't expired (5 minute limit)

### Rate Limit Issues

- Wait for rate limit window to reset (15 minutes)
- Adjust `RATE_LIMIT_MAX` in environment if needed
- Check if IP is being correctly identified

### API Key Issues

- Verify Gemini API key is valid
- Check API quota at https://aistudio.google.com
- Ensure key has proper permissions

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template

2. **Rotate API keys regularly** - Update in deployment platform

3. **Monitor logs** - Watch for suspicious activity patterns

4. **Use HTTPS only** - No HTTP in production/testnet

5. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

6. **Enable CORS whitelist** - Only allow known frontend domains

7. **Set up monitoring** - Use service like Sentry or LogRocket

## API Endpoints Reference

### Captcha Endpoints

- `POST /api/captcha/create-session` - Create new captcha session
- `POST /api/captcha/verify` - Verify captcha answer
- `POST /api/captcha/validate-token` - Validate verification token
- `GET /api/captcha/stats` - Get captcha system statistics

### Fraud Detection Endpoints

- `POST /api/fraud-detection/analyze` - Full fraud analysis
- `POST /api/fraud-detection/quick-check` - Quick pattern check

### Contract Audit Endpoints

- `POST /api/contract-audit/analyze` - Audit contract code
- `POST /api/contract-audit/file` - Audit contract file
- `POST /api/contract-audit/batch` - Batch audit multiple contracts

### AI Content Endpoints

- `POST /api/generate-description` - Generate campaign description
- `POST /api/summarize` - Summarize campaign
- `POST /api/contract-summary` - Generate contract summary

### Health Check

- `GET /health` - Server health status

## Production Deployment

When ready for production:

1. Use `.env.production` configuration
2. Enable stricter rate limits
3. Set up database for session storage (replace in-memory store)
4. Configure Redis for distributed rate limiting
5. Set up SSL certificates
6. Enable monitoring and alerting
7. Configure automatic backups
8. Set up CI/CD pipeline

## Support

For issues or questions:
- Check backend logs first
- Review this guide thoroughly
- Test with curl commands
- Check GitHub issues
- Contact support team

## Next Steps

1. ✅ Deploy backend to testnet
2. ✅ Configure frontend environment
3. ✅ Test all endpoints
4. ✅ Monitor logs and metrics
5. ✅ Deploy smart contracts to testnet
6. ✅ Integrate frontend with testnet
7. ✅ Run end-to-end tests
8. ✅ Gather feedback
9. ✅ Fix issues
10. ✅ Deploy to production

Good luck with your testnet deployment! 🚀
