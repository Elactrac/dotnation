const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

const CONTRACT_ADDRESS = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
const RPC_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io';

async function testWithDifferentCallers() {
    console.log('Testing getCampaignsPaginated with different caller addresses\n');
    
    const wsProvider = new WsProvider(RPC_ENDPOINT);
    const api = await ApiPromise.create({ provider: wsProvider });
    
    const abiPath = './frontend/src/contracts/donation_platform.json';
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const contract = new ContractPromise(api, abi, CONTRACT_ADDRESS);
    
    // Test 1: With contract address as caller (what works in my test)
    console.log('Test 1: Using contract address as caller');
    try {
        const { result, output } = await contract.query.getCampaignsPaginated(
            CONTRACT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 30000000000, proofSize: 5000000 }) },
            0,
            5
        );
        console.log(`  Result: ${result.isOk ? '✓ Ok' : '❌ Err'}`);
        if (result.isOk) {
            console.log(`  Output: ${JSON.stringify(output.toPrimitive())}`);
        } else {
            console.log(`  Error: ${JSON.stringify(result.asErr.toHuman())}`);
        }
    } catch (error) {
        console.log(`  Exception: ${error.message}`);
    }
    console.log();
    
    // Test 2: With empty string (what frontend uses when no wallet)
    console.log('Test 2: Using empty string as caller (frontend behavior)');
    try {
        const { result, output } = await contract.query.getCampaignsPaginated(
            '',
            { gasLimit: api.registry.createType('WeightV2', { refTime: 30000000000, proofSize: 5000000 }) },
            0,
            5
        );
        console.log(`  Result: ${result.isOk ? '✓ Ok' : '❌ Err'}`);
        if (result.isOk) {
            console.log(`  Output: ${JSON.stringify(output.toPrimitive())}`);
        } else {
            console.log(`  Error: ${JSON.stringify(result.asErr.toHuman())}`);
            if (result.asErr.isModule) {
                const error = result.asErr.asModule;
                console.log(`  Module error - Index: ${error.index}, Code: ${error.error.toHex()}`);
            }
        }
    } catch (error) {
        console.log(`  Exception: ${error.message}`);
    }
    console.log();
    
    // Test 3: With a valid but different address
    console.log('Test 3: Using Alice test account address');
    const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    try {
        const { result, output } = await contract.query.getCampaignsPaginated(
            ALICE,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 30000000000, proofSize: 5000000 }) },
            0,
            5
        );
        console.log(`  Result: ${result.isOk ? '✓ Ok' : '❌ Err'}`);
        if (result.isOk) {
            console.log(`  Output: ${JSON.stringify(output.toPrimitive())}`);
        } else {
            console.log(`  Error: ${JSON.stringify(result.asErr.toHuman())}`);
        }
    } catch (error) {
        console.log(`  Exception: ${error.message}`);
    }
    console.log();
    
    // Test 4: With gasLimit -1 (what frontend uses)
    console.log('Test 4: Using contract address with gasLimit -1 (frontend style)');
    try {
        const { result, output } = await contract.query.getCampaignsPaginated(
            CONTRACT_ADDRESS,
            { gasLimit: -1 },
            0,
            100
        );
        console.log(`  Result: ${result.isOk ? '✓ Ok' : '❌ Err'}`);
        if (result.isOk) {
            console.log(`  Output: ${JSON.stringify(output.toPrimitive())}`);
        } else {
            console.log(`  Error: ${JSON.stringify(result.asErr.toHuman())}`);
        }
    } catch (error) {
        console.log(`  Exception: ${error.message}`);
    }
    console.log();
    
    console.log('='.repeat(80));
    console.log('DIAGNOSIS:');
    console.log('If empty string fails → Frontend needs to use a default address');
    console.log('If gasLimit -1 fails → Need to specify explicit gas limit');
    console.log('='.repeat(80));
    
    await api.disconnect();
}

testWithDifferentCallers().catch(console.error);
