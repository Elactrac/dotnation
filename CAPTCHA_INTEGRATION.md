# Advanced Captcha System Integration Guide

## Overview

The DotNation platform now features a comprehensive, multi-layered captcha verification system with backend integration. The system includes 4 different captcha types with progressive difficulty escalation and robust security features.

## Architecture

### Frontend Components

**Location**: `frontend/src/components/`

1. **CaptchaModal.jsx** (Main Component)
   - Manages captcha type selection and progressive difficulty
   - Handles session initialization
   - Coordinates verification with backend
   - Supports 4 captcha types: Math, Image, Slider, Pattern

2. **ImageCaptcha.jsx**
   - 3x3 grid image selection challenge
   - 4 categories: traffic lights, crosswalks, buses, bicycles
   - Multi-select capability with visual feedback

3. **SliderCaptcha.jsx**
   - Drag-to-align puzzle piece challenge
   - Random target positions (20-80%)
   - ±5% tolerance for success
   - Touch and mouse support

4. **PatternCaptcha.jsx**
   - Memory sequence challenge
   - Progressive difficulty (3-6 steps)
   - Step-by-step pattern tracking
   - Real-time validation

### Backend API

**Location**: `gemini-backend/`

**Files**:
- `captchaVerification.js` - Core verification logic
- `server.js` - REST API endpoints

**Endpoints**:

#### 1. Create Session
```http
POST /api/captcha/session
```

**Response**:
```json
{
  "success": true,
  "sessionToken": "9b4e103636fb8af1c454a231...",
  "expiresIn": 300
}
```

#### 2. Verify Captcha
```http
POST /api/captcha/verify
```

**Request Body**:
```json
{
  "sessionToken": "string",
  "captchaType": "math|image|slider|pattern",
  "userAnswer": "any",
  "expectedAnswer": "any",
  "timeTaken": "number (seconds)",
  "options": {
    "tolerance": 5
  }
}
```

**Success Response**:
```json
{
  "verified": true,
  "token": "eyJzZXNzaW9uVG9rZW4...",
  "timestamp": 1761822828545
}
```

**Failure Response**:
```json
{
  "verified": false,
  "error": "Incorrect answer",
  "attempts": 1,
  "maxAttempts": 3,
  "remainingAttempts": 2
}
```

#### 3. Validate Token
```http
POST /api/captcha/validate-token
```

**Request Body**:
```json
{
  "token": "eyJzZXNzaW9uVG9rZW4..."
}
```

#### 4. Get Statistics
```http
GET /api/captcha/stats
```

**Response**:
```json
{
  "activeSessions": 0,
  "rateLimitEntries": 0,
  "config": {
    "sessionMaxAge": 300000,
    "maxAttempts": 3,
    "lockoutDuration": 60000,
    "rateLimitWindow": 900000,
    "rateLimitMax": 50
  }
}
```

## Security Features

### 1. Session Management
- Unique session tokens generated using crypto.randomBytes(32)
- Sessions expire after 5 minutes
- Sessions are deleted after successful verification
- Automatic cleanup of expired sessions

### 2. Rate Limiting
- 50 verification attempts per 15-minute window per IP
- IP addresses are hashed for privacy
- Automatic reset after window expires

### 3. Attempt Tracking
- Maximum 3 attempts per session
- Account lockout for 60 seconds after 3 failed attempts
- Progressive difficulty escalation on repeated failures

### 4. Anti-Bot Protection
- Minimum time validation (1-2 seconds depending on captcha type)
- Suspicious activity detection
- Time-taken analysis for pattern detection

### 5. Progressive Difficulty
- 3 failures on Math → Escalate to Image
- 5 failures total → Escalate to Slider
- 7 failures total → Escalate to Pattern (hardest)

## Usage Example

### In Your Component

```jsx
import { useState } from 'react';
import CaptchaModal from './components/CaptchaModal';

function MyComponent() {
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleCaptchaVerify = (success, verificationToken) => {
    if (success) {
      console.log('Captcha verified!', verificationToken);
      // Proceed with protected action
      // You can validate the token on backend if needed
    }
  };

  return (
    <>
      <button onClick={() => setShowCaptcha(true)}>
        Show Captcha
      </button>
      
      <CaptchaModal
        isOpen={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onVerify={handleCaptchaVerify}
      />
    </>
  );
}
```

### Direct API Usage

