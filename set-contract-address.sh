#!/bin/bash
# Quick script to update contract address in .env.local

if [ -z "$1" ]; then
    echo "Usage: ./set-contract-address.sh <contract-address>"
    echo ""
    echo "Example:"
    echo "  ./set-contract-address.sh 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    exit 1
fi

CONTRACT_ADDRESS="$1"

# Validate address format (basic check)
if [[ ! "$CONTRACT_ADDRESS" =~ ^[1-9A-HJ-NP-Za-km-z]{47,48}$ ]]; then
    echo "❌ Invalid address format. Must be 47-48 character SS58 address."
    exit 1
fi

# Backup .env.local
cp frontend/.env.local frontend/.env.local.backup

# Update contract address
if grep -q "^VITE_CONTRACT_ADDRESS=" frontend/.env.local; then
    # Replace existing line
    sed -i.tmp "s|^VITE_CONTRACT_ADDRESS=.*|VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" frontend/.env.local
    rm frontend/.env.local.tmp 2>/dev/null || true
else
    # Add new line after RPC endpoint
    sed -i.tmp "/^VITE_RPC_ENDPOINT=/a\\
VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
" frontend/.env.local
    rm frontend/.env.local.tmp 2>/dev/null || true
fi

echo "✅ Contract address updated in frontend/.env.local"
echo "📦 New address: $CONTRACT_ADDRESS"
echo "💾 Backup saved: frontend/.env.local.backup"
echo ""
echo "⚠️  Restart your frontend dev server for changes to take effect:"
echo "   cd frontend && npm run dev"
