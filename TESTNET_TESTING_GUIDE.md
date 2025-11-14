# Paseo Testnet Testing Guide (Start to Finish)

Date: October 31, 2025

This is a precise, step-by-step guide to test DotNation on the Paseo ecosystem using a contracts-enabled parachain. Follow in order. No optional content.

---

## 0. Result You Will Achieve

- Build the ink! contract
- Deploy on **Mandala Paseo Chain** (or another contracts-enabled parachain) via Polkadot.js Apps
- Configure the frontend to point at that parachain and contract address
- Execute: create campaign → donate → withdraw
- Verify on-chain storage and events

**Recommended Network:** Mandala Paseo Chain (`wss://rpc2.paseo.mandalachain.io`)
- Full pallet-contracts support
- Paseo testnet ecosystem
- 12 decimals (same as Polkadot)
- Token: **KPGT** (Kusama Paseo Generic Token)
- Free KPGT tokens via faucet
- **Deployed Contract**: `14ztLqeXNXVmtDketzBif6xDiuE2a2Z5TKSGzL7sKHPGVyKY`

---

## 1. Install Tools (macOS)

Open Terminal.

Install Rust and toolchain:
```bash
curl https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"
rustup default stable
rustup target add wasm32-unknown-unknown
```

Install cargo-contract 5.0.3:
```bash
cargo install cargo-contract --version 5.0.3 --force
```

Install Node.js 18 (use one method):
```bash
# If you have Homebrew
brew install node@18

# Or use nvm (recommended if you have it)
# brew install nvm && follow its setup, then:
nvm install 18
nvm use 18
```

Install project dependencies:
```bash
cd /Users/keshav/Downloads/DotNation
cd frontend && npm install && cd ..
```

Install the Polkadot.js browser extension (Chrome/Brave/Edge):
- https://polkadot.js.org/extension

---

## 2. Prepare Wallet and Funds

1) Create/import at least two accounts in the Polkadot.js extension (Creator, Donor).

2) Get test funds for the Paseo testnet:

**For Mandala Paseo Chain:**
- Request KPGT tokens via the [Polkadot Faucet](https://faucet.polkadot.io/paseo)
- Or request in the [Polkadot Discord](https://discord.gg/polkadot) #paseo-faucet channel
- Paste your address and wait for the drop (usually instant)
- Ensure both accounts have at least 10 KPGT for transactions and contract deployment

**For other parachains:** Check the parachain's documentation for faucet information.

---

## 3. Identify a Contracts-Enabled Parachain on Paseo

You must deploy on a parachain (not the Paseo relay) that supports pallet-contracts.

### Recommended: Mandala Paseo Chain

**Mandala Chain** provides a production-grade contracts parachain on Paseo with full pallet-contracts support.

**RPC Endpoints:**
- Primary: `wss://rpc2.paseo.mandalachain.io`
- Alternative: `wss://rpc.paseo.mandalachain.io`

**Quick Setup:**
1) Open Polkadot.js Apps: https://polkadot.js.org/apps/
2) Top-left network selector → **Development** → **Custom** → paste Mandala RPC URL
3) Click "Switch" to connect
4) Verify "Developer → Contracts" menu appears in the left sidebar
5) Chain decimals: **12** (same as Polkadot)

### Alternative Parachains

If Mandala is unavailable, you can use other contracts-enabled parachains:
1) In Apps, top-left network selector → choose Paseo → then select a parachain endpoint that exposes Developer → Contracts
2) Confirm "Contracts" menu appears. If it does not, switch to another parachain under Paseo that supports contracts.

Record the parachain RPC URL you choose:
- Parachain RPC: ______________________________

---

## 4. Build the Contract (Release)

```bash
cd /Users/keshav/Downloads/DotNation/donation_platform
cargo contract build --release
```

Artifacts produced:
- target/ink/donation_platform.contract
- target/ink/donation_platform.json
- target/ink/donation_platform.wasm

---

## 5. Deploy the Contract via Polkadot.js Apps

1) In Apps (connected to the selected contracts parachain):
2) Developer → Contracts → Upload & deploy code
3) Upload: target/ink/donation_platform.contract
4) Constructor: `new()`
5) Endowment: set a small amount (e.g., 1 unit)
6) Submit and sign with the Creator account
7) Copy the instantiated contract address

Record:
- Contract Address: ______________________________
- Deployment Extrinsic Hash: _____________________

Sanity check:
1) Developer → Contracts → Your contract → Read → `get_campaign_count()`
2) Expect 0

---

## 6. Verify Chain Decimals (Required for Amounts)

In Polkadot.js Apps → Developer → JavaScript console:
```js
(await api.rpc.system.properties()).toHuman()
api.registry.chainDecimals
api.registry.chainSS58
```

