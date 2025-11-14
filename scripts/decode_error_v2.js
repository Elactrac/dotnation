const { ApiPromise, WsProvider } = require('@polkadot/api');

async function decodeModuleError() {
    console.log('Connecting to Paseo testnet...');
    const provider = new WsProvider('wss://rpc2.paseo.mandalachain.io');
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    console.log('\n=== Decoding Module Error 0x19000000 ===');
    
    const moduleIndex = 52;
    const errorIndex = 0x19; // 25 in decimal
    
    console.log(`\nModule Index: ${moduleIndex} (0x${moduleIndex.toString(16)})`);
    console.log(`Error Index: ${errorIndex} (0x${errorIndex.toString(16)})`);
    
    const pallets = api.registry.metadata.pallets;
    
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
        
        // Check errors structure
        console.log('Errors object type:', typeof contractsPallet.errors);
        console.log('Errors is Some:', contractsPallet.errors.isSome);
        
        if (contractsPallet.errors.isSome) {
            const errorsOption = contractsPallet.errors.unwrap();
            console.log('Unwrapped errors type:', errorsOption.type.toString());
            console.log('Errors length:', errorsOption.length);
            
            // Try to access individual errors
            console.log('\n=== All Contracts Pallet Errors ===');
            for (let i = 0; i < errorsOption.length; i++) {
                const error = errorsOption[i];
                console.log(`${i}: ${error.name.toString()}`);
                if (i === errorIndex) {
                    console.log(`\n✅ ERROR ${errorIndex} DECODED:`);
                    console.log(`   Name: ${error.name.toString()}`);
                    console.log(`   Docs: ${error.docs.map(d => d.toString()).join('\n         ')}`);
                    console.log('');
                }
            }
        } else {
            console.log('\n❌ No errors defined in this pallet');
        }
    } else {
        console.log(`\n❌ Could not find pallet with index ${moduleIndex}`);
    }
    
    await api.disconnect();
    process.exit(0);
}

decodeModuleError().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
