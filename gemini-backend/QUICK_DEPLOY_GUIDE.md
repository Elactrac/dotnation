# 🚀 Quick Action Plan - Production Deployment

## 📋 **30-Minute Production Prep**

### Step 1: Generate Secure Keys (5 min)

```bash
cd ~/Downloads/DotNation/gemini-backend

# Generate API key
echo "BACKEND_API_KEY=$(openssl rand -hex 32)" >> prod-keys.txt

# Generate JWT secret
echo "JWT_SECRET=$(openssl rand -hex 64)" >> prod-keys.txt

# Display keys
cat prod-keys.txt

# Copy keys to .env.production
```

---

### Step 2: Update .env.production (5 min)

Edit `gemini-backend/.env.production`:

```bash
# Production Environment
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Redis (get from Redis Cloud: https://redis.com/try-free/)
REDIS_URL=redis://username:password@your-redis-host:port

# Google Gemini API
GEMINI_API_KEY=your_production_gemini_key

# Security (PASTE GENERATED KEYS FROM ABOVE)
BACKEND_API_KEY=<paste_from_prod-keys.txt>
JWT_SECRET=<paste_from_prod-keys.txt>

# CORS (add your production domains)
ALLOWED_ORIGINS=https://dotnation.vercel.app,https://www.dotnation.xyz

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
AI_RATE_LIMIT_MAX=10

# Sentry (optional - get from sentry.io)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

### Step 3: Update Frontend API Calls (10 min)

**File**: `frontend/src/contexts/ApiContext.js` (or wherever you make backend calls)

**Add API Key Header**:

```javascript
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Example: Generate description
async function generateDescription(title) {
  const response = await fetch(`${BACKEND_URL}/api/generate-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': BACKEND_API_KEY,  // ← ADD THIS
    },
    body: JSON.stringify({ title }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}
```

**Create** `frontend/.env.local`:

```bash
# Development
VITE_BACKEND_URL=http://localhost:3001
VITE_BACKEND_API_KEY=dev_api_key_12345
```

**Update** `frontend/.env.production`:

```bash
# Production
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_BACKEND_API_KEY=<your_production_api_key>
```

---

### Step 4: Add to Vercel Environment Variables (5 min)

**Vercel Dashboard** → Your Project → Settings → Environment Variables

Add these:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_BACKEND_URL` | `https://your-backend.com` | Production |
| `VITE_BACKEND_API_KEY` | `<your_prod_key>` | Production |
| `VITE_BACKEND_URL` | `http://localhost:3001` | Development |
| `VITE_BACKEND_API_KEY` | `dev_api_key_12345` | Development |

**Redeploy frontend** after adding variables.

---

### Step 5: Test Locally (5 min)

```bash
# Terminal 1: Start backend
cd gemini-backend
npm start

# Terminal 2: Start frontend
cd ../frontend
npm run dev

# Terminal 3: Test API endpoint
curl -X POST http://localhost:3001/api/generate-description \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev_api_key_12345" \
  -d '{"title":"Test Campaign"}'

# Should return generated description
# Should NOT return 401/403 error
```

**Expected**: ✅ Description generated successfully

---

## 🚀 **Deployment Options**

### Option A: Railway (Recommended - Easiest)

1. **Sign up**: https://railway.app
2. **Create New Project** → Deploy from GitHub
3. **Connect Repository**: Elactrac/dotnation
4. **Select Directory**: `gemini-backend`
5. **Add Environment Variables**:
   - Copy all from `.env.production`
   - Railway auto-detects `PORT`
6. **Deploy**: Railway builds and deploys automatically
7. **Get URL**: `https://dotnation-backend.railway.app`

**Cost**: $5/month (500MB RAM, 5GB storage)

---

### Option B: Render

1. **Sign up**: https://render.com
2. **New Web Service** → Connect GitHub
3. **Configure**:
   - Name: `dotnation-backend`
   - Root Directory: `gemini-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables** (same as .env.production)
5. **Create Redis** (Render Redis Add-on - $7/month)
6. **Deploy**

**Cost**: $7-14/month (Free tier available but limited)

---

### Option C: DigitalOcean App Platform

1. **Sign up**: https://cloud.digitalocean.com
2. **Create App** → GitHub
3. **Configure**:
   - Source: `gemini-backend` directory
   - Run Command: `npm start`
4. **Add Components**:
   - Web Service (Node.js)
   - Redis Database ($15/month)
5. **Environment Variables**: Add all
6. **Deploy**

**Cost**: $5 (app) + $15 (Redis) = $20/month

---

## ⚡ **Quick Deploy Script**

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 DotNation Backend Deployment Script"
echo "======================================="

# Check if prod keys exist
if [ ! -f "prod-keys.txt" ]; then
    echo "⚠️  Generating production keys..."
    echo "BACKEND_API_KEY=$(openssl rand -hex 32)" > prod-keys.txt
    echo "JWT_SECRET=$(openssl rand -hex 64)" >> prod-keys.txt
    echo "✅ Keys generated in prod-keys.txt"
    echo ""
    echo "📋 IMPORTANT: Save these keys securely!"
    cat prod-keys.txt
    echo ""
fi

# Check Redis connection
echo "🔍 Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis not running. Start with: docker run -d --name redis -p 6379:6379 redis:alpine"
    exit 1
fi

# Check dependencies
echo "🔍 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run tests
echo "🧪 Running syntax check..."
npm run check
if [ $? -ne 0 ]; then
    echo "❌ Syntax check failed"
    exit 1
fi

echo ""
echo "✅ Pre-deployment checks passed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.production with generated keys"
echo "2. Deploy to Railway/Render/DigitalOcean"
echo "3. Add environment variables to hosting platform"
echo "4. Update frontend with production backend URL"
echo "5. Deploy frontend to Vercel"
echo ""
echo "🚀 Ready for deployment!"
```

Make executable and run:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🧪 **Production Smoke Tests**

After deployment, test these endpoints:

```bash
# Set your production URL
BACKEND_URL="https://your-backend.railway.app"
API_KEY="your_production_api_key"

# 1. Health check (no auth required)
curl $BACKEND_URL/health

# 2. Test authentication (should fail without key)
curl -X POST $BACKEND_URL/api/generate-description \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
# Expected: 401 Unauthorized

# 3. Test with API key (should succeed)
curl -X POST $BACKEND_URL/api/generate-description \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"title":"Decentralized Education Platform"}'
# Expected: Generated description

# 4. Test rate limiting
for i in {1..15}; do
  curl -X POST $BACKEND_URL/api/generate-description \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"title":"Test $i"}'
  echo ""
done
# Expected: 429 Too Many Requests after 10 requests

# 5. Test captcha
curl -X POST $BACKEND_URL/api/captcha/session
# Expected: Session token
```

**All tests passing?** ✅ Backend is production ready!

---

## 📊 **Monitoring Setup (Optional but Recommended)**

### Sentry (Error Tracking)

1. Sign up: https://sentry.io
2. Create project: Node.js/Express
3. Copy DSN: `https://xxx@sentry.io/yyy`
4. Add to `.env.production`: `SENTRY_DSN=...`
5. Uncomment Sentry code in `server.js` (lines 18-26 and after routes)
6. Redeploy

**Benefits**: Real-time error tracking, stack traces, performance monitoring

---

### UptimeRobot (Uptime Monitoring)

1. Sign up: https://uptimerobot.com (free tier)
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.com/health`
   - Interval: 5 minutes
   - Alert contacts: Your email
3. Done!

**Benefits**: Email alerts if backend goes down

---

## 🎯 **Success Criteria**

Before considering deployment complete, verify:

- [x] ✅ Backend starts without errors
- [x] ✅ Redis connects successfully
- [x] ✅ Health endpoint returns 200
- [ ] ✅ Production API keys generated
- [ ] ✅ Frontend updated with API key
- [ ] ✅ CORS configured for production domain
- [ ] ✅ Deployed to hosting platform
- [ ] ✅ Environment variables set
- [ ] ✅ Smoke tests passing
- [ ] ✅ Sentry configured (optional)
- [ ] ✅ Uptime monitoring active (optional)

---

## 💡 **Pro Tips**

1. **Always test in staging first** - Deploy to a staging environment before production
2. **Monitor closely for 24 hours** - Watch logs and error rates
3. **Set up alerts** - Get notified immediately if issues arise
4. **Document your deployment** - Keep notes on what you did
5. **Backup your keys** - Store API keys securely (password manager)
6. **Use different keys per environment** - Never reuse dev keys in production
7. **Enable HTTPS** - Most hosting platforms provide free SSL
8. **Scale gradually** - Start with minimum resources, scale up as needed

---

## 🆘 **Troubleshooting**

### "Cannot connect to Redis"
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis
docker run -d --name redis -p 6379:6379 redis:alpine

# Update REDIS_URL in .env
```

### "401 Unauthorized" from frontend
```bash
# Check API key is set in frontend .env
echo $VITE_BACKEND_API_KEY

# Verify header is being sent
# Check browser DevTools → Network → Headers
```

### "429 Too Many Requests"
```bash
# This is normal - rate limiting is working!
# Wait 15 minutes or increase limits in .env:
RATE_LIMIT_MAX_REQUESTS=100
AI_RATE_LIMIT_MAX=20
```

### Server crashes on startup
```bash
# Check logs
tail -f logs/error-*.log

# Common issues:
# - Missing environment variables
# - Redis connection failed
# - Port already in use
```

---

## 🎉 **You're Ready!**

Your backend is **85% production-ready**. Complete these quick steps and you'll be at **100%**!

**Estimated Time**: 30 minutes to production deployment 🚀

Need help with any step? Just ask! 💪
