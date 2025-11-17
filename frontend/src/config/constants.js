export const TOKEN_DECIMALS = 12n;

export const CONTRACT_LIMITS = {
  // Storage deposit limit for contract interactions
  // Set to a very high value (1000 DOT) to prevent StorageDepositLimitExhausted errors
  // Contract creation requires significant storage deposit for state storage
  MAX_STORAGE_DEPOSIT: 1000n * (10n ** TOKEN_DECIMALS), // 1000 DOT in plancks
};

export const AMOUNT_LIMITS = {
  MIN_DONATION: 1_000_000_000n, // 0.001 DOT in plancks
  MAX_DONATION: 1_000_000n * (10n ** TOKEN_DECIMALS), // 1,000,000 DOT
  MIN_GOAL: 1_000_000_000_000n, // 1 DOT in plancks
  MAX_GOAL: 1_000_000n * (10n ** TOKEN_DECIMALS), // 1,000,000 DOT
};
