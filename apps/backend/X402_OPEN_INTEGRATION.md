# x402-open Integration Documentation

## Overview

This document describes the x402-open integration into TeachRelief, enabling micro-payments for AI-powered grading services using the Solana blockchain. Teachers now pay a small fee (default: $0.0001) each time they grade a student submission, helping offset the costs of Google Gemini API calls.

## What is x402-open?

x402-open is a decentralized facilitator toolkit for the X402 protocol that enables:
- **Micro-payments for API access** - Charge small fees for endpoint usage
- **Blockchain-based payments** - Uses Solana (SVM) or Ethereum (EVM) networks
- **Decentralized facilitators** - No reliance on centralized payment processors
- **Easy integration** - Simple Express.js middleware integration

## Architecture

```
Teacher (Frontend) → Payment Request → x402 Payment Middleware → Facilitator Node → Solana Blockchain
                                                                    ↓
                                                              Verify & Settle Payment
                                                                    ↓
                                                              AI Grading Service
```

### Components

1. **Facilitator Node** (`/facilitator` endpoint)
   - Verifies payment requests
   - Settles payments on Solana blockchain
   - Exposes: `GET /facilitator/supported`, `POST /facilitator/verify`, `POST /facilitator/settle`

2. **Payment Middleware** (on `/api/gradeAi` route)
   - Intercepts requests to protected endpoints
   - Requires valid payment before allowing access
   - Automatically handles payment verification

3. **Backend Integration**
   - Co-located facilitator node (runs alongside API server)
   - Payment middleware protects grading endpoint
   - Graceful fallback if payment not configured

## Environment Variables

### Required Variables

Add these to your `apps/backend/.env` file:

```bash
# Solana Private Key (Base58 encoded)
# This is the private key for the facilitator node that will receive payments
# Format: Base58 encoded string (e.g., from Solana CLI or wallet)
SOLANA_PRIVATE_KEY=your_base58_encoded_private_key_here

# Solana Wallet Address (Public Key)
# This is the public key/address that will receive payments
# You can derive this from SOLANA_PRIVATE_KEY or get it from your wallet
X402_RECEIVING_WALLET=your_solana_wallet_address_here

# Network Configuration
# Options: "solana-devnet" (for testing) or "solana-mainnet" (for production)
X402_NETWORK=solana-devnet
```

### Optional Variables

```bash
# Facilitator URL (defaults to localhost if not set)
# Use this if facilitator is running on a different server
X402_FACILITATOR_URL=http://localhost:1000/facilitator

# Grading Price (defaults to $0.0001 if not set)
# Format: "$0.0001" (must include dollar sign)
X402_GRADING_PRICE=$0.0001

# Gateway Auto-Registration (optional)
# Comma-separated list of gateway URLs for auto-registration
# Example: "https://facilitator.x402open.org/facilitator,http://localhost:8080/facilitator"
X402_GATEWAY_URLS=https://facilitator.x402open.org/facilitator

# Node Base URL (for auto-registration)
# The public URL where your facilitator node is accessible
# Example: "https://your-domain.com/facilitator"
NODE_BASE_URL=http://localhost:1000/facilitator
```

## Setup Instructions

### Step 1: Generate Solana Keypair

You need a Solana keypair for the facilitator. Here are several ways to generate one:

#### Option A: Using Solana CLI (Recommended)

```bash
# Install Solana CLI (if not already installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate a new keypair
solana-keygen new --outfile ~/.config/solana/facilitator-keypair.json

# Get the private key (Base58 encoded)
solana-keygen pubkey ~/.config/solana/facilitator-keypair.json --outfile /dev/stdout

# Get the public key (wallet address)
solana-keygen pubkey ~/.config/solana/facilitator-keypair.json
```

#### Option B: Using Node.js Script

Create a temporary file `generate-keypair.js`:

```javascript
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const keypair = Keypair.generate();
const privateKey = bs58.encode(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

console.log('Private Key (Base58):', privateKey);
console.log('Public Key (Wallet Address):', publicKey);
```

