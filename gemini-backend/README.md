# Gemini Backend - AI Campaign Assistant

Node.js + Express server that integrates Google's Gemini AI (FREE tier) to provide intelligent campaign assistance for DotNation.

## Features

- **Campaign Description Generation**: AI-powered campaign description creation
- **Content Summarization**: Concise summaries of campaign descriptions
- **CORS Enabled**: Works with frontend on different domains
- **Environment Config**: Secure API key management
- **FREE**: Uses Google's free Gemini API tier

## Setup

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get FREE one here](https://aistudio.google.com/app/apikey))

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

### Generate Campaign Description

```http
POST /api/generate-description
Content-Type: application/json

{
  "title": "Decentralized Education Platform"
}
```

**Response**:
```json
{
  "description": "Transforming education through blockchain technology..."
}
```

### Summarize Campaign Description

```http
POST /api/summarize
Content-Type: application/json

{
  "description": "Long campaign description text here..."
}
```

**Response**:
```json
{
  "summary": "Brief summary of the campaign goals and solutions..."
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
  "message": "Gemini backend is running"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key (FREE) | ✅ Yes |
| `PORT` | Server port (default: 3001) | ❌ No |
| `NODE_ENV` | Environment (development/production) | ❌ No |

## Integration with Frontend

The frontend automatically calls these endpoints at `http://localhost:3001`

## Testing

```bash
# Test description generation
curl -X POST http://localhost:3001/api/generate-description \
  -H "Content-Type: application/json" \
  -d '{"title":"Green Energy Initiative"}'

# Test summarization
curl -X POST http://localhost:3001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"description":"This campaign is about renewable energy solutions."}'
```

## Troubleshooting

### Error: "GEMINI_API_KEY is not set"

Check your `.env` file exists and contains the API key.

### Error: "Failed to generate content"

- Verify your Gemini API key is valid
- Check your internet connection
- Ensure you haven't exceeded the free tier limits

## Cost

**FREE** - Uses Google's Gemini API free tier (15 RPM, 1M tokens/month)</content>
</xai:function_call">Now let me install the dependencies and test the Gemini integration. 

<xai:function_call name="bash">
<parameter name="command">cd gemini-backend && npm install