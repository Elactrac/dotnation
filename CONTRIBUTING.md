# Contributing to DotNation

First off, thank you for considering contributing to DotNation! It's people like you that make DotNation such a great platform for decentralized crowdfunding.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to creating a positive environment include:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior include:**

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/Elactrac/dotnation/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome, Firefox, Safari]
 - Node.js version: [e.g. 18.0.0]
 - Wallet: [e.g. Polkadot.js extension version]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/Elactrac/dotnation/issues). When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful** to most DotNation users
- **List some examples** of how this enhancement would be used
- **Specify which version** you're using

**Enhancement Template:**

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these issues:

- `good-first-issue` - Issues which should only require a few lines of code
- `help-wanted` - Issues which require more involvement
- `documentation` - Help improve our docs

### Pull Requests

We actively welcome your pull requests! Follow these steps:

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** and ensure code quality
3. **Add tests** if you've added code that should be tested
4. **Update documentation** if you've changed APIs or functionality
5. **Ensure the test suite passes** and linting succeeds
6. **Submit your pull request**

---

## Development Setup

### Prerequisites

- Node.js 18+
- Redis (for backend development)
- Rust & cargo-contract (for smart contract development)
- Polkadot.js browser extension

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dotnation.git
cd dotnation

# Add upstream remote
git remote add upstream https://github.com/Elactrac/dotnation.git

# Install dependencies for all packages
npm run install:all

# Set up Redis (macOS)
brew install redis
brew services start redis

# Configure environment files
cd gemini-backend
cp .env.example .env
# Edit .env with your configuration

cd ../frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Running Locally

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd gemini-backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if available)
cd gemini-backend
npm test

# Smart contract tests
cd donation_platform
cargo test

# Linting
cd frontend
npm run lint
```

### Building

```bash
# Build frontend
cd frontend
npm run build

# Build smart contract
cd donation_platform
cargo contract build --release
```

---

## Pull Request Process

### Before Submitting

1. **Create a feature branch**: `git checkout -b feature/amazing-feature`
2. **Follow code style guidelines** (see below)
3. **Write or update tests** for your changes
4. **Run the full test suite** and ensure everything passes
5. **Update documentation** as needed
6. **Commit with clear messages** (see commit message guidelines)

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**

```bash
feat(frontend): add campaign search functionality

Implement search bar with real-time filtering for campaigns.
Users can now search by title, description, or beneficiary.

Closes #123

---

fix(contract): prevent reentrancy in withdraw function

Add reentrancy guard to withdraw_funds to prevent
potential exploit discovered in security audit.

BREAKING CHANGE: withdraw_funds now requires additional gas

---

docs(readme): update deployment guide with Redis setup

Add detailed instructions for Redis configuration
on different operating systems.
```

### PR Title Format

```
<type>(<scope>): <description>
```

Examples:
- `feat(frontend): add dark mode toggle`
- `fix(backend): resolve captcha verification timeout`
- `docs(contract): add inline comments for state machine`

### PR Description Template

When you create a PR, please include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them.

- [ ] Test A
- [ ] Test B

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information that reviewers should know.
```

### Review Process

1. **Automated Checks**: CI/CD will run automatically
   - Frontend linting and tests
   - Backend linting and tests
   - Smart contract tests
   - Security audits

2. **Code Review**: At least one maintainer will review your PR
   - We may suggest changes, improvements, or alternatives
   - Please be responsive to feedback

3. **Approval**: Once approved, a maintainer will merge your PR

4. **Deployment**: Changes are automatically deployed based on branch:
   - `main` branch → Production (Vercel)
   - Feature branches → Preview deployments

---

## Style Guides

### JavaScript/React Style Guide

We use ESLint and Prettier for code consistency:

**Key Principles:**
- Use functional components with hooks (no class components)
- Use arrow functions for component definitions
- Destructure props when possible
- Use PropTypes for type checking
- Keep components small and focused (< 200 lines)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

**Example:**

```javascript
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Campaign card component displaying campaign information
 * @param {Object} props - Component props
 * @param {Object} props.campaign - Campaign data object
 * @param {Function} props.onDonate - Callback when donate button is clicked
 */
const CampaignCard = ({ campaign, onDonate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [campaign]);

  return (
    <div className="campaign-card">
      {/* Component JSX */}
    </div>
  );
};

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onDonate: PropTypes.func.isRequired,
};

export default CampaignCard;
```

**Running Linter:**
```bash
cd frontend
npm run lint        # Check for issues
npm run lint --fix  # Auto-fix issues
```

### Rust/Smart Contract Style Guide

Follow the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) and ink! best practices:

**Key Principles:**
- Use `rustfmt` for formatting
- Run `clippy` for linting
- Add comprehensive unit tests
- Document public APIs with `///` comments
- Use meaningful error types
- Follow ink! storage optimization patterns
- Add overflow checks for arithmetic
- Implement access control where needed