```javascript
import { createCaptchaSession, verifyCaptcha } from './utils/captchaApi';

// Create session
const session = await createCaptchaSession();
const sessionToken = session.sessionToken;

// Verify answer
const result = await verifyCaptcha({
  sessionToken,
  captchaType: 'math',
  userAnswer: 7,
  expectedAnswer: 7,
  timeTaken: 3.5
});

if (result.verified) {
  console.log('Verification token:', result.token);
}
```

## Configuration

### Frontend Environment Variables

In `frontend/.env.local`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

### Backend Configuration

In `gemini-backend/captchaVerification.js`:

```javascript
const SESSION_CONFIG = {
  maxAge: 5 * 60 * 1000,        // 5 minutes
  maxAttempts: 3,                // Max attempts per session
  lockoutDuration: 60 * 1000,    // 60 seconds lockout
  cleanupInterval: 10 * 60 * 1000 // Cleanup every 10 minutes
};

const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000,      // 15 minutes
  maxRequests: 50                 // Max 50 requests per window
};
```

## Testing

### Backend Tests

```bash
# Test session creation
curl -X POST http://localhost:3001/api/captcha/session \
  -H "Content-Type: application/json"

# Test math verification
curl -X POST http://localhost:3001/api/captcha/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "captchaType": "math",
    "userAnswer": 7,
    "expectedAnswer": 7,
    "timeTaken": 3.5
  }'

# Test image verification
curl -X POST http://localhost:3001/api/captcha/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "YOUR_SESSION_TOKEN",
    "captchaType": "image",
    "userAnswer": [0, 3, 6],
    "expectedAnswer": [0, 3, 6],
    "timeTaken": 5.2
  }'

# Get statistics
curl http://localhost:3001/api/captcha/stats
```

### Frontend Testing

1. Start the backend server:
   ```bash
   cd gemini-backend
   npm start
   ```

2. Start the frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to any page that uses the captcha modal
4. Try all 4 captcha types
5. Test failure scenarios
6. Verify progressive difficulty escalation

## Performance Considerations

### In-Memory Storage
- Sessions and rate limits are stored in-memory (Map objects)
- For production, consider using Redis or another persistent store
- Automatic cleanup prevents memory leaks

### Scalability
- Horizontal scaling requires shared session storage (Redis)
- Rate limiting should be coordinated across instances
- Consider implementing session affinity for sticky sessions

## Future Enhancements

### Planned Features
1. **AI-Powered Anomaly Detection** (Priority: Medium)
   - Use Gemini AI to analyze verification patterns
   - Detect bot-like behavior based on timing and answer patterns
   - Flag suspicious IPs for manual review

2. **Enhanced Image Captcha**
   - Real image challenges using actual photos
   - Dynamic category generation
   - YOLO object detection integration

3. **Audio Captcha**
   - Accessibility support for visually impaired users
   - Speech-to-text verification

4. **Honeypot Fields**
   - Hidden fields to catch automated bots
   - Zero-impact on legitimate users

## Troubleshooting

### Common Issues

**Issue**: "Session not initialized"
- **Cause**: Frontend called verification before session creation
- **Fix**: Ensure `createCaptchaSession()` completes before verification

**Issue**: "Rate limit exceeded"
- **Cause**: Too many requests from same IP
- **Fix**: Wait for rate limit window to reset (15 minutes)

**Issue**: "Invalid or expired session"
- **Cause**: Session expired (5 minutes) or already used
- **Fix**: Create a new session

**Issue**: Backend not responding
- **Cause**: Server not running or wrong URL
- **Fix**: Check VITE_BACKEND_URL and ensure backend is running

## API Utility Reference

### `captchaApi.js`

**Functions**:
- `createCaptchaSession()` - Creates a new captcha session
- `verifyCaptcha(params)` - Verifies a captcha answer
- `validateCaptchaToken(token)` - Validates a verification token
- `getCaptchaStats()` - Retrieves captcha system statistics

## Monitoring

### Key Metrics to Track
1. **Session Creation Rate** - Monitor for unusual spikes
2. **Verification Success Rate** - Should be >70% for legitimate users
3. **Average Time Per Captcha** - Baseline for anomaly detection
4. **Rate Limit Hits** - Identify potential attack patterns
5. **Lockout Frequency** - Too many lockouts may indicate bot activity

### Logs
Backend logs include:
- Session creation with truncated token
- Verification attempts (success/failure)
- Rate limit violations
- Suspicious activity detection
- Session cleanup operations

## Credits

Developed for DotNation - Polkadot Donation Platform
Backend API: Express.js + Node.js
Frontend: React 18 + Vite + Tailwind CSS
Security: Crypto module + Rate limiting + Session management
