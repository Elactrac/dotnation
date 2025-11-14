export const TOKEN_DECIMALS = 12n;

export const CONTRACT_LIMITS = {
  MAX_STORAGE_DEPOSIT: 10n * (10n ** TOKEN_DECIMALS), // 10 DOT in plancks
};

export const AMOUNT_LIMITS = {
  MIN_DONATION: 1_000_000_000n, // 0.001 DOT in plancks
  MAX_DONATION: 1_000_000n * (10n ** TOKEN_DECIMALS), // 1,000,000 DOT
  MIN_GOAL: 1_000_000_000_000n, // 1 DOT in plancks
  MAX_GOAL: 1_000_000n * (10n ** TOKEN_DECIMALS), // 1,000,000 DOT
};
