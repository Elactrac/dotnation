# Redis Setup Guide for DotNation Backend

## Option 1: Docker (Recommended for Local Development)

### Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### Start Redis
```bash
cd gemini-backend
docker-compose up -d
```

### Verify Redis is running
```bash
docker-compose ps
# Should show redis container running on port 6379
```

### Stop Redis
```bash
docker-compose down
# To also remove data: docker-compose down -v
```

---

## Option 2: Redis Cloud (Free Tier - Recommended for Production)

### Sign up
1. Go to: https://redis.com/try-free/
2. Create account (30MB free, no credit card required)
3. Create new database

### Get Connection URL
1. In Redis Cloud dashboard, click your database
2. Copy the **Public endpoint** (looks like: `redis://default:password@redis-12345.cloud.redislabs.com:12345`)
3. Add to `.env`:
   ```
   REDIS_URL=redis://default:password@your-redis-url.cloud.redislabs.com:12345
   ```

**Free Tier Limits:**
- 30MB storage (enough for ~50,000 sessions)
- Unlimited connections
- High availability

---

## Option 3: Local Redis Installation (macOS)

### Install via Homebrew
```bash
brew install redis
```

### Start Redis
```bash
brew services start redis
# Or run in foreground: redis-server
```

### Verify
```bash
redis-cli ping
# Should return: PONG
```

### Stop Redis
```bash
brew services stop redis
```

---

## Option 4: Local Redis Installation (Linux)

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Verify
```bash
redis-cli ping
```

---

## Testing Connection

After setting up Redis, test the connection:

```bash
cd gemini-backend
node -e "const redis = require('redis'); const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' }); client.connect().then(() => { console.log('✅ Redis connected!'); client.quit(); }).catch(err => console.error('❌ Redis error:', err));"
```

---

## Environment Variables

Add to your `.env` file:

```env
# Local development (Docker or local Redis)
REDIS_URL=redis://localhost:6379

# Production (Redis Cloud)
REDIS_URL=redis://default:your_password@your-host.redis.cloud:port
```

---

## Troubleshooting

### Connection Refused (Docker)
```bash
docker-compose logs redis  # Check Redis logs
docker-compose restart redis  # Restart Redis
```

### Connection Refused (Local)
```bash
# macOS
brew services restart redis

# Linux
sudo systemctl restart redis
```

### Test Redis CLI
```bash
redis-cli
> PING
PONG
> SET test "Hello"
OK
> GET test
"Hello"
> exit
```

---

## Production Deployment

For production, **DO NOT use local Redis**. Use one of these managed options:

1. **Railway Redis Plugin** (Recommended for DotNation)
   - Included with Railway backend deployment
   - Automatic configuration (sets `REDIS_URL`)
   - $5/month (includes backend hosting)
   - See `VERCEL_DEPLOYMENT_GUIDE.md` for setup

2. **Redis Cloud** - https://redis.com/try-free/
   - Free tier: 30MB (enough for ~50,000 sessions)
   - Paid: Starting at $5/month
   - High availability built-in

3. **Upstash Redis** - https://upstash.com/
   - Serverless, pay-per-request
   - Free tier: 10,000 commands/day
   - Good for low-traffic apps

4. **AWS ElastiCache** - For enterprise deployments
   - Starting at $15/month
   - Full AWS integration

---

## Security Best Practices

1. **Always use authentication in production**
   ```env
   REDIS_URL=redis://username:password@host:port
   ```

2. **Use TLS in production**
   ```env
   REDIS_URL=rediss://username:password@host:port  # Note: rediss:// (with 's')
   ```

3. **Firewall Redis port (6379)** - Only allow backend server access

4. **Regular backups** - Redis Cloud does this automatically

---

## Next Steps

After Redis is running:

1. Start the backend server: `npm start`
2. Check logs for Redis connection: `✅ Redis connected successfully`
3. Test captcha endpoint: `POST http://localhost:3001/api/captcha/generate`
4. Verify session persistence: Stop/restart server, session should survive

---

## Cost Estimation

| Provider | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Railway Plugin** | None | **$5/mo (w/ backend)** | **DotNation (recommended)** |
| Redis Cloud | 30MB | $5-10/mo | Standalone Redis |
| Upstash | 10K req/day | $0.20/100K req | Serverless, low traffic |
| AWS ElastiCache | None | $15+/mo | Enterprise |

**Recommendation for DotNation**: Use **Railway with Redis plugin** ($5/mo total) for backend + Redis in one service.
