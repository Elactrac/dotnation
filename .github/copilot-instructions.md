# DotNation - AI Agent Instructions

## Project Overview
DotNation is a decentralized crowdfunding platform built on Polkadot with advanced features:
- **Backend**: ink! smart contract (`donation_platform/lib.rs`) with Quadratic Funding & DAO Voting
- **Frontend**: React 18 + Vite 5 SPA with Chakra UI v3 and Polkadot.js
- **Network**: Targets local `substrate-contracts-node` (dev) and Polkadot parachains (prod)
- **Key Features**: Quadratic Funding matching pools, DAO milestone-based voting, weighted governance

## Tech Stack
- **Smart Contract**: Rust + ink! 5.0.2, cargo-contract 5.0.3
- **Frontend**: React 18.2, React Router 6.22, Chakra UI 3.27, Framer Motion 12.23
- **Blockchain SDK**: Polkadot.js (extension-dapp + api) - **NOT in package.json, must be added**
- **Build Tools**: Vite 5.1 (frontend), cargo-contract (backend)
- **Testing**: ink! test env (contract), React Testing Library (frontend - minimal coverage)

## Architecture & Data Flow

### Smart Contract Layer (Rust + ink!)
- **Location**: `donation_platform/lib.rs` (V2 with QF + DAO voting)
- **Pattern**: Campaign state machine with 4 states: `Active`, `Successful`, `Failed`, `Withdrawn`
- **Advanced Features**:
  - **Quadratic Funding**: Matching pools, rounds, QF calculation with sqrt algorithm
  - **DAO Voting**: Milestone-based releases, weighted voting (66% threshold), sequential unlocking
  - **Governance**: Donors vote on milestones proportional to donation amount
