const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const logger = require('./logger');
const { cacheOps, postsOps } = require('./redisClient');

// Mock database for posts (In production, use a real DB)
// Structure: { id, creatorId, title, content (encrypted), tier, timestamp }
const postsDB = [];

// IPFS-based posts are now stored in Redis via postsOps
// Fallback in-memory storage if Redis is unavailable
const ipfsPostsDB = [];

// Mock on-chain verification (In production, query the smart contract)
const verifySubscriptionOnChain = async (userAddress, creatorAddress) => {
    // TODO: Integrate with Polkadot API to check subscription_manager contract
    // For MVP/Demo, we assume valid if user sends a specific "valid_token" or just return true for testing
    logger.info(`Verifying subscription for ${userAddress} -> ${creatorAddress}`);
    return true;
};

/**
 * @route POST /api/members/post
 * @desc Create a new exclusive post
 * @access Private (Creator only)
 */
router.post('/post', [
    check('creatorId').isString().notEmpty(),
    check('title').isString().notEmpty(),
    check('content').isString().notEmpty(),
    check('tier').optional().isNumeric(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { creatorId, title, content, tier = 1 } = req.body;

        // In a real app, we would encrypt 'content' here using a server key
        // For this demo, we'll just store it as is, but the 'unlock' endpoint controls access

        const newPost = {
            id: Date.now().toString(),
            creatorId,
            title,
            content, // This should be encrypted in storage
            tier,
            timestamp: new Date().toISOString()
        };

        postsDB.push(newPost);

        // Invalidate cache for this creator's feed (if Redis available)
        try {
            await cacheOps.del(`feed:${creatorId}`);
        } catch (error) {
            // Redis unavailable, continue without caching
        }

        logger.info(`New member post created by ${creatorId}`);
        res.status(201).json({ success: true, postId: newPost.id });
    } catch (error) {
        logger.error('Error creating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route GET /api/members/feed/:creatorId
 * @desc Get list of posts for a creator (Metadata only, no content)
 * @access Public
 */
router.get('/feed/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Check cache (if Redis available)
        let cachedFeed = null;
        try {
            cachedFeed = await cacheOps.get(`feed:${creatorId}`);
        } catch (error) {
            // Redis unavailable, continue without caching
        }

        if (cachedFeed) {
            return res.json(JSON.parse(cachedFeed));
        }

        const posts = postsDB
            .filter(p => p.creatorId === creatorId)
            .map(({ id, title, tier, timestamp }) => ({
                id,
                title,
                tier,
                timestamp,
                locked: true // Frontend uses this to show "Unlock" button
            }));

        // Cache for 5 minutes (if Redis available)
        try {
            await cacheOps.set(`feed:${creatorId}`, JSON.stringify(posts), 300);
        } catch (error) {
            // Redis unavailable, continue without caching
        }

        res.json(posts);
    } catch (error) {
        logger.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route POST /api/members/unlock
 * @desc Unlock a specific post by verifying subscription
 * @access Private
 */
router.post('/unlock', [
    check('postId').isString().notEmpty(),
    check('userAddress').isString().notEmpty(),
    check('signature').isString().notEmpty(), // Proof of identity
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { postId, userAddress, signature } = req.body;

        const post = postsDB.find(p => p.id === postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // 1. Verify Signature (Proof that userAddress is the caller)
        // TODO: Use @polkadot/util-crypto to verify signature

        // 2. Verify Subscription on Chain
        const isSubscribed = await verifySubscriptionOnChain(userAddress, post.creatorId);

        if (!isSubscribed) {
            return res.status(403).json({ error: 'Active subscription required' });
        }

        // 3. Return Content
        res.json({
            success: true,
            post: {
                id: post.id,
                title: post.title,
                content: post.content, // Revealed content
                timestamp: post.timestamp
            }
        });
    } catch (error) {
        logger.error('Error unlocking post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route POST /api/members/posts
 * @desc Create a new IPFS-based post
 * @access Private (Creator only)
 */
router.post('/posts', [
    check('creatorAddress').isString().notEmpty(),
    check('metadataHash').isString().notEmpty(),
    check('contentHash').isString().notEmpty(),
    check('contentType').isString().notEmpty(),
    check('title').isString().notEmpty(),
    check('description').optional().isString(),
    check('requiredTier').optional().isString(),
    check('status').optional().isString(),
    check('thumbnailHash').optional().isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { 
            creatorAddress, 
            metadataHash, 
            contentHash,
            contentType,
            title,
            description,
            requiredTier,
            status = 'published',
            thumbnailHash
        } = req.body;

        const newPost = {
            id: metadataHash, // Use metadata hash as ID
            creatorAddress,
            metadataHash,
            contentHash,
            contentType,
            title,
            description: description || '',
            requiredTier: requiredTier || 'all',
            status,
            thumbnailHash: thumbnailHash || null,
            timestamp: Date.now(),
            views: 0,
            likes: 0,
            comments: 0
        };

        // Try to save to Redis, fallback to in-memory
        try {
            await postsOps.createPost(newPost);
            logger.info(`New IPFS post created by ${creatorAddress}: ${metadataHash} (Redis)`);
        } catch (error) {
            // Redis unavailable, use in-memory fallback
            logger.warn('Redis unavailable, using in-memory storage for post');
            ipfsPostsDB.push(newPost);
        }

        // Invalidate cache for this creator's posts
        try {
            await cacheOps.del(`creator-posts-cache:${creatorAddress}`);
        } catch (error) {
            // Redis unavailable, continue without caching
        }

        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        logger.error('Error creating IPFS post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route GET /api/members/posts/:creatorAddress
 * @desc Get all posts for a creator
 * @access Public
 */
router.get('/posts/:creatorAddress', async (req, res) => {
    try {
        const { creatorAddress } = req.params;
        const { status, limit = 50, offset = 0 } = req.query;

        // Check cache
        const cacheKey = `creator-posts-cache:${creatorAddress}:${status || 'all'}`;
        let cachedPosts = null;
        try {
            cachedPosts = await cacheOps.get(cacheKey);
        } catch (error) {
            // Redis unavailable
        }

        if (cachedPosts) {
            return res.json(JSON.parse(cachedPosts));
        }

        let response;

        // Try to get posts from Redis
        try {
            response = await postsOps.getCreatorPosts(creatorAddress, {
                status,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            logger.debug(`Fetched ${response.posts.length} posts from Redis for ${creatorAddress}`);
        } catch (error) {
            // Redis unavailable, fallback to in-memory
            logger.warn('Redis unavailable, using in-memory storage for posts');
            let posts = ipfsPostsDB.filter(p => p.creatorAddress === creatorAddress);

            // Filter by status if provided
            if (status) {
                posts = posts.filter(p => p.status === status);
            }

            // Sort by timestamp (newest first)
            posts.sort((a, b) => b.timestamp - a.timestamp);

            // Apply pagination
            const paginatedPosts = posts.slice(
                parseInt(offset), 
                parseInt(offset) + parseInt(limit)
            );

            response = {
                posts: paginatedPosts,
                total: posts.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            };
        }

        // Cache for 5 minutes
        try {
            await cacheOps.set(cacheKey, JSON.stringify(response), 300);
        } catch (error) {
            // Redis unavailable
        }

        res.json(response);
    } catch (error) {
        logger.error('Error fetching creator posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route GET /api/members/posts/:creatorAddress/:postId
 * @desc Get a specific post
 * @access Public
 */
router.get('/posts/:creatorAddress/:postId', async (req, res) => {
    try {
        const { creatorAddress, postId } = req.params;

        let post = null;

        // Try to get post from Redis
        try {
            post = await postsOps.getPost(postId);
            
            if (post && post.creatorAddress === creatorAddress) {
                // Increment view count
                await postsOps.incrementViews(postId);
                post.views += 1; // Update local copy
            } else if (post && post.creatorAddress !== creatorAddress) {
                post = null; // Wrong creator
            }
        } catch (error) {
            // Redis unavailable, fallback to in-memory
            logger.warn('Redis unavailable, using in-memory storage for post');
            post = ipfsPostsDB.find(
                p => p.id === postId && p.creatorAddress === creatorAddress
            );
            if (post) {
                post.views += 1;
            }
        }

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        logger.error('Error fetching post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route PUT /api/members/posts/:postId
 * @desc Update a post
 * @access Private (Creator only)
 */
router.put('/posts/:postId', [
    check('creatorAddress').isString().notEmpty(),
    check('title').optional().isString(),
    check('description').optional().isString(),
    check('requiredTier').optional().isString(),
    check('status').optional().isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { postId } = req.params;
        const { 
            creatorAddress, 
            title, 
            description, 
            requiredTier, 
            status 
        } = req.body;

        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (requiredTier) updates.requiredTier = requiredTier;
        if (status) updates.status = status;

        let updatedPost;

        // Try to update in Redis
        try {
            updatedPost = await postsOps.updatePost(postId, creatorAddress, updates);
            logger.info(`Post ${postId} updated by ${creatorAddress} (Redis)`);
        } catch (error) {
            // Redis unavailable, fallback to in-memory
            logger.warn('Redis unavailable, using in-memory storage for post update');
            const postIndex = ipfsPostsDB.findIndex(
                p => p.id === postId && p.creatorAddress === creatorAddress
            );

            if (postIndex === -1) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Update fields
            if (title) ipfsPostsDB[postIndex].title = title;
            if (description) ipfsPostsDB[postIndex].description = description;
            if (requiredTier) ipfsPostsDB[postIndex].requiredTier = requiredTier;
            if (status) ipfsPostsDB[postIndex].status = status;

            updatedPost = ipfsPostsDB[postIndex];
        }

        // Invalidate cache
        try {
            await cacheOps.del(`creator-posts-cache:${creatorAddress}`);
        } catch (error) {
            // Redis unavailable
        }

        res.json({ success: true, post: updatedPost });
    } catch (error) {
        logger.error('Error updating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route DELETE /api/members/posts/:postId
 * @desc Delete a post
 * @access Private (Creator only)
 */
router.delete('/posts/:postId', [
    check('creatorAddress').isString().notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { postId } = req.params;
        const { creatorAddress } = req.body;

        // Try to delete from Redis
        try {
            await postsOps.deletePost(postId, creatorAddress);
            logger.info(`Post ${postId} deleted by ${creatorAddress} (Redis)`);
        } catch (error) {
            // Redis unavailable, fallback to in-memory
            logger.warn('Redis unavailable, using in-memory storage for post deletion');
            const postIndex = ipfsPostsDB.findIndex(
                p => p.id === postId && p.creatorAddress === creatorAddress
            );

            if (postIndex === -1) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Remove post
            ipfsPostsDB.splice(postIndex, 1);
        }

        // Invalidate cache
        try {
            await cacheOps.del(`creator-posts-cache:${creatorAddress}`);
        } catch (error) {
            // Redis unavailable
        }

        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        logger.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route POST /api/members/posts/:postId/like
 * @desc Like a post
 * @access Public
 */
router.post('/posts/:postId/like', [
    check('userAddress').isString().notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { postId } = req.params;
        const { userAddress } = req.body;

        let likes;

        // Try to increment likes in Redis
        try {
            likes = await postsOps.incrementLikes(postId);
            logger.info(`Post ${postId} liked by ${userAddress} (Redis)`);
        } catch (error) {
            // Redis unavailable, fallback to in-memory
            logger.warn('Redis unavailable, using in-memory storage for like');
            const post = ipfsPostsDB.find(p => p.id === postId);

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Increment likes (in production, track who liked to prevent duplicates)
            post.likes += 1;
            likes = post.likes;
        }

        res.json({ success: true, likes });
    } catch (error) {
        logger.error('Error liking post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
