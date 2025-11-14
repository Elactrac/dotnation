#!/bin/bash
# Complete test workflow for Mandala Chain campaign creation

set -e

echo "🎯 DotNation Mandala Chain - Campaign Creation Test"
echo "═══════════════════════════════════════════════════"
echo ""

# Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

if [ ! -f "frontend/.env.local" ]; then
    echo "❌ frontend/.env.local not found"
    exit 1
fi

CONTRACT_ADDRESS=$(grep "^VITE_CONTRACT_ADDRESS=" frontend/.env.local | cut -d'=' -f2)
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Contract address not set"
    echo "   Run: ./set-contract-address.sh <your-contract-address>"
    exit 1
fi

echo "✅ Contract address: $CONTRACT_ADDRESS"
echo ""

# Manual verification reminder
echo "📋 Step 2: Verify Mandala Chain support"
echo ""
echo "⚠️  MANUAL ACTION REQUIRED:"
echo "   1. Open: https://polkadot.js.org/apps/?rpc=wss://rpc2.paseo.mandalachain.io#/chainstate"
echo "   2. Go to: Developer → Chain State"
echo "   3. Check if 'contracts' pallet exists in dropdown"
echo ""
read -p "Does 'contracts' pallet exist? (y/n): " has_contracts

if [ "$has_contracts" != "y" ]; then
    echo ""
    echo "❌ Mandala Chain doesn't support ink! contracts"
    echo ""
    echo "💡 SOLUTION: Switch to Rococo Contracts"
    echo "   1. Edit frontend/.env.local:"
    echo "      VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io"
    echo "   2. Deploy contract to Rococo"
    echo "   3. Update contract address"
    echo ""
    exit 1
fi

echo "✅ Contracts pallet confirmed"
echo ""

# Test contract
echo "📋 Step 3: Test contract address"
echo ""
echo "⚠️  MANUAL ACTION REQUIRED:"
echo "   1. Go to: Developer → Contracts"
echo "   2. Click 'Add existing contract'"
echo "   3. Paste address: $CONTRACT_ADDRESS"
echo "   4. Upload ABI: donation_platform/target/ink/donation_platform.json"
echo "   5. Try query: getCampaignCount()"
echo ""
read -p "Does contract query work? (y/n): " contract_works

if [ "$contract_works" != "y" ]; then
    echo ""
    echo "❌ Contract doesn't exist or is not functional"
    echo ""
    echo "💡 SOLUTION: Deploy new contract"
    echo "   See: MANDALA_CHAIN_TESTING.md for deployment instructions"
    echo ""
    exit 1
fi

echo "✅ Contract verified"
echo ""

# Check dependencies
echo "📋 Step 4: Installing dependencies..."
echo ""

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "gemini-backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd gemini-backend && npm install && cd ..
fi

echo "✅ Dependencies installed"
echo ""

# Start services
echo "═══════════════════════════════════════════════════"
echo "🚀 Ready to test! Follow these steps:"
echo "═══════════════════════════════════════════════════"
echo ""
echo "1️⃣  Start Backend (Terminal 1):"
echo "   cd gemini-backend && npm start"
echo ""
echo "2️⃣  Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3️⃣  Open Browser:"
echo "   http://localhost:5173"
echo ""
echo "4️⃣  Connect Wallet:"
echo "   - Click 'Connect Wallet'"
echo "   - Authorize in Polkadot.js extension"
echo "   - Select account with PAS tokens"
echo ""
echo "5️⃣  Create Test Campaign:"
echo "   - Title: 'Test on Mandala' (10-100 chars)"
echo "   - Description: 'Testing campaign creation...' (50-1000 chars)"
echo "   - Goal: 10 DOT"
echo "   - Deadline: Tomorrow"
echo "   - Beneficiary: Your wallet address"
echo ""
echo "6️⃣  Watch Console Logs:"
echo "   - Browser: Press F12 → Console tab"
echo "   - Look for: '[CampaignContext] contract exists: true'"
echo "   - Should see: 'Contract exists, using blockchain mode'"
echo ""
echo "7️⃣  Sign Transaction:"
echo "   - Polkadot.js extension popup"
echo "   - Click 'Sign and Submit'"
echo ""
echo "8️⃣  Verify Success:"
echo "   - Toast: 'Campaign created successfully!'"
echo "   - Campaign appears in dashboard"
echo ""
echo "═══════════════════════════════════════════════════"
echo "📖 Documentation:"
echo "   - Deployment: MANDALA_CHAIN_TESTING.md"
echo "   - Testing: TESTNET_TESTING_GUIDE.md"
echo "   - Results: TEST_RESULTS.md"
echo "═══════════════════════════════════════════════════"
echo ""
