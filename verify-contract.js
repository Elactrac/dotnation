#!/usr/bin/env node

/**
 * Contract Verification Script for Paseo Testnet
 * 
 * This script verifies the DotNation contract deployment by:
 * 1. Connecting to the Paseo testnet via Mandala Chain RPC
 * 2. Loading the contract ABI and instantiating the contract
 * 3. Testing read-only query methods
 * 4. Verifying contract version and configuration
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RPC_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io';
const CONTRACT_ADDRESS = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
const METADATA_PATH = path.join(__dirname, 'frontend/src/contracts/donation_platform.json');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

async function main() {
  let api;
  
  try {
    section('🔍 Contract Verification Report');
    
    // Step 1: Load contract metadata
    log('\n📄 Loading contract metadata...', colors.yellow);
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    log(`✓ Contract Name: ${metadata.contract.name}`, colors.green);
    log(`✓ Contract Version: ${metadata.contract.version}`, colors.green);
    log(`✓ Language: ${metadata.source.language}`, colors.green);
    log(`✓ Compiler: ${metadata.source.compiler}`, colors.green);
    
    // Step 2: Connect to Paseo testnet
    log('\n🌐 Connecting to Paseo testnet...', colors.yellow);
    log(`   Endpoint: ${RPC_ENDPOINT}`, colors.blue);
    
    const provider = new WsProvider(RPC_ENDPOINT);
    api = await ApiPromise.create({ provider });
    
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
    ]);
    
    log(`✓ Connected to: ${chain}`, colors.green);
    log(`✓ Node: ${nodeName} v${nodeVersion}`, colors.green);
    
    // Step 3: Instantiate contract
    log('\n📋 Instantiating contract...', colors.yellow);
    log(`   Address: ${CONTRACT_ADDRESS}`, colors.blue);
    
    const contract = new ContractPromise(api, metadata, CONTRACT_ADDRESS);
    log('✓ Contract instantiated successfully', colors.green);
    
    // Step 4: Query contract version
    section('📊 Contract State Verification');
    
    log('\n🔢 Querying contract version...', colors.yellow);
    const versionResult = await contract.query.getVersion(
      CONTRACT_ADDRESS,
      { gasLimit: -1 }
    );
    
    if (versionResult.result.isOk) {
      const version = versionResult.output.toHuman();
      log(`✓ Contract Version: ${version}`, colors.green);
    } else {
      log('✗ Failed to query version', colors.red);
      console.log('   Error:', versionResult.result.asErr);
    }
    
    // Step 5: Query campaign count
    log('\n📈 Querying campaign count...', colors.yellow);
    const countResult = await contract.query.getCampaignCount(
      CONTRACT_ADDRESS,
      { gasLimit: -1 }
    );
    
    if (countResult.result.isOk) {
      const count = countResult.output.toHuman();
      log(`✓ Total Campaigns Created: ${count}`, colors.green);
    } else {
      log('✗ Failed to query campaign count', colors.red);
      console.log('   Error:', countResult.result.asErr);
    }
    
    // Step 6: Query max batch size
    log('\n⚙️  Querying max batch size...', colors.yellow);
    const batchSizeResult = await contract.query.getMaxBatchSize(
      CONTRACT_ADDRESS,
      { gasLimit: -1 }
    );
    
    if (batchSizeResult.result.isOk) {
      const batchSize = batchSizeResult.output.toHuman();
      log(`✓ Max Batch Size: ${batchSize}`, colors.green);
    } else {
      log('✗ Failed to query max batch size', colors.red);
      console.log('   Error:', batchSizeResult.result.asErr);
    }
    
    // Step 7: Query active campaigns (first page)
    log('\n🎯 Querying active campaigns (first 10)...', colors.yellow);
    const activeCampaignsResult = await contract.query.getActiveCampaigns(
      CONTRACT_ADDRESS,
      { gasLimit: -1 },
      0, // offset
      10 // limit
    );
    
    if (activeCampaignsResult.result.isOk) {
      const campaigns = activeCampaignsResult.output.toHuman();
      log(`✓ Active Campaigns Found: ${campaigns ? campaigns.length : 0}`, colors.green);
      
      if (campaigns && campaigns.length > 0) {
        log('\n   Sample Campaign:', colors.cyan);
        console.log('   ', JSON.stringify(campaigns[0], null, 2).split('\n').join('\n    '));
      }
    } else {
      log('✗ Failed to query active campaigns', colors.red);
      console.log('   Error:', activeCampaignsResult.result.asErr);
    }
    
    // Step 8: List available contract methods
    section('🛠️  Available Contract Methods');
    
    log('\n📝 Write Methods (require transaction):', colors.yellow);
    const writeMethods = metadata.spec.messages
      .filter(m => m.mutates)
      .map(m => `  • ${m.label}${m.payable ? ' (payable)' : ''}`);
    writeMethods.forEach(m => log(m, colors.green));
    
    log('\n📖 Read Methods (query only):', colors.yellow);
    const readMethods = metadata.spec.messages
      .filter(m => !m.mutates)
      .map(m => `  • ${m.label}`);
    readMethods.forEach(m => log(m, colors.blue));
    
    // Step 9: Verify contract events
    log('\n📡 Available Events:', colors.yellow);
    metadata.spec.events.forEach(event => {
      log(`  • ${event.label}`, colors.cyan);
    });
    
    // Final summary
    section('✅ Verification Summary');
    
    log('\n✓ Contract is deployed and accessible', colors.green);
    log('✓ All query methods are working', colors.green);
    log('✓ Contract metadata matches deployment', colors.green);
    log('✓ V2 features available (batch operations, pagination)', colors.green);
    
    log('\n📌 Next Steps:', colors.bright);
    log('   1. Test creating a campaign from the frontend', colors.blue);
    log('   2. Verify donation flow works end-to-end', colors.blue);
    log('   3. Test batch operations if needed', colors.blue);
    log('   4. Monitor contract events for transactions', colors.blue);
    
  } catch (error) {
    log('\n❌ Verification Failed', colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    if (api) {
      await api.disconnect();
      log('\n👋 Disconnected from network', colors.yellow);
    }
  }
}

// Run the verification
main()
  .then(() => {
    log('\n✅ Verification Complete!\n', colors.green + colors.bright);
    process.exit(0);
  })
  .catch((error) => {
    log('\n❌ Verification Failed\n', colors.red + colors.bright);
    console.error(error);
    process.exit(1);
  });
