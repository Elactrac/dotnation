#!/usr/bin/env node
/**
 * Script to verify if Mandala Chain supports ink! contracts (pallet-contracts)
 * and test if a specific contract address is deployed
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');

const RPC_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io';
const TEST_CONTRACT_ADDRESS = '14R7BucJsVzszaZy844PTtJQPp4j9mSELjdvEktf7YZ2sT5N';

async function checkMandalaSupport() {
  console.log('🔍 Checking Mandala Chain ink! contracts support...\n');
  
  let api;
  try {
    // Connect to Mandala Chain
    console.log(`📡 Connecting to: ${RPC_ENDPOINT}`);
    const provider = new WsProvider(RPC_ENDPOINT, false, {}, 10000); // 10s timeout
    
    provider.on('connected', () => console.log('✅ WebSocket connected'));
    provider.on('disconnected', () => console.log('⚠️  WebSocket disconnected'));
    provider.on('error', (error) => console.error('❌ WebSocket error:', error.message));
    
    api = await ApiPromise.create({ 
      provider,
      throwOnConnect: true,
      throwOnUnknown: false
    });
    
    await api.isReady;
    console.log('✅ API ready\n');
    
    // 1. Check chain info
    console.log('📊 Chain Information:');
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ]);
    console.log(`   Chain: ${chain}`);
    console.log(`   Node: ${nodeName} v${nodeVersion}`);
    
    // 2. Check runtime version
    const runtimeVersion = api.runtimeVersion;
    console.log(`   Runtime: ${runtimeVersion.specName} v${runtimeVersion.specVersion}`);
    console.log(`   Transaction Version: ${runtimeVersion.transactionVersion}\n`);
    
    // 3. Check token decimals (CRITICAL for amount conversions)
    const chainDecimals = api.registry.chainDecimals[0] || 12;
    const chainTokens = api.registry.chainTokens[0] || 'PAS';
    console.log(`💰 Token Configuration:`);
    console.log(`   Symbol: ${chainTokens}`);
    console.log(`   Decimals: ${chainDecimals}`);
    console.log(`   1 ${chainTokens} = ${10 ** chainDecimals} plancks\n`);
    
    // 4. Check if contracts pallet exists
    console.log('🔍 Checking for pallet-contracts...');
    const hasContractsPallet = api.query.contracts !== undefined;
    
    if (!hasContractsPallet) {
      console.log('❌ CRITICAL: pallet-contracts NOT FOUND');
      console.log('   Mandala Chain does NOT support ink! smart contracts');
      console.log('\n⚠️  SOLUTION: Use a different chain that supports contracts:');
      console.log('   - Rococo Contracts: wss://rococo-contracts-rpc.polkadot.io');
      console.log('   - Paseo Contracts Parachain (if available)');
      console.log('   - Astar/Shiden (mainnet)\n');
      await api.disconnect();
      process.exit(1);
    }
    
    console.log('✅ pallet-contracts FOUND - ink! contracts are supported!\n');
    
    // 5. List available contract methods
    console.log('📋 Available Contracts Pallet Methods:');
    const contractsMethods = Object.keys(api.query.contracts);
    contractsMethods.slice(0, 10).forEach(method => {
      console.log(`   - ${method}`);
    });
    if (contractsMethods.length > 10) {
      console.log(`   ... and ${contractsMethods.length - 10} more\n`);
    } else {
      console.log('');
    }
    
    // 6. Test contract address
    console.log(`🔍 Testing contract address: ${TEST_CONTRACT_ADDRESS}`);
    
    try {
      // Check if contract exists using contractInfoOf query
      const contractInfo = await api.query.contracts.contractInfoOf(TEST_CONTRACT_ADDRESS);
      
      if (contractInfo.isNone) {
        console.log('❌ Contract NOT found at this address');
        console.log('   This contract may have been removed or never deployed to this chain\n');
        console.log('💡 Action Required: Deploy a new contract');
        console.log('   See MANDALA_CHAIN_TESTING.md for deployment instructions\n');
      } else {
        console.log('✅ Contract EXISTS at this address!');
        const info = contractInfo.unwrap();
        console.log(`   Storage Deposit: ${info.storageDeposit?.toString() || 'N/A'}`);
        console.log(`   Code Hash: ${info.codeHash?.toString() || 'N/A'}\n`);
        console.log('✨ You can use this contract address in your .env.local\n');
      }
    } catch (contractError) {
      console.error('⚠️  Error querying contract:', contractError.message);
      console.log('   This may indicate the contract doesn\'t exist or query format changed\n');
    }
    
    // 7. Summary
    console.log('═══════════════════════════════════════');
    console.log('📝 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`Chain: ${chain}`);
    console.log(`Contracts Support: ${hasContractsPallet ? '✅ YES' : '❌ NO'}`);
    console.log(`Token: ${chainTokens} (${chainDecimals} decimals)`);
    console.log(`Test Contract: ${TEST_CONTRACT_ADDRESS}`);
    
    await api.disconnect();
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\n⚠️  Connection timeout. Possible issues:');
      console.log('   - RPC endpoint may be down or slow');
      console.log('   - Firewall blocking WebSocket connections');
      console.log('   - Try alternative RPC: wss://rpc.paseo.mandalachain.io');
    }
    
    if (api) {
      await api.disconnect();
    }
    process.exit(1);
  }
}

// Run the check
checkMandalaSupport().catch(console.error);