Run it:
```bash
npm install @solana/web3.js bs58
node generate-keypair.js
```

#### Option C: Using Phantom Wallet (For Testing)

1. Install Phantom wallet extension
2. Create a new wallet or use existing
3. Export private key (Settings → Security & Privacy → Export Private Key)
4. Convert to Base58 format if needed

**⚠️ Security Warning**: Never commit private keys to version control. Always use environment variables and `.env` files (which should be in `.gitignore`).

### Step 2: Fund Your Wallet (For Testing)

If using **Solana Devnet** (recommended for testing):

```bash
# Airdrop test SOL to your wallet
solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet

# Or use the web faucet:
# https://faucet.solana.com/
```

For **Solana Mainnet**, you'll need to purchase SOL from an exchange.

### Step 3: Configure Environment Variables

Add the generated keys to `apps/backend/.env`:

```bash
SOLANA_PRIVATE_KEY=YOUR_BASE58_PRIVATE_KEY
X402_RECEIVING_WALLET=YOUR_PUBLIC_KEY_ADDRESS
X402_NETWORK=solana-devnet
X402_GRADING_PRICE=$0.0001
```

### Step 4: Install Dependencies

Dependencies should already be installed, but verify:

```bash
cd apps/backend
pnpm install
```

Required packages:
- `x402-open` - Facilitator toolkit
- `x402-express` - Express middleware
- `viem` - Ethereum/Solana utilities

### Step 5: Build and Start Server

```bash
# Build TypeScript
pnpm build

# Start server
pnpm start

# Or for development
pnpm dev
```

You should see:
```
[x402-open] Facilitator initialized for network: solana-devnet
[x402-open] Facilitator endpoints mounted at /facilitator
```

### Step 6: Verify Facilitator Endpoints

Test that the facilitator is running:

```bash
# Check supported networks
curl http://localhost:1000/facilitator/supported

# Expected response:
# {
#   "kinds": [
#     {
#       "scheme": "exact",
#       "network": "solana-devnet"
#     }
#   ]
# }
```

## API Endpoints

### Facilitator Endpoints

- **GET `/facilitator/supported`**
  - Returns supported payment networks and schemes
  - Response: `{ kinds: [{ scheme, network, extra? }] }`

- **POST `/facilitator/verify`**
  - Verifies a payment payload
  - Body: `{ paymentPayload, paymentRequirements }`
  - Returns verification result

- **POST `/facilitator/settle`**
  - Settles a verified payment
  - Body: `{ paymentPayload, paymentRequirements }`
  - Returns settlement result with transaction hash

### Protected Endpoints

- **POST `/api/gradeAi`**
  - Now requires payment before access
  - Payment is automatically handled by middleware
  - If `X402_RECEIVING_WALLET` is not set, endpoint works without payment (fallback mode)

## Frontend Integration

The frontend needs to be updated to handle payments. Teachers will need:

1. **Solana Wallet** (Phantom, Solflare, etc.)
2. **Payment Client** - Use `x402-fetch` or `x402-axios` to automatically handle payments

### Example Frontend Integration

```typescript
import { withPaymentInterceptor } from 'x402-axios';
import { Connection, Keypair } from '@solana/web3.js';
import axios from 'axios';

// Create Solana connection
const connection = new Connection('https://api.devnet.solana.com');

// Get teacher's wallet (from wallet adapter or similar)
const teacherWallet = /* get from wallet adapter */;

// Create axios instance with payment interceptor
const api = withPaymentInterceptor(
  axios.create({
    baseURL: 'http://localhost:1000',
    withCredentials: true,
  }),
  teacherWallet,
  connection
);

// Make grading request - payment is handled automatically
const response = await api.post('/api/gradeAi', {
  submissionId: '...',
  assignmentId: '...'
});
```

### Required Frontend Packages

```bash
cd apps/frontend
pnpm add x402-fetch @solana/web3.js @solana/wallet-adapter-base
# or
pnpm add x402-axios @solana/web3.js @solana/wallet-adapter-base
```

## Testing

### Test Payment Flow

1. **Start Backend Server**
   ```bash
   cd apps/backend
   pnpm dev
   ```

