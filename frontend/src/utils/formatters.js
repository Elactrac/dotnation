import { BN, formatBalance } from '@polkadot/util';

// This function is a placeholder until the API is fully integrated
export const formatDotBalance = (balance) => {
  if (!balance) return '0 DOT';
  
  // Assuming balance is a BigInt or a string that can be converted to BN
  const bnBalance = new BN(balance.toString());
  
  // Format the balance using Polkadot.js utility
  // You might need to adjust the decimals based on the chain's configuration
  return formatBalance(bnBalance, { withSi: true, withUnit: 'DOT' });
};


export const shortenAddress = (address, chars = 6) => {
  if (!address) return '';
  const prefix = address.slice(0, chars);
  const suffix = address.slice(-chars);
  return `${prefix}...${suffix}`;
};

export const getCampaignStatus = (campaign) => {
    const now = Date.now();
    if (campaign.state === 'Successful') return { text: 'Successful', className: 'status-successful' };
    if (campaign.state === 'Failed') return { text: 'Failed', className: 'status-failed' };
    if (campaign.state === 'Withdrawn') return { text: 'Withdrawn', className: 'status-withdrawn' };

    const timeLeft = campaign.deadline - now;
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

    if (timeLeft <= 0) return { text: 'Ended', className: 'status-failed' };
    if (daysLeft <= 5) return { text: `${daysLeft} Days Left`, className: 'status-ending-soon' };
    
    return { text: 'Active', className: 'status-active' };
};

export const calculateProgress = (raised, goal) => {
    if (!goal || goal === 0n) return 0;
    const percentage = (Number(raised) / Number(goal)) * 100;
    return Math.min(percentage, 100);
};

export const getDeadlineStatus = (deadline) => {
    const now = Date.now();
    const timeLeft = deadline - now;

    if (timeLeft <= 0) return { text: 'Ended', color: 'red.500' };

    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

    if (daysLeft <= 1) return { text: 'Ending Soon', color: 'orange.500' };
    if (daysLeft <= 7) return { text: `${daysLeft} Days Left`, color: 'yellow.500' };

    return { text: 'Active', color: 'green.500' };
};

export const getCampaignStateColor = (state) => {
    switch (state) {
        case 'Active': return 'green.500';
        case 'Successful': return 'blue.500';
        case 'Failed': return 'red.500';
        case 'Withdrawn': return 'gray.500';
        default: return 'gray.500';
    }
};

export const formatDOT = formatDotBalance; // Alias for compatibility

export const parseDOT = (value) => {
    if (!value || typeof value !== 'string') return 0n;
    // Simple parsing, assuming value is like "10.5 DOT"
    const num = parseFloat(value.replace(' DOT', ''));
    if (isNaN(num)) return 0n;
    // Convert to smallest unit (assuming 10 decimals)
    return BigInt(Math.floor(num * 1e10));
};

export const isValidAddress = (address) => {
    // Basic SS58 address validation
    return typeof address === 'string' && address.length >= 40 && address.length <= 50;
};

export const isValidPositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
};

export const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
};

export const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
};