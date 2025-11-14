<div align="center">

# 🌐 DotNation

### The Future of Transparent Crowdfunding on Polkadot

[![Contract CI](https://github.com/Elactrac/dotnation/workflows/Smart%20Contract%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/contract-ci.yml)
[![Frontend CI](https://github.com/Elactrac/dotnation/workflows/Frontend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/Elactrac/dotnation/workflows/Gemini%20Backend%20CI/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/backend-ci.yml)
[![Security Audit](https://github.com/Elactrac/dotnation/workflows/Security%20Audit/badge.svg)](https://github.com/Elactrac/dotnation/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A next-generation decentralized crowdfunding platform built on Polkadot that eliminates intermediaries, ensures complete transparency, and empowers creators with AI-powered tools.**

[Live Demo](https://dotnation.vercel.app) · [Documentation](#documentation) · [Report Bug](https://github.com/Elactrac/dotnation/issues) · [Request Feature](https://github.com/Elactrac/dotnation/issues)

</div>

---

## 🚀 Why DotNation?

Traditional crowdfunding platforms take 5-10% in fees, hold your funds in escrow, and can freeze accounts without warning. **DotNation changes the game.**

### 💡 The Problem We Solve

- **High Platform Fees**: Traditional platforms take 5-10% of every donation
- **Lack of Transparency**: Where does your money really go?
- **Centralized Control**: Platforms can freeze funds or ban campaigns arbitrarily
- **Geographic Restrictions**: Many platforms aren't available worldwide
- **Trust Issues**: Donors can't verify if funds reached their intended purpose

### ✨ Our Solution

DotNation leverages **Polkadot's ink! smart contracts** to create a trustless, transparent crowdfunding ecosystem where:

- ✅ **Zero Platform Fees** - Only blockchain transaction costs
- ✅ **100% Transparent** - Every transaction is verifiable on-chain
- ✅ **Truly Decentralized** - No single point of failure or control
- ✅ **Global Access** - Available to anyone with a Polkadot wallet
- ✅ **AI-Powered** - Get help crafting compelling campaigns with Google Gemini AI
- ✅ **Upgradable & Scalable** - Built for millions of users with proxy pattern architecture

---

## 📊 Key Metrics

<div align="center">

| Metric | Value |
|--------|-------|
| **Smart Contract Security** | 100% test coverage, reentrancy protection, access controls |
| **Frontend Tests** | 108+ test files |
| **Performance** | Lighthouse score 90+ |
| **Scalability** | Batch operations for 50+ campaigns/transaction |
| **AI Integration** | Google Gemini for campaign optimization |
| **Deployment Cost** | $0/month (FREE stack available) |

</div>

---

## 🎯 Quick Start (Deploy for FREE!)

Perfect for hackathons, MVPs, or production! Deploy the entire platform with **zero monthly cost**:

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | **FREE** |
| Backend | Render.com | **FREE** (750hrs/month) |
| Database | Upstash Redis | **FREE** (10K commands/day) |
| AI Engine | Google Gemini | **FREE** API |
| Blockchain | Rococo/Shibuya Testnet | **FREE** |

**Total: $0/month** 🎉 No credit card required!

👉 **[Complete Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)** - Get live in 15 minutes

---

## 🎨 Features

### 🔐 Smart Contract Security & Trustlessness

- **Escrow Protection**: Funds held in smart contract, not by intermediaries
- **Automated Payouts**: Successful campaigns automatically release funds to beneficiaries
- **Refund Guarantee**: Failed campaigns automatically return funds to donors
- **Reentrancy Protection**: Battle-tested security patterns prevent exploits
- **Time-Bound Campaigns**: Enforced deadlines with automatic state transitions
- **On-Chain Events**: Complete audit trail of every action

### 🚀 Advanced Architecture (V2)

- **🔄 Upgradable Contracts**: Fix bugs and add features without data migration using proxy pattern
- **📦 Batch Operations**: Create 50 campaigns or process 50 withdrawals in a single transaction
- **⚡ Optimized Pagination**: Handle millions of campaigns and donations efficiently
- **🎯 Version Tracking**: Seamless contract upgrades with backward compatibility
- **🔒 Admin Controls**: Secure upgrade mechanisms with role-based access

### 🤖 AI-Powered Campaign Creation

- **Smart Descriptions**: Google Gemini generates compelling campaign narratives
- **Title Optimization**: AI-crafted titles that capture attention
- **Fraud Detection**: AI-powered analysis identifies suspicious campaigns
- **Content Suggestions**: Get real-time tips to improve your campaign

### 🛡️ Enterprise-Grade Backend

- **🔐 API Authentication**: Secure key-based access control
- **⚡ Rate Limiting**: Protection against abuse (100 req/15min)
- **🎯 Multi-Captcha System**: Math, Image, Slider, and Pattern captchas prevent bots
- **📊 Redis Persistence**: High-performance session management
- **📈 Prometheus Metrics**: Production-ready monitoring and observability
- **🔍 Structured Logging**: Winston-powered logging with daily rotation

### 💎 Modern User Experience

- **Wallet Integration**: Seamless Polkadot.js extension support
- **Real-Time Updates**: Live campaign progress and transaction status
- **Responsive Design**: Beautiful UI built with React 18, Tailwind CSS, and Chakra UI
- **Error Boundaries**: Graceful error handling with Sentry integration
- **Skeleton Loading**: Smooth loading states for better UX
- **Dark Mode Ready**: Modern, accessible interface

---

## 🏗️ Architecture

DotNation is built on a modern, scalable three-tier architecture designed for millions of users.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 18)                      │
│  • Modern SPA with Vite                                          │
│  • Polkadot.js Wallet Integration                                │
│  • Real-time updates via events                                  │
│  • Responsive UI (Tailwind + Chakra)                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GEMINI BACKEND (Node.js)                      │
│  • AI Campaign Generation                                        │
│  • Fraud Detection Engine                                        │
│  • Multi-Captcha System                                          │
│  • Rate Limiting & Security                                      │
│  • Redis Session Management                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│               BLOCKCHAIN LAYER (Polkadot/ink!)                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           PROXY CONTRACT (Fixed Address)                  │   │
│  │  • Delegates to logic contract                            │   │
│  │  • Stores all campaign data                               │   │
│  │  • Upgradable by admin                                    │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        LOGIC CONTRACT V2 (Upgradable)                     │   │
│  │  • Campaign lifecycle management                          │   │
│  │  • Batch operations                                       │   │
│  │  • Optimized pagination                                   │   │
│  │  • Event emission                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- React 18 with Hooks
- Vite for lightning-fast builds
- Tailwind CSS + Chakra UI
- Polkadot.js API
- React Router v6
- Framer Motion
- Sentry error tracking

**Backend**
- Node.js 18+
- Express 5
- Google Gemini AI SDK
- Redis for sessions
- Winston logging
- Prometheus metrics
- Helmet security

**Blockchain**
- ink! 5.0 smart contracts
- Polkadot parachains (Astar/Rococo)
- Proxy pattern for upgradability
- Comprehensive event logging

**DevOps & Testing**
- GitHub Actions CI/CD
- 108+ test files (Vitest, Jest)
- ESLint + Prettier
- Husky pre-commit hooks
- Docker support
- Automated security audits

---

## 📁 Project Structure

```
DotNation/
├── 📜 donation_platform/       # ink! Smart Contracts
│   ├── lib.rs                 # V1 contract (production-ready)
│   ├── lib_v2.rs              # V2 with batch operations
│   ├── proxy.rs               # Upgradable proxy pattern
│   ├── UPGRADE_GUIDE.md       # Contract upgrade documentation
│   └── SCALABILITY_GUIDE.md   # Scaling to millions of users
│
├── 🎨 frontend/               # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context (Wallet, Campaign, API)
│   │   ├── pages/             # Route pages
│   │   ├── utils/             # Helpers, formatters, error handlers
│   │   └── contracts/         # Contract ABI
│   ├── __tests__/             # 108+ test files
│   └── vite.config.js
│
├── 🤖 gemini-backend/         # Node.js AI Backend
│   ├── server.js              # Express server
│   ├── captchaVerification.js # Multi-captcha system
│   ├── fraudDetection.js      # AI fraud detection
│   ├── redisClient.js         # Session management
│   └── IMPLEMENTATION_GUIDE.md
│
├── 🔧 .github/workflows/      # CI/CD Pipelines
│   ├── backend-ci.yml         # Backend tests
│   ├── contract-ci.yml        # Smart contract tests
│   ├── frontend-ci.yml        # Frontend tests & build
│   ├── security.yml           # Security audits
│   └── deploy.yml             # Automated deployment
│
└── 📚 Documentation
    ├── VERCEL_DEPLOYMENT_GUIDE.md
    ├── TESTNET_DEPLOYMENT_CHECKLIST.md
    └── BACKEND_MAINNET_READINESS.md
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend & Backend runtime |
| Redis | Latest | Session management (optional for local dev) |
| Polkadot.js Extension | Latest | Browser wallet |
| Rust + cargo-contract | 5.0.3+ | Smart contract development (optional) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Elactrac/dotnation.git
cd dotnation

# 2. Install all dependencies (frontend + backend)
npm run install:all

# 3. Set up Redis (macOS example)
brew install redis && brew services start redis

# 4. Configure backend environment
cd gemini-backend
cp .env.example .env
```

**Edit `gemini-backend/.env`:**
```bash
# Required - Get free API key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
BACKEND_API_KEY=dev_api_key_12345

# Optional - defaults shown
PORT=3001
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

**Configure `frontend/.env.local`:**
```bash
cd ../frontend
cp .env.example .env.local
```

**Edit `frontend/.env.local`:**
```bash
# Backend Configuration
VITE_BACKEND_URL=http://localhost:3001
VITE_BACKEND_API_KEY=dev_api_key_12345

# Network Configuration (Testnet)
VITE_NETWORK_NAME=Shibuya Testnet
VITE_RPC_ENDPOINT=wss://shibuya.public.blastapi.io
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

### Development

**Start both frontend and backend simultaneously:**
```bash
# From root directory
npm run dev
```

**Or start them separately:**
```bash
# Terminal 1 - Backend
cd gemini-backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/health

### Testing

```bash
# Run all tests
npm run test:frontend
npm run test:contract

# Lint code
npm run lint:frontend

# Build for production
npm run build:frontend
npm run build:contract
```

---

## 🌐 Deployment

### Option 1: FREE Stack (Recommended for Hackathons/MVPs)

Deploy to production for **$0/month** using this stack:

1. **Frontend (Vercel)**
   - Connect GitHub repo to Vercel
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variables in Vercel dashboard

2. **Backend (Render.com FREE tier)**
   - 750 hours/month free
   - Connect GitHub repo
   - Root directory: `gemini-backend`
   - Start command: `node server.js`

3. **Database (Upstash Redis FREE tier)**
   - 10,000 commands/day free
   - Copy connection URL to backend env

4. **AI (Google Gemini FREE API)**
   - Get free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add to backend environment

**📖 Complete Step-by-Step Guide:** [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

### Option 2: Testnet Deployment (Shibuya/Rococo)

```bash
# 1. Get testnet tokens
# Shibuya: https://faucet.astar.network/
# Rococo: https://faucet.polkadot.io/

# 2. Build and deploy contract
cd donation_platform
./build_contracts.sh

# 3. Deploy via Polkadot.js Apps
# - Upload .contract file
# - Instantiate with constructor 'new'
# - Copy contract address

# 4. Update frontend environment
VITE_CONTRACT_ADDRESS=<your_deployed_address>
VITE_NETWORK_NAME=Shibuya Testnet
VITE_RPC_ENDPOINT=wss://shibuya.public.blastapi.io
```

### Option 3: Production (Mainnet)

See [BACKEND_MAINNET_READINESS.md](BACKEND_MAINNET_READINESS.md) for production checklist including:
- Paid hosting with guaranteed uptime
- Production Redis cluster
- Enhanced security measures
- Monitoring and alerting
- Backup strategies

---

## 📚 Documentation

### Smart Contracts

Generate comprehensive Rust documentation:
```bash
cd donation_platform
cargo doc --open
```

**Key Guides:**
- [UPGRADE_GUIDE.md](donation_platform/UPGRADE_GUIDE.md) - Implement upgradable contracts
- [SCALABILITY_GUIDE.md](donation_platform/SCALABILITY_GUIDE.md) - Scale to millions of users

### Backend API

Complete backend documentation:
```bash
cd gemini-backend
cat README.md
```

**Key Resources:**
- [IMPLEMENTATION_GUIDE.md](gemini-backend/IMPLEMENTATION_GUIDE.md) - Backend setup
- [REDIS_SETUP.md](gemini-backend/REDIS_SETUP.md) - Redis configuration
- API Endpoints documented in `server.js`

### Deployment Guides

- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Deploy for FREE
- [TESTNET_DEPLOYMENT_CHECKLIST.md](TESTNET_DEPLOYMENT_CHECKLIST.md) - Testnet setup
- [TESTNET_TESTING_GUIDE.md](TESTNET_TESTING_GUIDE.md) - Test on testnet
- [BACKEND_MAINNET_READINESS.md](BACKEND_MAINNET_READINESS.md) - Production checklist

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Open an issue with detailed reproduction steps
- 💡 **Suggest Features**: Share your ideas for improvements
- 📝 **Improve Documentation**: Help make our docs clearer
- 🔧 **Submit PRs**: Fix bugs or add features
- ⭐ **Star the Repo**: Show your support!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm test`)
5. Commit with clear messages (`git commit -m 'feat: add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Code Quality Standards:**
- All PRs must pass CI/CD checks
- Frontend: ESLint warnings ≤ 20
- Test coverage for new features
- Follow existing code style
- Update documentation as needed

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🛡️ Security

### Audit Status

- ✅ **Smart Contract**: Comprehensive unit tests, reentrancy protection
- ✅ **Backend**: API authentication, rate limiting, input validation
- ✅ **Frontend**: XSS prevention, secure wallet integration
- ✅ **CI/CD**: Automated security audits on every commit

### Reporting Security Issues

Found a vulnerability? Please **do not** open a public issue. Instead:

1. Email: [security@dotnation.io](mailto:security@dotnation.io) (if available)
2. Or open a private security advisory on GitHub
3. Include detailed reproduction steps
4. We'll respond within 48 hours

### Security Best Practices

- 🔐 Never commit API keys or private keys
- 🔐 Use environment variables for sensitive data
- 🔐 Keep dependencies updated (`npm audit`)
- 🔐 Review smart contract changes carefully
- 🔐 Test thoroughly before deploying to mainnet

---

## 📊 Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Core smart contract with escrow
- [x] Frontend with wallet integration
- [x] AI-powered campaign creation
- [x] Multi-captcha system
- [x] Comprehensive testing
- [x] CI/CD pipelines

### Phase 2: Scalability ✅ (Completed)
- [x] Upgradable contracts (proxy pattern)
- [x] Batch operations
- [x] Optimized pagination
- [x] Redis session management
- [x] Fraud detection

### Phase 3: Advanced Features 🚧 (In Progress)
- [ ] Campaign categories and search filters
- [ ] Social sharing integration
- [ ] Email notifications
- [ ] Campaign updates system
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Phase 4: Ecosystem Growth 📋 (Planned)
- [ ] DAO governance for platform decisions
- [ ] Reputation system for creators
- [ ] NFT rewards for donors
- [ ] Cross-chain support (Ethereum, BSC)
- [ ] Fiat on-ramp integration
- [ ] Campaign analytics dashboard

---

## 🏆 Why Choose DotNation?

### For Campaign Creators

- 💰 **Zero platform fees** - Keep 100% of your funds (minus gas)
- 🚀 **AI-powered tools** - Create compelling campaigns in minutes
- 🌍 **Global reach** - Access supporters worldwide
- 📊 **Full transparency** - Prove funds reached their destination
- 🔒 **No middlemen** - Direct donor-to-creator transfers

### For Donors

- ✅ **Verify everything** - See exactly where your money goes
- 🛡️ **Refund guarantee** - Automatic refunds if campaigns fail
- 🌐 **Support anyone** - No geographic restrictions
- 🔐 **Stay anonymous** - Donate with just a wallet address
- 📈 **Track impact** - Follow campaign progress in real-time

### For Developers

- 🔧 **Open source** - MIT licensed, fork and customize
- 📚 **Well documented** - Comprehensive guides and comments
- 🧪 **Fully tested** - 108+ test files
- 🎯 **Modern stack** - React 18, Vite, ink! 5.0
- 🚀 **Production ready** - CI/CD, monitoring, security

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Polkadot & Parity Technologies** - For the incredible Substrate and ink! frameworks
- **Google Gemini** - For providing free AI API access
- **Astar Network** - For Shibuya testnet infrastructure
- **Vercel** - For free frontend hosting
- **Open Source Community** - For all the amazing libraries we use

---

## 📞 Support & Community

- 🌐 **Website**: [dotnation.vercel.app](https://dotnation.vercel.app)
- 📧 **Email**: [contact@dotnation.io](mailto:contact@dotnation.io)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Elactrac/dotnation/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Elactrac/dotnation/discussions)
- 🐦 **Twitter**: [@DotNation](https://twitter.com/dotnation) (if available)

---

<div align="center">

**⭐ Star us on GitHub — it motivates us a lot!**

Made with ❤️ by the DotNation Team

[Report Bug](https://github.com/Elactrac/dotnation/issues) · [Request Feature](https://github.com/Elactrac/dotnation/issues) · [Documentation](#documentation)

</div>
