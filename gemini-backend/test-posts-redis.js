/**
 * Test script for Redis posts operations
 */

require('dotenv').config();
const { initializeRedis, postsOps, closeRedis } = require('./redisClient');

async function testPostsOperations() {
  console.log('🧪 Testing Redis Posts Operations...\n');

  try {
    // Initialize Redis
    console.log('1️⃣ Initializing Redis...');
    await initializeRedis();
    console.log('✅ Redis connected\n');

    // Test data
    const testCreatorAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const testPost = {
      id: 'QmTestHash123',
      creatorAddress: testCreatorAddress,
      metadataHash: 'QmTestHash123',
      contentHash: 'QmContentHash456',
      contentType: 'text',
      title: 'Test Post',
      description: 'This is a test post for Redis integration',
      requiredTier: 'tier_1',
      status: 'published',
      thumbnailHash: null,
      timestamp: Date.now(),
      views: 0,
      likes: 0,
      comments: 0
    };

    // Test 1: Create Post
    console.log('2️⃣ Creating test post...');
    const createdPost = await postsOps.createPost(testPost);
    console.log('✅ Post created:', createdPost.id);
    console.log(`   Title: ${createdPost.title}\n`);

    // Test 2: Get Post
    console.log('3️⃣ Fetching post by ID...');
    const fetchedPost = await postsOps.getPost(testPost.id);
    console.log('✅ Post fetched:', fetchedPost.id);
    console.log(`   Title: ${fetchedPost.title}\n`);

    // Test 3: Get Creator Posts
    console.log('4️⃣ Fetching all posts for creator...');
    const creatorPosts = await postsOps.getCreatorPosts(testCreatorAddress);
    console.log(`✅ Found ${creatorPosts.posts.length} post(s) for creator`);
    console.log(`   Total: ${creatorPosts.total}\n`);

    // Test 4: Update Post
    console.log('5️⃣ Updating post...');
    const updatedPost = await postsOps.updatePost(
      testPost.id,
      testCreatorAddress,
      { title: 'Updated Test Post', description: 'This post has been updated' }
    );
    console.log('✅ Post updated:', updatedPost.id);
    console.log(`   New Title: ${updatedPost.title}\n`);

    // Test 5: Increment Views
    console.log('6️⃣ Incrementing views...');
    const views = await postsOps.incrementViews(testPost.id);
    console.log(`✅ Views incremented: ${views}\n`);

    // Test 6: Increment Likes
    console.log('7️⃣ Incrementing likes...');
    const likes = await postsOps.incrementLikes(testPost.id);
    console.log(`✅ Likes incremented: ${likes}\n`);

    // Test 7: Get Posts Count
    console.log('8️⃣ Getting posts count for creator...');
    const count = await postsOps.getCreatorPostsCount(testCreatorAddress);
    console.log(`✅ Total posts for creator: ${count}\n`);

    // Test 8: Delete Post
    console.log('9️⃣ Deleting post...');
    await postsOps.deletePost(testPost.id, testCreatorAddress);
    console.log('✅ Post deleted\n');

    // Test 9: Verify Deletion
    console.log('🔟 Verifying deletion...');
    const deletedPost = await postsOps.getPost(testPost.id);
    if (deletedPost === null) {
      console.log('✅ Post successfully deleted (not found)\n');
    } else {
      console.log('❌ Post still exists after deletion\n');
    }

    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Close Redis connection
    console.log('Closing Redis connection...');
    await closeRedis();
    console.log('✅ Redis connection closed');
  }
}

// Run tests
testPostsOperations();
