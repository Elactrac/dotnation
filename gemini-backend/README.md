# Gemini Backend - AI Campaign Assistant

**Last Updated:** November 15, 2025

Node.js + Express server that integrates Google's Gemini AI (FREE tier) to provide intelligent campaign assistance for DotNation.

## Features

- **🔐 API Key Authentication**: Secure endpoint protection with X-API-Key header
- **⚡ Rate Limiting**: Two-tier rate limiting (general + AI-specific)
- **🤖 AI Campaign Tools**: Description generation, title suggestions, fraud detection
- **🔒 Captcha System**: Multi-type captcha with Redis session management
- **📊 Redis Persistence**: Session storage with graceful in-memory fallback
- **🛡️ Security Hardened**: Helmet, CORS, input validation, structured logging
- **💰 FREE**: Uses Google's free Gemini API tier

## Setup

### Prerequisites

- Node.js 18+
- Redis (for session persistence)
- Google Gemini API key ([Get FREE one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Install Redis**:
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```bash
   # Required - Backend API key for authentication
   BACKEND_API_KEY=dev_api_key_12345
   
   # Required - Google Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional - Server configuration
   PORT=3001
   NODE_ENV=development
   
   # Optional - Redis configuration
   REDIS_URL=redis://localhost:6379
   
   # Optional - CORS configuration
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

### Running Locally

```bash
node server.js
```

Server will start on `http://localhost:3001`

## API Endpoints

### 🔐 Authentication

All endpoints (except `/health` and `/metrics`) require authentication via the `X-API-Key` header:

```http
X-API-Key: your_backend_api_key
```

**Authentication Responses:**
- `401 Unauthorized` - Missing API key
- `403 Forbidden` - Invalid API key
- `429 Too Many Requests` - Rate limit exceeded

### ⚡ Rate Limits

- **General endpoints**: 100 requests per 15 minutes per IP
- **AI endpoints**: 10 requests per 15 minutes per IP

### AI Endpoints

#### Generate Campaign Description

```http
POST /api/generate-description
Content-Type: application/json
X-API-Key: your_api_key

{
  "title": "Help Kids Learn to Code"
}
```

**Response**:
```json
{
  "description": "A comprehensive coding education program...",
  "fallback": false
}
```

#### Generate Campaign Titles

```http
POST /api/generate-title
Content-Type: application/json
X-API-Key: your_api_key

{
  "keywords": "education technology blockchain",
  "category": "education"
}
```

**Response**:
```json
{
  "titles": [
    "Decentralized Learning Platform for All",
    "Blockchain-Powered Education Revolution"
  ]
}
```

#### Fraud Detection

```http
POST /api/fraud-detection
Content-Type: application/json
X-API-Key: your_api_key

{
  "campaign": {
    "title": "Campaign Title",
    "description": "Campaign description...",
    "goal": "10000",
    "beneficiary": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "category": "education"
  }
}
```

**Response**:
```json
{
  "riskScore": 15,
  "riskLevel": "low",
  "flags": [],
  "recommendations": ["Campaign looks legitimate"],
  "aiAnalysis": {
    "contentQuality": "high",
    "credibilityScore": 85
  }
}
```

#### Summarize Content

```http
POST /api/summarize
Content-Type: application/json
X-API-Key: your_api_key

{
  "description": "Long campaign description text...",
  "maxLength": 100
}
```

#### Generate Contract Summary

```http
POST /api/contract-summary
Content-Type: application/json
X-API-Key: your_api_key

{
  "contract": {
    "campaigns": 42,
    "totalDonations": "1500000000000000",
    "activeCampaigns": 28
  }
}
```

### Captcha Endpoints

#### Create Captcha Session

```http
POST /api/captcha/session
X-API-Key: your_api_key
```

**Response**:
```json
{
  "success": true,
  "sessionToken": "abc123...",
  "expiresIn": 300
}
```

#### Verify Captcha

```http
POST /api/captcha/verify
Content-Type: application/json
X-API-Key: your_api_key

{
  "sessionToken": "abc123...",
  "captchaType": "slider",
  "userAnswer": 85,
  "expectedAnswer": 82,
  "timeTaken": 3.5,
  "options": { "tolerance": 5 }
}
```

#### Validate Token

```http
POST /api/captcha/validate-token
Content-Type: application/json
X-API-Key: your_api_key

{
  "token": "verification_token_here"
}
```

#### Get Captcha Stats

```http
GET /api/captcha/stats
X-API-Key: your_api_key
```

### Public Endpoints

#### Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T14:06:27.836Z",
  "services": {
    "redis": "connected",
    "gemini": "configured"
  }
}
```

#### Metrics

```http
GET /metrics
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BACKEND_API_KEY` | Backend authentication key | ✅ Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key (FREE) | ✅ Yes | - |
| `PORT` | Server port | ❌ No | 3001 |
| `NODE_ENV` | Environment (development/production) | ❌ No | development |
| `REDIS_URL` | Redis connection URL | ❌ No | redis://localhost:6379 |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | ❌ No | http://localhost:5173 |

## Integration with Frontend

### Frontend Configuration

Add to `frontend/.env.local`:

```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_BACKEND_API_KEY=dev_api_key_12345
```

### Frontend API Usage

```javascript
// frontend/src/utils/aiApi.js or captchaApi.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || 'dev_api_key_12345';

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
}

