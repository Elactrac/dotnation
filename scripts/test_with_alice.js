const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function testContractMethods() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
    const contract = new ContractPromise(api, metadata, contractAddress);
    
    console.log('\n=== Available Contract Methods ===');
    console.log('Messages:', Object.keys(contract.abi.messages).join(', '));
    
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: api.registry.createType('Compact<u64>', 30000000000),
        proofSize: api.registry.createType('Compact<u64>', 5000000)
    });
    
    // Test getCampaignsPaginated (should work)
    console.log('\n=== Testing getCampaignsPaginated ===');
    try {
        const result = await contract.query['getCampaignsPaginated'](
            contractAddress,
            { gasLimit, storageDepositLimit: null },
            0,
            10
        );
        
        console.log('✅ Query succeeded');
        console.log('Result OK?:', result.result.isOk);
        if (result.result.isOk && result.output) {
            console.log('Output:', JSON.stringify(result.output.toHuman(), null, 2));
        } else {
            console.log('Error:', result.result.asErr.toHuman());
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    // Test getCampaignCount (should work)
    console.log('\n=== Testing getCampaignCount ===');
    try {
        const result = await contract.query['getCampaignCount'](
            contractAddress,
            { gasLimit, storageDepositLimit: null }
        );
        
        console.log('✅ Query succeeded');
        console.log('Result OK?:', result.result.isOk);
        if (result.result.isOk && result.output) {
            console.log('Campaign Count:', result.output.toHuman());
        } else {
            console.log('Error:', result.result.asErr.toHuman());
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    // Test with Alice's well-known address (has funds on testnets usually)
    const aliceAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    
    console.log('\n=== Testing createCampaign with Alice as caller ===');
    console.log('Alice address:', aliceAddress);
    
    const testParams = {
        title: 'Test Campaign',
        description: 'Test Description',
        targetAmount: '1000000000000',
        deadline: Date.now() + 86400000,
        beneficiary: aliceAddress
    };
    
    try {
        const result = await contract.query.createCampaign(
            aliceAddress, // Use Alice as caller
            {
                gasLimit,
                storageDepositLimit: null
            },
            testParams.title,
            testParams.description,
            testParams.targetAmount,
            testParams.deadline,
            testParams.beneficiary
        );
        
        console.log('Result OK?:', result.result.isOk);
        if (result.result.isOk) {
            console.log('✅ Query succeeded with Alice!');
            console.log('Output:', result.output?.toHuman());
        } else {
            console.log('❌ Query failed:', result.result.asErr.toHuman());
        }
        console.log('Gas Required:', result.gasRequired.toHuman());
        console.log('Storage Deposit:', JSON.stringify(result.storageDeposit.toHuman(), null, 2));
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
    
    await api.disconnect();
    process.exit(0);
}

testContractMethods().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
