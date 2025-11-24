const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const logger = require('./logger');
const { cacheOps } = require('./redisClient');

// Mock database for posts (In production, use a real DB)
// Structure: { id, creatorId, title, content (encrypted), tier, timestamp }
const postsDB = [];

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

module.exports = router;
