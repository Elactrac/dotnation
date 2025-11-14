#!/bin/bash
# Quick test script for Mandala Chain contract

set -e

echo "🔍 Testing Mandala Chain Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}❌ frontend/.env.local not found${NC}"
    exit 1
fi

# Extract contract address
CONTRACT_ADDRESS=$(grep "^VITE_CONTRACT_ADDRESS=" frontend/.env.local | cut -d'=' -f2)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ VITE_CONTRACT_ADDRESS is empty in .env.local${NC}"
    echo ""
    echo "📋 To fix this:"
    echo "1. Deploy your contract to Mandala Chain"
    echo "2. Copy the contract address"
    echo "3. Run: ./set-contract-address.sh <your-contract-address>"
    echo ""
    echo "See MANDALA_CHAIN_TESTING.md for detailed instructions"
    exit 1
fi

echo -e "${GREEN}✅ Contract address found: $CONTRACT_ADDRESS${NC}"

# Extract RPC endpoint
RPC_ENDPOINT=$(grep "^VITE_RPC_ENDPOINT=" frontend/.env.local | cut -d'=' -f2)
echo -e "${GREEN}✅ RPC endpoint: $RPC_ENDPOINT${NC}"

# Check if contract artifacts exist
if [ ! -f "donation_platform/target/ink/donation_platform.contract" ]; then
    echo -e "${YELLOW}⚠️  Contract artifact not found. Building...${NC}"
    cd donation_platform
    cargo contract build --release
    cd ..
fi

echo -e "${GREEN}✅ Contract artifacts exist${NC}"

# Check Node.js dependencies
echo ""
echo "📦 Checking dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed. Installing...${NC}"
    cd frontend
    npm install
    cd ..
fi

if [ ! -d "gemini-backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not installed. Installing...${NC}"
    cd gemini-backend
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "✨ Setup looks good! Ready to test."
echo ""
echo "📝 Next steps:"
echo "1. Start backend: cd gemini-backend && npm start"
echo "2. Start frontend (new terminal): cd frontend && npm run dev"
echo "3. Open browser: http://localhost:5173"
echo "4. Connect wallet and create a test campaign"
echo ""
echo "📖 Full guide: MANDALA_CHAIN_TESTING.md"
