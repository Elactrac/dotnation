const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

const CONTRACT_ADDRESS = '14UAjY9AptwMMoHhGtbLogqq5VESpKcreiM2XPqgvkz15rDM';
const RPC_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io';

async function testDeployedContract() {
    console.log('='.repeat(80));
    console.log('TESTING DEPLOYED CONTRACT');
    console.log('='.repeat(80));
    console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`RPC Endpoint: ${RPC_ENDPOINT}\n`);

    const wsProvider = new WsProvider(RPC_ENDPOINT);
    const api = await ApiPromise.create({ provider: wsProvider });

    console.log('✓ Connected to network');
    console.log(`  Chain: ${await api.rpc.system.chain()}`);
    console.log(`  Version: ${await api.rpc.system.version()}\n`);

    // Load the ABI
    const abiPath = './frontend/src/contracts/donation_platform.json';
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    
    console.log('✓ Loaded ABI');
    console.log(`  ABI file: ${abiPath}`);
    console.log(`  Code hash from ABI: ${abi.source?.hash || 'N/A'}\n`);

    // Create contract instance
    const contract = new ContractPromise(api, abi, CONTRACT_ADDRESS);
    console.log('✓ Created contract instance\n');

    // Check if contract exists on-chain
    console.log('-'.repeat(80));
    console.log('STEP 1: Verify Contract Exists');
    console.log('-'.repeat(80));
    
    try {
        const contractInfo = await api.query.contracts.contractInfoOf(CONTRACT_ADDRESS);
        
        if (contractInfo.isNone) {
            console.log('❌ ERROR: Contract does NOT exist at this address!');
            console.log('   This means either:');
            console.log('   1. Wrong address is configured');
            console.log('   2. Contract was not deployed');
            console.log('   3. Wrong network (testnet vs mainnet)\n');
            await api.disconnect();
            return;
        }
        
        console.log('✓ Contract exists on-chain');
        const info = contractInfo.unwrap();
        console.log(`  Storage deposit: ${info.storageDeposit.toString()}`);
        console.log(`  Code hash: ${info.codeHash.toHex()}\n`);

        // Compare code hashes
        const deployedCodeHash = info.codeHash.toHex();
        const abiCodeHash = abi.source?.hash;
        
        if (abiCodeHash && deployedCodeHash !== abiCodeHash) {
            console.log('⚠️  WARNING: Code hash MISMATCH!');
            console.log(`   Deployed:  ${deployedCodeHash}`);
            console.log(`   ABI:       ${abiCodeHash}`);
            console.log('   This means the ABI does NOT match the deployed contract!\n');
        } else {
            console.log('✓ Code hashes match - ABI is correct\n');
        }
    } catch (error) {
        console.log(`❌ Error checking contract info: ${error.message}\n`);
    }

    // Test simple queries
    console.log('-'.repeat(80));
    console.log('STEP 2: Test Simple Query Methods');
    console.log('-'.repeat(80));

    // Test getVersion
    try {
        console.log('Testing getVersion()...');
        const { gasRequired, storageDeposit, result, output } = await contract.query.getVersion(
            CONTRACT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        console.log(`  Gas required: ${gasRequired.refTime.toNumber()}`);
        console.log(`  Result: ${result.isOk ? 'Ok' : 'Err'}`);
        
        if (result.isOk) {
            if (output) {
                const version = output.toPrimitive();
                console.log(`  ✓ Version: ${JSON.stringify(version)}`);
            } else {
                console.log('  ⚠️  Query succeeded but no output returned');
            }
        } else {
            console.log(`  ❌ Error: ${result.asErr.toHuman()}`);
            if (result.asErr.isModule) {
                const error = result.asErr.asModule;
                console.log(`     Module error - Index: ${error.index}, Code: ${error.error.toHex()}`);
            }
        }
        console.log();
    } catch (error) {
        console.log(`  ❌ Exception: ${error.message}\n`);
    }

    // Test getCampaignCount
    try {
        console.log('Testing getCampaignCount()...');
        const { gasRequired, storageDeposit, result, output } = await contract.query.getCampaignCount(
            CONTRACT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        console.log(`  Gas required: ${gasRequired.refTime.toNumber()}`);
        console.log(`  Result: ${result.isOk ? 'Ok' : 'Err'}`);
        
        if (result.isOk) {
            if (output) {
                const count = output.toPrimitive();
                console.log(`  ✓ Campaign count: ${JSON.stringify(count)}`);
            } else {
                console.log('  ⚠️  Query succeeded but no output returned');
            }
        } else {
            console.log(`  ❌ Error: ${result.asErr.toHuman()}`);
            if (result.asErr.isModule) {
                const error = result.asErr.asModule;
                console.log(`     Module error - Index: ${error.index}, Code: ${error.error.toHex()}`);
            }
        }
        console.log();
    } catch (error) {
        console.log(`  ❌ Exception: ${error.message}\n`);
    }

    // Test getMaxBatchSize
    try {
        console.log('Testing getMaxBatchSize()...');
        const { gasRequired, storageDeposit, result, output } = await contract.query.getMaxBatchSize(
            CONTRACT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        console.log(`  Gas required: ${gasRequired.refTime.toNumber()}`);
        console.log(`  Result: ${result.isOk ? 'Ok' : 'Err'}`);
        
        if (result.isOk) {
            if (output) {
                const size = output.toPrimitive();
                console.log(`  ✓ Max batch size: ${JSON.stringify(size)}`);
            } else {
                console.log('  ⚠️  Query succeeded but no output returned');
            }
        } else {
            console.log(`  ❌ Error: ${result.asErr.toHuman()}`);
            if (result.asErr.isModule) {
                const error = result.asErr.asModule;
                console.log(`     Module error - Index: ${error.index}, Code: ${error.error.toHex()}`);
            }
        }
        console.log();
    } catch (error) {
        console.log(`  ❌ Exception: ${error.message}\n`);
    }

    // Test getCampaignsPaginated
    console.log('-'.repeat(80));
    console.log('STEP 3: Test getCampaignsPaginated');
    console.log('-'.repeat(80));
    
    try {
        console.log('Testing getCampaignsPaginated(0, 5)...');
        const { gasRequired, storageDeposit, result, output } = await contract.query.getCampaignsPaginated(
            CONTRACT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 30000000000, proofSize: 5000000 }) },
            0,
            5
        );
        
        console.log(`  Gas required: ${gasRequired.refTime.toNumber()}`);
        console.log(`  Result: ${result.isOk ? 'Ok' : 'Err'}`);
        
        if (result.isOk) {
            if (output) {
                const campaigns = output.toHuman();
                console.log(`  ✓ Campaigns returned: ${JSON.stringify(campaigns, null, 2)}`);
            } else {
                console.log('  ⚠️  Query succeeded but no output returned');
            }
        } else {
            console.log(`  ❌ Error: ${result.asErr.toHuman()}`);
            if (result.asErr.isModule) {
                const error = result.asErr.asModule;
                console.log(`     Module error - Index: ${error.index}, Code: ${error.error.toHex()}`);
                
                // Decode the error
                const errorCode = error.error.toHex();
                if (errorCode === '0x02000000') {
                    console.log('     This is ContractTrapped - the contract panicked during execution!');
                }
            }
        }
        console.log();
    } catch (error) {
        console.log(`  ❌ Exception: ${error.message}\n`);
    }

    // Check if contract code is uploaded
    console.log('-'.repeat(80));
    console.log('STEP 4: Check If Code Exists On-Chain');
    console.log('-'.repeat(80));
    
    try {
        const contractInfo = await api.query.contracts.contractInfoOf(CONTRACT_ADDRESS);
        if (contractInfo.isSome) {
            const codeHash = contractInfo.unwrap().codeHash;
            const codeInfo = await api.query.contracts.codeStorage(codeHash);
            
            if (codeInfo.isSome) {
                console.log('✓ Contract code exists on-chain');
                console.log(`  Code hash: ${codeHash.toHex()}\n`);
            } else {
                console.log('❌ Contract code NOT found on-chain!');
                console.log(`  Code hash: ${codeHash.toHex()}`);
                console.log('  This is unusual and may indicate a problem.\n');
            }
        }
    } catch (error) {
        console.log(`❌ Error checking code: ${error.message}\n`);
    }

    // Summary and recommendations
    console.log('='.repeat(80));
    console.log('DIAGNOSIS SUMMARY');
    console.log('='.repeat(80));
    console.log('Based on the test results:');
    console.log('1. If simple queries (getVersion, getCampaignCount) FAIL → Contract code has bugs');
    console.log('2. If simple queries work but getCampaignsPaginated FAILS → Bug in that specific method');
    console.log('3. If all queries fail with ContractTrapped → Contract constructor failed or bad deployment');
    console.log('4. If code hash mismatch → Wrong ABI, need to redeploy with correct code');
    console.log('='.repeat(80));

    await api.disconnect();
}

testDeployedContract().catch(console.error);
