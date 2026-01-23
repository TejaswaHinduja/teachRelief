# Quick Setup Guide for x402-open

## What You Have ✅
- ✅ `SOLANA_PRIVATE_KEY` - Added to `.env`

## What You Still Need

### 1. Get Your Wallet Address (X402_RECEIVING_WALLET)

You need to derive the public key (wallet address) from your private key. Run this command:

```bash
cd apps/backend
node scripts/get-wallet-address.js
```

Or if you have the private key as an argument:
```bash
node scripts/get-wallet-address.js YOUR_PRIVATE_KEY_HERE
```

This will output your wallet address. Add it to your `.env` file:

```bash
X402_RECEIVING_WALLET=your_wallet_address_here
```

### 2. Required Environment Variables

Add these to `apps/backend/.env`:

```bash
# ✅ You already have this
SOLANA_PRIVATE_KEY=your_base58_private_key

# ⚠️ ADD THIS - Run the script above to get it
X402_RECEIVING_WALLET=your_wallet_address_from_script

# ⚠️ ADD THIS (optional, defaults to solana-devnet)
X402_NETWORK=solana-devnet

# Optional: Custom RPC endpoint (your Alchemy URL)
SOLANA_RPC_URL=https://solana-devnet.g.alchemy.com/v2/rHEPGDOFYLii_cfX5zvfa

# Optional: Pricing
X402_GRADING_PRICE=$0.0001
```

### 3. Install Dependencies

```bash
cd apps/backend
pnpm install
```

This will install `@solana/web3.js` and `bs58` needed for the wallet address script.

### 4. Test the Setup

```bash
# Build
pnpm build

# Start server
pnpm start
```

You should see:
```
[x402-open] Facilitator initialized for network: solana-devnet
[x402-open] Facilitator endpoints mounted at /facilitator
```

### 5. Verify It Works

```bash
curl http://localhost:1000/facilitator/supported
```

Expected response:
```json
{
  "kinds": [
    {
      "scheme": "exact",
      "network": "solana-devnet"
    }
  ]
}
```

## Summary

**Minimum Required:**
1. ✅ `SOLANA_PRIVATE_KEY` (you have this)
2. ⚠️ `X402_RECEIVING_WALLET` (run the script to get it)
3. ⚠️ `X402_NETWORK=solana-devnet` (optional, has default)

**Optional but Recommended:**
- `SOLANA_RPC_URL` - Your Alchemy endpoint (for better reliability)
- `X402_GRADING_PRICE` - Customize pricing

## Next Steps

Once you have `X402_RECEIVING_WALLET` set, the payment middleware will be active. Without it, the endpoint will work but won't require payments (development mode).
