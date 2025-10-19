# DotNation

A decentralized crowdfunding platform built on Polkadot, enabling transparent and secure fundraising through smart contracts.

## Features

- **Trustless Fundraising**: Campaign rules enforced by robust ink! smart contracts
- **Direct Fund Flow**: Funds go directly from donors to beneficiaries via escrow
- **On-Chain Transparency**: All transactions are verifiable on the blockchain with comprehensive events
- **Goal-Based Campaigns**: Automatic success/failure based on funding goals with overflow protection
- **Time-Bound Campaigns**: Deadlines with enforced state transitions and validation
- **Multi-Network Support**: Compatible with Polkadot parachains like Astar (Shibuya testnet)
- **Security First**: Reentrancy protection, input validation, and access controls
- **Modern UI**: Built with React 18, Tailwind CSS, and Vite with seamless navigation
- **Scalable Architecture**: Pagination, caching, and error handling for performance

## Quick Start

### Prerequisites

- Node.js v18+
- Polkadot.js browser extension (for wallet functionality)
- Rust with WASM target (for contract development)
- cargo-contract v5.0.3+ (for contract deployment)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/Elactrac/dotnation.git
   cd dotnation
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up Rust (for contract development):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   cargo install cargo-contract --version 5.0.3
   ```

### Development

1. **Quick Start with Mock Data** (Recommended):
   ```bash
   cd frontend
   npm run dev
   # Visit http://localhost:5173
   ```
   The app runs with mock data for immediate testing of UI/UX.

2. **Full Blockchain Development**:
   - **Start Local Node**:
     ```bash
     # Download substrate-contracts-node
     curl -L https://github.com/paritytech/substrate-contracts-node/releases/download/v0.27.0/substrate-contracts-node-linux -o substrate-contracts-node
     chmod +x substrate-contracts-node
     ./substrate-contracts-node --dev --tmp
     ```

   - **Deploy Contract**:
     ```bash
     cd donation_platform
     cargo contract build --release
     cargo contract instantiate --constructor new --suri //Alice --url ws://localhost:9944 --skip-confirm
     ```

   - **Configure Frontend**:
     ```bash
     cd frontend
     cp .env.example .env.local
     # Add VITE_CONTRACT_ADDRESS=your_deployed_address
     npm run dev
     ```

## Project Structure

- `donation_platform/`: ink! smart contract
- `frontend/`: React application
- `.github/workflows/`: CI/CD pipelines
- Documentation files (CONTRIBUTING.md, CI_CD_SETUP.md, etc.)

## Architecture

### Smart Contract (ink!)

Robust campaign management with security features:
- **State Machine**: Active → Successful/Failed → Withdrawn
- **Security**: Reentrancy guards, overflow checks, input validation
- **Events**: Comprehensive logging for monitoring (CampaignStateChanged, etc.)
- **Pagination**: Efficient data retrieval for large datasets

**Key Methods**:
- `create_campaign`: Create with validation (title, goal, deadline, beneficiary)
- `donate`: Secure donations with amount limits
- `withdraw_funds`: Owner-only withdrawal with state checks
- `get_campaigns_paginated`: Efficient listing
- `get_campaign_details`: Full campaign data with donations

### Frontend (React + Vite)

Modern SPA with advanced features:
- **Routing**: React Router v6 with active states and 404 handling
- **State Management**: Context API for wallet, campaigns, and API
- **UI/UX**: Tailwind CSS with responsive design and animations
- **Error Handling**: User-friendly messages with retry logic
- **Caching**: Async caching for performance
- **Mock Mode**: Development mode with sample data

**Key Components**:
- Wallet integration (Polkadot.js + EVM support)
- Campaign dashboard with real-time updates
- Progressive enhancement and accessibility

## Testing

### Contract
```bash
cd donation_platform
cargo test  # 5 unit tests covering validation, creation, donation, withdrawal
cargo contract build --release  # Build verification
```

### Frontend
```bash
cd frontend
npm run lint  # ESLint with React rules
npm run build  # Production build verification
npm run dev  # Development server with hot reload
```

### Current Test Status
- ✅ Contract: 5/5 tests passing
- ✅ Frontend: Build successful, lint warnings addressed
- ✅ Integration: Mock data mode functional

## Deployment

### Testnet (Shibuya - Astar)
1. **Get Test Tokens**: Visit [Astar Faucet](https://faucet.astar.network/) for SBY tokens
2. **Build Contract**:
   ```bash
   cd donation_platform
   cargo contract build --release
   ```
3. **Deploy via Polkadot.js Apps**:
   - Go to [Polkadot.js Apps](https://polkadot.js.org/apps/)
   - Switch to Shibuya network
   - Contracts > Upload & Instantiate
   - Upload `donation_platform.contract`
   - Instantiate with endowment: 1000 SBY
4. **Configure Frontend**:
   ```bash
   cd frontend
   echo "VITE_CONTRACT_ADDRESS=your_deployed_address" > .env.production
   npm run build
   ```

### Production (Vercel)
- **Frontend**: Auto-deployed via Vercel (GitHub integration)
- **Status**: ✅ Deployed with mock data
- **URL**: Check Vercel dashboard for live URL

### Local Development
- **Mock Mode**: `npm run dev` (immediate testing)
- **Full Mode**: Deploy local contract, update `.env.local`

## Tech Stack

- **Smart Contract**: Rust, ink! 5.0.2, cargo-contract 5.0.3+
- **Frontend**: React 18, Vite, Tailwind CSS, Polkadot.js API
- **Backend**: Node.js (optional API server in gemini-backend/)
- **Infrastructure**: Substrate, GitHub Actions, Vercel
- **Security**: Sentry (error monitoring), custom validation
- **Development**: ESLint, Prettier, Husky (pre-commit hooks)

## Current Status

- ✅ **Frontend**: Fully functional with routing, navigation, and mock data
- ✅ **Backend**: Robust contract with security, validation, and events
- ✅ **Testing**: All tests passing, build successful
- ✅ **Deployment**: Frontend deployed to Vercel
- 🔄 **Contract**: Ready for testnet deployment (Shibuya/Astar)
- 📋 **Next Steps**: Deploy contract, integrate real addresses, enable live transactions

## Recent Improvements

### Backend Enhancements
- **Security**: Added reentrancy guards, overflow protection, and access controls
- **Validation**: Comprehensive input validation for all contract methods
- **Events**: Enhanced event logging for better monitoring and analytics
- **Performance**: Pagination support and efficient storage usage
- **Error Handling**: Granular error types with user-friendly messages

### Frontend Enhancements
- **Navigation**: Complete routing system with active states and 404 handling
- **UI/UX**: Modern design with responsive layout and smooth animations
- **Integration**: Robust API error handling with retry logic and caching
- **Development**: Mock data mode for immediate testing and development

### Infrastructure
- **CI/CD**: Automated testing and deployment pipelines
- **Monitoring**: Error tracking and performance metrics
- **Documentation**: Comprehensive setup and deployment guides

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
