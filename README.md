# DotNation 🌐

**Decentralized crowdfunding built on Polkadot**

A transparent, secure, and fully decentralized fundraising platform powered by ink! smart contracts and React. Funds flow directly from donors to beneficiaries with immutable on-chain tracking.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Contract CI](https://github.com/Elactrac/dotnation/workflows/Smart%20Contract%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions)
[![Frontend CI](https://github.com/Elactrac/dotnation/workflows/Frontend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions)

## ✨ Features

- 🔐 **Trustless Fundraising** - Smart contract-enforced campaign rules
- 💎 **Direct Fund Flow** - Donor → Contract → Beneficiary (no intermediaries)
- 📊 **Transparent Tracking** - All transactions verified on-chain
- 🎯 **Goal-Based Campaigns** - Automated success/failure determination
- ⏰ **Time-Limited** - Deadline enforcement with automatic state updates
- 🔄 **State Machine Logic** - Active → Successful/Failed → Withdrawn
- 🌍 **Multi-Network** - Supports Polkadot parachains (Astar, Rococo)
- 🎨 **Modern UI** - React 18 + Chakra UI v3 with animated canvas

## 🚀 Quick Start

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) + WASM target
- [cargo-contract](https://github.com/paritytech/cargo-contract) v5.0.3+
- [Node.js](https://nodejs.org/) v18+
- [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node)
- [Polkadot.js Extension](https://polkadot.js.org/extension/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Elactrac/dotnation.git
cd dotnation

# Install frontend dependencies
cd frontend
npm install

# Install Rust toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install cargo-contract --version 5.0.3
```

### Local Development

**1. Start local blockchain:**
```bash
substrate-contracts-node --dev
```

**2. Build and deploy contract:**
```bash
cd donation_platform
cargo contract build --release

# Deploy via Polkadot.js Apps:
# https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944
# Developer → Contracts → Upload & deploy code
# Upload: target/ink/donation_platform.contract
```

**3. Configure frontend:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your contract address
```

**4. Start frontend:**
```bash
npm run dev
# Open http://localhost:5173
```

## 📁 Project Structure

```
dotnation/
├── donation_platform/          # Smart contract (ink! 5.0.2)
│   ├── lib.rs                 # Main contract (~420 lines)
│   ├── Cargo.toml
│   └── target/ink/            # Build artifacts
│
├── frontend/                   # React 18 + Vite 5
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Router setup
│   │   ├── contexts/          # State management
│   │   │   ├── WalletContext.js    # Polkadot.js wallet
│   │   │   ├── ApiContext.js       # Chain connection
│   │   │   └── CampaignContext.js  # Contract interactions
│   │   ├── components/        # Reusable UI
│   │   └── pages/             # Route components
│   └── package.json
│
├── .github/
│   ├── workflows/             # CI/CD pipelines
│   └── copilot-instructions.md # AI agent guide (877 lines)
│
├── .husky/                    # Git hooks
├── CONTRIBUTING.md            # Contribution guide
├── CI_CD_SETUP.md            # Deployment guide
└── README.md                 # This file
```

## 🏗️ Architecture

### Smart Contract (Rust + ink!)

Campaign state machine with strict invariants:

```
Campaign States:
  Active → Successful (goal reached)
        → Failed (deadline passed, goal not reached)
        → Withdrawn (funds released)
```

**Key Contract Methods:**
- `create_campaign()` - Create new fundraising campaign
- `donate()` - Contribute to a campaign (payable)
- `withdraw_funds()` - Release funds to beneficiary
- `get_campaign()` - Query campaign details
- `get_active_campaigns()` - List all active campaigns

### Frontend (React + Polkadot.js)

**State Management:**
- `WalletContext` - Polkadot.js extension integration
- `ApiContext` - Substrate node WebSocket connection
- `CampaignContext` - Contract method wrappers

**Key Features:**
- Progressive enhancement (works without node/wallet)
- 5-second connection timeout with graceful degradation
- Real-time transaction status updates
- Responsive Chakra UI components
- Interactive particle canvas animation

## 🧪 Testing

### Smart Contract Tests

```bash
cd donation_platform

# Unit tests
cargo test

# End-to-end tests
cargo test --features e2e-tests

# Specific test
cargo test test_donate_works
```

### Frontend Testing

```bash
cd frontend

# Lint
npm run lint

# Build validation
npm run build
```

## 🚀 Deployment

### Testnet (Rococo Contracts)

```bash
# 1. Build optimized contract
cd donation_platform
cargo contract build --release

# 2. Deploy via Polkadot.js Apps
# Connect to: wss://rococo-contracts-rpc.polkadot.io
# Upload contract.json and instantiate

# 3. Configure frontend
cd frontend
cp .env.production.example .env.production
# Set VITE_CONTRACT_ADDRESS

# 4. Build frontend
npm run build
```

### Production (Astar)

Production deployments are automated via GitHub Actions:

1. Go to **Actions** → **Deploy to Network**
2. Select network: `astar`
3. Select environment: `production`
4. Manual approval required
5. Follow deployment instructions in logs

See [CI_CD_SETUP.md](CI_CD_SETUP.md) for detailed instructions.

## 🛠️ Technology Stack

### Smart Contract
- **Language**: Rust 1.90+
- **Framework**: ink! 5.0.2
- **Build Tool**: cargo-contract 5.0.3
- **Standards**: PSP22 (future), ink! storage patterns

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.1
- **UI Library**: Chakra UI 3.27
- **Animation**: Framer Motion 12.23
- **Router**: React Router 6.22
- **Blockchain**: Polkadot.js API 16.4+

### Infrastructure
- **Blockchain**: Substrate (contracts pallet)
- **Networks**: Local node, Rococo, Astar, Shiden
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel/Netlify/IPFS

## 📊 CI/CD Pipeline

Automated workflows for quality assurance:

✅ **Contract CI** - Tests and builds smart contract
✅ **Frontend CI** - Lints and builds React app
✅ **Security Audit** - Weekly dependency scans
✅ **Deployment** - Multi-network deployment automation

All workflows configured in `.github/workflows/`

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Coding standards
- Testing guidelines
- PR process
- Deployment procedures

### Quick Contribution Guide

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/dotnation.git

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes and commit
git commit -m "feat: add your feature"

# 4. Push and create PR
git push origin feature/your-feature
```

## 📖 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CI_CD_SETUP.md](CI_CD_SETUP.md)** - Deployment and CI/CD setup
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Comprehensive AI guide (877 lines)
- **Frontend README** - `frontend/README.md` (outdated, references CRA)

## 🔐 Security

### Smart Contract Security

- ✅ No reentrancy vulnerabilities (ink! uses `env().transfer()`)
- ✅ Integer overflow protection (Rust checked arithmetic)
- ✅ Access control validation (owner checks)
- ✅ State machine prevents double withdrawals
- ⚠️ Admin role defined but unused (consider removal)

### Frontend Security

- ✅ Environment variables for sensitive data
- ✅ Polkadot.js extension for key management
- ✅ Input validation on both layers
- ⚠️ User content not sanitized (XSS risk)
- ⚠️ No SS58 address validation

**Report security issues**: Please email security@dotnation.xyz (or create private issue)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Polkadot](https://polkadot.network/) - Blockchain infrastructure
- [ink!](https://use.ink/) - Smart contract framework
- [Substrate](https://substrate.io/) - Blockchain development kit
- [Chakra UI](https://chakra-ui.com/) - React component library

## 📞 Contact & Community

- **GitHub Issues**: [Report bugs](https://github.com/Elactrac/dotnation/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/Elactrac/dotnation/discussions)
- **Twitter**: [@DotNation](https://twitter.com/dotnation) (placeholder)
- **Discord**: [Join community](https://discord.gg/dotnation) (placeholder)

## 🗺️ Roadmap

### Current Version (v0.1.0)
- ✅ Basic campaign creation and donations
- ✅ Smart contract state machine
- ✅ React frontend with Polkadot.js
- ✅ CI/CD pipeline

### Planned Features
- [ ] Campaign categories and search
- [ ] NFT rewards for donors
- [ ] Multi-milestone campaigns
- [ ] DAO governance for disputes
- [ ] Social sharing integration
- [ ] Campaign updates/comments
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 📈 Project Stats

- **Smart Contract**: ~420 lines of Rust
- **Frontend**: ~2,500+ lines of JavaScript/React
- **Documentation**: ~2,000+ lines
- **Test Coverage**: Contract (3 e2e tests), Frontend (minimal)
- **Build Size**: Contract <10KB WASM, Frontend ~200KB gzipped

---

**Built with ❤️ on Polkadot**

*Empowering transparent fundraising through blockchain technology*

---

## 🚀 Star Us!

If you find DotNation useful, please star ⭐ this repository to show your support!
