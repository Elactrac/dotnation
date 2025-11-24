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
    console.log('🚀 Starting Members Backend Verification...');
    let passed = 0;
    let failed = 0;
    let postId = null;
    const creatorId = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'; // Alice
    const userAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'; // Bob

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

    // 1. Create Post
    await test('Create Post', async () => {
        const res = await request('POST', '/api/members/post', {
            creatorId,
            title: 'Exclusive Update #1',
            content: 'This is secret content for subscribers only.',
            tier: 1
        });
        if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
        if (!res.body.success) throw new Error('Response missing success: true');
        postId = res.body.postId;
    });

    // 2. Get Feed
    await test('Get Feed', async () => {
        const res = await request('GET', `/api/members/feed/${creatorId}`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        if (!Array.isArray(res.body)) throw new Error('Expected array response');
        const post = res.body.find(p => p.id === postId);
        if (!post) throw new Error('Created post not found in feed');
        if (post.content) throw new Error('Feed should not return content');
        if (!post.locked) throw new Error('Feed items should be locked');
    });

    // 3. Unlock Post
    await test('Unlock Post', async () => {
        const res = await request('POST', '/api/members/unlock', {
            postId,
            userAddress,
            signature: '0x_mock_signature'
        });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        if (!res.body.success) throw new Error('Response missing success: true');
        if (res.body.post.content !== 'This is secret content for subscribers only.') {
            throw new Error('Returned content does not match');
        }
    });

    console.log('\n-------------------');
    console.log(`Tests Completed: ${passed}/${passed + failed} Passed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
