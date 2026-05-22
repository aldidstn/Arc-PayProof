import React, { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ARC_TESTNET } from '../config/arc';

// Reown Project ID (Vite expects import.meta.env.VITE_REOWN_PROJECT_ID)
// fallback provided to ensure it doesn't crash on initialize
const projectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID || "4a4413156cfd7462fa9fdbe6ffda41c5";

// Define Arc Testnet as a custom EVM chain using defineChain as required in PRD
export const arcTestnet = defineChain({
  id: Number(ARC_TESTNET.id),
  caipNetworkId: `eip155:${ARC_TESTNET.id}`,
  chainNamespace: 'eip155',
  name: ARC_TESTNET.name,
  nativeCurrency: { name: ARC_TESTNET.nativeCurrency.name, symbol: ARC_TESTNET.nativeCurrency.symbol, decimals: ARC_TESTNET.nativeCurrency.decimals },
  rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
  blockExplorers: { default: { name: 'Arcscan', url: ARC_TESTNET.blockExplorerUrl } }
});

const networks: [any, ...any[]] = [arcTestnet];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

// Initialize Reown AppKit outside React components to avoid unwanted rerenders.
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: arcTestnet,
  metadata: {
    name: 'ArcPay Receipt',
    description: 'No-database USDC payment receipts on Arc Testnet',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    icons: [typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : '']
  },
  features: { analytics: false }
});

// Create Query Client
const queryClient = new QueryClient();

interface ReownAppKitProviderProps {
  children: ReactNode;
}

export function ReownAppKitProvider({ children }: ReownAppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
