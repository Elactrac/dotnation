# DotNation

[![Contract CI](https://github.com/Elactrac/dotnation/workflows/Smart%20Contract%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/contract-ci.yml)
[![Frontend CI](https://github.com/Elactrac/dotnation/workflows/Frontend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/Elactrac/dotnation/workflows/Gemini%20Backend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/backend-ci.yml)
[![Security Audit](https://github.com/Elactrac/dotnation/workflows/Security%20Audit/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/security.yml)

A decentralized crowdfunding platform built on Polkadot, enabling transparent and secure fundraising through smart contracts.

## 🎯 Quick Start (100% FREE for Hackathons!)

Deploy the entire platform with **zero cost**:
- **Frontend**: Vercel (FREE)
- **Backend**: Render.com (FREE tier)
- **Redis**: Upstash (FREE tier)
- **AI**: Google Gemini (FREE API)
- **Blockchain**: Rococo testnet (FREE)

**Total: $0/month** - No credit card required! Perfect for hackathons and demos.

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## Features

### Core Functionality
- **Trustless Fundraising**: Campaign rules enforced by robust ink! smart contracts.
- **Direct Fund Flow**: Funds go directly from donors to beneficiaries via escrow.
- **On-Chain Transparency**: All transactions are verifiable on the blockchain with comprehensive events.
- **Goal-Based Campaigns**: Automatic success/failure based on funding goals with overflow protection.
- **Time-Bound Campaigns**: Deadlines with enforced state transitions and validation.
- **Multi-Network Support**: Compatible with Polkadot parachains like Astar (Shibuya testnet).

### Upgradability & Scalability ✨ NEW
- **🔄 Upgradable Contracts**: Proxy pattern allows bug fixes and feature additions without data migration
- **📦 Batch Operations**: Create multiple campaigns or withdraw from multiple campaigns in a single transaction
- **⚡ Optimized Pagination**: Efficient data fetching for thousands of campaigns and millions of donations
- **🎯 Version Tracking**: Track contract versions and manage migrations seamlessly
- **🔒 Admin Controls**: Secure upgrade locks and admin transfer capabilities

### Security & Performance
- **Security First**: Reentrancy protection, input validation, and access controls.
- **Modern UI**: Built with React 18, Tailwind CSS, and Vite with seamless navigation.
- **Scalable Architecture**: Pagination, caching, error handling, and batch processing for performance.

---

## Project Structure

The repository is organized into three main parts: the smart contract, the frontend, and the AI-powered backend.

- **`donation_platform/`**: The ink! smart contract that manages all on-chain campaign logic.
  - `lib.rs`: Original contract (V1)
  - `lib_v2.rs`: Upgraded contract with batch operations and scalability improvements
  - `proxy.rs`: Proxy contract for upgradability
  - `UPGRADE_GUIDE.md`: Complete guide for implementing upgradable contracts
  - `SCALABILITY_GUIDE.md`: Strategies for scaling to millions of users
- **`frontend/`**: The React + Vite application that provides the user interface.
- **`gemini-backend/`**: A Node.js + Express server for Gemini AI integration.
- **`.github/workflows/`**: Automated CI/CD pipelines for testing and deployment.
- **`CONTRIBUTING.md`**: Guidelines for contributing to the project.
- **`CI_CD_SETUP.md`**: Detailed information about the CI/CD setup.

---

## Architecture

DotNation's architecture is composed of three key components that work together to provide a seamless and decentralized crowdfunding experience.

### 1. Smart Contract (`donation_platform/`)

The core of the platform is the ink! smart contract, which runs on a Polkadot-compatible blockchain. It is responsible for:
- **Campaign Management**: Creating, managing, and tracking the state of all fundraising campaigns.
- **Secure Fund Handling**: Holding donated funds in escrow and ensuring they are only released to the beneficiary if the campaign is successful.
- **State Machine**: Enforcing the campaign lifecycle from `Active` to `Successful` or `Failed`, and finally to `Withdrawn`.
- **Event Logging**: Emitting on-chain events for all significant actions, which allows the frontend to monitor and display real-time updates.

#### Upgradable Architecture (V2)

The V2 implementation introduces a **proxy pattern** for seamless upgrades:

```
User → Proxy Contract (Fixed Address) → Logic Contract V1/V2 (Upgradable)
              ↓
        Storage (Persistent)
```

**Key Benefits:**
- ✅ Fix bugs without redeploying or migrating data
- ✅ Add new features while maintaining backward compatibility
- ✅ Batch operations: Create 50 campaigns or withdraw from 50 campaigns in one transaction
- ✅ Improved pagination: Handle millions of donations efficiently
- ✅ Version tracking for managing upgrades

**Learn More:**
- [UPGRADE_GUIDE.md](donation_platform/UPGRADE_GUIDE.md) - Complete implementation guide
- [SCALABILITY_GUIDE.md](donation_platform/SCALABILITY_GUIDE.md) - Scaling to millions of users

### 2. Frontend (`frontend/`)

The frontend is a modern Single Page Application (SPA) built with React and Vite. It interacts with the smart contract and provides a user-friendly interface for:
- **Wallet Integration**: Connecting to the Polkadot.js browser extension to enable users to interact with the blockchain.
- **Campaign Interaction**: Browsing, creating, and donating to campaigns.
- **Real-Time Updates**: Using the smart contract's events to display up-to-date information about campaign progress and status.
- **State Management**: Using React's Context API to manage the application's state, including wallet connection, API status, and campaign data.

### 3. Gemini Backend (`gemini-backend/`)

The Gemini backend is a Node.js server that provides AI-powered features to enhance the user experience. It offers a RESTful API for:
- **🔐 Secure Authentication**: API key-based authentication on all endpoints
- **⚡ Rate Limiting**: Protection against abuse (100 req/15min general, 10 req/15min AI)
- **🤖 AI Content Generation**: Generating compelling campaign descriptions and titles using Google Gemini AI
- **🛡️ Fraud Detection**: AI-powered campaign analysis to detect potential fraud
- **🎯 Captcha System**: Multi-type captcha verification with Redis session management
- **📊 Redis Persistence**: Session storage with graceful in-memory fallback
- **🔍 Campaign Assistance**: Providing users with suggestions and optimizations for their campaign content
- **📈 Scalability**: Offloading AI-related tasks from the frontend to a dedicated server, which can be scaled independently

**See [gemini-backend/README.md](gemini-backend/README.md) for complete API documentation and configuration details.**

---

## Quick Start

### Prerequisites

- **Node.js**: v18+
- **Redis**: For backend session persistence
- **Polkadot.js Extension**: A browser extension for managing Polkadot accounts.
- **Rust**: The Rust toolchain with the `wasm32-unknown-unknown` target for smart contract development.
- **cargo-contract**: v5.0.3+ for building and deploying ink! smart contracts.
- **Google Gemini API Key**: FREE API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Elactrac/dotnation.git
   cd dotnation
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd ../gemini-backend
   npm install
   ```

4. **Set up Redis** (required for backend):
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   ```

5. **Configure backend environment**:
   ```bash
   cd gemini-backend
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```bash
   # Required - Backend API key for authentication
   BACKEND_API_KEY=dev_api_key_12345
   
   # Required - Google Gemini API key (get free at https://aistudio.google.com/app/apikey)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional - defaults shown
   PORT=3001
   NODE_ENV=development
   REDIS_URL=redis://localhost:6379
   ALLOWED_ORIGINS=http://localhost:5173
   ```

6. **Configure frontend environment**:
   ```bash
   cd ../frontend
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```bash
   # Backend API Configuration
   VITE_BACKEND_URL=http://localhost:3001
   VITE_BACKEND_API_KEY=dev_api_key_12345  # Must match backend
   
   # Network Configuration
   VITE_NETWORK_NAME=Shibuya Testnet
   VITE_RPC_ENDPOINT=wss://shibuya.public.blastapi.io
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

7. **Set up the Rust environment** (for smart contract development):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   cargo install cargo-contract --version 5.0.3
   ```

### Development

#### 1. Quick Start with Mock Data (Recommended)

For a quick start, you can run the frontend with mock data, which allows you to test the UI/UX without needing a running blockchain.

**Start the backend** (in one terminal):
```bash
cd gemini-backend
node server.js
```
Backend will be available at `http://localhost:3001`.

**Start the frontend** (in another terminal):
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

#### 2. Full Blockchain Development

For end-to-end testing, you will need to run a local blockchain node, deploy the smart contract, and configure the frontend to connect to it.

- **Start the backend**:
  ```bash
  cd gemini-backend
  node server.js
  ```

- **Start a local blockchain node**:
  ```bash
  # Download and run a substrate-contracts-node
  curl -L https://github.com/paritytech/substrate-contracts-node/releases/download/v0.27.0/substrate-contracts-node-linux -o substrate-contracts-node
  chmod +x substrate-contracts-node
  ./substrate-contracts-node --dev --tmp
  ```

- **Deploy the smart contract**:
  ```bash
  cd donation_platform
  cargo contract build --release
  cargo contract instantiate --constructor new --suri //Alice --url ws://localhost:9944 --skip-confirm
  ```

- **Configure the frontend**:
  Update `.env.local` in the `frontend` directory with your deployed contract address:
  ```
  VITE_CONTRACT_ADDRESS=your_deployed_address
  ```
  Then, start the frontend development server:
  ```bash
  cd frontend
  npm run dev
  ```

---

## Testing

### Backend

To run the backend server:
```bash
cd gemini-backend
node server.js
```

To test authentication:
```bash
# Should return 401 (no API key)
curl http://localhost:3001/api/generate-description

# Should return 200 with valid key
curl -H "X-API-Key: dev_api_key_12345" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3001/api/generate-description \
  -d '{"title":"Test Campaign"}'
```

### Smart Contract

To run the smart contract's unit tests:
```bash
cd donation_platform
cargo test
```

### Frontend

To run the frontend's linter and build verification:
```bash
cd frontend
npm run lint
npm run build
```

---

## Deployment

### Testnet (Shibuya)

1. **Get test tokens**: Visit the [Astar Faucet](https://faucet.astar.network/) to get SBY tokens for the Shibuya testnet.
2. **Build the contract**:
   ```bash
   cd donation_platform
   cargo contract build --release
   ```
3. **Deploy via Polkadot.js Apps**:
   - Open [Polkadot.js Apps](https://polkadot.js.org/apps/).
   - Switch to the Shibuya network.
   - Navigate to **Contracts > Upload & Instantiate**.
   - Upload the `donation_platform.contract` file and instantiate it with an endowment.
4. **Configure the frontend**:
   Create a `.env.production` file in the `frontend` directory with the deployed contract address.
   ```
   VITE_CONTRACT_ADDRESS=your_deployed_address
   ```
   Then, build the frontend for production:
   ```bash
   cd frontend
   npm run build
   ```

### Production (Vercel)

The frontend is automatically deployed to Vercel from the `main` branch.

---

## Documentation

This repository is thoroughly documented to assist developers.

### Smart Contracts
The smart contract code in the `donation_platform/` directory is documented using Rust's official documentation tool, `rustdoc`. To generate the documentation:

```bash
cd donation_platform
cargo doc --open
```
This command will build the documentation and open it in your default web browser.

### Frontend
The frontend code in the `frontend/` directory is documented using JSDoc. To generate the documentation, you can use a tool like `jsdoc-to-markdown`.

### Backend
The backend code in the `gemini-backend/` directory is also documented using JSDoc.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License.
