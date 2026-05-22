import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Wallet, LogOut, Radio, AlertCircle } from 'lucide-react';
import { arcTestnet } from './ReownAppKitProvider';

export function Header() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== arcTestnet.id;

  // Format short address: 0x1234...5678
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-linear-to-tr from-[#2563EB] to-[#06B6D4] w-10 h-10 rounded-xl flex items-center justify-center shadow-xs">
            <span className="text-white font-bold text-lg font-mono tracking-tighter">Ap</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight leading-none">ArcPay Receipt</h1>
            <p className="text-xs text-[#475569] mt-0.5 font-sans">On-chain Payment Verifier</p>
          </div>
        </div>

        {/* Badges and Connect Button */}
        <div className="flex items-center space-x-3">
          
          {/* Network Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-[#EFF6FF] text-[#1D4ED8] text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Arc Testnet</span>
          </div>

          {/* Wrong Network CTA */}
          {isWrongChain && (
            <button
              onClick={() => switchChain?.({ chainId: arcTestnet.id })}
              className="flex items-center space-x-1 bg-[#EF4444]/10 hover:bg-[#EF4444]/15 border border-[#EF4444]/20 text-[#EF4444] px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
              title="Click to switch to Arc Testnet"
            >
              <AlertCircle size={14} />
              <span>Switch to Arc</span>
            </button>
          )}

          {/* Reown Connection */}
          {isConnected && address ? (
            <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-full p-1 pl-3.5 pr-1 space-x-2.5">
              <span className="text-xs font-mono font-medium text-[#475569]">
                {formatAddress(address)}
              </span>
              <button
                onClick={() => disconnect()}
                className="p-1.5 bg-white text-[#475569] hover:text-[#EF4444] rounded-full border border-[#E2E8F0] shadow-xs cursor-pointer transition-all duration-200"
                title="Disconnect Wallet"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="flex items-center space-x-1.5 px-4.5 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold font-sans cursor-pointer transition-all active:scale-95 duration-150 shadow-xs"
            >
              <Wallet size={14} />
              <span>Connect Wallet</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
