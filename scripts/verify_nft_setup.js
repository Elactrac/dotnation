const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

const PLATFORM_ADDRESS = '1x3RgDAppuAAbEQzz1Sq6SieaLNR7KtXYgpYCe2Jdt5Vgjp';
const NFT_ADDRESS = '12KWTGitcQcD5msfm1PjJmTec7TNwf6UPLkW7MGdKQy66ZXT';
const RPC_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io';

async function verifyNftSetup() {
    console.log('='.repeat(80));
    console.log('NFT AUTO-MINTING SETUP VERIFICATION');
    console.log('='.repeat(80));
    console.log(`Platform Contract: ${PLATFORM_ADDRESS}`);
    console.log(`NFT Contract:      ${NFT_ADDRESS}`);
    console.log(`Network:           ${RPC_ENDPOINT}\n`);

    const wsProvider = new WsProvider(RPC_ENDPOINT);
    const api = await ApiPromise.create({ provider: wsProvider });

    console.log('✓ Connected to network');
    console.log(`  Chain: ${await api.rpc.system.chain()}`);
    console.log(`  Version: ${await api.rpc.system.version()}\n`);

    // Load ABIs
    const platformAbiPath = './frontend/src/contracts/donation_platform.json';
    const nftAbiPath = './frontend/src/contracts/donation_nft.json';
    
    const platformAbi = JSON.parse(fs.readFileSync(platformAbiPath, 'utf8'));
    const nftAbi = JSON.parse(fs.readFileSync(nftAbiPath, 'utf8'));
    
    console.log('✓ Loaded ABIs\n');

    // Create contract instances
    const platformContract = new ContractPromise(api, platformAbi, PLATFORM_ADDRESS);
    const nftContract = new ContractPromise(api, nftAbi, NFT_ADDRESS);

    let allChecksPass = true;

    // STEP 1: Verify Platform Contract Configuration
    console.log('-'.repeat(80));
    console.log('STEP 1: Verify Platform Contract Configuration');
    console.log('-'.repeat(80));

    try {
        // Check if NFT is enabled on platform
        console.log('Checking isNftEnabled()...');
        const { result: nftEnabledResult, output: nftEnabledOutput } = await platformContract.query.isNftEnabled(
            PLATFORM_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        if (nftEnabledResult.isOk && nftEnabledOutput) {
            const isEnabled = nftEnabledOutput.toPrimitive();
            if (isEnabled) {
                console.log('  ✓ NFT minting is ENABLED on platform contract');
            } else {
                console.log('  ❌ NFT minting is DISABLED on platform contract');
                console.log('     ACTION: Call setNftEnabled(true) on platform contract');
                allChecksPass = false;
            }
        } else {
            console.log('  ❌ Failed to query isNftEnabled()');
            allChecksPass = false;
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        allChecksPass = false;
    }

    try {
        // Check NFT contract address on platform
        console.log('Checking getNftContract()...');
        const { result: nftAddressResult, output: nftAddressOutput } = await platformContract.query.getNftContract(
            PLATFORM_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        if (nftAddressResult.isOk && nftAddressOutput) {
            const rawOutput = nftAddressOutput.toJSON();
            const configuredAddress = rawOutput && rawOutput.ok ? rawOutput.ok : null;
            
            if (configuredAddress === NFT_ADDRESS) {
                console.log('  ✓ NFT contract address is correctly configured');
                console.log(`    Address: ${configuredAddress}`);
            } else if (configuredAddress === null) {
                console.log('  ❌ NFT contract address is NOT set (null)');
                console.log(`    Expected: ${NFT_ADDRESS}`);
                console.log('     ACTION: Call setNftContract() on platform contract');
                allChecksPass = false;
            } else {
                console.log('  ❌ NFT contract address MISMATCH');
                console.log(`    Expected: ${NFT_ADDRESS}`);
                console.log(`    Configured: ${configuredAddress}`);
                console.log('     ACTION: Call setNftContract() on platform contract');
                allChecksPass = false;
            }
        } else {
            console.log('  ❌ Failed to query getNftContract()');
            allChecksPass = false;
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        allChecksPass = false;
    }

    console.log();

    // STEP 2: Verify NFT Contract Configuration
    console.log('-'.repeat(80));
    console.log('STEP 2: Verify NFT Contract Configuration');
    console.log('-'.repeat(80));

    try {
        // Check platform contract address on NFT
        console.log('Checking getPlatformContract()...');
        const { result: platformAddressResult, output: platformAddressOutput } = await nftContract.query.getPlatformContract(
            NFT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        if (platformAddressResult.isOk && platformAddressOutput) {
            const rawOutput = platformAddressOutput.toJSON();
            const configuredAddress = rawOutput && rawOutput.ok ? rawOutput.ok : null;
            
            if (configuredAddress === PLATFORM_ADDRESS) {
                console.log('  ✓ Platform contract address is correctly configured on NFT');
                console.log(`    Address: ${configuredAddress}`);
            } else if (configuredAddress === null) {
                console.log('  ❌ Platform contract address is NOT set (null)');
                console.log(`    Expected: ${PLATFORM_ADDRESS}`);
                console.log('     ACTION: Call setPlatformContract() on NFT contract');
                allChecksPass = false;
            } else {
                console.log('  ❌ Platform contract address MISMATCH on NFT');
                console.log(`    Expected: ${PLATFORM_ADDRESS}`);
                console.log(`    Configured: ${configuredAddress}`);
                console.log('     ACTION: Call setPlatformContract() on NFT contract');
                allChecksPass = false;
            }
        } else {
            console.log('  ❌ Failed to query getPlatformContract()');
            allChecksPass = false;
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        allChecksPass = false;
    }

    console.log();

    // STEP 3: Check NFT Collection Info
    console.log('-'.repeat(80));
    console.log('STEP 3: NFT Collection Information');
    console.log('-'.repeat(80));

    try {
        console.log('Checking totalSupply()...');
        const { result: supplyResult, output: supplyOutput } = await nftContract.query.totalSupply(
            NFT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) }
        );
        
        if (supplyResult.isOk && supplyOutput) {
            const rawOutput = supplyOutput.toJSON();
            const totalSupply = rawOutput && rawOutput.ok !== undefined ? rawOutput.ok : rawOutput;
            console.log(`  ✓ Total NFTs minted: ${totalSupply}`);
            if (totalSupply === 0 || totalSupply === '0') {
                console.log('    (No NFTs minted yet - this is expected if no donations made)');
            }
        } else {
            console.log('  ⚠️  Could not query total supply');
        }
    } catch (error) {
        console.log(`  ⚠️  Error: ${error.message}`);
    }

    try {
        console.log('Checking collection_id()...');
        const { result: collectionResult, output: collectionOutput } = await nftContract.query['psp34Metadata::getAttribute'](
            NFT_ADDRESS,
            { gasLimit: api.registry.createType('WeightV2', { refTime: 10000000000, proofSize: 1000000 }) },
            { u128: 0 }, // token ID 0 or collection level
            'name'
        );
        
        if (collectionResult.isOk && collectionOutput) {
            const name = collectionOutput.toHuman();
            console.log(`  ✓ Collection name: ${name}`);
        }
    } catch (error) {
        // This query might fail if method doesn't exist, that's ok
    }

    console.log();

    // STEP 4: Verify Contract Code Exists
    console.log('-'.repeat(80));
    console.log('STEP 4: Verify Contracts Exist On-Chain');
    console.log('-'.repeat(80));

    try {
        const platformInfo = await api.query.contracts.contractInfoOf(PLATFORM_ADDRESS);
        if (platformInfo.isSome) {
            console.log('  ✓ Platform contract exists on-chain');
            const info = platformInfo.unwrap();
            console.log(`    Code hash: ${info.codeHash.toHex()}`);
        } else {
            console.log('  ❌ Platform contract NOT found on-chain!');
            allChecksPass = false;
        }
    } catch (error) {
        console.log(`  ❌ Error checking platform: ${error.message}`);
        allChecksPass = false;
    }

    try {
        const nftInfo = await api.query.contracts.contractInfoOf(NFT_ADDRESS);
        if (nftInfo.isSome) {
            console.log('  ✓ NFT contract exists on-chain');
            const info = nftInfo.unwrap();
            console.log(`    Code hash: ${info.codeHash.toHex()}`);
        } else {
            console.log('  ❌ NFT contract NOT found on-chain!');
            allChecksPass = false;
        }
    } catch (error) {
        console.log(`  ❌ Error checking NFT: ${error.message}`);
        allChecksPass = false;
    }

    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    if (allChecksPass) {
        console.log('✓ ALL CHECKS PASSED!');
        console.log('\nNFT auto-minting is correctly configured and ready to use.');
        console.log('\nNext steps:');
        console.log('1. Make a test donation through your frontend or contract');
        console.log('2. Check NFT total_supply() - should increase by 1');
        console.log('3. Check balance_of(donor_address) - should show 1 NFT');
        console.log('4. Query token_uri(0) - should show metadata with donation details');
    } else {
        console.log('❌ SOME CHECKS FAILED');
        console.log('\nPlease review the errors above and take the suggested actions.');
        console.log('\nRequired actions:');
        console.log('1. Ensure setNftContract() was called on platform contract');
        console.log('2. Ensure setNftEnabled(true) was called on platform contract');
        console.log('3. Ensure setPlatformContract() was called on NFT contract');
    }
    
    console.log('='.repeat(80));

    await api.disconnect();
}

verifyNftSetup().catch(console.error);
