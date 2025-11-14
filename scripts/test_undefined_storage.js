const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function testStorageDepositUndefined() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
    const contract = new ContractPromise(api, metadata, contractAddress);
    
    const testParams = {
        title: 'Test Campaign',
        description: 'Test Description',
        targetAmount: '1000000000000',
        deadline: Date.now() + 86400000,
        beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
    };
    
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: api.registry.createType('Compact<u64>', 30000000000),
        proofSize: api.registry.createType('Compact<u64>', 5000000)
    });
    
    console.log('\n=== Testing with storageDepositLimit: undefined ===');
    try {
        const result = await contract.query.createCampaign(
            contractAddress,
            {
                gasLimit,
                storageDepositLimit: undefined
            },
            testParams.title,
            testParams.description,
            testParams.targetAmount,
            testParams.deadline,
            testParams.beneficiary
        );
        
        console.log('✅ Query succeeded!');
        console.log('Result:', JSON.stringify(result.result.toHuman(), null, 2));
        console.log('Gas Required:', result.gasRequired.toHuman());
        console.log('Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
        
        if (result.output) {
            console.log('Output:', result.output.toHuman());
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    // Also try with a very high limit
    console.log('\n=== Testing with storageDepositLimit: 1000 DOT ===');
    try {
        const result = await contract.query.createCampaign(
            contractAddress,
            {
                gasLimit,
                storageDepositLimit: '1000000000000000' // 1000 DOT
            },
            testParams.title,
            testParams.description,
            testParams.targetAmount,
            testParams.deadline,
            testParams.beneficiary
        );
        
        console.log('✅ Query succeeded!');
        console.log('Result:', JSON.stringify(result.result.toHuman(), null, 2));
        console.log('Gas Required:', result.gasRequired.toHuman());
        console.log('Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
        
        if (result.output) {
            console.log('Output:', result.output.toHuman());
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    await api.disconnect();
    process.exit(0);
}

testStorageDepositUndefined().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