**For Mandala Paseo Chain:**
- Chain decimals: **12** (1 KPGT = 1_000_000_000_000 plancks)
- Token symbol: **KPGT** (Kusama Paseo Generic Token)
- SS58 Format: **42** (generic Substrate)
- **Example Contract Address**: `14ztLqeXNXVmtDketzBif6xDiuE2a2Z5TKSGzL7sKHPGVyKY`

Note the decimal value for your chosen chain. You'll use 10^decimals for planck conversion.

---

## 7. Configure the Frontend for the Parachain & Contract

Create `frontend/.env.local` with your values:

**For Mandala Paseo Chain:**
```bash
VITE_NETWORK_NAME=Paseo Testnet
VITE_RPC_ENDPOINT=wss://rpc2.paseo.mandalachain.io
VITE_CONTRACT_ADDRESS=14XMeZRAtCVwRb6irF2eJbhLXCYsay9kujAzXYfwxgezk2Mg
VITE_BACKEND_URL=http://localhost:3001
VITE_BACKEND_API_KEY=dev_api_key_12345
VITE_APP_VERSION=1.0.0-dev
```

**For other parachains:**
```bash
VITE_NETWORK_NAME=Paseo (Your Parachain Name)
VITE_RPC_ENDPOINT=<paste the parachain wss endpoint from Apps>
VITE_CONTRACT_ADDRESS=<paste the contract address>
```

Start the app:
```bash
cd /Users/keshav/Downloads/DotNation/frontend
npm run dev
```

Open http://localhost:5173

Grant the site access in the Polkadot.js extension when prompted.

---

## 8. Execute Tests (Minimal End-to-End)

All transactions must be signed with the extension and finalized on-chain before verifying state.

1) Connect Wallet
- Click “Connect Wallet”
- Select the Creator account
- Expected: Address shown in UI, no errors

2) Create Campaign
- Inputs:
  - Title: Water Wells Project
  - Description: ≥ 100 characters
  - Goal: 10 units (your token symbol)
  - Deadline: choose a future timestamp (≥ 10 minutes ahead)
  - Beneficiary: a valid SS58 address on this parachain
- Submit → Sign
- Wait until finalized
- Expected:
  - Event: CampaignCreated
  - UI lists the campaign
  - `get_campaign_count()` increased by 1

3) Donate
- Switch to the Donor account in the extension
- Open the campaign → Donate 0.1 units
- Submit → Sign → wait for finalization
- Expected:
  - Event: DonationReceived
  - Raised amount increases by 0.1 × 10^decimals plancks

4) Goal Reached → Withdraw
- If needed, perform additional donations until raised ≥ goal
- Switch to the Owner (Creator) account
- Click Withdraw → Sign → wait for finalization
- Expected:
  - Event: FundsWithdrawn
  - State becomes Withdrawn
  - Beneficiary balance increases

---

## 9. Verify On-Chain State and Events

In Polkadot.js Apps:
1) Network → Explorer → Events: find CampaignCreated, DonationReceived, FundsWithdrawn
2) Developer → Contracts → Your contract → Read messages:
   - `get_campaign_count()`
   - `get_campaign(<id>)` (if exposed) to check state fields

Record extrinsic hashes for each step.

---

## 10. Amount Conversion Rule (Must Match Chain Decimals)

If chainDecimals = 12, 1 token = 1_000_000_000_000 plancks.
Use BigInt in the UI and do not convert large balances with `.toNumber()`.

---

## 11. Common Issues and Fixes

- **Cannot find Contracts menu**: You selected a parachain without pallet-contracts. Switch to Mandala Paseo Chain (`wss://rpc2.paseo.mandalachain.io`) or another contracts-enabled parachain.
- **Connection timeout**: Try the alternative Mandala endpoint (`wss://rpc.paseo.mandalachain.io`) or check your internet connection.
- **Wallet not detected**: Reinstall Polkadot.js extension, allow the site, and refresh. Ensure you're using a recent version of the extension.
- **Contract reads fail**: Ensure you deployed the same artifact you built (`.contract`), and the parachain is the same one the frontend connects to. Verify the contract address in `.env.local` matches the deployed contract.
- **Amounts look wrong**: Re-check `api.registry.chainDecimals` (should be 12 for Mandala). Confirm planck conversion uses 10^decimals and BigInt. For Mandala: 1 KPGT = 1_000_000_000_000 plancks.
- **Contract error {"module":{"index":52,"error":"0x02000000"}}**: This indicates ContractTrapped. Common causes:
  - ABI mismatch: Redeploy the contract with the latest build
  - Method doesn't exist: Ensure you're calling the correct camelCase method names (e.g., `getCampaignsPaginated`, not `get_campaigns_paginated`)
  - Invalid parameters: Check that all arguments match the contract's expected types

---

## 12. What to Submit After Testing

- Parachain RPC URL used
- Contract address
- Extrinsic hashes (create, donate, withdraw)
- Screenshots of Explorer events and Contract read values
- Notes on any failures with exact error messages
