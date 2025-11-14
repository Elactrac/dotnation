const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function testFixedStorageLogic() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
    const contract = new ContractPromise(api, metadata, contractAddress);
    
    // Test with contract address (which has no funds, but should succeed for dry-run simulation)
    console.log('\n=== Testing with 10 DOT storage limit ===');
    
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
    
    try {
        const result = await contract.query.createCampaign(
            contractAddress,
            {
                gasLimit,
                storageDepositLimit: '10000000000000' // 10 DOT
            },
            testParams.title,
            testParams.description,
            testParams.targetAmount,
            testParams.deadline,
            testParams.beneficiary
        );
        
        console.log('Result OK?:', result.result.isOk);
        
        if (result.result.isOk) {
            console.log('✅ Query succeeded!');
            console.log('Output:', result.output?.toHuman());
        } else {
            const error = result.result.asErr;
            console.log('Error:', error.toHuman());
            
            // Decode the error
            if (error.isModule) {
                const decoded = api.registry.findMetaError(error.asModule);
                console.log('\n📋 Decoded Error:');
                console.log('  Name:', decoded.name);
                console.log('  Section:', decoded.section);
                console.log('  Docs:', decoded.docs.join(' '));
            }
        }
        
        console.log('\n📊 Query Metrics:');
        console.log('Gas Required:', result.gasRequired.toHuman());
        console.log('Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
        
        // Check if storageDeposit has the structure we expect
        console.log('\nStorage Deposit Properties:');
        console.log('  Type:', typeof result.storageDeposit);
        console.log('  isCharge:', result.storageDeposit.isCharge);
        console.log('  isRefund:', result.storageDeposit.isRefund);
        if (result.storageDeposit.isCharge) {
            console.log('  asCharge:', result.storageDeposit.asCharge.toString());
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    await api.disconnect();
    process.exit(0);
}

testFixedStorageLogic().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
