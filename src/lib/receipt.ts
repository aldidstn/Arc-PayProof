export type TxStatus =
  | "idle"
  | "awaiting_wallet"
  | "submitted"
  | "confirmed"
  | "failed"
  | "rejected";

export interface Receipt {
  status: "confirmed" | "failed";
  amount: string;
  symbol: "USDC";
  network: "Arc Testnet";
  from: string;
  to: string;
  txHash: string;
  blockNumber?: bigint;
  timestamp?: string; // e.g., "May 22, 2026, 10:32"
  gasUsed?: bigint;
  explorerUrl?: string;
}

/**
 * Formats a raw receipt as a copyable text receipt as displayed in Screen 3
 */
export function formatTextReceipt(receipt: Receipt): string {
  const statusStr = receipt.status === "confirmed" ? "Success" : "Failed";
  return `Payment Confirmed
${Number(receipt.amount).toFixed(2)} ${receipt.symbol}

Network: ${receipt.network}
From: ${receipt.from}
To: ${receipt.to}
Transaction Hash: ${receipt.txHash}
Block: ${receipt.blockNumber?.toString() || "N/A"}
Timestamp: ${receipt.timestamp || "N/A"}
Status: ${statusStr}`;
}
