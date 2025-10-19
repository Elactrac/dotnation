# Gemini Backend - AI Campaign Assistant

Node.js + Express server that integrates Google's Gemini AI to provide intelligent campaign assistance for DotNation.

## Features

- **Campaign Suggestions**: AI-powered campaign title and description generation
- **Content Optimization**: Improve existing campaign descriptions
- **CORS Enabled**: Works with frontend on different domains
- **Environment Config**: Secure API key management

## Setup

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

3. **Add your Gemini API key** to `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3001
   ```

### Running Locally

```bash
node server.js
```

Server will start on `http://localhost:3001`

## API Endpoints

### Generate Campaign Suggestion

```http
POST /api/generate-campaign
Content-Type: application/json

{
  "prompt": "Create a campaign for a community garden project"
}
```

**Response**:
```json
{
  "title": "Community Garden Initiative",
  "description": "Help us create a sustainable community garden...",
  "suggestedGoal": 5000
}
```

### Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "gemini": "connected"
}
```

## Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variable:
```bash
railway variables set GEMINI_API_KEY=your_key_here
```

### Option 2: Render

1. Create new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variable `GEMINI_API_KEY`

### Option 3: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly secrets set GEMINI_API_KEY=your_key_here
fly deploy
```

### Option 4: Heroku

```bash
# Create app
heroku create dotnation-backend

# Set environment variable
heroku config:set GEMINI_API_KEY=your_key_here

# Deploy
git push heroku main
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `PORT` | Server port (default: 3001) | ❌ No |
| `NODE_ENV` | Environment (development/production) | ❌ No |

## Integration with Frontend

Update frontend `.env.local`:

```bash
VITE_GEMINI_BACKEND_URL=http://localhost:3001
```

For production:
```bash
VITE_GEMINI_BACKEND_URL=https://your-backend.railway.app
```

## Development

### Test API Locally

```bash
# Using curl
curl -X POST http://localhost:3001/api/generate-campaign \
  -H "Content-Type: application/json" \
  -d '{"prompt": "medical equipment fundraiser"}'

# Using httpie
http POST http://localhost:3001/api/generate-campaign prompt="medical equipment fundraiser"
```

### Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing prompt)
- `500` - Server error (Gemini API failure)

## Security Notes

- **Never commit `.env` file** - Already in `.gitignore`
- **Use HTTPS in production** - Most platforms provide this automatically
- **Rate limit API calls** - Implement rate limiting for production use
- **Validate inputs** - Server validates all incoming requests

## Troubleshooting

### Error: "Cannot find module 'dotenv'"

```bash
npm install
```

### Error: "GEMINI_API_KEY is not set"

Check your `.env` file exists and contains the API key.

### Error: "Failed to generate campaign"

- Verify your Gemini API key is valid
- Check your internet connection
- Ensure you haven't exceeded API quota

### CORS errors

The server allows all origins by default. For production, update `cors` config in `server.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

## CI/CD

This backend is automatically tested via GitHub Actions (`.github/workflows/backend-ci.yml`):

- ✅ Syntax validation
- ✅ Dependency installation
- ✅ Security audit
- ✅ Deployment artifact creation

## License

MIT
