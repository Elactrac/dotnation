const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function testWithMaxInt() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
    const contract = new ContractPromise(api, metadata, contractAddress);
    
    // Use Alice who should have funds
    const aliceAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    
    // Check Alice's balance first
    console.log('\n=== Checking Alice Balance ===');
    const aliceInfo = await api.query.system.account(aliceAddress);
    console.log('Alice Free Balance:', aliceInfo.data.free.toHuman());
    console.log('Alice Reserved:', aliceInfo.data.reserved.toHuman());
    
    const testParams = {
        title: 'Test Campaign',
        description: 'Test Description',
        targetAmount: '1000000000000',
        deadline: Date.now() + 86400000,
        beneficiary: aliceAddress
    };
    
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: api.registry.createType('Compact<u64>', 30000000000),
        proofSize: api.registry.createType('Compact<u64>', 5000000)
    });
    
    // Try with max u128 value (unlimited)
    const maxU128 = '340282366920938463463374607431768211455';
    
    console.log('\n=== Testing with max u128 as storage limit ===');
    try {
        const result = await contract.query.createCampaign(
            aliceAddress,
            {
                gasLimit,
                storageDepositLimit: maxU128
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
            console.log('❌ Query failed:', error.toHuman());
            
            // Try to decode the error
            if (error.isModule) {
                const decoded = api.registry.findMetaError(error.asModule);
                console.log('Decoded error:', decoded);
            }
        }
        console.log('Gas Required:', result.gasRequired.toHuman());
        console.log('Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
    } catch (error) {
        console.log('❌ Exception:', error.message);
        console.log(error.stack);
    }
    
    await api.disconnect();
    process.exit(0);
}

testWithMaxInt().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
