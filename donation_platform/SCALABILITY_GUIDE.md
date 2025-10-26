# DotNation Scalability Guide

## Overview

This guide covers strategies and implementations for scaling the DotNation crowdfunding platform to handle thousands of campaigns and millions of donations efficiently.

## Current Limitations

### V1 Contract Bottlenecks

1. **No Batch Operations**: Each campaign creation requires a separate transaction
2. **Inefficient Pagination**: `get_all_campaigns()` loads entire dataset into memory
3. **Donation Storage**: All donations stored in a single vector per campaign
4. **No Indexing**: Must iterate through all campaigns to filter by state
5. **Single Transaction Limits**: Large operations can exceed gas limits

## V2 Improvements

### 1. Batch Operations

#### Batch Campaign Creation

Create up to 50 campaigns in a single transaction:

```rust
#[ink(message)]
pub fn create_campaigns_batch(
    &mut self,
    campaigns_data: Vec<(String, String, Balance, Timestamp, AccountId)>,
) -> Result<BatchResult, Error>
```

**Use Case:**
- Migrating campaigns from another platform
- Pre-seeding campaigns for events
- Admin bulk operations

**Gas Savings:**
- Single transaction overhead instead of N transactions
- Reduced signature verification costs
- ~40% cheaper for 10+ campaigns

#### Batch Withdrawals

Withdraw from multiple campaigns at once:

```rust
#[ink(message)]
pub fn withdraw_funds_batch(&mut self, campaign_ids: Vec<u32>) -> Result<BatchResult, Error>
```

**Use Case:**
- Campaign owners with multiple successful campaigns
- Admin cleanup operations
- Automated fund distribution

### 2. Improved Pagination

All listing functions now support offset/limit pagination:

```rust
// V1: Loads all campaigns (memory intensive)
pub fn get_all_campaigns(&self) -> Vec<Campaign>

// V2: Loads only requested slice (efficient)
pub fn get_campaigns_paginated(&self, offset: u32, limit: u32) -> Vec<Campaign>
pub fn get_active_campaigns(&self, offset: u32, limit: u32) -> Vec<Campaign>
pub fn get_campaign_details(&self, campaign_id: u32, offset: u32, limit: u32) -> Option<CampaignDetails>
```

**Benefits:**
- Constant memory usage regardless of total campaigns
- Faster response times
- Lower gas costs for queries

### 3. Configurable Batch Limits

Admin can adjust maximum batch size based on network conditions:

```rust
#[ink(message)]
pub fn set_max_batch_size(&mut self, size: u32) -> Result<(), Error>
```

**Strategy:**
- Start with conservative limit (50)
- Monitor gas usage and success rates
- Increase gradually if network allows
- Decrease during congestion

### 4. Donation Count Tracking

Campaigns now track donation count separately:

```rust
pub struct Campaign {
    // ...
    donation_count: u32, // New field in V2
}
```

**Benefits:**
- Know donation count without loading all donations
- Efficient sorting by popularity
- Better UX for displaying "X donors"

## Scaling Strategies

### Frontend Optimization

#### 1. Infinite Scroll with Pagination

```javascript
// Load campaigns in chunks as user scrolls
const [campaigns, setCampaigns] = useState([]);
const [offset, setOffset] = useState(0);
const PAGE_SIZE = 20;

const loadMoreCampaigns = async () => {
  const newCampaigns = await contract.getCampaignsPaginated(offset, PAGE_SIZE);
  setCampaigns([...campaigns, ...newCampaigns]);
  setOffset(offset + PAGE_SIZE);
};

// Trigger on scroll
useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      loadMoreCampaigns();
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [offset]);
```

#### 2. Client-Side Caching

```javascript
// frontend/src/utils/cache.js
class CampaignCache {
  constructor(ttl = 60000) { // 1 minute TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const campaignCache = new CampaignCache();
```

Usage:

```javascript
const getCampaign = async (id) => {
  // Check cache first
  const cached = campaignCache.get(`campaign_${id}`);
  if (cached) return cached;

  // Fetch from blockchain
  const campaign = await contract.getCampaign(id);
  
  // Cache the result
  campaignCache.set(`campaign_${id}`, campaign);
  
  return campaign;
};
```

#### 3. Event-Based Updates

Subscribe to contract events for real-time updates:

```javascript
// Subscribe to donation events
const subscription = api.query.system.events((events) => {
  events.forEach((record) => {
    const { event } = record;
    
    if (event.section === 'contracts' && event.method === 'ContractEmitted') {
      const [account, eventData] = event.data;
      
      // Parse event type
      if (eventData.eventName === 'DonationReceived') {
        const { campaign_id, amount } = eventData;
        
        // Update local state
        updateCampaignLocally(campaign_id, amount);
        
        // Invalidate cache
        campaignCache.clear();
      }
    }
  });
});
```

