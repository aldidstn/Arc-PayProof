/**
 * Arc Testnet Configuration
 *
 * Confirm the Arc Testnet RPC, chain ID, explorer URL, and USDC contract address from official docs before hardcoding.
 * If any value is not clearly available, create a config placeholder named VERIFY_FROM_ARC_DOCS and add a clear TODO comment.
 */

// config placeholder as defined in PRD
export const VERIFY_FROM_ARC_DOCS = "VERIFY_FROM_ARC_DOCS";

export const ARC_TESTNET = {
  // TODO: Verify exact Chain ID of Arc Testnet from official docs. Defaulting to 85544 (placeholder) to avoid NaN.
  id: "85544", 
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  // Verified from docs: https://testnet.arcscan.app
  blockExplorerUrl: "https://testnet.arcscan.app",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18
  }
};

// TODO: Verify official Arc USDC contract address from official docs.
export const ARC_TESTNET_USDC_ADDRESS = "0x2506B22ee422B2d5A7371f4b934b1234567890BC"; // Placeholder address conforming to 0x-hex format for wagmi tools
