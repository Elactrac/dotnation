const { ApiPromise, WsProvider } = require('@polkadot/api');

async function decodeModuleError() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    console.log('\n=== Decoding Module Error 0x19000000 ===');
    
    const moduleIndex = 52;
    const errorIndex = 0x19; // 25 in decimal
    
    console.log(`\nModule Index: ${moduleIndex}`);
    console.log(`Error Index: ${errorIndex}`);
    
    // Try using the API's error registry directly
    try {
        // Create the error from the raw bytes
        const errorHex = '0x34190000'; // module 52 (0x34), error 25 (0x19)
        const dispatchError = api.registry.createType('DispatchError', errorHex);
        
        console.log('\n✅ Dispatch Error Details:');
        console.log('Human readable:', JSON.stringify(dispatchError.toHuman(), null, 2));
        console.log('Is Module Error:', dispatchError.isModule);
        
        if (dispatchError.isModule) {
            const moduleError = dispatchError.asModule;
            console.log('\nModule Error Details:');
            console.log('  Index:', moduleError.index.toString());
            console.log('  Error:', moduleError.error.toString());
            
            // Get the error metadata
            const errorMeta = api.registry.findMetaError(moduleError);
            console.log('\n✅ ERROR DECODED:');
            console.log(`  Pallet: ${errorMeta.section}`);
            console.log(`  Error Name: ${errorMeta.name}`);
            console.log(`  Documentation:`);
            errorMeta.docs.forEach(doc => {
                console.log(`    ${doc}`);
            });
        }
    } catch (error) {
        console.error('Error decoding:', error.message);
    }
    
    // Also list all Contracts pallet errors for reference
    console.log('\n\n=== All Contracts Pallet Errors ===');
    const metadata = api.registry.metadata;
    const pallets = metadata.pallets;
    
    for (const pallet of pallets) {
        if (pallet.name.toString() === 'Contracts') {
            console.log(`Found Contracts pallet at index ${pallet.index.toNumber()}`);
            
            if (pallet.errors.isSome) {
                const errors = pallet.errors.unwrap();
                console.log(`\nListing errors (type: ${errors.type}):`);
                
                // The errors is a variant type, need to iterate differently
                if (errors.variants) {
                    errors.variants.forEach((variant, idx) => {
                        console.log(`${idx}: ${variant.name.toString()}`);
                    });
                } else {
                    // Try direct iteration
                    for (let i = 0; i < 30; i++) {
                        try {
                            const error = api.registry.findMetaError({ index: api.registry.createType('u8', pallet.index), error: api.registry.createType('[u8; 4]', [i, 0, 0, 0]) });
                            console.log(`${i}: ${error.name}`);
                        } catch (e) {
                            // No more errors
                            break;
                        }
                    }
                }
            }
            break;
        }
    }
    
    await api.disconnect();
    process.exit(0);
}

decodeModuleError().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
