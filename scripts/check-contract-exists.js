#!/usr/bin/env node

/**
 * Check if contract exists at address
 */

import { ApiPromise, WsProvider } from '@polkadot/api';

const RPC_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io';
const CONTRACT_ADDRESS = '14R7BucJsVzszaZy844PTtJQPp4j9mSELjdvEktf7YZ2sT5N';

async function main() {
  console.log('🔍 Checking contract deployment...\n');
  
  const provider = new WsProvider(RPC_ENDPOINT);
  const api = await ApiPromise.create({ provider });
  
  console.log('✓ Connected to:', (await api.rpc.system.chain()).toString());
  
  // Check if address exists and has code
  const accountInfo = await api.query.system.account(CONTRACT_ADDRESS);
  console.log('\n📊 Account Info:');
  console.log('   Balance:', accountInfo.data.free.toHuman());
  console.log('   Nonce:', accountInfo.nonce.toHuman());
  
  // Try to get contract info
  try {
    const contractInfo = await api.query.contracts.contractInfoOf(CONTRACT_ADDRESS);
    
    if (contractInfo.isSome) {
      console.log('\n✅ Contract exists!');
      console.log('   Contract Info:', contractInfo.toHuman());
    } else {
      console.log('\n❌ No contract found at this address');
      console.log('   This address exists but is not a smart contract');
      console.log('\n💡 Possible reasons:');
      console.log('   1. Contract was never deployed to this address');
      console.log('   2. Contract was deployed to a different network');
      console.log('   3. Address is a regular account, not a contract');
      console.log('\n📝 Next steps:');
      console.log('   • Deploy the contract using: npm run deploy:testnet');
      console.log('   • Or verify the contract address in .env.local');
    }
  } catch (error) {
    console.log('\n⚠️  Could not query contract info');
    console.log('   Error:', error.message);
  }
  
  await api.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
