import dotenv from "dotenv";
import { baseSepolia, base } from "viem/chains";

dotenv.config();

/**
 * x402-open Facilitator Configuration (EVM - Base Sepolia)
 * 
 * This facilitator handles payment verification and settlement for the X402 protocol.
 * It supports EVM networks (Ethereum, Base, etc.) for micro-payments.
 * 
 * Environment Variables Required:
 * - ETH_PRIVATE_KEY: Ethereum/EVM private key (0x prefixed)
 * - X402_NETWORK: Network to use ("base-sepolia" or "base")
 * 
 * Optional:
 * - X402_GATEWAY_URLS: Comma-separated list of gateway URLs for auto-registration
 * - NODE_BASE_URL: Base URL for this node (for auto-registration)
 */
export async function createFacilitator() {
  // Dynamic import for ES module
  const { Facilitator } = await import("x402-open");
  const evmPrivateKey = process.env.ETH_PRIVATE_KEY;
  const network = process.env.X402_NETWORK || "base-sepolia";

  if (!evmPrivateKey) {
    throw new Error(
      "ETH_PRIVATE_KEY environment variable is required for x402-open facilitator"
    );
  }

  // Validate private key format
  if (!evmPrivateKey.startsWith("0x")) {
    throw new Error(
      "ETH_PRIVATE_KEY must be a hex string starting with 0x"
    );
  }

  // Validate network and get chain config
  const networkToChain: Record<string, typeof baseSepolia | typeof base> = {
    "base-sepolia": baseSepolia,
    "base": base,
  };

  if (!networkToChain[network]) {
    throw new Error(
      `Invalid X402_NETWORK: ${network}. Must be one of: ${Object.keys(networkToChain).join(", ")}`
    );
  }

  const chain = networkToChain[network];

  const facilitator = new Facilitator({
    // EVM support (Base Sepolia for testing, Base for production)
    evmPrivateKey: evmPrivateKey as `0x${string}`,
    evmNetworks: [chain],
  });

  console.log(`[x402-open] Facilitator initialized for EVM network: ${network}`);

  return facilitator;
}