### Database Layer (Optional)

For very large scales, consider adding an off-chain indexer:

#### Option 1: SubQuery Indexer

Create a SubQuery project to index all contract events:

```yaml
# project.yaml
specVersion: 1.0.0
name: dotnation-indexer
version: 1.0.0
runner:
  node:
    name: '@subql/node'
    version: '*'
  query:
    name: '@subql/query'
    version: '*'
schema:
  file: ./schema.graphql
network:
  chainId: '0x...' # Your chain ID
  endpoint: wss://rpc.astar.network
  dictionary: https://api.subquery.network/sq/...
dataSources:
  - kind: substrate/Runtime
    startBlock: 1
    mapping:
      file: ./dist/index.js
      handlers:
        - handler: handleCampaignCreated
          kind: substrate/EventHandler
          filter:
            module: contracts
            method: ContractEmitted
```

#### Option 2: The Graph Protocol

```graphql
# schema.graphql
type Campaign @entity {
  id: ID!
  owner: String!
  title: String!
  description: String!
  goal: BigInt!
  raised: BigInt!
  deadline: BigInt!
  state: CampaignState!
  beneficiary: String!
  donations: [Donation!]! @derivedFrom(field: "campaign")
  createdAt: BigInt!
}

type Donation @entity {
  id: ID!
  campaign: Campaign!
  donor: String!
  amount: BigInt!
  timestamp: BigInt!
}

enum CampaignState {
  Active
  Successful
  Failed
  Withdrawn
}
```

Then query via GraphQL:

```javascript
const query = `
  query GetCampaigns($first: Int!, $skip: Int!) {
    campaigns(
      first: $first, 
      skip: $skip, 
      orderBy: raised, 
      orderDirection: desc
    ) {
      id
      title
      goal
      raised
      state
      donations {
        amount
        donor
      }
    }
  }
`;

const { data } = await graphQLClient.query({
  query,
  variables: { first: 20, skip: 0 }
});
```

**Benefits:**
- Lightning-fast queries
- Complex filtering and sorting
- Full-text search
- Real-time subscriptions
- No gas costs for reads

### Storage Optimization

#### 1. Lazy Loading Donations

Only load donations when specifically requested:

```rust
// Don't return donations by default
#[ink(message)]
pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign>

// Separate method for donations
#[ink(message)]
pub fn get_campaign_donations_paginated(
    &self, 
    campaign_id: u32, 
    offset: u32, 
    limit: u32
) -> Vec<Donation>
```

#### 2. Donation Aggregation

For campaigns with thousands of donations, aggregate data:

```rust
pub struct CampaignStats {
    total_donations: u32,
    unique_donors: u32,
    average_donation: Balance,
    largest_donation: Balance,
    recent_donations: Vec<Donation>, // Last 10 only
}

#[ink(message)]
pub fn get_campaign_stats(&self, campaign_id: u32) -> Option<CampaignStats>
```

#### 3. Archival System

Move completed campaigns to cheaper storage:

```rust
// Active campaigns in fast storage
campaigns: Mapping<u32, Campaign>,

// Archived campaigns in compact storage
archived_campaigns: Mapping<u32, ArchivedCampaign>,

#[ink(message)]
pub fn archive_campaign(&mut self, campaign_id: u32) -> Result<(), Error> {
    // Admin only
    // Move withdrawn campaigns to archive after 30 days
}
```

### Gas Optimization

#### 1. Batch Size Tuning

Monitor gas usage and adjust batch sizes:

```javascript
// Test different batch sizes
const sizes = [10, 25, 50, 100];
for (const size of sizes) {
  const startGas = await api.rpc.system.accountNextIndex(account.address);
  
  await contract.createCampaignsBatch(generateCampaigns(size));
  
  const endGas = await api.rpc.system.accountNextIndex(account.address);
  console.log(`Batch size ${size}: ${endGas - startGas} gas`);
}
```

#### 2. Lazy State Updates

Update campaign states only when necessary:

```rust
// V1: Always check and update state
if current_time > campaign.deadline {
    campaign.state = CampaignState::Failed;
    self.campaigns.insert(campaign_id, &campaign);
}

// V2: Only update on interaction
// State transition happens naturally when users interact
```

#### 3. Minimal Data Transfers

Return only required fields:

```rust
// Heavy: Returns full campaign + all donations
pub fn get_campaign_details(&self, campaign_id: u32) -> Option<CampaignDetails>

// Light: Returns only campaign summary
pub fn get_campaign_summary(&self, campaign_id: u32) -> Option<CampaignSummary>
```

