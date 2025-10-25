# DotNation

[![Contract CI](https://github.com/Elactrac/dotnation/workflows/Smart%20Contract%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/contract-ci.yml)
[![Frontend CI](https://github.com/Elactrac/dotnation/workflows/Frontend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/Elactrac/dotnation/workflows/Gemini%20Backend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/backend-ci.yml)
[![Security Audit](https://github.com/Elactrac/dotnation/workflows/Security%20Audit/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/security.yml)

A decentralized crowdfunding platform built on Polkadot, enabling transparent and secure fundraising through smart contracts.

## Features

- **Trustless Fundraising**: Campaign rules enforced by robust ink! smart contracts.
- **Direct Fund Flow**: Funds go directly from donors to beneficiaries via escrow.
- **On-Chain Transparency**: All transactions are verifiable on the blockchain with comprehensive events.
- **Goal-Based Campaigns**: Automatic success/failure based on funding goals with overflow protection.
- **Time-Bound Campaigns**: Deadlines with enforced state transitions and validation.
- **Multi-Network Support**: Compatible with Polkadot parachains like Astar (Shibuya testnet).
- **Security First**: Reentrancy protection, input validation, and access controls.
- **Modern UI**: Built with React 18, Tailwind CSS, and Vite with seamless navigation.
- **Scalable Architecture**: Pagination, caching, and error handling for performance.

---

## Project Structure

The repository is organized into three main parts: the smart contract, the frontend, and the AI-powered backend.

- **`donation_platform/`**: The ink! smart contract that manages all on-chain campaign logic.
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

### 2. Frontend (`frontend/`)

The frontend is a modern Single Page Application (SPA) built with React and Vite. It interacts with the smart contract and provides a user-friendly interface for:
- **Wallet Integration**: Connecting to the Polkadot.js browser extension to enable users to interact with the blockchain.
- **Campaign Interaction**: Browsing, creating, and donating to campaigns.
- **Real-Time Updates**: Using the smart contract's events to display up-to-date information about campaign progress and status.
- **State Management**: Using React's Context API to manage the application's state, including wallet connection, API status, and campaign data.

### 3. Gemini Backend (`gemini-backend/`)

The Gemini backend is a Node.js server that provides AI-powered features to enhance the user experience. It offers a RESTful API for:
- **Content Generation**: Generating compelling campaign descriptions and summaries using the Google Gemini AI.
- **Campaign Assistance**: Providing users with suggestions and optimizations for their campaign content.
- **Scalability**: Offloading AI-related tasks from the frontend to a dedicated server, which can be scaled independently.

---

## Quick Start

### Prerequisites

- **Node.js**: v18+
- **Polkadot.js Extension**: A browser extension for managing Polkadot accounts.
- **Rust**: The Rust toolchain with the `wasm32-unknown-unknown` target for smart contract development.
- **cargo-contract**: v5.0.3+ for building and deploying ink! smart contracts.

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

3. **Set up the Rust environment** (for smart contract development):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   cargo install cargo-contract --version 5.0.3
   ```

### Development

#### 1. Quick Start with Mock Data (Recommended)

For a quick start, you can run the frontend with mock data, which allows you to test the UI/UX without needing a running blockchain.

```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

#### 2. Full Blockchain Development

For end-to-end testing, you will need to run a local blockchain node, deploy the smart contract, and configure the frontend to connect to it.

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
  Create a `.env.local` file in the `frontend` directory and add the following, replacing `your_deployed_address` with the address of your deployed contract:
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

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License.
