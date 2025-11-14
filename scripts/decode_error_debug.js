const { ApiPromise, WsProvider } = require('@polkadot/api');

async function decodeModuleError() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    console.log('\n=== Investigating Metadata Structure ===');
    
    // Check metadata structure
    console.log('API metadata:', typeof api.metadata);
    console.log('Registry metadata:', typeof api.registry.metadata);
    console.log('Metadata keys:', Object.keys(api.registry.metadata || {}));
    
    // Try different ways to access metadata
    let pallets = null;
    
    try {
        pallets = api.registry.metadata.pallets;
        console.log('✅ Found pallets at: api.registry.metadata.pallets');
    } catch (e) {
        console.log('❌ Not at api.registry.metadata.pallets');
    }
    
    if (!pallets) {
        try {
            pallets = api.registry.metadata.asLatest.pallets;
            console.log('✅ Found pallets at: api.registry.metadata.asLatest.pallets');
        } catch (e) {
            console.log('❌ Not at api.registry.metadata.asLatest.pallets');
        }
    }
    
    if (!pallets) {
        try {
            const metadataRaw = api.runtimeMetadata;
            pallets = metadataRaw.asLatest.pallets;
            console.log('✅ Found pallets at: api.runtimeMetadata.asLatest.pallets');
        } catch (e) {
            console.log('❌ Not at api.runtimeMetadata.asLatest.pallets');
        }
    }
    
    if (pallets) {
        console.log(`\nTotal pallets: ${pallets.length}`);
        
        // Module 52 (0x34), Error 0x19 (25 decimal)
        const moduleIndex = 52;
        const errorIndex = 0x19; // 25 in decimal
        
        console.log(`\n=== Decoding Module ${moduleIndex}, Error ${errorIndex} ===`);
        
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
                console.log(`Total errors in pallet: ${errors.length}`);
                
                if (errorIndex < errors.length) {
                    const error = errors[errorIndex];
                    console.log(`\n✅ ERROR DECODED:`);
                    console.log(`   Name: ${error.name.toString()}`);
                    console.log(`   Docs: ${error.docs.map(d => d.toString()).join('\n         ')}`);
                } else {
                    console.log(`\n❌ Error index ${errorIndex} is out of bounds (max: ${errors.length - 1})`);
                }
                
                // List first 30 errors for reference
                console.log(`\n=== Contracts Pallet Errors (first 30) ===`);
                errors.slice(0, 30).forEach((error, idx) => {
                    console.log(`${idx}: ${error.name.toString()}`);
                });
            } else {
                console.log('\n❌ No errors defined in this pallet');
            }
        } else {
            console.log(`\n❌ Could not find pallet with index ${moduleIndex}`);
            console.log('\nPallets around index 52:');
            for (const pallet of pallets) {
                const idx = pallet.index.toNumber();
                if (idx >= 48 && idx <= 56) {
                    console.log(`  ${idx}: ${pallet.name.toString()}`);
                }
            }
        }
    } else {
        console.log('\n❌ Could not find pallets in metadata');
    }
    
    await api.disconnect();
    process.exit(0);
}

decodeModuleError().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