// Example usage
const response = await fetch(`${BACKEND_URL}/api/generate-description`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify({ title: 'My Campaign' }),
});
```

## Testing

### Test Authentication

```bash
# Should return 401 (no API key)
curl http://localhost:3001/api/generate-description

# Should return 403 (invalid key)
curl -H "X-API-Key: wrong_key" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3001/api/generate-description \
  -d '{"title":"Test"}'

# Should return 200 (valid key)
curl -H "X-API-Key: dev_api_key_12345" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3001/api/generate-description \
  -d '{"title":"Help Kids Learn to Code"}'
```

### Test Captcha System

```bash
# Create session
curl -H "X-API-Key: dev_api_key_12345" \
  -X POST http://localhost:3001/api/captcha/session

# Get stats
curl -H "X-API-Key: dev_api_key_12345" \
  http://localhost:3001/api/captcha/stats
```

### Test Health

```bash
# No authentication required
curl http://localhost:3001/health
```

## Security Features

### 🔐 Authentication
- API key validation on all protected endpoints
- Separate keys for development and production
- Header-based authentication (not query params)

### ⚡ Rate Limiting
- **General**: 100 requests per 15 minutes
- **AI endpoints**: 10 requests per 15 minutes (prevents cost abuse)
- IP-based rate limiting with Redis storage

### 🛡️ Security Headers
- Helmet.js security middleware
- CORS with configurable origins
- Content Security Policy
- XSS protection

### 📝 Logging
- Winston structured logging
- Request/response logging
- Error tracking
- No sensitive data in logs

### ✅ Input Validation
- Request body validation
- Type checking
- Length limits
- Sanitization

## Redis Configuration

### Why Redis?

- **Session Persistence**: Captcha sessions survive server restarts
- **Distributed Rate Limiting**: Consistent limits across multiple instances
- **Production Ready**: Scales horizontally

### Fallback Behavior

If Redis is unavailable:
- System continues with in-memory storage
- Logs warning but doesn't crash
- Automatically reconnects when Redis is back

### Redis Keys

```
session:{sessionToken}  - Captcha session data (TTL: 5 min)
verified:{token}        - Verification tokens (TTL: 1 hour)
```

## Deployment

### 🆓 FREE Deployment (Perfect for Hackathons!)

**Total Cost: $0/month** using Render + Upstash + Gemini

#### Option 1: Render.com (FREE Tier)

1. **Sign up**: https://render.com (no credit card required!)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. **Configure**:
   - Root Directory: `gemini-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - **Instance Type: Free** ⭐
5. **Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=3001
   BACKEND_API_KEY=<secure_random_32_char_key>
   GEMINI_API_KEY=<from_google_ai_studio>
   REDIS_URL=<from_upstash_below>
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Deploy! (3-5 minutes)

