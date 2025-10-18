/**
 * Formatting utilities for DotNation
 * Handles amounts, addresses, dates, and campaign states
 */

/**
 * Format plancks to DOT with proper decimals
 * @param {BigInt|string|number} plancks - Amount in smallest unit (plancks)
 * @param {number} decimals - Number of decimal places (default 12 for DOT)
 * @returns {string} Formatted DOT amount
 */
export const formatDOT = (plancks, decimals = 12) => {
  if (!plancks) return '0';
  
  try {
    const divisor = Math.pow(10, decimals);
    const amount = Number(plancks) / divisor;
    
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  } catch (error) {
    console.error('Error formatting DOT amount:', error);
    return '0';
  }
};

/**
 * Parse DOT amount to plancks
 * @param {string|number} dot - Amount in DOT
 * @param {number} decimals - Number of decimal places (default 12 for DOT)
 * @returns {BigInt} Amount in plancks
 */
export const parseDOT = (dot, decimals = 12) => {
  if (!dot) return BigInt(0);
  
  try {
    const multiplier = Math.pow(10, decimals);
    const amount = parseFloat(dot) * multiplier;
    return BigInt(Math.floor(amount));
  } catch (error) {
    console.error('Error parsing DOT amount:', error);
    return BigInt(0);
  }
};

/**
 * Shorten blockchain address for display
 * @param {string} address - Full blockchain address
 * @param {number} start - Characters to show at start (default 8)
 * @param {number} end - Characters to show at end (default 8)
 * @returns {string} Shortened address
 */
export const shortenAddress = (address, start = 8, end = 8) => {
  if (!address) return '';
  if (address.length <= start + end) return address;
  
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

/**
 * Format timestamp to readable date
 * @param {number|string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format timestamp to readable date and time
 * @param {number|string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return '';
  }
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * @param {number|string|Date} timestamp - Timestamp to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    const isPast = diffMs < 0;
    const abs = Math.abs;
    
    if (abs(diffDay) > 30) {
      return formatDate(timestamp);
    } else if (abs(diffDay) > 0) {
      return isPast 
        ? `${abs(diffDay)} day${abs(diffDay) !== 1 ? 's' : ''} ago`
        : `in ${abs(diffDay)} day${abs(diffDay) !== 1 ? 's' : ''}`;
    } else if (abs(diffHour) > 0) {
      return isPast
        ? `${abs(diffHour)} hour${abs(diffHour) !== 1 ? 's' : ''} ago`
        : `in ${abs(diffHour)} hour${abs(diffHour) !== 1 ? 's' : ''}`;
    } else if (abs(diffMin) > 0) {
      return isPast
        ? `${abs(diffMin)} minute${abs(diffMin) !== 1 ? 's' : ''} ago`
        : `in ${abs(diffMin)} minute${abs(diffMin) !== 1 ? 's' : ''}`;
    } else {
      return 'just now';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Calculate days remaining until deadline
 * @param {number|string|Date} deadline - Deadline timestamp
 * @returns {number} Days remaining (0 if passed)
 */
export const daysRemaining = (deadline) => {
  if (!deadline) return 0;
  
  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return 0;
  }
};

/**
 * Get color scheme for campaign state
 * @param {string} state - Campaign state (Active, Successful, Failed, Withdrawn)
 * @returns {string} Chakra UI color scheme
 */
export const getCampaignStateColor = (state) => {
  const colors = {
    Active: 'blue',
    Successful: 'green',
    Failed: 'red',
    Withdrawn: 'purple',
  };
  
  return colors[state] || 'gray';
};

/**
 * Calculate campaign progress percentage
 * @param {BigInt|string|number} raised - Amount raised
 * @param {BigInt|string|number} goal - Goal amount
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (raised, goal) => {
  if (!goal || goal === 0) return 0;
  
  try {
    const raisedNum = Number(raised);
    const goalNum = Number(goal);
    const progress = (raisedNum / goalNum) * 100;
    
    return Math.min(100, Math.max(0, progress));
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatLargeNumber = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Validate Substrate/Polkadot address format (SS58)
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid SS58 address format
 */
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  
  // Basic SS58 format check: starts with 1-9 or a-z, length between 47-48 chars
  const ss58Regex = /^[1-9A-HJ-NP-Za-km-z]{47,48}$/;
  return ss58Regex.test(address);
};

/**
 * Validate positive number input
 * @param {string|number} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Format campaign deadline status
 * @param {number|string|Date} deadline - Deadline timestamp
 * @returns {object} Status object with message, color, and daysLeft
 */
export const getDeadlineStatus = (deadline) => {
  const days = daysRemaining(deadline);
  
  if (days === 0) {
    return {
      message: 'Campaign ended',
      color: 'red',
      daysLeft: 0,
      isEnded: true,
    };
  } else if (days === 1) {
    return {
      message: '1 day left',
      color: 'orange',
      daysLeft: 1,
      isEnded: false,
    };
  } else if (days <= 7) {
    return {
      message: `${days} days left`,
      color: 'orange',
      daysLeft: days,
      isEnded: false,
    };
  } else {
    return {
      message: `${days} days left`,
      color: 'green',
      daysLeft: days,
      isEnded: false,
    };
  }
};

export default {
  formatDOT,
  parseDOT,
  shortenAddress,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  daysRemaining,
  getCampaignStateColor,
  calculateProgress,
  formatLargeNumber,
  isValidAddress,
  isValidPositiveNumber,
  getDeadlineStatus,
};
