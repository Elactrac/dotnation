const { ApiPromise, WsProvider } = require('@polkadot/api');

async function decodeModuleError() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });

    console.log('\n=== Decoding Module Error 0x19000000 ===');
    
    // Module 52 (0x34), Error 0x19 (25 decimal)
    const moduleIndex = 52;
    const errorIndex = 0x19; // 25 in decimal
    
    console.log(`\nModule Index: ${moduleIndex} (0x${moduleIndex.toString(16)})`);
    console.log(`Error Index: ${errorIndex} (0x${errorIndex.toString(16)})`);
    
    // Get metadata for Contracts pallet
    await api.isReady;
    const metadata = api.registry.metadata;
    const pallets = metadata.asLatest.pallets;
    
    // Find the Contracts pallet
    let contractsPallet = null;
    for (const pallet of pallets) {
        if (pallet.index.toNumber() === moduleIndex) {
            contractsPallet = pallet;
            break;
        }
    }
    
    if (contractsPallet) {
        console.log(`\nFound pallet: ${contractsPallet.name.toString()}`);
        
        if (contractsPallet.errors.isSome) {
            const errors = contractsPallet.errors.unwrap();
            console.log(`\nTotal errors in pallet: ${errors.length}`);
            
            if (errorIndex < errors.length) {
                const error = errors[errorIndex];
                console.log(`\n✅ ERROR DECODED:`);
                console.log(`   Name: ${error.name.toString()}`);
                console.log(`   Docs: ${error.docs.map(d => d.toString()).join('\n         ')}`);
            } else {
                console.log(`\n❌ Error index ${errorIndex} is out of bounds (max: ${errors.length - 1})`);
            }
            
            // List all errors for reference
            console.log(`\n=== All Contracts Pallet Errors ===`);
            errors.forEach((error, idx) => {
                console.log(`${idx}: ${error.name.toString()}`);
            });
        } else {
            console.log('\n❌ No errors defined in this pallet');
        }
    } else {
        console.log(`\n❌ Could not find pallet with index ${moduleIndex}`);
        console.log('\nAvailable pallets:');
        for (const pallet of pallets) {
            console.log(`  ${pallet.index.toNumber()}: ${pallet.name.toString()}`);
        }
    }
    
    // Test storage deposit calculation
    console.log('\n\n=== Testing Storage Deposit Calculation ===');
    const contractAddress = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
    
    try {
        // Load contract metadata
        const fs = require('fs');
        const metadata = JSON.parse(fs.readFileSync('./frontend/src/contracts/donation_platform.json', 'utf8'));
        
        const { ContractPromise } = require('@polkadot/api-contract');
        const contract = new ContractPromise(api, metadata, contractAddress);
        
        // Test parameters
        const testParams = {
            title: 'Test Campaign',
            description: 'Test Description',
            targetAmount: '1000000000000', // 1 DOT
            deadline: Date.now() + 86400000, // 1 day from now
            beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
        };
        
        console.log('\nTest Parameters:');
        console.log(JSON.stringify(testParams, null, 2));
        
        // Query with different storageDepositLimit values
        const limits = [null, -1, 0, '1000000000000', '10000000000000'];
        
        for (const limit of limits) {
            console.log(`\n--- Testing with storageDepositLimit: ${limit} ---`);
            
            const gasLimit = api.registry.createType('WeightV2', {
                refTime: api.registry.createType('Compact<u64>', 30000000000),
                proofSize: api.registry.createType('Compact<u64>', 5000000)
            });
            
            try {
                const result = await contract.query.createCampaign(
                    contractAddress,
                    {
                        gasLimit,
                        storageDepositLimit: limit
                    },
                    testParams.title,
                    testParams.description,
                    testParams.targetAmount,
                    testParams.deadline,
                    testParams.beneficiary
                );
                
                console.log('Result:', JSON.stringify(result.toHuman(), null, 2));
                
                if (result.result.isOk) {
                    console.log('✅ Query succeeded');
                    if (result.output) {
                        console.log('Output:', result.output.toHuman());
                    }
                } else {
                    console.log('❌ Query failed:', result.result.asErr.toHuman());
                }
                
                if (result.gasRequired) {
                    console.log('Gas Required:', result.gasRequired.toHuman());
                }
                if (result.storageDeposit) {
                    console.log('Storage Deposit:', result.storageDeposit.toHuman());
                }
            } catch (error) {
                console.log('❌ Exception:', error.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Error testing storage deposit:', error.message);
    }
    
    await api.disconnect();
}

decodeModuleError().catch(console.error);