**Example:**

```rust
/// Withdraws funds from a successful campaign
///
/// # Arguments
/// * `campaign_id` - The ID of the campaign to withdraw from
///
/// # Errors
/// * `CampaignNotFound` - If the campaign doesn't exist
/// * `Unauthorized` - If caller is not the beneficiary
/// * `InvalidState` - If campaign is not in Successful state
///
/// # Events
/// Emits `FundsWithdrawn` on success
#[ink(message)]
pub fn withdraw_funds(&mut self, campaign_id: u32) -> Result<(), Error> {
    let caller = self.env().caller();
    let campaign = self.campaigns.get(&campaign_id)
        .ok_or(Error::CampaignNotFound)?;
    
    // Validation logic
    self.validate_withdrawal(&campaign, &caller)?;
    
    // Withdrawal logic
    self.process_withdrawal(campaign_id)?;
    
    Ok(())
}
```

**Running Checks:**
```bash
cd donation_platform
cargo fmt          # Format code
cargo clippy       # Run linter
cargo test         # Run tests
cargo contract build  # Build contract
```

### Git Workflow

```bash
# Start new feature
git checkout main
git pull upstream main
git checkout -b feature/my-feature

# Make changes and commit regularly
git add .
git commit -m "feat(scope): description"

# Keep your branch updated
git fetch upstream
git rebase upstream/main

# Push to your fork
git push origin feature/my-feature

# Create PR on GitHub
```

### Testing Guidelines

**Frontend Tests (Vitest + React Testing Library):**
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CampaignCard from './CampaignCard';

describe('CampaignCard', () => {
  it('renders campaign title', () => {
    const campaign = { id: '1', title: 'Test Campaign' };
    render(<CampaignCard campaign={campaign} />);
    
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
  });

  it('calls onDonate when button is clicked', () => {
    const onDonate = vi.fn();
    const campaign = { id: '1', title: 'Test Campaign' };
    render(<CampaignCard campaign={campaign} onDonate={onDonate} />);
    
    fireEvent.click(screen.getByText('Donate'));
    expect(onDonate).toHaveBeenCalledWith('1');
  });
});
```

**Smart Contract Tests:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[ink::test]
    fn test_create_campaign() {
        let mut contract = DonationPlatform::new();
        let result = contract.create_campaign(
            "Test Campaign".into(),
            1000,
            get_future_timestamp(),
        );
        
        assert!(result.is_ok());
        let campaign_id = result.unwrap();
        assert_eq!(campaign_id, 0);
    }
}
```

---

## Code Review Guidelines

### For Contributors

When your PR is under review:
- **Be responsive** to feedback and questions
- **Don't take feedback personally** - we're all here to improve
- **Ask questions** if something isn't clear
- **Make requested changes** in new commits (don't force-push during review)
- **Update your PR description** if scope changes

### For Reviewers

When reviewing PRs:
- **Be respectful and constructive** in feedback
- **Explain the "why"** behind suggestions
- **Acknowledge good work** and clever solutions
- **Use GitHub suggestions** for small changes
- **Test the changes locally** when possible
- **Focus on**:
  - Code correctness and logic
  - Security implications
  - Performance impacts
  - Test coverage
  - Documentation completeness
  - Code style consistency

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions

### Getting Help

- Check the [README.md](README.md) for setup instructions
- Browse [existing issues](https://github.com/Elactrac/dotnation/issues)
- Read the documentation in the `docs/` folders
- Ask questions in GitHub Discussions

### Recognition

Contributors are recognized in several ways:
- Listed in GitHub contributors
- Mentioned in release notes for significant contributions
- Potential invitation to become a maintainer for consistent contributors

---

## Project Governance

### Maintainers

Current maintainers have the authority to:
- Review and merge pull requests
- Triage and label issues
- Make architectural decisions
- Release new versions

### Decision Making

- **Minor changes**: Can be merged by any maintainer after approval
- **Major changes**: Require discussion and consensus among maintainers
- **Breaking changes**: Require thorough discussion, documentation, and migration guide

---

## Release Process

DotNation follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backwards compatible)
- **PATCH** version: Bug fixes (backwards compatible)

### Release Checklist

1. Update version numbers
2. Update CHANGELOG.md
3. Run full test suite
4. Create release branch
5. Tag release
6. Deploy to testnet
7. Deploy to mainnet (after verification)
8. Publish release notes

---

## License

By contributing to DotNation, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Questions?

If you have questions about contributing, feel free to:
- Open a [GitHub Discussion](https://github.com/Elactrac/dotnation/discussions)
- Create an issue with the `question` label
- Reach out to the maintainers

**Thank you for contributing to DotNation!** 🎉

Together, we're building the future of transparent, decentralized crowdfunding.