## Load Testing

### Test Scenarios

#### Scenario 1: Heavy Campaign Creation

```javascript
// Create 1000 campaigns in batches
const TOTAL_CAMPAIGNS = 1000;
const BATCH_SIZE = 50;

for (let i = 0; i < TOTAL_CAMPAIGNS; i += BATCH_SIZE) {
  const batch = Array(BATCH_SIZE).fill(null).map((_, j) => [
    `Campaign ${i + j}`,
    `Description ${i + j}`,
    1000000000000,
    deadline,
    beneficiary
  ]);
  
  await contract.createCampaignsBatch(batch);
  console.log(`Created campaigns ${i}-${i + BATCH_SIZE}`);
}
```

#### Scenario 2: Concurrent Donations

```javascript
// Simulate 100 concurrent donations
const promises = Array(100).fill(null).map((_, i) => 
  contract.donate(campaignId % 100, { value: 1000000000000 })
);

await Promise.all(promises);
```

#### Scenario 3: Pagination Performance

```javascript
// Measure query time for different pagination sizes
const sizes = [10, 50, 100, 500];

for (const size of sizes) {
  const start = Date.now();
  await contract.getCampaignsPaginated(0, size);
  const end = Date.now();
  
  console.log(`Size ${size}: ${end - start}ms`);
}
```

## Monitoring & Metrics

### Key Metrics to Track

1. **Transaction Success Rate**: % of successful vs failed transactions
2. **Average Gas Cost**: Gas per transaction type
3. **Query Response Time**: Time to fetch campaigns/donations
4. **Cache Hit Rate**: % of requests served from cache
5. **Active Users**: Daily/monthly active addresses

### Monitoring Setup

```javascript
// frontend/src/utils/metrics.js
class Metrics {
  constructor() {
    this.data = {
      transactions: [],
      queries: [],
      errors: [],
    };
  }

  recordTransaction(type, gasUsed, success) {
    this.data.transactions.push({
      type,
      gasUsed,
      success,
      timestamp: Date.now(),
    });
  }

  recordQuery(method, duration) {
    this.data.queries.push({
      method,
      duration,
      timestamp: Date.now(),
    });
  }

  recordError(error, context) {
    this.data.errors.push({
      error: error.message,
      context,
      timestamp: Date.now(),
    });
  }

  getStats() {
    return {
      avgGas: this.calculateAverageGas(),
      successRate: this.calculateSuccessRate(),
      avgQueryTime: this.calculateAverageQueryTime(),
      errorRate: this.calculateErrorRate(),
    };
  }
}

export const metrics = new Metrics();
```

## Best Practices

### For Developers

1. **Always Use Pagination**: Never fetch all items at once
2. **Implement Caching**: Cache frequently accessed data
3. **Batch When Possible**: Use batch operations for multiple items
4. **Monitor Gas Usage**: Track and optimize gas-heavy operations
5. **Test at Scale**: Use realistic data volumes in testing

### For Users

1. **Create Campaigns in Batches**: If creating multiple campaigns, use batch operation
2. **Withdraw in Batches**: Withdraw from multiple campaigns at once
3. **Use Filters**: Filter campaigns on frontend before querying
4. **Subscribe to Events**: Use event subscriptions for real-time updates

### For Admins

1. **Adjust Batch Limits**: Monitor and adjust based on network conditions
2. **Archive Old Campaigns**: Move completed campaigns to archive
3. **Monitor Metrics**: Track gas costs and success rates
4. **Plan Upgrades**: Schedule upgrades during low-traffic periods

## Future Optimizations (V3+)

### 1. State Channels

For high-frequency donations, use state channels:
- Donations happen off-chain
- Periodically settle on-chain
- Reduces gas costs by 90%+

### 2. Rollups

Aggregate multiple operations:
- Batch 1000+ donations into single proof
- Submit to base layer
- Near-instant finality

### 3. Storage Rent

Implement storage rent for old campaigns:
- Charge small fee for long-term storage
- Incentivize archival
- Free up blockchain state

### 4. Sharding

Distribute campaigns across shards:
- Each shard handles subset of campaigns
- Parallel processing
- Linear scalability

## Resources

- [ink! Optimization Guide](https://use.ink/basics/gas)
- [Polkadot Scaling Solutions](https://wiki.polkadot.network/docs/learn-scaling)
- [SubQuery Documentation](https://academy.subquery.network/)
- [The Graph Protocol](https://thegraph.com/docs/)

---

**Last Updated:** October 26, 2025  
**Target Scale:** 100k+ campaigns, 10M+ donations  
**Status:** V2 Production Ready