**⚠️ Render Free Tier Limitation**:
- Spins down after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Perfect for hackathons and demos!
- Upgrade to paid ($7/mo) for always-on service

#### Option 2: Upstash Redis (FREE Tier)

1. **Sign up**: https://upstash.com (no credit card required!)
2. **Create Database**:
   - Name: `dotnation-redis`
   - Type: Regional (cheaper)
   - Region: Choose closest to Render
   - TLS: ✅ Enabled
3. **Copy Redis URL**: From "Details" tab (format: `rediss://...`)
4. **Add to Render**: Environment variable `REDIS_URL`

**✅ Upstash Free Tier**:
- 10,000 commands/day (~400/hour)
- 256MB storage
- TLS encryption
- More than enough for hackathons!

#### Option 3: Get Gemini API Key (FREE Forever)

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and add to Render: `GEMINI_API_KEY`
4. **FREE tier**: 15 requests/minute, 1M tokens/month

**Total: $0/month!** 🎉

---

### 💰 Paid Option: Railway ($5/month - Easier, Always On)

If you want simpler setup and no sleep mode:

1. **Sign up**: https://railway.app
2. **Deploy from GitHub**: Select `gemini-backend` as root directory
3. **Add Redis Plugin**: Railway auto-configures `REDIS_URL`
4. **Add Environment Variables**: Same as above
5. Deploy automatically on git push

**Benefits**: No sleep mode, integrated Redis, easier management

**Cost**: $5/month (backend + Redis included)

---

### Production Checklist

1. ✅ Set strong `BACKEND_API_KEY` (not dev_api_key_12345)
2. ✅ Configure `ALLOWED_ORIGINS` for your frontend domain
3. ✅ Set `NODE_ENV=production`
4. ✅ Ensure Redis is running and accessible
5. ✅ Add Gemini API key
6. ✅ Configure frontend with matching API key
7. ✅ Test all endpoints with authentication
8. ✅ Monitor rate limits and adjust if needed

### Environment-Specific Keys

```bash
# Development
BACKEND_API_KEY=dev_api_key_12345

# Production
BACKEND_API_KEY=prod_secure_random_key_xyz789abc
```

## Cost

### FREE Option (Hackathons)

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| Render (Backend) | Free | $0 | Sleeps after 15min |
| Upstash (Redis) | Free | $0 | 10K commands/day |
| Gemini API | Free | $0 | 15 req/min |
| **TOTAL** | | **$0/month** | Perfect for demos! |

**No credit card required for any service!**

### Paid Option (Production)

| Service | Tier | Cost |
|---------|------|------|
| Railway | Hobby | $5/mo (backend + Redis) |
| Render | Starter | $7/mo (backend only) |
| Gemini API | Free | $0 (always free) |

**Recommendation**: 
- **Hackathons**: Use FREE stack (Render + Upstash)
- **Production**: Upgrade to Railway ($5/mo) or Render Starter ($7/mo)

**Rate limiting protects against abuse** - AI endpoints limited to 10 requests per 15 minutes per user.

## Monitoring

### Health Check
- `GET /health` - Service status with Redis/Gemini connectivity

### Metrics
- `GET /metrics` - Performance and usage metrics (no auth required)

### Logs
- Winston JSON structured logs
- Levels: error, warn, info, debug
- Located in console output (configure file output as needed)

## Troubleshooting

### "Authentication required" error
- Add `X-API-Key` header to your requests
- Verify API key matches between frontend and backend `.env` files

### "Rate limit exceeded" error
- Wait 15 minutes or use different IP
- Check if you're testing too quickly
- Increase limits in `server.js` if legitimate usage

### Redis connection failed
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`
- System will fallback to in-memory storage

### Gemini API errors
- Check API key is valid at https://aistudio.google.com/app/apikey
- Verify you're within free tier limits (15 RPM)
- Gemini may return 503 during high load (retry after delay)

## Support

For issues or questions:
- Check logs for detailed error messages
- Verify all environment variables are set
- Test authentication with curl commands above
- Ensure Redis is running for production use