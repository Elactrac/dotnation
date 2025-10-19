# Contributing to DotNation

Thank you for your interest in contributing to DotNation! This guide will help you get started with contributing to our decentralized crowdfunding platform built on Polkadot.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Deployment](#deployment)
- [Getting Help](#getting-help)

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and collaborative environment. We expect all contributors to:

- Be respectful and considerate in communication
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members
- Give and gracefully accept constructive feedback

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

**For Smart Contract Development:**
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [cargo-contract](https://github.com/paritytech/cargo-contract) v5.0.3+
- WASM target: `rustup target add wasm32-unknown-unknown`

**For Frontend Development:**
- [Node.js](https://nodejs.org/) v18+
- npm v9+

**For Local Testing:**
- [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node)
- [Polkadot.js Extension](https://polkadot.js.org/extension/)

### Installation Commands

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install WASM target
rustup target add wasm32-unknown-unknown

# Install cargo-contract
cargo install cargo-contract --version 5.0.3

# Install substrate-contracts-node
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node
```

## 💻 Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/dotnation.git
cd dotnation
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# This also installs Husky pre-commit hooks
```

### 3. Configure Environment

```bash
# Copy environment template
cd frontend
cp .env.example .env.local

# Edit .env.local with your settings
# VITE_NETWORK_NAME=Local Node
# VITE_RPC_ENDPOINT=ws://127.0.0.1:9944
# VITE_CONTRACT_ADDRESS=<deployed contract address>
```

### 4. Start Local Blockchain

```bash
# In a separate terminal, start local node
substrate-contracts-node --dev
```

### 5. Build and Deploy Contract

```bash
cd donation_platform

# Build the contract
cargo contract build --release

# Deploy via Polkadot.js Apps UI:
# 1. Go to https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944
# 2. Developer → Contracts → Upload & deploy code
# 3. Upload target/ink/donation_platform.contract
# 4. Instantiate with new() constructor
# 5. Copy the contract address to .env.local
```

### 6. Start Frontend

```bash
cd frontend
npm run dev

# Open http://localhost:5173
```

## 📁 Project Structure

```
dotnation/
├── donation_platform/        # Smart contract (Rust + ink!)
│   ├── lib.rs               # Main contract code (~420 lines)
│   ├── Cargo.toml           # Contract dependencies
│   └── target/ink/          # Build artifacts
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── main.jsx        # Entry point
│   │   ├── App.jsx         # Router setup
│   │   ├── contexts/       # React Context (Wallet, Api, Campaign)
│   │   ├── components/     # Reusable UI components
│   │   └── pages/          # Route-level components
│   ├── package.json
│   └── vite.config.js
│
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   └── copilot-instructions.md  # AI agent guide
│
├── .husky/                 # Git hooks
└── CI_CD_SETUP.md          # Deployment guide
```

## 🔄 Development Workflow

### Branch Strategy

- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Update your local repository
git checkout master
git pull upstream master

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write your code** following our [coding standards](#coding-standards)
2. **Test locally** to ensure everything works
3. **Commit frequently** with clear messages
4. **Push to your fork** regularly

```bash
# Stage changes
git add .

# Commit (pre-commit hooks will run automatically)
git commit -m "feat: add campaign filtering by category"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat(contract): add campaign update functionality
fix(frontend): resolve wallet connection timeout issue
docs(readme): update installation instructions
test(contract): add withdrawal edge case tests
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd donation_platform

# Run unit tests
cargo test

# Run e2e tests
cargo test --features e2e-tests

# Run specific test
cargo test test_donate_works
```

### Frontend Tests

```bash
cd frontend

# Run linter
npm run lint

# Run tests (when configured)
npm test

# Build production bundle (validates build)
npm run build
```

### Manual Testing Checklist

Before submitting a PR, test these core flows:

**Smart Contract:**
- [ ] Create a campaign
- [ ] Donate to a campaign
- [ ] Reach campaign goal
- [ ] Withdraw funds (successful campaign)
- [ ] Withdraw funds (failed campaign after deadline)
- [ ] Test all error conditions

**Frontend:**
- [ ] Connect Polkadot.js wallet
- [ ] View campaign list
- [ ] Create new campaign
- [ ] Make donation
- [ ] Switch between accounts
- [ ] Test with no wallet extension
- [ ] Test with no local node

## 📏 Coding Standards

### Smart Contract (Rust)

- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `snake_case` for functions and variables
- Use `PascalCase` for types and structs
- Document public functions with `///` comments
- Run `cargo fmt` before committing
- Run `cargo clippy` and fix warnings
- Keep contract size under 50KB (check with `ls -lh target/ink/*.wasm`)

**Example:**
```rust
/// Creates a new fundraising campaign
///
/// # Parameters
/// * `title` - Campaign title
/// * `goal` - Fundraising goal in Balance
/// * `deadline` - Unix timestamp deadline
///
/// # Returns
/// Campaign ID on success, Error on failure
#[ink(message)]
pub fn create_campaign(
    &mut self,
    title: String,
    goal: Balance,
    deadline: Timestamp,
) -> Result<u32, Error> {
    // Implementation
}
```

### Frontend (JavaScript/React)

- Use `PascalCase` for React components
- Use `camelCase` for functions and variables
- Use functional components with hooks
- Follow [React best practices](https://react.dev/learn)
- Run ESLint: `npm run lint`
- Use Chakra UI components for consistency

**Example:**
```javascript
import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';

export const CreateCampaignButton = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      // Implementation
      toast({
        title: 'Campaign created',
        status: 'success',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCreate} isLoading={isLoading}>
      Create Campaign
    </Button>
  );
};
```

### Amount Handling

**Critical:** Always use proper amount conversions:

```javascript
// User input (DOT) → Contract (plancks)
const amountInPlancks = BigInt(userAmount * 1_000_000_000_000);

// Contract (plancks) → Display (DOT)
const displayAmount = Number(plancks) / 1_000_000_000_000;

// ALWAYS use BigInt for large amounts
const raised = campaign.raised.toBigInt();
```

## 🔀 Submitting Changes

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Open a PR** on GitHub to the `develop` branch
3. **Fill out the PR template** completely
4. **Link related issues** (e.g., "Fixes #123")
5. **Wait for CI** to pass (automated checks)
6. **Request review** from maintainers

### PR Title Format

Follow the same convention as commit messages:

```
feat(contract): add campaign category filtering
fix(frontend): resolve race condition in wallet connection
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manually tested locally
- [ ] Tested on testnet

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added for new functionality
- [ ] All tests pass locally

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Automated checks run** (CI/CD workflows)
2. **Maintainers review** your code
3. **Address feedback** by pushing new commits
4. **Approval** from at least one maintainer
5. **Merge** to develop branch

## 🚀 Deployment

### Testnet Deployment (Rococo)

For testing your changes on a public testnet:

```bash
# 1. Build optimized contract
cd donation_platform
cargo contract build --release

# 2. Get testnet tokens
# Request ROC tokens in Polkadot Discord

# 3. Deploy via Polkadot.js Apps
# Connect to wss://rococo-contracts-rpc.polkadot.io
# Upload and instantiate contract

# 4. Update frontend environment
# Set VITE_CONTRACT_ADDRESS in .env
```

### Production Deployment

Production deployments are handled by maintainers through GitHub Actions:

1. Code merged to `master` branch
2. Manual workflow trigger: Actions → Deploy to Network
3. Select network (Astar mainnet)
4. Select environment (production)
5. Manual approval required
6. Contract deployed and verified
7. Frontend deployed to hosting platform

## 🆘 Getting Help

### Resources

- **Documentation**: Read `CI_CD_SETUP.md` and `.github/copilot-instructions.md`
- **Issues**: Check [existing issues](https://github.com/Elactrac/dotnation/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/Elactrac/dotnation/discussions)

### Common Issues

**Q: Contract size exceeds 50KB**
```bash
# Solution: Build in release mode and check size
cargo contract build --release
ls -lh target/ink/donation_platform.wasm
```

**Q: Wallet connection fails**
```bash
# Solution: Ensure local node is running
substrate-contracts-node --dev

# Check node is accessible
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock"}' \
  http://localhost:9944
```

**Q: Pre-commit hooks not running**
```bash
# Solution: Reinstall Husky
cd frontend
npm install
npx husky install
chmod +x ../.husky/pre-commit
```

**Q: Contract deployment fails**
```bash
# Solution: Check account has sufficient balance
# Ensure deadline is in the future (Unix timestamp)
# Verify contract was built in release mode
```

### Asking Questions

When asking for help:

1. **Search existing issues** first
2. **Provide context**: What were you trying to do?
3. **Include error messages**: Copy full error output
4. **Share your environment**: OS, Node version, Rust version
5. **Show what you tried**: List troubleshooting steps

## 🏆 Recognition

Contributors will be recognized in:

- `CONTRIBUTORS.md` file
- Release notes for significant contributions
- Project documentation

Thank you for contributing to DotNation! Together, we're building a transparent and decentralized future for crowdfunding. 🚀

---

**Questions?** Open an issue or discussion on GitHub!