- **Critical invariants**:
  - Funds transfer directly: Donor → Contract → Beneficiary (never through intermediaries)
  - Withdrawals only allowed when: goal reached OR deadline passed (or milestone approved)
  - All amounts stored in `Balance` type (Polkadot's smallest unit)
  - Campaign IDs are auto-incremented u32 starting from 0
  - QF matching distributed only when round ends
  - Milestones must be activated and released sequentially

### Frontend Architecture (React + Polkadot.js)
- **Entry**: `frontend/src/main.jsx` → `App.jsx` → React Router → Pages
- **Routing**: React Router 6 with nested routes
  - `/` → `LandingPage` (marketing site with animated canvas)
  - `/dashboard` → `DashboardLayout` → `DashboardPage` (app interface)
  - Campaign detail pages expected at `/campaign/:id` (not fully wired)
- **State management**: React Context API (3 contexts)
  - `WalletContext`: Polkadot.js extension auth, account selection, wallet UI
  - `ApiContext`: WebSocket connection to Substrate node (ws://127.0.0.1:9944)
  - `CampaignContext`: Contract method wrappers, campaign CRUD, donation flows, QF functions, DAO voting
- **New Components**:
  - `MilestoneCreation.jsx`: Form for campaign owners to define milestones (475 lines)
  - `MilestoneVoting.jsx`: Voting interface for donors, fund release for owners (390 lines)
  - `MatchingPoolAdmin.jsx`: Admin dashboard for QF matching pool management
- **Resilience**: App loads without Polkadot node (5s timeout), shows warnings if disconnected

### Contract Interaction Pattern
```javascript
// CampaignContext wraps all contract calls:
const tx = api.tx.donationPlatform.<method>(...args);
await tx.signAndSend(selectedAccount.address, options);
```
- **Read operations**: `api.query.donationPlatform.<method>()` returns wrapped types
- **Write operations**: `api.tx.donationPlatform.<method>()` creates extrinsic
- **Payable calls**: Pass `{ value: amountInPlancks }` as second arg to `signAndSend`
- **Amount conversion**: User DOT → multiply by `1_000_000_000_000` → plancks (12 decimals)
- **Type unwrapping**: Chain returns → `.toNumber()`, `.toString()`, `.toBigInt()`

**Critical**: `signAndSend` is fire-and-forget. Add callback for tx finalization:
```javascript
await tx.signAndSend(account, ({ status, events }) => {
  if (status.isInBlock) { /* tx included */ }
  if (status.isFinalized) { /* tx finalized */ }
});
```

## Development Workflows

### Building Smart Contract
```bash
cd donation_platform
cargo contract build --release
# Output: target/ink/donation_platform.{contract,json,wasm}
# - .contract: Bundled WASM + metadata (use this for deployment)
# - .json: ABI metadata (needed for frontend contract interaction)
# - .wasm: Raw compiled contract
```
- **Always build in release mode** - Debug builds are 3x larger
- **Deployment**: Upload `.contract` via Polkadot.js Apps → Developer → Contracts
- **Frontend integration**: The `.json` metadata is NOT currently loaded by frontend
  - Frontend uses hardcoded `api.tx/query.donationPlatform` patterns
  - TODO: Load ABI dynamically via `ContractPromise` from `@polkadot/api-contract`

### Frontend Development
```bash
cd frontend
npm run dev     # Vite dev server on localhost:5173
npm run build   # Production build to dist/
npm run lint    # ESLint check
```
- **Note**: Frontend was initially bootstrapped with CRA but migrated to Vite
  - Old `package.json` scripts reference removed but README still mentions CRA (outdated)
  - Actual build system: Vite 5 with `@vitejs/plugin-react`

### Local Testing Setup
1. **Install dependencies** (if not already):
   ```bash
   # Smart contract toolchain
   cargo install cargo-contract --version 5.0.3
   
   # Local Substrate node with contracts pallet
   cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node
   
   # Frontend (MISSING @polkadot/* packages!)
   cd frontend
   npm install
   npm install @polkadot/api @polkadot/extension-dapp  # Add these!
   ```

2. **Start local node**: `substrate-contracts-node --dev` (listens on ws://127.0.0.1:9944)

3. **Deploy contract**:
   - Option A: Polkadot.js Apps (https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944)
   - Option B: Contracts UI (https://contracts-ui.substrate.io)
   - Upload `target/ink/donation_platform.contract`
   - Instantiate with `new()` constructor
   - **Copy contract address** (e.g., `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`)

4. **Wire contract address**: Currently hardcoded in `CampaignContext` as API calls
   - Proper solution: Store in `.env.local` as `VITE_CONTRACT_ADDRESS=<addr>`
   - Load in context: `import.meta.env.VITE_CONTRACT_ADDRESS`

5. **Start frontend**: `cd frontend && npm run dev` (http://localhost:5173)

### Production Deployment

#### Target Networks
DotNation can deploy to any Substrate chain with the `pallet-contracts` enabled:

| Network | Type | RPC Endpoint | Use Case |
|---------|------|--------------|----------|
| **Local Node** | Dev | `ws://127.0.0.1:9944` | Development & testing |
| **Rococo Contracts** | Testnet | `wss://rococo-contracts-rpc.polkadot.io` | Pre-production testing |
| **Astar (Shibuya)** | Testnet | `wss://rpc.shibuya.astar.network` | Polkadot parachain testnet |
| **Astar** | Mainnet | `wss://rpc.astar.network` | Production (Polkadot parachain) |
| **Shiden** | Mainnet | `wss://rpc.shiden.astar.network` | Production (Kusama parachain) |

#### Contract Deployment Workflow

1. **Build optimized contract**:
   ```bash
   cd donation_platform
   cargo contract build --release
   # Verify output size (should be <50KB for production)
   ls -lh target/ink/donation_platform.wasm
   ```

2. **Choose deployment method**:

   **Option A: Polkadot.js Apps UI** (Recommended for first deployment)
   - Navigate to [Polkadot.js Apps](https://polkadot.js.org/apps/)
   - Connect to target network (click top-left network selector)
   - Go to Developer → Contracts → Upload & deploy code
   - Upload `target/ink/donation_platform.contract`
   - Set endowment (initial funding for contract, e.g., 1 DOT)
   - Call constructor: `new()` with no parameters
   - Sign transaction with deployment account
   - **Save contract address** from success message

   **Option B: Command-line deployment** (For automation)
   ```bash
   # Install cargo-contract if not already installed
   cargo install cargo-contract --version 5.0.3
   
   # Deploy to network (requires funded account)
   cargo contract instantiate \
     --constructor new \
     --args \
     --suri "//Alice" \
     --url wss://rococo-contracts-rpc.polkadot.io \
     --execute
   ```

3. **Verify deployment**:
   - Check contract appears in Polkadot.js Apps → Developer → Contracts
   - Test read operations (e.g., `get_campaign_count()` should return 0)
   - Create test campaign to verify write operations work

4. **Configure frontend for production**:

   Create `frontend/.env.production`:
   ```bash
   # Rococo Contracts (testnet)
   VITE_NETWORK_NAME=Rococo Contracts
   VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
   VITE_CONTRACT_ADDRESS=5ABC123...  # Your deployed contract address
   
   # OR Astar (mainnet)
   # VITE_NETWORK_NAME=Astar
   # VITE_RPC_ENDPOINT=wss://rpc.astar.network
   # VITE_CONTRACT_ADDRESS=XYZ789...
   ```

   Update `frontend/src/contexts/ApiContext.js`:
   ```javascript
   const wsProvider = new WsProvider(
     import.meta.env.VITE_RPC_ENDPOINT || 'ws://127.0.0.1:9944'
   );
   ```

   Update `frontend/src/contexts/CampaignContext.js`:
   ```javascript
   const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
   if (!CONTRACT_ADDRESS) {
     throw new Error('VITE_CONTRACT_ADDRESS not configured');
   }
   ```

5. **Build and deploy frontend**:
   ```bash
   cd frontend
   npm run build
   # Output in dist/ folder - deploy to Vercel, Netlify, or IPFS
   ```

#### Network-Specific Considerations

**Rococo Contracts (Testnet)**
- Faucet: Request ROC tokens via [Polkadot Discord](https://discord.gg/polkadot)
- Best for: Pre-production testing with real network conditions
- Cost: Free testnet tokens

**Astar/Shiden (Mainnet)**
- Requires: Real ASTR/SDN tokens for gas fees
- Supports: EVM + WASM (ink!) contracts side-by-side
- Best for: Production deployments with dApp staking rewards
- Gas fees: ~0.01 ASTR per transaction

**Substrate Contracts Node (Local)**
- Best for: Rapid development iteration
- Limitations: No persistence across restarts, single validator

#### Multi-Network Configuration (Advanced)

For apps supporting multiple networks, create `frontend/src/config/networks.js`:
```javascript
export const NETWORKS = {
  local: {
    name: 'Local Node',
    rpc: 'ws://127.0.0.1:9944',
    contractAddress: '5GrwvaEF...',
  },
  rococo: {
    name: 'Rococo Contracts',
    rpc: 'wss://rococo-contracts-rpc.polkadot.io',
    contractAddress: '5HT3Qx...',
  },
  astar: {
    name: 'Astar',
    rpc: 'wss://rpc.astar.network',
    contractAddress: '5FLSig...',
  },
};

export const getNetwork = () => {
  const networkId = import.meta.env.VITE_NETWORK_ID || 'local';
  return NETWORKS[networkId];
};
```

#### Deployment Checklist
- [ ] Contract built with `--release` flag
- [ ] Contract size optimized (<50KB WASM)
- [ ] Contract tested on local node
- [ ] Deployment account funded with sufficient balance
- [ ] Contract deployed and address saved
- [ ] Frontend environment variables configured
- [ ] Frontend tested against deployed contract
- [ ] Contract address backed up securely
- [ ] Admin/owner account secured (hardware wallet recommended)

## CI/CD & Automation

### Current State
**No CI/CD workflows are currently configured.** The project relies on manual builds and deployments.

### Recommended GitHub Actions Workflows

#### 1. Contract Build & Test (`contract-ci.yml`)
Validates smart contract on every push/PR:

```yaml
name: Smart Contract CI

on:
  push:
    branches: [ master, main, develop ]
    paths:
      - 'donation_platform/**'
      - '.github/workflows/contract-ci.yml'
  pull_request:
    branches: [ master, main, develop ]
    paths:
      - 'donation_platform/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Rust toolchain
      uses: actions-rust-lang/setup-rust-toolchain@v1
      with:
        toolchain: stable
        target: wasm32-unknown-unknown
    
    - name: Install cargo-contract
      run: cargo install cargo-contract --version 5.0.3 --force
    
    - name: Build contract (debug)
      working-directory: ./donation_platform
      run: cargo contract build
    
    - name: Run unit tests
      working-directory: ./donation_platform
      run: cargo test
    
    - name: Run e2e tests
      working-directory: ./donation_platform
      run: cargo test --features e2e-tests
    
    - name: Build contract (release)
      working-directory: ./donation_platform
      run: cargo contract build --release
    
    - name: Check contract size
      working-directory: ./donation_platform
      run: |
        SIZE=$(wc -c < target/ink/donation_platform.wasm)
        echo "Contract WASM size: $SIZE bytes"
        if [ $SIZE -gt 51200 ]; then
          echo "Warning: Contract size exceeds 50KB"
          exit 1
        fi
    
    - name: Upload contract artifacts
      uses: actions/upload-artifact@v4
      with:
        name: contract-artifacts
        path: |
          donation_platform/target/ink/donation_platform.contract
          donation_platform/target/ink/donation_platform.json
          donation_platform/target/ink/donation_platform.wasm
        retention-days: 30
```

#### 2. Frontend Build & Test (`frontend-ci.yml`)
Validates frontend on every push/PR:

```yaml
name: Frontend CI

on:
  push:
    branches: [ master, main, develop ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [ master, main, develop ]
    paths:
      - 'frontend/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Lint code
      working-directory: ./frontend
      run: npm run lint
    
    - name: Run tests (if configured)
      working-directory: ./frontend
      run: npm test || echo "No tests configured yet"
    
    - name: Build production bundle
      working-directory: ./frontend
      run: npm run build
    
    - name: Check bundle size
      working-directory: ./frontend
      run: |
        SIZE=$(du -sh dist | cut -f1)
        echo "Bundle size: $SIZE"
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: frontend-dist
        path: frontend/dist/
        retention-days: 30
```

#### 3. Deployment Pipeline (`deploy.yml`)
Automated deployment to testnet (manual trigger):

```yaml
name: Deploy to Testnet

on:
  workflow_dispatch:
    inputs:
      network:
        description: 'Target network'
        required: true
        default: 'rococo'
        type: choice
        options:
          - rococo
          - shibuya
      environment:
        description: 'Environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-contract:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Rust toolchain
      uses: actions-rust-lang/setup-rust-toolchain@v1
      with:
        toolchain: stable
        target: wasm32-unknown-unknown
    
    - name: Install cargo-contract
      run: cargo install cargo-contract --version 5.0.3 --force
    
    - name: Build contract (release)
      working-directory: ./donation_platform
      run: cargo contract build --release
    
    - name: Deploy contract
      working-directory: ./donation_platform
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_PRIVATE_KEY }}
      run: |
        # This is a placeholder - actual deployment requires:
        # 1. Funded account (mnemonic/private key in secrets)
        # 2. Network-specific RPC endpoint
        # 3. cargo-contract instantiate command
        echo "Contract ready for deployment to ${{ github.event.inputs.network }}"
        echo "Manual deployment required via Polkadot.js Apps"
        echo "Artifact: target/ink/donation_platform.contract"
  
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-contract
    environment: ${{ github.event.inputs.environment }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Build with environment config
      working-directory: ./frontend
      env:
        VITE_NETWORK_NAME: ${{ secrets.VITE_NETWORK_NAME }}
        VITE_RPC_ENDPOINT: ${{ secrets.VITE_RPC_ENDPOINT }}
        VITE_CONTRACT_ADDRESS: ${{ secrets.VITE_CONTRACT_ADDRESS }}
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
        vercel-args: '--prod'
```

#### 4. Security Audit (`security.yml`)
Automated security checks:

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

jobs:
  rust-security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Install cargo-audit
      run: cargo install cargo-audit
    
    - name: Run security audit
      working-directory: ./donation_platform
      run: cargo audit
  
  frontend-security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Run npm audit
      working-directory: ./frontend
      run: npm audit --audit-level=moderate
```

### Required GitHub Secrets

For automated deployments, configure these secrets in GitHub Settings → Secrets:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `DEPLOY_PRIVATE_KEY` | Contract deployment account key | Contract deployment |
| `VITE_NETWORK_NAME` | Target network name | Frontend builds |
| `VITE_RPC_ENDPOINT` | WebSocket RPC endpoint | Frontend builds |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | Frontend builds |
| `VERCEL_TOKEN` | Vercel deployment token | Frontend deployment |
| `VERCEL_ORG_ID` | Vercel organization ID | Frontend deployment |
| `VERCEL_PROJECT_ID` | Vercel project ID | Frontend deployment |

### Local Pre-Commit Hooks (Recommended)

Create `.husky/pre-commit` for local validation:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run contract tests if contract files changed
if git diff --cached --name-only | grep -q "^donation_platform/"; then
  echo "Running smart contract tests..."
  cd donation_platform && cargo test
fi

# Run frontend linting if frontend files changed
if git diff --cached --name-only | grep -q "^frontend/"; then
  echo "Running frontend linting..."
  cd frontend && npm run lint
fi
```

Install husky:
```bash
cd frontend
npm install --save-dev husky
npx husky install
```

### CI/CD Best Practices for This Project

1. **Always build contracts in release mode** for size optimization
2. **Run full test suite** before deployment (unit + e2e)
3. **Validate contract size** (<50KB for optimal deployment)
4. **Use environment-specific secrets** (staging vs production)
5. **Test on testnet first** (Rococo Contracts) before mainnet
6. **Manual approval required** for production deployments
7. **Backup contract addresses** after each deployment
8. **Version artifacts** with git tags for traceability

### Deployment Workflow Pattern

```
┌─────────────┐
│ Git Push    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Run Tests   │ ◄── contract-ci.yml + frontend-ci.yml
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Build       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Manual      │ ◄── Requires approval
│ Trigger     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Deploy to   │ ◄── deploy.yml (testnet)
│ Testnet     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Verify      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Deploy to   │ ◄── deploy.yml (mainnet)
│ Production  │
└─────────────┘
```

## Project-Specific Conventions

### File Organization
- **Smart contract**: Single-file `donation_platform/lib.rs` (common ink! pattern for small contracts)
- **Frontend** follows feature-based structure:
  - `src/main.jsx` → Entry point, wraps App with React StrictMode
  - `src/App.jsx` → Router setup with `createBrowserRouter`
  - `src/contexts/` → Context providers (Wallet, Api, Campaign)
  - `src/components/` → Reusable UI (CampaignCard, DonationInterface, WalletConnect)
  - `src/pages/` → Route components (LandingPage, DashboardPage, DashboardLayout)
  - `src/routes/` → Empty (was for old routing pattern, now inline in App.jsx)
- **Artifacts**: Root-level `App.js`, `WalletConnect.js`, `ApiContext.js` are STALE duplicates
  - Active files are in `frontend/src/`
  - Root files likely from early scaffolding, safe to delete

### Naming Patterns
- Smart contract methods: `snake_case` (Rust convention)
- Frontend API mapping: Direct translation (`create_campaign` → `createCampaign`)
- React components: `PascalCase` for components, `camelCase` for hooks/utils
- State enum variants: `PascalCase` in Rust, converted to strings in JS

### Error Handling
- **Smart contract**: Custom `Error` enum (8 variants: CampaignNotFound, NotActive, DeadlinePassed, etc.)
  - Returns `Result<T, Error>` from all fallible operations
  - Tests validate error conditions (see `#[ink::test]` blocks)
- **Frontend**: Try-catch with Chakra UI `useToast` hook
  - Pattern: Contexts throw errors with `.message`, components catch and display toast
  - Example: `CreateCampaignForm` validates input, shows toast on success/failure
  - Missing: Global error boundary for uncaught errors in React tree

## Critical Integration Points

### Polkadot.js Extension Integration
- **Extension flow** (in `WalletContext`):
  1. User clicks "Connect Wallet" → calls `connectWallet()`
  2. `web3Enable('DotNation')` → authorizes app with extension
  3. `web3Accounts()` → fetches all accounts from extension
  4. Auto-selects first account, user can switch via dropdown
- **Account object structure**:
  ```javascript
  {
    address: "5GrwvaEF...",  // SS58 encoded address
    meta: { name: "Alice", source: "polkadot-js" }
  }
  ```
- **Connection resilience**:
  - 5-second timeout on node connection (both WalletContext and ApiContext)
  - If timeout: App continues without node, shows "Retry Connection" button
  - If no extension: Error toast "No extension installed"
- **UX pattern**: Progressive enhancement - core UI loads, wallet features disabled until connected

### Smart Contract ABI & Deployment
- **Metadata**: `target/ink/donation_platform.json` contains full ABI (constructors, messages, events, types)
- **Current frontend approach**: Hardcoded method calls via `api.tx/query.donationPlatform`
  - Assumes contract is already deployed and registered with chain
  - Does NOT use `ContractPromise` from `@polkadot/api-contract`
- **Better approach** (not implemented):
  ```javascript
  import { ContractPromise } from '@polkadot/api-contract';
  import metadata from '../../donation_platform/target/ink/donation_platform.json';
  
  const contract = new ContractPromise(api, metadata, contractAddress);
  const result = await contract.query.getCampaign(caller, { value: 0 }, campaignId);
  ```
- **Deployment addresses**: No config file for mainnet/testnet addresses
  - Recommend: `frontend/src/config/contracts.js` with network-specific addresses

### Amount Conversions
- User input (DOT) → multiply by `1_000_000_000_000` → Contract (Balance/plancks)
- Contract returns → divide by `1_000_000_000_000` → Display (DOT)
- Always use `BigInt` for on-chain amounts to avoid precision loss

## Known Gaps & Implementation Notes

### Critical Missing Dependencies
- **Polkadot.js packages NOT in package.json**: `@polkadot/api`, `@polkadot/extension-dapp`
  - Code imports these but they're not declared
  - Must run: `npm install @polkadot/api @polkadot/extension-dapp`

### Contract Integration Gaps
1. **Contract address management**: No env var or config file for deployed addresses
   - Current: Assumes contract methods available as `api.tx.donationPlatform.*`
   - Fix: Add `VITE_CONTRACT_ADDRESS` to `.env.local`, load with `import.meta.env`

2. **Event subscription**: Contract emits 3 events but frontend ignores them
   - Events: `CampaignCreated`, `DonationReceived`, `FundsWithdrawn` (see lib.rs:292-318)
   - Subscribe via: `api.query.system.events()` or `contract.events.subscribe()`
   - Use case: Real-time UI updates when campaigns receive donations

3. **Transaction finalization**: Fire-and-forget pattern causes stale UI
   - Current: `signAndSend()` returns immediately, frontend refreshes manually
   - Fix: Add status callback to wait for `isFinalized` before refreshing

4. **ABI loading**: Frontend doesn't use contract metadata
   - Should use `ContractPromise` with imported JSON for type safety
   - Current approach works but brittle (no compile-time validation)

### Code Artifacts
- **Stale root files**: `App.js`, `WalletConnect.js`, `ApiContext.js` at project root
  - Active code is in `frontend/src/`
  - These are likely early prototypes, safe to remove

- **Empty route file**: `frontend/src/routes/AppRoutes.js` is unused
  - Routes defined inline in `App.jsx` with `createBrowserRouter`

- **README mismatch**: `frontend/README.md` still references Create React App
  - Project actually uses Vite (see `vite.config.js`, `main.jsx`, package.json scripts)

- **Test placeholder**: `App.test.js` is default CRA boilerplate, not updated for actual app

## Common Tasks

### Adding a new smart contract method
1. Add method to `impl DonationPlatform` in `lib.rs`
2. Mark with `#[ink(message)]` or `#[ink(message, payable)]`
3. Rebuild contract: `cargo contract build --release`
4. Add corresponding JS method in `CampaignContext.js`
5. Map Rust types: `u32` → `toNumber()`, `String` → `toString()`, `Balance` → `toBigInt()`

### Adding a new campaign field
1. Update `Campaign` struct in contract
2. Update `CampaignContext` formatting logic (in `fetchCampaigns` and `getCampaignDetails`)
3. Update UI components (`CampaignCard`, `CreateCampaignForm`, etc.)
4. Redeploy contract and update address

### Styling & Theming
- **Color palette**: Polkadot-inspired pink (#E6007A) + cyan (#00EAD3) accent
- **UI framework**: Chakra UI v3 for components, custom CSS for layout/animations
- **Styling approach**: Hybrid
  - Chakra components: Forms, buttons, cards, modals, toasts
  - Custom CSS: Landing page, dashboard grid, canvas animations
  - Files: `LandingPage.css`, `Dashboard.css`, `WalletConnect.css`
- **Signature feature**: Interactive particle network on landing page
  - Canvas-based animation in `LandingPage.jsx` (lines 5-180)
  - Mouse-reactive particles with ripple effects on click
  - ~200 lines of pure Canvas API code

## Testing & Validation

### Smart Contract Tests
```bash
cd donation_platform
cargo test --features e2e-tests
```
- Tests use ink!'s test environment (mock runtime)
- Key test scenarios: campaign lifecycle, donations, withdrawals, state transitions

### Frontend Testing
- **Current state**: Minimal - only default `App.test.js` from CRA template
- **Setup files**: `setupTests.js` configures jest-dom, but no actual test suite
- **Recommended stack**: 
  - Vitest (Vite-native test runner, replace Jest)
  - React Testing Library (already in dependencies)
  - Mock `@polkadot/api` calls for unit tests
- **Priority test cases**:
  - Campaign creation form validation
  - Donation amount conversion (DOT ↔ plancks)
  - Wallet connection error states
  - Campaign list rendering with mock data

## Security Considerations

### Smart Contract
- **Admin role**: Defined (`self.admin = caller` in constructor) but unused in logic
  - Only `withdraw_funds` checks `caller == admin`, allows bypassing owner check
  - Consider: Remove admin or use for emergency pause/upgrades
- **Reentrancy**: Not vulnerable - ink! uses `env().transfer()` which doesn't allow callbacks
- **Integer overflow**: Protected by Rust's checked arithmetic (panics on overflow in debug mode)
- **Access control**: `withdraw_funds` validates ownership (`caller == campaign.owner || caller == admin`)
- **State validation**: Campaign state machine prevents double withdrawals (checks `state != Withdrawn`)

### Frontend
- **Input validation**: Both sides validate amounts (`donation > 0`, `goal > 0`, `deadline > now`)
- **Address validation**: Frontend accepts any string for beneficiary (should validate SS58 format)
- **Wallet security**: Extension handles key management, app only requests signatures
- **Type safety gaps**: Polkadot.js returns wrapped types, must unwrap (`.toNumber()`, `.toString()`)
  - Dangerous: `.toNumber()` can overflow for large balances (use `.toBigInt()`)
- **XSS risks**: User-provided campaign titles/descriptions rendered without sanitization
  - Chakra UI's `Text` component auto-escapes, but verify for `dangerouslySetInnerHTML` usage

### Recommended Audits
1. Smart contract formal verification (ink! supports this via `cargo contract check`)
2. Frontend security scan (npm audit, check for vulnerable dependencies)
3. Penetration testing on deployed contract (test withdraw edge cases)

---

## Quick Reference

### Essential Commands
```bash
# Smart contract
cd donation_platform
cargo contract build --release        # Build contract
cargo test                            # Run unit tests
cargo test --features e2e-tests       # Run e2e tests

# Frontend
cd frontend
npm install                           # Install deps
npm install @polkadot/api @polkadot/extension-dapp  # Add missing deps
npm run dev                           # Start dev server (localhost:5173)
npm run build                         # Production build
npm run lint                          # ESLint check

# Local node
substrate-contracts-node --dev        # Start local testnet (ws://127.0.0.1:9944)
```

### Key File Locations
- **Smart contract**: `donation_platform/lib.rs` (single file, ~420 lines)
- **Build artifacts**: `donation_platform/target/ink/donation_platform.{contract,json,wasm}`
- **Frontend entry**: `frontend/src/main.jsx` → `App.jsx`
- **Contexts**: `frontend/src/contexts/{WalletContext,ApiContext,CampaignContext}.js`
- **Main pages**: `frontend/src/pages/{LandingPage,DashboardPage}.jsx`

### Common Pitfalls
1. **Forgetting amount conversion**: Always multiply user input by `1_000_000_000_000`
2. **Using `.toNumber()` on balances**: Can overflow - use `.toBigInt()` instead
3. **Not waiting for tx finalization**: Add callback to `signAndSend` for status
4. **Missing Polkadot.js deps**: Not in package.json, must install manually
5. **Deploying debug build**: Always use `--release` flag (3x smaller WASM)

### Type Mappings (Rust ↔ JavaScript)
| Rust Type | JS Unwrap Method | Example |
|-----------|------------------|---------|
| `u32` | `.toNumber()` | `campaign.id.toNumber()` |
| `String` | `.toString()` | `campaign.title.toString()` |
| `Balance` | `.toBigInt()` | `campaign.raised.toBigInt()` |
| `AccountId` | `.toString()` | `campaign.owner.toString()` |
| `Timestamp` | `.toNumber()` | `campaign.deadline.toNumber()` |
| `Vec<T>` | `.map(...)` | `donations.map(d => d.amount.toBigInt())` |

### Contract Address Pattern (Not Implemented)
```javascript
// .env.local
VITE_CONTRACT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

// CampaignContext.js
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const contract = new ContractPromise(api, metadata, CONTRACT_ADDRESS);
```
