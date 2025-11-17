#!/usr/bin/env node
/**
 * XCM Route Diagnostic Script
 * 
 * This script tests the XCM route from Asset Hub Paseo to Mandala
 * and helps diagnose why funds aren't reaching the destination.
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { decodeAddress, encodeAddress } = require('@polkadot/util-crypto');

const ASSET_HUB_RPC = 'wss://sys.ibp.network/asset-hub-paseo';
const MANDALA_RPC = 'wss://rpc2.paseo.mandalachain.io';
const MANDALA_PARA_ID = 4040;

// The transaction hash from your test
const TX_HASH = '0x0be8f6407594851690a9c1d0a79cbb4073b46695ccafaaf79f4283db82e55f9f';

// Your contract address
const CONTRACT_ADDRESS = '14tB5LMv6yfMwH5YxToqVporLb31GnaFyngEwu6knyywtgD9';

async function checkXcmRoute() {
  console.log('🔍 XCM Route Diagnostic Tool\n');
  console.log('═══════════════════════════════════════════════════\n');

  let assetHubApi = null;
  let mandalaApi = null;

  try {
    // Connect to Asset Hub Paseo
    console.log('📡 Connecting to Asset Hub Paseo...');
    const assetHubProvider = new WsProvider(ASSET_HUB_RPC);
    assetHubApi = await ApiPromise.create({ provider: assetHubProvider });
    await assetHubApi.isReady;
    console.log('✅ Connected to Asset Hub Paseo\n');

    // Connect to Mandala
    console.log('📡 Connecting to Mandala...');
    const mandalaProvider = new WsProvider(MANDALA_RPC);
    mandalaApi = await ApiPromise.create({ provider: mandalaProvider });
    await mandalaApi.isReady;
    console.log('✅ Connected to Mandala\n');

    console.log('═══════════════════════════════════════════════════\n');

    // Check 1: Verify the transaction on Asset Hub
    console.log('📝 Step 1: Checking transaction on Asset Hub Paseo...');
    try {
      const blockHash = TX_HASH;
      const signedBlock = await assetHubApi.rpc.chain.getBlock(blockHash);
      const block = signedBlock.block;
      
      console.log(`✅ Block found: #${block.header.number}`);
      console.log(`   Extrinsics in block: ${block.extrinsics.length}`);
      
      // Look for XCM-related extrinsics
      let foundXcm = false;
      block.extrinsics.forEach((ex, index) => {
        const { method: { section, method } } = ex;
        if (section === 'polkadotXcm') {
          console.log(`   ✓ Found XCM extrinsic #${index}: ${section}.${method}`);
          foundXcm = true;
        }
      });
      
      if (!foundXcm) {
        console.log('   ⚠️  No XCM extrinsics found in this block');
      }
      
      // Get events for this block
      const apiAt = await assetHubApi.at(blockHash);
      const events = await apiAt.query.system.events();
      
      console.log(`   Events in block: ${events.length}`);
      
      // Look for XCM execution results
      let xcmSent = false;
      events.forEach((record) => {
        const { event } = record;
        if (event.section === 'polkadotXcm') {
          console.log(`   → ${event.section}.${event.method}:`, event.data.toString());
          if (event.method === 'Sent') {
            xcmSent = true;
          }
        }
        if (event.section === 'xcmpQueue') {
          console.log(`   → ${event.section}.${event.method}:`, event.data.toString());
        }
      });
      
      if (xcmSent) {
        console.log('   ✅ XCM message was sent from Asset Hub\n');
      } else {
        console.log('   ⚠️  No XCM.Sent event found - message may not have been sent\n');
      }
    } catch (err) {
      console.log(`   ❌ Error checking transaction: ${err.message}\n`);
    }

    console.log('═══════════════════════════════════════════════════\n');

    // Check 2: Look for XCM channel between Asset Hub and Mandala
    console.log('📝 Step 2: Checking XCM channel configuration...');
    try {
      // Check if there's an open HRMP channel from Asset Hub to Mandala
      const assetHubParaId = 1000; // Asset Hub's para ID on Paseo
      
      console.log(`   Checking for HRMP channel: ${assetHubParaId} → ${MANDALA_PARA_ID}`);
      
      // This would require relay chain access to check HRMP channels
      console.log('   ℹ️  HRMP channel check requires Paseo Relay Chain RPC');
      console.log('   ℹ️  Skipping for now...\n');
    } catch (err) {
      console.log(`   ⚠️  ${err.message}\n`);
    }

    console.log('═══════════════════════════════════════════════════\n');

    // Check 3: Check balance on Mandala
    console.log('📝 Step 3: Checking contract balance on Mandala...');
    try {
      const { data: balance } = await mandalaApi.query.system.account(CONTRACT_ADDRESS);
      
      console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
      console.log(`   Free Balance: ${balance.free.toHuman()}`);
      console.log(`   Reserved: ${balance.reserved.toHuman()}`);
      console.log(`   Frozen: ${balance.frozen.toHuman()}\n`);
      
      if (balance.free.toBigInt() === 0n) {
        console.log('   ⚠️  Contract has zero balance - funds have not arrived\n');
      } else {
        console.log('   ✅ Contract has balance\n');
      }
    } catch (err) {
      console.log(`   ❌ Error checking balance: ${err.message}\n`);
    }

    console.log('═══════════════════════════════════════════════════\n');

    // Check 4: Look for recent XCM messages on Mandala
    console.log('📝 Step 4: Checking recent XCM messages on Mandala...');
    try {
      const latestBlock = await mandalaApi.rpc.chain.getBlock();
      const blockNumber = latestBlock.block.header.number.toNumber();
      
      console.log(`   Latest Mandala block: #${blockNumber}`);
      console.log(`   Scanning last 100 blocks for XCM messages...\n`);
      
      let foundXcmMessages = 0;
      const startBlock = Math.max(0, blockNumber - 100);
      
      for (let i = blockNumber; i >= startBlock; i--) {
        const blockHash = await mandalaApi.rpc.chain.getBlockHash(i);
        const apiAt = await mandalaApi.at(blockHash);
        const events = await apiAt.query.system.events();
        
        events.forEach((record) => {
          const { event } = record;
          if (event.section === 'xcmpQueue' || event.section === 'dmpQueue' || event.section === 'ump') {
            console.log(`   Block #${i}: ${event.section}.${event.method}`);
            foundXcmMessages++;
          }
        });
      }
      
      if (foundXcmMessages === 0) {
        console.log('   ⚠️  No XCM messages found in last 100 blocks');
        console.log('   This suggests XCM messages are not reaching Mandala\n');
      } else {
        console.log(`   ✅ Found ${foundXcmMessages} XCM-related events\n`);
      }
    } catch (err) {
      console.log(`   ⚠️  Error scanning blocks: ${err.message}\n`);
    }

    console.log('═══════════════════════════════════════════════════\n');
    console.log('📊 DIAGNOSTIC SUMMARY\n');
    console.log('Possible issues:\n');
    console.log('1. ❌ No HRMP channel from Asset Hub Paseo → Mandala');
    console.log('   Solution: XCM routes must be established on the relay chain');
    console.log('   Asset Hub Paseo may only route to system parachains\n');
    
    console.log('2. ❌ Mandala may not be accepting XCM from Asset Hub');
    console.log('   Solution: Check Mandala\'s XCM configuration\n');
    
    console.log('3. ❌ Reserve transfer may not be the correct transfer type');
    console.log('   Solution: Try direct transfer from Paseo Relay Chain instead\n');
    
    console.log('═══════════════════════════════════════════════════\n');
    console.log('💡 RECOMMENDED APPROACH:\n');
    console.log('Instead of Asset Hub → Mandala, try:');
    console.log('  Paseo Relay Chain → Mandala (direct parachain connection)');
    console.log('  This route is more likely to work on testnet\n');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    if (assetHubApi) await assetHubApi.disconnect();
    if (mandalaApi) await mandalaApi.disconnect();
  }
}

// Run the diagnostic
checkXcmRoute().catch(console.error);
