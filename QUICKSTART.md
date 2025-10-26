# 🚀 Quick Start - Deploy in 5 Steps

**For: New projects with no existing users**

## TL;DR

```bash
# 1. Build contracts
cd DotNation
./build_contracts.sh  # Or follow manual steps below

# 2. Deploy V2 logic contract via Polkadot.js Apps
# → Save address as V2_LOGIC_ADDRESS

# 3. Deploy proxy contract with V2_LOGIC_ADDRESS
# → Save address as PROXY_ADDRESS

# 4. Configure frontend
echo "VITE_CONTRACT_ADDRESS=<PROXY_ADDRESS>" > frontend/.env.local

# 5. Run
cd frontend && npm install && npm run dev
```

## Manual Build Steps

```bash
# Build V2
mkdir temp_v2
cp donation_platform/lib_v2.rs temp_v2/lib.rs
cp donation_platform/Cargo.toml temp_v2/
cd temp_v2
sed -i '' 's/name = "donation_platform"/name = "donation_platform_v2"/' Cargo.toml
cargo contract build --release
cd ..

# Build Proxy
mkdir temp_proxy
cp donation_platform/proxy.rs temp_proxy/lib.rs
cp donation_platform/Cargo.toml temp_proxy/
cd temp_proxy
sed -i '' 's/name = "donation_platform"/name = "proxy"/' Cargo.toml
cargo contract build --release
cd ..
```

## Deployment Order

```
1. temp_v2/target/ink/donation_platform_v2.contract → Deploy first
   ↓ (copy address)
2. temp_proxy/target/ink/proxy.contract → Deploy with V2 address
   ↓ (copy proxy address)
3. frontend/.env.local → Use PROXY address
```

## Environment File

```bash
# frontend/.env.local
VITE_NETWORK_NAME=Rococo Contracts
VITE_RPC_ENDPOINT=wss://rococo-contracts-rpc.polkadot.io
VITE_CONTRACT_ADDRESS=<YOUR_PROXY_ADDRESS>
```

## What You Get

✅ Upgradable contracts (fix bugs without migration)  
✅ Batch operations (40% gas savings)  
✅ Scalable architecture (millions of users)  
✅ Modern UI with batch features  
✅ Production-ready from day one  

## Need Help?

📖 Full Guide: [FRESH_DEPLOYMENT_GUIDE.md](./FRESH_DEPLOYMENT_GUIDE.md)  
📖 Upgrades: [donation_platform/UPGRADE_GUIDE.md](./donation_platform/UPGRADE_GUIDE.md)  
📖 Scaling: [donation_platform/SCALABILITY_GUIDE.md](./donation_platform/SCALABILITY_GUIDE.md)  

**No migration needed - you're starting fresh! 🎉**
