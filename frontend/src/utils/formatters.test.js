import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDotBalance,
  formatDOT,
  shortenAddress,
  getCampaignStatus,
  calculateProgress,
  getDeadlineStatus,
  getCampaignStateColor,
  parseDOT,
  isValidAddress,
  isValidPositiveNumber,
  formatDate,
  formatDateTime
} from './formatters';

// Mock @polkadot/util
vi.mock('@polkadot/util', () => ({
  BN: class BN {
    constructor(value) {
      this.value = value.toString();
    }
    toString() {
      return this.value;
    }
  },
  formatBalance: (balance, options) => {
    const value = balance.value || balance.toString();
    const num = Number(value) / 1e12;
    return `${num} ${options.withUnit}`;
  }
}));

describe('formatDotBalance', () => {
  it('should return "0 DOT" for null or undefined', () => {
    expect(formatDotBalance(null)).toBe('0 DOT');
    expect(formatDotBalance(undefined)).toBe('0 DOT');
    expect(formatDotBalance('')).toBe('0 DOT');
  });

  it('should format balance using Polkadot.js utilities', () => {
    const balance = '1000000000000';
    const formatted = formatDotBalance(balance);
    expect(formatted).toContain('DOT');
  });

  it('should handle BigInt input', () => {
    const balance = BigInt('1000000000000');
    const formatted = formatDotBalance(balance);
    expect(formatted).toContain('DOT');
  });
});

describe('formatDOT', () => {
  it('should convert plancks to DOT string without unit', () => {
    const plancks = BigInt('2500000000000');
    expect(formatDOT(plancks)).toBe('2.5');
  });

  it('should trim trailing zeros in fractional part', () => {
    const plancks = BigInt('1234500000000');
    expect(formatDOT(plancks)).toBe('1.2345');
  });

  it('should return "0" for zero plancks', () => {
    expect(formatDOT(0n)).toBe('0');
  });
});

describe('shortenAddress', () => {
  it('should return empty string for null or undefined', () => {
    expect(shortenAddress(null)).toBe('');
    expect(shortenAddress(undefined)).toBe('');
    expect(shortenAddress('')).toBe('');
  });

  it('should shorten address with default 6 characters', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const shortened = shortenAddress(address);
    expect(shortened).toBe('5Grwva...GKutQY');
  });

  it('should shorten address with custom character count', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const shortened = shortenAddress(address, 4);
    expect(shortened).toBe('5Grw...utQY');
  });
});

describe('getCampaignStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Successful" for successful campaigns', () => {
    const campaign = { state: 'Successful', deadline: Date.now() + 100000 };
    const status = getCampaignStatus(campaign);
    expect(status).toEqual({ text: 'Successful', className: 'status-successful' });
  });

  it('should return "Failed" for failed campaigns', () => {
    const campaign = { state: 'Failed', deadline: Date.now() + 100000 };
    const status = getCampaignStatus(campaign);
    expect(status).toEqual({ text: 'Failed', className: 'status-failed' });
  });

  it('should return "Withdrawn" for withdrawn campaigns', () => {
    const campaign = { state: 'Withdrawn', deadline: Date.now() + 100000 };
    const status = getCampaignStatus(campaign);
    expect(status).toEqual({ text: 'Withdrawn', className: 'status-withdrawn' });
  });

  it('should return "Ended" for campaigns past deadline', () => {
    const campaign = { state: 'Active', deadline: Date.now() - 100000 };
    const status = getCampaignStatus(campaign);
    expect(status).toEqual({ text: 'Ended', className: 'status-failed' });
  });

  it('should return days left for campaigns ending soon', () => {
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const campaign = { state: 'Active', deadline: Date.now() + threeDaysInMs };
    const status = getCampaignStatus(campaign);
    expect(status.text).toMatch(/\d+ Days Left/);
    expect(status.className).toBe('status-ending-soon');
  });

  it('should return "Active" for campaigns with more than 5 days left', () => {
    const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
    const campaign = { state: 'Active', deadline: Date.now() + tenDaysInMs };
    const status = getCampaignStatus(campaign);
    expect(status).toEqual({ text: 'Active', className: 'status-active' });
  });
});

describe('calculateProgress', () => {
  it('should return 0 for null or undefined goal', () => {
    expect(calculateProgress(100n, null)).toBe(0);
    expect(calculateProgress(100n, undefined)).toBe(0);
  });

  it('should return 0 for zero goal', () => {
    expect(calculateProgress(100n, 0n)).toBe(0);
  });

  it('should calculate percentage correctly', () => {
    const raised = 5000n;
    const goal = 10000n;
    expect(calculateProgress(raised, goal)).toBe(50);
  });

  it('should cap progress at 100%', () => {
    const raised = 15000n;
    const goal = 10000n;
    expect(calculateProgress(raised, goal)).toBe(100);
  });

  it('should handle large BigInt values', () => {
    const raised = BigInt('1000000000000');
    const goal = BigInt('2000000000000');
    expect(calculateProgress(raised, goal)).toBe(50);
  });
});

