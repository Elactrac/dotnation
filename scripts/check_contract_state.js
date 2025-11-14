const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function checkContractState() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    console.log('\n=== Checking Contract State ===');
    
    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    
    // Check contract balance
    const accountInfo = await api.query.system.account(contractAddress);
    console.log('\n💰 Contract Balance:');
    console.log('  Free:', api.registry.createType('Balance', accountInfo.data.free).toHuman());
    console.log('  Reserved:', api.registry.createType('Balance', accountInfo.data.reserved).toHuman());
    console.log('  Frozen:', api.registry.createType('Balance', accountInfo.data.frozen).toHuman());
    
    // Check contract info
    try {
        const contractInfo = await api.query.contracts.contractInfoOf(contractAddress);
        if (contractInfo.isSome) {
            console.log('\n📋 Contract Info:');
            console.log(JSON.stringify(contractInfo.toHuman(), null, 2));
        } else {
            console.log('\n❌ Contract not found in storage');
        }
    } catch (error) {
        console.log('\n❌ Error querying contract info:', error.message);
    }
    
    // Load contract and test queries
    const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
    const contract = new ContractPromise(api, metadata, contractAddress);
    
    // Test getCampaigns query (should work)
    console.log('\n=== Testing getCampaigns Query ===');
    try {
        const gasLimit = api.registry.createType('WeightV2', {
            refTime: api.registry.createType('Compact<u64>', 30000000000),
            proofSize: api.registry.createType('Compact<u64>', 5000000)
        });
        
        const result = await contract.query.getCampaigns(
            contractAddress,
            { gasLimit, storageDepositLimit: null }
        );
        
        if (result.result.isOk) {
            console.log('✅ getCampaigns query succeeded');
            console.log('Output:', JSON.stringify(result.output.toHuman(), null, 2));
        } else {
            console.log('❌ getCampaigns query failed:', result.result.asErr.toHuman());
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    // Try a simple test - donate to a non-existent campaign (should fail but tell us why)
    console.log('\n=== Testing Donate Query (with 0 value to non-existent campaign) ===');
    try {
        const gasLimit = api.registry.createType('WeightV2', {
            refTime: api.registry.createType('Compact<u64>', 30000000000),
            proofSize: api.registry.createType('Compact<u64>', 5000000)
        });
        
        const result = await contract.query.donate(
            contractAddress,
            { 
                gasLimit, 
                storageDepositLimit: null,
                value: 0
            },
            999 // Non-existent campaign ID
        );
        
        console.log('Result:', JSON.stringify(result.result.toHuman(), null, 2));
        if (result.storageDeposit) {
            console.log('Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    // Check if there's a minimum balance requirement
    console.log('\n=== Existential Deposit ===');
    const existentialDeposit = api.consts.balances.existentialDeposit;
    console.log('Existential Deposit:', existentialDeposit.toHuman());
    
    await api.disconnect();
    process.exit(0);
}

checkContractState().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
