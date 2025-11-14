/**
 * Mock storage utility for campaigns when blockchain is not available
 * Stores campaigns in localStorage for testing purposes
 */

const STORAGE_KEY = 'dotnation_mock_campaigns';
const DONATIONS_KEY = 'dotnation_mock_donations';

/**
 * Get all campaigns from localStorage
 * @returns {Array} Array of campaign objects
 */
export const getMockCampaigns = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Return initial mock data if nothing stored
    return [
      {
        id: 1,
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        title: 'Decentralized Education Platform',
        description: 'Building the future of learning with blockchain technology.',
        goal: 1000000000000n,
        raised: 500000000000n,
        deadline: Date.now() + 86400000 * 30, // 30 days
        state: 'Active',
        beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmvcE1QP9KG1Yqk5j9',
      },
      {
        id: 2,
        owner: '5FHneW46xGXgs5mUiveU4sbTyGBzmvcE1QP9KG1Yqk5j9',
        title: 'Green Energy Initiative',
        description: 'Funding renewable energy projects for a sustainable future.',
        goal: 2000000000000n,
        raised: 800000000000n,
        deadline: Date.now() + 86400000 * 15, // 15 days
        state: 'Active',
        beneficiary: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
    ];
  } catch (error) {
    console.error('Error reading mock campaigns:', error);
    return [];
  }
};

/**
 * Save campaigns to localStorage
 * @param {Array} campaigns - Array of campaign objects
 */
export const saveMockCampaigns = (campaigns) => {
  try {
    // Convert BigInt to string for JSON serialization
    const serializable = campaigns.map(c => ({
      ...c,
      goal: c.goal.toString(),
      raised: c.raised.toString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Error saving mock campaigns:', error);
  }
};

/**
 * Add a new campaign
 * @param {Object} campaignData - Campaign data object
 * @returns {Object} The created campaign with ID
 */
export const addMockCampaign = (campaignData) => {
  const campaigns = getMockCampaigns();
  
  // Convert string values back to BigInt if needed
  const parsedCampaigns = campaigns.map(c => ({
    ...c,
    goal: typeof c.goal === 'string' ? BigInt(c.goal) : c.goal,
    raised: typeof c.raised === 'string' ? BigInt(c.raised) : c.raised,
  }));
  
  const newId = parsedCampaigns.length > 0 
    ? Math.max(...parsedCampaigns.map(c => c.id)) + 1 
    : 1;
  
  const newCampaign = {
    id: newId,
    ...campaignData,
    raised: 0n,
    state: 'Active',
  };
  
  parsedCampaigns.push(newCampaign);
  saveMockCampaigns(parsedCampaigns);
  
  return newCampaign;
};

/**
 * Get campaign by ID
 * @param {number} campaignId - Campaign ID
 * @returns {Object|null} Campaign object or null if not found
 */
export const getMockCampaignById = (campaignId) => {
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find(c => c.id === parseInt(campaignId));
  
  if (campaign) {
    // Convert string to BigInt if needed
    return {
      ...campaign,
      goal: typeof campaign.goal === 'string' ? BigInt(campaign.goal) : campaign.goal,
      raised: typeof campaign.raised === 'string' ? BigInt(campaign.raised) : campaign.raised,
    };
  }
  
  return null;
};

/**
 * Get donations for a campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Array} Array of donation objects
 */
export const getMockDonations = (campaignId) => {
  try {
    const stored = localStorage.getItem(DONATIONS_KEY);
    const allDonations = stored ? JSON.parse(stored) : {};
    const donations = allDonations[campaignId] || [];
    
    // Convert string to BigInt
    return donations.map(d => ({
      ...d,
      amount: typeof d.amount === 'string' ? BigInt(d.amount) : d.amount,
    }));
  } catch (error) {
    console.error('Error reading mock donations:', error);
    return [];
  }
};

/**
 * Add a donation to a campaign
 * @param {number} campaignId - Campaign ID
 * @param {string} donor - Donor address
 * @param {BigInt} amount - Donation amount in planks
 * @returns {Object} Updated campaign
 */
export const addMockDonation = (campaignId, donor, amount) => {
  // Update donations
  const stored = localStorage.getItem(DONATIONS_KEY);
  const allDonations = stored ? JSON.parse(stored) : {};
  
  if (!allDonations[campaignId]) {
    allDonations[campaignId] = [];
  }
  
  allDonations[campaignId].push({
    donor,
    amount: amount.toString(),
    timestamp: Date.now(),
  });
  
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(allDonations));
  
  // Update campaign raised amount
  const campaigns = getMockCampaigns();
  const parsedCampaigns = campaigns.map(c => {
    const campaign = {
      ...c,
      goal: typeof c.goal === 'string' ? BigInt(c.goal) : c.goal,
      raised: typeof c.raised === 'string' ? BigInt(c.raised) : c.raised,
    };
    
    if (campaign.id === campaignId) {
      campaign.raised = campaign.raised + amount;
      
      // Check if goal reached
      if (campaign.raised >= campaign.goal) {
        campaign.state = 'Successful';
      }
    }
    
    return campaign;
  });
  
  saveMockCampaigns(parsedCampaigns);
  
  return getMockCampaignById(campaignId);
};

/**
 * Update campaign state
 * @param {number} campaignId - Campaign ID
 * @param {string} newState - New state (Active, Successful, Failed, Cancelled)
 * @returns {Object} Updated campaign
 */
export const updateMockCampaignState = (campaignId, newState) => {
  const campaigns = getMockCampaigns();
  const parsedCampaigns = campaigns.map(c => {
    const campaign = {
      ...c,
      goal: typeof c.goal === 'string' ? BigInt(c.goal) : c.goal,
      raised: typeof c.raised === 'string' ? BigInt(c.raised) : c.raised,
    };
    
    if (campaign.id === campaignId) {
      campaign.state = newState;
    }
    
    return campaign;
  });
  
  saveMockCampaigns(parsedCampaigns);
  
  return getMockCampaignById(campaignId);
};

/**
 * Clear all mock data (useful for testing)
 */
export const clearMockData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DONATIONS_KEY);
};
