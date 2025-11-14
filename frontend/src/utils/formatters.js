import { BN, formatBalance } from '@polkadot/util';
import { TOKEN_DECIMALS, AMOUNT_LIMITS } from '../config/constants';

const DECIMALS_NUMBER = Number(TOKEN_DECIMALS);

const toPlanckBigInt = (value) => {
  if (value === null || value === undefined) {
    return 0n;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return 0n;
    }
    return BigInt(Math.trunc(value));
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    if (normalized === '') {
      return 0n;
    }

    if (/^-?\d+$/.test(normalized)) {
      return BigInt(normalized);
    }

    // String contains decimals – parse as DOT value
    return parseDOT(normalized);
  }

  if (typeof value.toString === 'function') {
    return toPlanckBigInt(value.toString());
  }

  return 0n;
};

/**
 * Formats a given balance into a human-readable string with a "DOT" unit.
 *
 * This function takes a balance, which can be a string, number, or BigInt,
 * and uses the Polkadot.js utility to format it into a concise representation
 * (e.g., "1.23 kDOT").
 *
 * @param {string|number|BN} balance - The balance to format (in plancks, 12 decimals).
 * @returns {string} The formatted balance string (e.g., "1.23 kDOT") or "0 DOT"
 *   if the balance is zero or undefined.
 */
export const formatDotBalance = (balance) => {
  if (balance === null || balance === undefined) {
    return '0 DOT';
  }

  try {
    const plancks = toPlanckBigInt(balance);
    const bnBalance = new BN(plancks.toString());
    return formatBalance(bnBalance, {
      decimals: DECIMALS_NUMBER,
      withSi: true,
      withUnit: 'DOT',
    });
  } catch (err) {
    console.error('Error formatting balance:', err);
    return '0 DOT';
  }
};

/**
 * Shortens a Polkadot address for display purposes.
 *
 * It returns a truncated version of the address, showing the first and last
 * few characters, separated by an ellipsis.
 *
 * @param {string} address - The full Polkadot address to shorten.
 * @param {number} [chars=6] - The number of characters to show at the beginning
 *   and end of the address.
 * @returns {string} The shortened address (e.g., "15Gf...K9aW").
 */
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
  const goalBigInt = toPlanckBigInt(goal);
  if (goalBigInt <= 0n) {
    return 0;
  }

  const raisedBigInt = toPlanckBigInt(raised);
  if (raisedBigInt <= 0n) {
    return 0;
  }

  const scaled = (raisedBigInt * 10000n) / goalBigInt; // two decimal precision
  const cappedScaled = scaled > 10000n ? 10000n : scaled;
  return Number(cappedScaled) / 100;
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

export const parseDOT = (value, decimals = DECIMALS_NUMBER) => {
  if (value === null || value === undefined) {
    return 0n;
  }

  if (typeof value === 'bigint') {
    return value;
  }

  let normalized;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return 0n;
    }
    normalized = value.toString();
  } else if (typeof value === 'string') {
    normalized = value.replace(/,/g, '').replace(/[^0-9.]/g, '');
  } else if (typeof value.toString === 'function') {
    normalized = value.toString();
  } else {
    return 0n;
  }

  if (!normalized) {
    return 0n;
  }

  if (!/^\d*(\.\d*)?$/.test(normalized)) {
    return 0n;
  }

  const [whole = '0', fraction = ''] = normalized.split('.');
  const fractionPadded = (fraction + '0'.repeat(decimals)).slice(0, decimals);

  try {
    return BigInt(whole || '0') * (10n ** BigInt(decimals)) + BigInt(fractionPadded || '0');
  } catch (error) {
    console.error('parseDOT failed:', error);
    return 0n;
  }
};

export const formatDOT = (plancks, decimals = DECIMALS_NUMBER) => {
  const value = toPlanckBigInt(plancks);
  if (value === 0n) {
    return '0';
  }

  const divisor = 10n ** BigInt(decimals);
  const wholePart = value / divisor;
  const fractionPart = value % divisor;

  if (fractionPart === 0n) {
    return wholePart.toString();
  }

  const fractionString = fractionPart.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${wholePart.toString()}.${fractionString}`;
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

export const validateAmountInRange = (plancks) => {
  const amount = toPlanckBigInt(plancks);
  return amount >= AMOUNT_LIMITS.MIN_DONATION && amount <= AMOUNT_LIMITS.MAX_DONATION;
};