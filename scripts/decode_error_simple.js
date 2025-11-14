const { ApiPromise, WsProvider } = require('@polkadot/api');

async function decodeModuleError() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    console.log('\n=== Decoding Module Error 0x19000000 ===');
    
    // Module 52 (0x34), Error 0x19 (25 decimal)
    const moduleIndex = 52;
    const errorIndex = 0x19; // 25 in decimal
    
    console.log(`\nModule Index: ${moduleIndex} (0x${moduleIndex.toString(16)})`);
    console.log(`Error Index: ${errorIndex} (0x${errorIndex.toString(16)})`);
    
    // Get metadata for Contracts pallet
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
    
    await api.disconnect();
    process.exit(0);
}

decodeModuleError().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
