/**
 * XCM Cross-Chain Configuration
 * 
 * Defines supported parachains for cross-chain donations
 * using Polkadot's XCM (Cross-Consensus Messaging)
 */

export const SUPPORTED_CHAINS = [
  {
    id: 'paseo',
    name: 'Paseo Relay',
    symbol: 'PAS',
    decimals: 10,
    logo: '🔴',
    rpc: 'wss://paseo.rpc.amforc.com',
    fallbackRpcs: [
      'wss://paseo-rpc.dwellir.com',
      'wss://rpc.ibp.network/paseo'
    ],
    description: 'Donate PAS from Paseo Relay Chain (Testnet)'
  },
  {
    id: 'assetHubPaseo',
    name: 'Asset Hub Paseo',
    symbol: 'PAS',
    decimals: 10,
    logo: '💎',
    rpc: 'wss://sys.ibp.network/asset-hub-paseo',
    fallbackRpcs: [
      'wss://paseo-asset-hub-rpc.polkadot.io',
      'wss://asset-hub-paseo-rpc.dwellir.com'
    ],
    description: 'Donate from Asset Hub on Paseo (Testnet)'
  },
  {
    id: 'moonbasePaseo',
    name: 'Moonbase Alpha',
    symbol: 'DEV',
    decimals: 18,
    logo: '🌙',
    rpc: 'wss://wss.api.moonbase.moonbeam.network',
    fallbackRpcs: [
      'wss://moonbeam-alpha.api.onfinality.io/public-ws'
    ],
    supportedAssets: ['DEV', 'PAS'],
    description: 'Donate from Moonbase Alpha (Testnet)'
  }
  // Note: For production deployment on mainnet, uncomment below:
  // {
  //   id: 'polkadot',
  //   name: 'Polkadot Relay',
  //   symbol: 'DOT',
  //   decimals: 10,
  //   logo: '🔴',
  //   rpc: 'wss://rpc.polkadot.io',
  //   description: 'Donate DOT from Polkadot Relay Chain'
  // },
  // {
  //   id: 'assetHub',
  //   name: 'Asset Hub',
  //   symbol: 'DOT',
  //   decimals: 10,
  //   logo: '💎',
  //   rpc: 'wss://polkadot-asset-hub-rpc.polkadot.io',
  //   description: 'Donate from Asset Hub (formerly Statemint)'
  // },
  // {
  //   id: 'moonbeam',
  //   name: 'Moonbeam',
  //   symbol: 'GLMR',
  //   decimals: 18,
  //   logo: '🌙',
  //   rpc: 'wss://wss.api.moonbeam.network',
  //   supportedAssets: ['GLMR', 'DOT', 'USDC', 'USDT'],
  //   description: 'Donate from Moonbeam (EVM-compatible)'
  // },
  // {
  //   id: 'acala',
  //   name: 'Acala',
  //   symbol: 'ACA',
  //   decimals: 12,
  //   logo: '🔷',
  //   rpc: 'wss://acala-rpc.dwellir.com',
  //   supportedAssets: ['ACA', 'DOT', 'aUSD'],
  //   description: 'Donate from Acala DeFi Hub'
  // },
  // {
  //   id: 'astar',
  //   name: 'Astar',
  //   symbol: 'ASTR',
  //   decimals: 18,
  //   logo: '⭐',
  //   rpc: 'wss://rpc.astar.network',
  //   supportedAssets: ['ASTR', 'DOT'],
  //   description: 'Donate from Astar Network'
  // }
];

// Target chain (where DotNation contract lives)
export const DESTINATION_CHAIN = {
  id: 'mandala',
  name: 'Mandala Paseo',
  symbol: 'UNIT',
  decimals: 12,
  paraId: 4040, // Mandala's para ID on Paseo
  rpc: 'wss://rpc2.paseo.mandalachain.io',
  fallbackRpcs: [
    'wss://mandala-paseo-rpc.aca-api.network',
    'wss://mandala-rpc.aca-staging.network/paseo'
  ]
};

// Asset conversion rates (for estimation only)
// In production, fetch from DEX price feeds
export const ASSET_CONVERSION_RATES = {
  'PAS': 1,      // Paseo testnet token
  'DEV': 0.15,   // Moonbase Alpha testnet token
  'UNIT': 1,     // Mandala testnet token
  // For mainnet (when switching):
  // 'DOT': 1,
  // 'GLMR': 0.15,
  // 'ACA': 0.05,
  // 'ASTR': 0.04,
  // 'USDC': 7.5,
  // 'USDT': 7.5,
  // 'aUSD': 7.5
};

// XCM Transfer fees (estimated for testnet)
export const XCM_FEES = {
  paseo: '0.01',           // 0.01 PAS
  assetHubPaseo: '0.005',  // 0.005 PAS
  moonbasePaseo: '0.1',    // 0.1 DEV
  // For mainnet (when switching):
  // polkadot: '0.01',     // 0.01 DOT
  // assetHub: '0.005',    // 0.005 DOT
  // moonbeam: '0.1',      // 0.1 GLMR
  // acala: '0.05',        // 0.05 ACA
  // astar: '1',           // 1 ASTR
};

/**
 * Get chain configuration by ID
 */
export const getChainById = (chainId) => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

/**
 * Get supported assets for a chain
 */
export const getSupportedAssets = (chainId) => {
  const chain = getChainById(chainId);
  return chain?.supportedAssets || [chain?.symbol];
};

/**
 * Estimate DOT equivalent for an asset
 */
export const estimateDotEquivalent = (amount, asset) => {
  const rate = ASSET_CONVERSION_RATES[asset] || 1;
  return amount * rate;
};
