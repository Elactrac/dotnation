const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_KEY = process.env.BACKEND_API_KEY || 'dev_api_key_12345';

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
    console.log('🚀 Starting reCAPTCHA Verification...');
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

    // 1. Missing Token
    await test('Missing Token', async () => {
        const res = await request('POST', '/api/verify-recaptcha', {});
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
        if (res.body.error !== 'Token is required') throw new Error('Unexpected error message');
    });

    // 2. Invalid Token (Google Test Keys always return success)
    await test('Invalid Token (Test Keys)', async () => {
        const res = await request('POST', '/api/verify-recaptcha', {
            token: 'invalid_token_for_testing'
        });

        // With Google's test keys, verification ALWAYS succeeds
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        if (res.body.success !== true) throw new Error('Test keys should always pass verification');
        console.log('   (Note: Test keys always return success, this is expected)');
    });

    console.log('\n-------------------');
    console.log(`Tests Completed: ${passed}/${passed + failed} Passed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
