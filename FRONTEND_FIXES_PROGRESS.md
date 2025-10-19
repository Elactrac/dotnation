# DotNation Project Outline & Progress Report

This document outlines the current architecture, features, and recent progress of the DotNation platform.

---

## 1. Project Overview

**DotNation** is a decentralized crowdfunding platform built on the Polkadot ecosystem. It enables creators to launch fundraising campaigns with rules enforced by an on-chain smart contract, ensuring transparency and security for both creators and donors.

## 2. Core Technologies

- **Frontend:** React 18 with Vite, styled using **Tailwind CSS**. Uses `polkadot.js` for wallet interaction.
- **Smart Contract (`donation_platform`):** Written in **Rust** using the **ink!** framework for Polkadot-compatible blockchains.
- **AI Service (`gemini-backend`):** A **Node.js/Express** microservice that securely connects to the **Gemini API** to provide AI-powered features.
- **CI/CD:** GitHub Actions for continuous integration, testing, and deployment.

## 3. Architecture

The project is a monorepo composed of three main parts:

1.  **`/frontend`**: The main user-facing application. It handles user interaction, wallet connections, and communication with both the smart contract and the AI backend.
2.  **`/donation_platform`**: The core on-chain logic. This ink! smart contract manages the lifecycle of campaigns, holds funds in escrow, and processes donations and withdrawals.
3.  **`/gemini-backend`**: A dedicated backend service for all AI-related tasks. It acts as a secure proxy between the frontend and the Google Gemini API, protecting the API key.

## 4. Key Features

### Core Functionality
- **Decentralized Campaigns:** Create, view, and manage funding campaigns.
- **On-Chain Donations:** Securely donate to campaigns using a Polkadot wallet.
- **Automated Lifecycle:** Campaigns automatically transition between `Active`, `Successful`, and `Failed` states based on contract rules.
- **Wallet Integration:** Connects with the Polkadot.js browser extension for account management.

### AI-Powered Enhancements (Newly Added)

1.  **AI Description Generation:**
    - **Location:** `CreateCampaignForm.jsx`
    - **Functionality:** A "✨ Generate with AI" button helps users automatically write a compelling, well-structured description for their campaign based on its title.

2.  **AI Campaign Summarization:**
    - **Location:** `CampaignCard.jsx`
    - **Functionality:** A "Summarize" button on each campaign card provides users with a quick, AI-generated paragraph summarizing the project, improving browsability.

## 5. Frontend Uniformity Initiative (In Progress)

A major effort has been completed to create a visually consistent and modern user interface across the application.

- **Design System:** A unified design system based on **Tailwind CSS** has been established, featuring a dark, glassmorphism theme with a consistent color palette, typography, and component style.
- **Refactored Components:**
    - ✅ **`CampaignCard.jsx`**: Fully refactored from custom CSS to the new Tailwind CSS theme.
    - ✅ **`CreateCampaignForm.jsx`**: Fully refactored from Chakra UI to the new Tailwind CSS theme.
- **Obsolete CSS Cleanup:** Old stylesheets related to the refactored components have been removed from `index.css`.

## 6. Potential Next Steps

- **Complete UI Unification:** Refactor remaining Chakra UI components (e.g., `CampaignList`, `CampaignDetailsPage`, `UserProfile`) to use Tailwind CSS.
- **Enhance AI Search:** Implement an AI-powered search feature that understands natural language queries.
- **Replace Toast Notifications:** Migrate the remaining `useToast` (from Chakra UI) to a Tailwind-native solution like `react-hot-toast` for full design consistency.
- **Live Data Integration:** Transition the campaign list from mock data to fetching directly from the blockchain via the `useCampaign` context.