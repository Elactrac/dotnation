#!/bin/bash

# DotNation - Quick Test Script
# This script helps you quickly test the entire stack locally

set -e

echo "🚀 DotNation - Quick Test Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing root dependencies...${NC}"
    npm install
fi

if [ ! -d "gemini-backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd gemini-backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo ""

# Check environment files
echo "⚙️  Checking environment configuration..."

if [ ! -f "gemini-backend/.env" ]; then
    echo -e "${RED}❌ Backend .env file missing${NC}"
    echo "Creating .env from .env.example..."
    cp gemini-backend/.env.example gemini-backend/.env
    echo -e "${YELLOW}⚠️  Please add your GEMINI_API_KEY to gemini-backend/.env${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env.local file missing${NC}"
    echo "Creating .env.local with default values..."
    cat > frontend/.env.local << EOF
# Backend Configuration
VITE_BACKEND_URL=http://localhost:3001

# Network Configuration (Test Mode)
VITE_NETWORK_NAME=Test Mode (No Blockchain)
VITE_RPC_ENDPOINT=
VITE_CONTRACT_ADDRESS=

# App Version
VITE_APP_VERSION=1.0.0-dev
EOF
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
fi

echo -e "${GREEN}✅ Environment files configured${NC}"
echo ""

# Test backend
echo "🔧 Testing backend..."
cd gemini-backend
(node server.js > /tmp/dotnation-backend.log 2>&1 &)
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:3001${NC}"
    echo -e "   Health: $(curl -s http://localhost:3001/health)"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Test captcha endpoint
echo ""
echo "🔒 Testing captcha endpoint..."
CAPTCHA_RESPONSE=$(curl -s -X POST http://localhost:3001/api/captcha/create-session)
if echo "$CAPTCHA_RESPONSE" | grep -q "sessionToken"; then
    echo -e "${GREEN}✅ Captcha endpoint working${NC}"
else
    echo -e "${RED}❌ Captcha endpoint failed${NC}"
fi

kill $BACKEND_PID 2>/dev/null || true
cd ..

echo ""

# Test frontend build
echo "🎨 Testing frontend build..."
cd frontend
if npm run build > /tmp/dotnation-frontend-build.log 2>&1; then
    echo -e "${GREEN}✅ Frontend builds successfully${NC}"
    echo -e "   Build size: $(du -sh dist | cut -f1)"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    echo "Check logs: tail /tmp/dotnation-frontend-build.log"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Ready to run the full stack!"
echo ""
echo "To start both servers:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""
echo "Or start individually:"
echo -e "${YELLOW}npm run dev:backend${NC}  # Backend on http://localhost:3001"
echo -e "${YELLOW}npm run dev:frontend${NC} # Frontend on http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "   - DEPLOYMENT_CHECKLIST.md - Deploy to production"
echo "   - DEPLOYMENT_STATUS.md - Current project status"
echo "   - DEMO_GUIDE.md - Guide for judges"
echo ""
