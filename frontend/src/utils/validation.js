import { decodeAddress } from '@polkadot/util-crypto';
import { AMOUNT_LIMITS } from '../config/constants';
import { parseDOT } from './formatters';

const MALICIOUS_PATTERNS = /<script|<iframe|javascript:|on\w+=|data:text\/html|expression\(|url\(/i;
const ENTITY_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '&': '&amp;',
};

const sanitizeWithMap = (text) => String(text).replace(/[<>"'&]/g, (char) => ENTITY_MAP[char]);

export const sanitizeText = (text) => sanitizeWithMap(text);

export const validateSubstrateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  try {
    decodeAddress(address);
    return true;
  } catch (error) {
    console.warn('[validation] Invalid address detected:', error?.message);
    return false;
  }
};

export const validateCampaignTitle = (title) => {
  const sanitized = sanitizeText(title?.trim?.() || '');

  if (sanitized.length === 0 || sanitized.length > 100) {
    throw new Error('Title must be between 1 and 100 characters.');
  }

  if (MALICIOUS_PATTERNS.test(sanitized)) {
    throw new Error('Title contains potentially malicious content.');
  }

  return sanitized;
};

export const validateCampaignDescription = (description) => {
  const sanitized = sanitizeText(description?.trim?.() || '');

  if (sanitized.length === 0 || sanitized.length > 1000) {
    throw new Error('Description must be between 1 and 1000 characters.');
  }

  if (MALICIOUS_PATTERNS.test(sanitized)) {
    throw new Error('Description contains potentially malicious content.');
  }

  return sanitized;
};

export const validateGoalAmount = (goalInDots) => {
  const plancks = typeof goalInDots === 'bigint' ? goalInDots : parseDOT(goalInDots);

  if (plancks < AMOUNT_LIMITS.MIN_GOAL || plancks > AMOUNT_LIMITS.MAX_GOAL) {
    throw new Error('Goal must be between 1 and 1,000,000 DOT.');
  }

  return plancks;
};

export const validateDonationAmount = (amountInDots) => {
  const plancks = typeof amountInDots === 'bigint' ? amountInDots : parseDOT(amountInDots);

  if (plancks < AMOUNT_LIMITS.MIN_DONATION || plancks > AMOUNT_LIMITS.MAX_DONATION) {
    throw new Error('Donation amount must be between 0.001 and 1,000,000 DOT.');
  }

  return plancks;
};

export const stripHtmlTags = (value = '') => value.replace(/<[^>]*>/g, '');
