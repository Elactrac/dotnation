const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function testStorageDeposit() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    console.log('\n=== Testing Storage Deposit Limits ===');
    
    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
    const contract = new ContractPromise(api, metadata, contractAddress);
    
    const testParams = {
        title: 'Test Campaign',
        description: 'Test Description',
        targetAmount: '1000000000000', // 1 DOT
        deadline: Date.now() + 86400000, // 1 day from now
        beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
    };
    
    console.log('\nTest Parameters:');
    console.log(JSON.stringify(testParams, null, 2));
    
    // Test different storageDepositLimit values
    const limits = [
        { name: 'null', value: null },
        { name: '-1', value: -1 },
        { name: '1 DOT', value: '1000000000000' },
        { name: '10 DOT', value: '10000000000000' },
        { name: '100 DOT', value: '100000000000000' },
    ];
    
    for (const limit of limits) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing with storageDepositLimit: ${limit.name}`);
        console.log(`${'='.repeat(60)}`);
        
        const gasLimit = api.registry.createType('WeightV2', {
            refTime: api.registry.createType('Compact<u64>', 30000000000),
            proofSize: api.registry.createType('Compact<u64>', 5000000)
        });
        
        try {
            const result = await contract.query.createCampaign(
                contractAddress,
                {
                    gasLimit,
                    storageDepositLimit: limit.value
                },
                testParams.title,
                testParams.description,
                testParams.targetAmount,
                testParams.deadline,
                testParams.beneficiary
            );
            
            console.log('\n📊 Result:');
            if (result.result.isOk) {
                console.log('✅ Query Status: OK');
                if (result.output) {
                    console.log('Output:', JSON.stringify(result.output.toHuman(), null, 2));
                }
            } else {
                console.log('❌ Query Status: ERROR');
                console.log('Error:', JSON.stringify(result.result.asErr.toHuman(), null, 2));
            }
            
            if (result.gasRequired) {
                console.log('\n⛽ Gas Required:', result.gasRequired.toHuman());
            }
            
            if (result.storageDeposit) {
                console.log('💾 Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
            }
            
        } catch (error) {
            console.log('❌ Exception:', error.message);
        }
    }
    
    await api.disconnect();
    process.exit(0);
}

testStorageDeposit().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
