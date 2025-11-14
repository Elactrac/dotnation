#!/bin/bash

# Build script for DotNation contracts
# Usage: ./build_contracts.sh

set -e  # Exit on error

echo "🚀 Building DotNation Contracts"
echo "=============================="
echo ""

# Check if cargo-contract is installed
if ! command -v cargo-contract &> /dev/null; then
    echo "❌ cargo-contract not found"
    echo "Install it with: cargo install cargo-contract --version 5.0.3"
    exit 1
fi

# Check if wasm target is installed
if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo "❌ wasm32-unknown-unknown target not found"
    echo "Install it with: rustup target add wasm32-unknown-unknown"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Clean up any previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf temp_v2 temp_proxy
echo ""

# Build V2 Logic Contract
echo "📦 Building V2 Logic Contract..."
mkdir -p temp_v2
cp donation_platform/lib.rs temp_v2/lib.rs
cp donation_platform/Cargo.toml temp_v2/

cd temp_v2
# Update package name for V2
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/name = "donation_platform"/name = "donation_platform_v2"/' Cargo.toml
else
    # Linux
    sed -i 's/name = "donation_platform"/name = "donation_platform_v2"/' Cargo.toml
fi

echo "   Building in release mode..."
cargo contract build --release 2>&1 | grep -E "Compiled|Finished|Error" || true

if [ -f "target/ink/donation_platform_v2.wasm" ]; then
    V2_SIZE=$(wc -c < target/ink/donation_platform_v2.wasm)
    echo "   ✅ V2 Logic Contract built successfully"
    echo "   📊 Size: $V2_SIZE bytes"
else
    echo "   ❌ V2 Logic Contract build failed"
    exit 1
fi

cd ..
echo ""

# Build Proxy Contract
echo "📦 Building Proxy Contract..."
mkdir -p temp_proxy
cp donation_platform/proxy.rs temp_proxy/lib.rs
cp donation_platform/Cargo.toml temp_proxy/

cd temp_proxy
# Update package name for Proxy
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/name = "donation_platform"/name = "proxy"/' Cargo.toml
else
    # Linux
    sed -i 's/name = "donation_platform"/name = "proxy"/' Cargo.toml
fi

echo "   Building in release mode..."
cargo contract build --release 2>&1 | grep -E "Compiled|Finished|Error" || true

if [ -f "target/ink/proxy.wasm" ]; then
    PROXY_SIZE=$(wc -c < target/ink/proxy.wasm)
    echo "   ✅ Proxy Contract built successfully"
    echo "   📊 Size: $PROXY_SIZE bytes"
else
    echo "   ❌ Proxy Contract build failed"
    exit 1
fi

cd ..
echo ""

# Summary
echo "=================================="
echo "✅ Build Complete!"
echo "=================================="
echo ""
echo "📁 Artifacts Location:"
echo "   V2 Logic Contract:"
echo "     - temp_v2/target/ink/donation_platform_v2.contract"
echo "     - temp_v2/target/ink/donation_platform_v2.wasm"
echo "     - temp_v2/target/ink/donation_platform_v2.json"
echo ""
echo "   Proxy Contract:"
echo "     - temp_proxy/target/ink/proxy.contract"
echo "     - temp_proxy/target/ink/proxy.wasm"
echo "     - temp_proxy/target/ink/proxy.json"
echo ""
echo "📊 Contract Sizes:"
echo "   V2 Logic:  $V2_SIZE bytes (~$((V2_SIZE / 1024))KB)"
echo "   Proxy:     $PROXY_SIZE bytes (~$((PROXY_SIZE / 1024))KB)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Deploy V2 Logic Contract (use .contract file)"
echo "   2. Deploy Proxy Contract with V2 address"
echo "   3. Configure frontend with Proxy address"
echo ""
echo "📖 See FRESH_DEPLOYMENT_GUIDE.md for detailed instructions"