describe('getDeadlineStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Ended" for past deadlines', () => {
    const deadline = Date.now() - 100000;
    const status = getDeadlineStatus(deadline);
    expect(status).toEqual({ text: 'Ended', color: 'red.500' });
  });

  it('should return "Ending Soon" for deadlines within 1 day', () => {
    const deadline = Date.now() + (12 * 60 * 60 * 1000);
    const status = getDeadlineStatus(deadline);
    expect(status).toEqual({ text: 'Ending Soon', color: 'orange.500' });
  });

  it('should return days left for deadlines within 7 days', () => {
    const deadline = Date.now() + (5 * 24 * 60 * 60 * 1000);
    const status = getDeadlineStatus(deadline);
    expect(status.text).toMatch(/\d+ Days Left/);
    expect(status.color).toBe('yellow.500');
  });

  it('should return "Active" for deadlines more than 7 days away', () => {
    const deadline = Date.now() + (10 * 24 * 60 * 60 * 1000);
    const status = getDeadlineStatus(deadline);
    expect(status).toEqual({ text: 'Active', color: 'green.500' });
  });
});

describe('getCampaignStateColor', () => {
  it('should return correct color for Active state', () => {
    expect(getCampaignStateColor('Active')).toBe('green.500');
  });

  it('should return correct color for Successful state', () => {
    expect(getCampaignStateColor('Successful')).toBe('blue.500');
  });

  it('should return correct color for Failed state', () => {
    expect(getCampaignStateColor('Failed')).toBe('red.500');
  });

  it('should return correct color for Withdrawn state', () => {
    expect(getCampaignStateColor('Withdrawn')).toBe('gray.500');
  });

  it('should return default gray color for unknown state', () => {
    expect(getCampaignStateColor('Unknown')).toBe('gray.500');
    expect(getCampaignStateColor('')).toBe('gray.500');
    expect(getCampaignStateColor(null)).toBe('gray.500');
  });
});

describe('parseDOT', () => {
  it('should return 0n for null or undefined', () => {
    expect(parseDOT(null)).toBe(0n);
    expect(parseDOT(undefined)).toBe(0n);
  });

  it('should support numeric input values', () => {
    expect(parseDOT(123)).toBe(BigInt('123000000000000'));
  });

  it('should parse DOT string without unit', () => {
  const result = parseDOT('10.5');
  expect(result).toBe(BigInt('10500000000000'));
  });

  it('should parse DOT string with unit', () => {
  const result = parseDOT('10.5 DOT');
  expect(result).toBe(BigInt('10500000000000'));
  });

  it('should return 0n for invalid number strings', () => {
    expect(parseDOT('invalid')).toBe(0n);
    expect(parseDOT('abc DOT')).toBe(0n);
  });

  it('should handle whole numbers', () => {
  const result = parseDOT('100');
  expect(result).toBe(BigInt('100000000000000'));
  });

  it('should handle small decimal values', () => {
  const result = parseDOT('0.1');
  expect(result).toBe(BigInt('100000000000'));
  });
});

describe('isValidAddress', () => {
  it('should return false for null or undefined', () => {
    expect(isValidAddress(null)).toBe(false);
    expect(isValidAddress(undefined)).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidAddress(123)).toBe(false);
  });

  it('should return false for addresses too short', () => {
    expect(isValidAddress('123')).toBe(false);
    expect(isValidAddress('5GrwvaEF')).toBe(false);
  });

  it('should return false for addresses too long', () => {
    const tooLong = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY12345';
    expect(isValidAddress(tooLong)).toBe(false);
  });

  it('should return true for valid SS58 address length', () => {
    const validAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    expect(isValidAddress(validAddress)).toBe(true);
  });

  it('should accept addresses between 40 and 50 characters', () => {
    const address40 = 'a'.repeat(40);
    const address45 = 'a'.repeat(45);
    const address50 = 'a'.repeat(50);
    
    expect(isValidAddress(address40)).toBe(true);
    expect(isValidAddress(address45)).toBe(true);
    expect(isValidAddress(address50)).toBe(true);
  });
});

describe('isValidPositiveNumber', () => {
  it('should return true for positive numbers', () => {
    expect(isValidPositiveNumber('10')).toBe(true);
    expect(isValidPositiveNumber('0.5')).toBe(true);
    expect(isValidPositiveNumber('100.99')).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isValidPositiveNumber('0')).toBe(false);
    expect(isValidPositiveNumber(0)).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isValidPositiveNumber('-10')).toBe(false);
    expect(isValidPositiveNumber(-5.5)).toBe(false);
  });

  it('should return false for invalid strings', () => {
    expect(isValidPositiveNumber('abc')).toBe(false);
    expect(isValidPositiveNumber('not a number')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(isValidPositiveNumber(null)).toBe(false);
    expect(isValidPositiveNumber(undefined)).toBe(false);
  });

  it('should handle numeric input', () => {
    expect(isValidPositiveNumber(10.5)).toBe(true);
    expect(isValidPositiveNumber(999999)).toBe(true);
  });
});

describe('formatDate', () => {
  it('should return empty string for null or undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('should format timestamp to date string', () => {
    const timestamp = new Date('2025-01-15T10:30:00Z').getTime();
    const result = formatDate(timestamp);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format zero timestamp', () => {
    const result = formatDate(0);
    // Zero is falsy, so formatDate returns empty string
    expect(result).toBe('');
  });
});

describe('formatDateTime', () => {
  it('should return empty string for null or undefined', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
  });

  it('should format timestamp to datetime string', () => {
    const timestamp = new Date('2025-01-15T10:30:00Z').getTime();
    const result = formatDateTime(timestamp);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should include time in the output', () => {
    const timestamp = new Date('2025-01-15T10:30:00Z').getTime();
    const result = formatDateTime(timestamp);
    expect(result.includes(':')).toBe(true);
  });

  it('should format zero timestamp', () => {
    const result = formatDateTime(0);
    // Zero is falsy, so formatDateTime returns empty string
    expect(result).toBe('');
  });
});
