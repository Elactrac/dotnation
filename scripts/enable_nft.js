const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');
const path = require('path');

// Configuration
const WS_ENDPOINT = 'wss://rpc2.paseo.mandalachain.io'; // Mandala Paseo Testnet
const CONTRACT_ADDRESS_FILE = path.join(__dirname, '../donation_platform/contract_address.txt');
const NFT_CONTRACT_ADDRESS_FILE = path.join(__dirname, '../donation_nft_contract/contract_address.txt');
const METADATA_FILE = path.join(__dirname, '../donation_platform/target/ink/donation_platform.json');

async function main() {
    console.log('🚀 Enabling NFT Minting on Donation Platform...');

    // 1. Initialize API
    const provider = new WsProvider(WS_ENDPOINT);
    const api = await ApiPromise.create({ provider });
    console.log('✅ Connected to Mandala Paseo');

    // 2. Load Keyring (Admin)
    const keyring = new Keyring({ type: 'sr25519' });
    // NOTE: In a real scenario, we'd load from a private key file or env var.
    // For this script, we assume the user has the 'Alice' dev key or provides a seed.
    // If running against a live testnet, you might need to replace this.
    // However, for local testing or if Alice is admin:
    const admin = keyring.addFromUri('//Alice');
    console.log(`🔑 Admin Account: ${admin.address}`);

    // 3. Load Contract Addresses
    if (!fs.existsSync(CONTRACT_ADDRESS_FILE)) {
        console.error('❌ Contract address file not found. Please deploy first.');
        process.exit(1);
    }
    const contractAddress = fs.readFileSync(CONTRACT_ADDRESS_FILE, 'utf8').trim();
    console.log(`📄 Platform Contract: ${contractAddress}`);

    if (!fs.existsSync(NFT_CONTRACT_ADDRESS_FILE)) {
        console.error('❌ NFT Contract address file not found. Please deploy NFT contract first.');
        // For now, we'll warn but proceed if we just want to enable the flag
        // process.exit(1);
    }
    let nftContractAddress = '';
    if (fs.existsSync(NFT_CONTRACT_ADDRESS_FILE)) {
        nftContractAddress = fs.readFileSync(NFT_CONTRACT_ADDRESS_FILE, 'utf8').trim();
        console.log(`🖼️ NFT Contract: ${nftContractAddress}`);
    }

    // 4. Load Metadata
    if (!fs.existsSync(METADATA_FILE)) {
        console.error('❌ Contract metadata not found. Please build the contract.');
        process.exit(1);
    }
    const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));

    // 5. Create Contract Instance
    const contract = new ContractPromise(api, metadata, contractAddress);

    // 6. Enable NFTs
    console.log('🔄 Setting NFT Enabled = true...');

    // Estimate gas
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: 3000000000,
        proofSize: 100000,
    });

    // Transaction 1: Set NFT Enabled
    const tx1 = contract.tx.setNftEnabled({ gasLimit }, true);

    await new Promise((resolve, reject) => {
        tx1.signAndSend(admin, (result) => {
            if (result.status.isInBlock) {
                console.log('✅ set_nft_enabled transaction included in block');
            } else if (result.status.isFinalized) {
                console.log('✅ set_nft_enabled finalized');
                resolve();
            } else if (result.isError) {
                console.error('❌ Transaction failed');
                reject(result.dispatchError);
            }
        });
    });

    // Transaction 2: Set NFT Contract Address (if available)
    if (nftContractAddress) {
        console.log(`🔄 Setting NFT Contract Address to ${nftContractAddress}...`);
        const tx2 = contract.tx.setNftContract({ gasLimit }, nftContractAddress);

        await new Promise((resolve, reject) => {
            tx2.signAndSend(admin, (result) => {
                if (result.status.isInBlock) {
                    console.log('✅ set_nft_contract transaction included in block');
                } else if (result.status.isFinalized) {
                    console.log('✅ set_nft_contract finalized');
                    resolve();
                } else if (result.isError) {
                    console.error('❌ Transaction failed');
                    reject(result.dispatchError);
                }
            });
        });
    }

    console.log('🎉 NFT Minting Enabled Successfully!');
    process.exit(0);
}

main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
