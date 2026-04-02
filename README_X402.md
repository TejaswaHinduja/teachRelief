# x402-open Micro-payments Integration 🚀

This repository integrates **x402-open** to facilitate micro-payments for AI-powered services. Specifically, it monetizes the AI Grading endpoint (`/api/gradeAi`) to recover API costs (OpenAI/Mistral) while providing a decentralized payment experience for users.

## 🛠️ How We Did It: Technology Stack

We transitioned from a Solana-based implementation to **Ethereum (Base Sepolia)** to leverage the widespread adoption of EVM wallets and the robust `x402-axios` ecosystem.

- **Backend**: `express`, `x402-open`, `x402-express`, `viem`
- **Frontend**: `next.js`, `x402-axios`, `wagmi`, `viem`, `@tanstack/react-query`
- **Network**: [Base Sepolia Testnet](https://sepolia.basescan.org/) (L2 Ethereum)

---

## 🔄 The Payment Workflow

1. **The Request**: The frontend clicks "Grade Submission" and sends an `axios` POST request to `/api/gradeAi`.
2. **The Interceptor**: On the frontend, `x402-axios` wraps the request with a **Payment Interceptor**.
3. **The 402 Error**: The backend `paymentMiddleware` intercepts the request. If no payment proof is found, it returns a `402 Payment Required` status code with details (Price, Receiver, Network).
4. **The User Prompt**: The frontend interceptor catches the 402, parses the requirements, and triggers a wallet signature (MetaMask/Backpack) for the micro-payment (e.g., $0.0001).
5. **The Facilitator**: Once signed, the transaction is sent to the network. The frontend retries the original request, passing the transaction hash.
6. **Verification**: The backend calls the `Facilitator` to verify the transaction on-chain.
7. **Execution**: Once verified, the AI grading logic executes, and the response is returned to the user.

---

## 📁 Key Files & Implementation Details

### Backend
- **`apps/backend/src/facilitator.ts`**: Initializes the `Facilitator` with an EVM private key and Base Sepolia chain configuration.
- **`apps/backend/src/routes/graderoute.ts`**: Configures the `paymentMiddleware` and applies it to the specific route.
- **`apps/backend/.env`**: Secret management for the receiving wallet and private key.

### Frontend
- **`apps/frontend/components/WalletProvider.tsx`**: Provides the Wagmi/QueryClient context needed for EVM interactions.
- **`apps/frontend/components/ui/WalletButton.tsx`**: A clean UI component for connecting/disconnecting accounts.
- **`apps/frontend/app/room/.../submissions/page.tsx`**: The main integration point where `paymentApi` (axios with interceptor) is used for grading calls.

---

## 🚀 Getting Started with x402

### Prerequisites
- [MetaMask](https://metamask.io/) or [Backpack](https://backpack.app/) wallet.
- **Base Sepolia ETH**: Get free testnet ETH from a [faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet).

### Testing
1. Connect your wallet via the **Connect Wallet** button.
2. Ensure you are on the **Base Sepolia** network.
3. Click **Grade Submission**.
4. Confirm the micro-payment in your wallet.
5. Success! The AI response will appear after verification.

---

## 🔗 Resources
- [x402-open Protocol](https://x402open.org)
- [Official Examples](https://github.com/VanshSahay/x402-open-example)
- [Base Development Docs](https://docs.base.org/)
