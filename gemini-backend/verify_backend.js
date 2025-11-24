const http = require('http');
const crypto = require('crypto');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_KEY = process.env.BACKEND_API_KEY || 'your_api_key_here'; // Use default if not set

// Helper for making HTTP requests
function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                ...headers,
            },
        };

        const req = http.request(`${BASE_URL}${path}`, options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : null;
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting Backend API Verification...');
    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            process.stdout.write(`Testing ${name}... `);
            await fn();
            console.log('✅ PASSED');
            passed++;
        } catch (error) {
            console.log('❌ FAILED');
            console.error('  Error:', error.message);
            failed++;
        }
    };

    // 1. Health Check
    await test('GET /health', async () => {
        const res = await request('GET', '/health');
        if (res.status !== 200 && res.status !== 503) throw new Error(`Status ${res.status}`);
        if (res.body.status !== 'ok') throw new Error('Status not ok');
    });

    // 2. Generate Description
    await test('POST /api/generate-description', async () => {
        const res = await request('POST', '/api/generate-description', {
            title: 'Test Campaign'
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
        if (!res.body.description) throw new Error('No description returned');
    });

    // 3. Summarize
    await test('POST /api/summarize', async () => {
        const res = await request('POST', '/api/summarize', {
            description: 'This is a long description that needs summarizing. It is about a project that does good things and helps many people in the community. We are building a better future for everyone involved.',
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
        if (!res.body.summary) throw new Error('No summary returned');
    });

    // 4. Contract Summary
    await test('POST /api/contract-summary', async () => {
        const res = await request('POST', '/api/contract-summary', {
            title: 'Test Campaign',
            description: 'This is a detailed description of the campaign that meets the minimum length requirement. It explains the project goals, the team, and the expected impact on the community. We need your support to make this happen.',
            goal: 100,
            deadline: new Date().toISOString(),
            beneficiary: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
        if (!res.body.summary) throw new Error('No summary returned');
    });

    // 5. Fraud Detection
    await test('POST /api/fraud-detection', async () => {
        const res = await request('POST', '/api/fraud-detection', {
            campaign: {
                title: 'Suspicious Campaign',
                description: 'Give me money for nothing. This is a scam campaign but I need to make the description long enough to pass validation so I can test the fraud detection system. Please do not actually donate to this.',
                goal: 1000000
            }
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.body)}`);
        if (typeof res.body.overallRiskScore === 'undefined') throw new Error('No risk score returned');
    });

    // 6. Captcha Flow
    let sessionToken;
    await test('Captcha Flow', async () => {
        // a. Create Session
        const sessionRes = await request('POST', '/api/captcha/session');
        if (sessionRes.status !== 200) throw new Error(`Session creation failed: ${sessionRes.status}`);
        sessionToken = sessionRes.body.sessionToken;
        if (!sessionToken) throw new Error('No session token');

        // b. Get Challenge
        const challengeRes = await request('POST', '/api/captcha/challenge', {
            sessionToken,
            captchaType: 'math',
            difficulty: 0
        });
        if (challengeRes.status !== 200) throw new Error(`Challenge failed: ${challengeRes.status}`);
        // Math captcha returns 'challenge' object with num1, num2, etc.
        if (!challengeRes.body.challenge) throw new Error('No challenge returned');

        // c. Verify (Mocking correct answer is hard without knowing it, but we can test failure)
        const verifyRes = await request('POST', '/api/captcha/verify', {
            sessionToken,
            captchaType: 'math',
            userAnswer: 'wrong',
            timeTaken: 5
        });
        if (verifyRes.status !== 200) throw new Error(`Verify failed: ${verifyRes.status}`);
        if (verifyRes.body.verified) throw new Error('Should have failed verification');
    });

    // 7. Profile Save & Load
    const testWallet = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'; // Valid SS58 address
    await test('Profile Save & Load', async () => {
        // Save
        const saveRes = await request('POST', '/api/profile/save', {
            walletAddress: testWallet,
            profile: {
                displayName: 'Test User',
                bio: 'Hello World, this is a bio that is long enough.',
                emailNotifications: true
            }
        });

        // If Redis is down, this might return 503, which is acceptable for this test environment
        if (saveRes.status === 503) {
            console.log('  (Skipping profile test - Redis unavailable)');
            return;
        }

        if (saveRes.status !== 200) throw new Error(`Save failed: ${saveRes.status}`);

        // Load
        const loadRes = await request('GET', `/api/profile/${testWallet}`);
        if (loadRes.status !== 200) throw new Error(`Load failed: ${loadRes.status}`);
        if (loadRes.body.profile?.displayName !== 'Test User') throw new Error('Profile mismatch');
    });

    console.log('\n-------------------');
    console.log(`Tests Completed: ${passed}/${passed + failed} Passed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