2. **Verify Facilitator is Running**
   ```bash
   curl http://localhost:1000/facilitator/supported
   ```

3. **Test with Payment Client**
   - Use the example buyer script from x402-open repository
   - Or implement frontend payment handling

### Test Without Payment (Development)

If `X402_RECEIVING_WALLET` is not set, the endpoint will work without payment:
```
[x402-open] X402_RECEIVING_WALLET not set, grading endpoint will not require payment
```

This allows development without blockchain setup.

## Production Deployment

### Checklist

- [ ] Switch to `solana-mainnet` in `X402_NETWORK`
- [ ] Use production facilitator URL in `X402_FACILITATOR_URL`
- [ ] Set appropriate `NODE_BASE_URL` for auto-registration
- [ ] Fund facilitator wallet with SOL for transaction fees
- [ ] Update frontend to use production backend URL
- [ ] Test payment flow end-to-end
- [ ] Monitor facilitator logs for errors

### Gateway Registration (Optional)

Register your facilitator with public gateways:

```bash
# Add to .env
X402_GATEWAY_URLS=https://facilitator.x402open.org/facilitator
NODE_BASE_URL=https://your-domain.com/facilitator
```

The facilitator will automatically register and send heartbeats.

## Troubleshooting

### Error: "SOLANA_PRIVATE_KEY environment variable is required"

**Solution**: Make sure `SOLANA_PRIVATE_KEY` is set in your `.env` file and the file is being loaded.

### Error: "Invalid X402_NETWORK"

**Solution**: Use either `"solana-devnet"` or `"solana-mainnet"` (exact strings, case-sensitive).

### Payment Verification Fails

**Possible causes**:
1. Insufficient funds in teacher's wallet
2. Network mismatch (devnet vs mainnet)
3. Facilitator not running or unreachable
4. Invalid payment payload

**Solution**: Check facilitator logs, verify network configuration, ensure teacher's wallet has SOL.

### Facilitator Endpoints Not Accessible

**Solution**: 
- Check CORS configuration in `apps/backend/src/index.ts`
- Verify server is running on correct port (default: 1000)
- Check firewall/network settings

### TypeScript Compilation Errors

**Solution**: 
- Run `pnpm build` to check for type errors
- Ensure all dependencies are installed: `pnpm install`
- Check TypeScript version compatibility

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Environment Variables**: Use `.env` files and ensure they're in `.gitignore`
3. **Network Security**: Use HTTPS in production
4. **Wallet Security**: Store facilitator private keys securely (consider using key management services)
5. **Rate Limiting**: Consider adding rate limits to facilitator endpoints
6. **Monitoring**: Monitor facilitator logs for suspicious activity

## Cost Analysis

- **Per Grading Request**: Default $0.0001 (configurable via `X402_GRADING_PRICE`)
- **Solana Transaction Fees**: ~0.000005 SOL per transaction (~$0.0001 at current prices)
- **Net Revenue**: ~$0.00009 per grading (after Solana fees)

Adjust `X402_GRADING_PRICE` based on your AI API costs and desired profit margin.

## Additional Resources

- [x402-open GitHub](https://github.com/VanshSahay/x402-open-example)
- [x402-open Documentation](https://x402open.org)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## Support

For issues related to:
- **x402-open**: Check the [x402-open repository](https://github.com/VanshSahay/x402-open-example)
- **Solana**: Check [Solana Discord](https://discord.gg/solana)
- **TeachRelief Integration**: Check this documentation or project issues

## Bounty Submission

For the x402-open bounty submission, you'll need:

1. **Facilitator Endpoint URL**: `http://your-domain.com/facilitator` (or localhost for testing)
2. **X Thread**: 5-10 tweets documenting:
   - Why you chose x402-open (cost recovery for AI services)
   - Integration process
   - Challenges faced
   - Benefits observed

Example facilitator endpoint: `http://localhost:1000/facilitator` (for local testing)

---

**Last Updated**: January 2026
**Integration Version**: x402-open v1.2.9, x402-express v1.1.0
