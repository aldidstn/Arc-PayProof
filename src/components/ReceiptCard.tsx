import React, { useState } from 'react';
import { Receipt, formatTextReceipt } from '../lib/receipt';
import { Check, Clipboard, Receipt as ReceiptIcon, ExternalLink, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';

interface ReceiptCardProps {
  receipt: Receipt;
  onNewPayment: () => void;
}

export function ReceiptCard({ receipt, onNewPayment }: ReceiptCardProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const copyToClipboard = async (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopyHash = () => {
    copyToClipboard(receipt.txHash, setCopiedHash);
  };

  const handleCopyFullReceipt = () => {
    const formatted = formatTextReceipt(receipt);
    copyToClipboard(formatted, setCopiedReceipt);
  };

  const shortAddr = (addr: string) => {
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-md max-w-xl mx-auto overflow-hidden animate-fade-in mt-6">
      {/* Visual Seal of Confirmation */}
      <div className="bg-linear-to-r from-[#10B981] to-[#16A34A] text-white p-6 sm:p-8 text-center relative">
        <div className="absolute right-4 top-4 bg-white/15 px-2.5 py-1 rounded-full flex items-center space-x-1 border border-white/10">
          <ShieldCheck size={13} />
          <span className="text-[10px] font-bold tracking-wider uppercase font-sans">On-chain Proof</span>
        </div>
        
        <div className="mx-auto bg-white/20 h-14 w-14 rounded-full flex items-center justify-center mb-4 border border-white/25">
          <Check size={28} className="text-white" />
        </div>
        
        <h3 className="text-lg font-bold uppercase tracking-widest font-sans">Payment Confirmed</h3>
        <p className="text-3xl sm:text-4xl font-extrabold mt-2 font-mono flex items-center justify-center space-x-1.5">
          <span>{Number(receipt.amount).toFixed(2)}</span>
          <span className="text-lg font-bold tracking-normal opacity-90">{receipt.symbol}</span>
        </p>
        <p className="text-xs text-white/80 mt-1 font-sans">Instant settlement on Arc Testnet</p>
      </div>

      {/* Main Details Panel */}
      <div className="p-6 sm:p-8 space-y-4.5">
        
        {/* Network detail */}
        <div className="flex justify-between items-center text-xs pb-3 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#475569] uppercase tracking-wider">Network</span>
          <span className="font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-1 rounded-full">
            {receipt.network}
          </span>
        </div>

        {/* From detail */}
        <div className="flex justify-between items-center text-xs pb-3 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#475569] uppercase tracking-wider">From (Sender)</span>
          <span className="font-mono text-[#0F172A] select-all bg-[#F1F5F9] px-2.5 py-1 rounded-lg" title={receipt.from}>
            {shortAddr(receipt.from)}
          </span>
        </div>

        {/* To detail */}
        <div className="flex justify-between items-center text-xs pb-3 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#475569] uppercase tracking-wider">To (Recipient)</span>
          <span className="font-mono text-[#0F172A] select-all bg-[#F1F5F9] px-2.5 py-1 rounded-lg" title={receipt.to}>
            {shortAddr(receipt.to)}
          </span>
        </div>

        {/* Tx Hash detail */}
        <div className="flex justify-between items-center text-xs pb-3 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#475569] uppercase tracking-wider">Transaction Hash</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-[#0F172A] select-all bg-[#F1F5F9] px-2.5 py-1 rounded-lg" title={receipt.txHash}>
              {shortAddr(receipt.txHash)}
            </span>
            <button
              onClick={handleCopyHash}
              className="p-1.5 text-slate-400 hover:text-[#2563EB] bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors cursor-pointer"
              title="Copy Tx Hash"
            >
              {copiedHash ? <Check size={12} className="text-[#10B981]" /> : <Clipboard size={12} />}
            </button>
          </div>
        </div>

        {/* Block number */}
        {receipt.blockNumber && (
          <div className="flex justify-between items-center text-xs pb-3 border-b border-[#F1F5F9]">
            <span className="font-bold text-[#475569] uppercase tracking-wider">Block Number</span>
            <span className="font-mono text-[#0F172A] font-medium bg-[#F1F5F9] px-2.5 py-1 rounded-lg">
              #{receipt.blockNumber.toString()}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex justify-between items-center text-xs pb-3 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#475569] uppercase tracking-wider">Timestamp</span>
          <span className="text-[#0F172A] font-semibold font-sans bg-[#F1F5F9] px-2.5 py-1 rounded-lg">
            {receipt.timestamp || 'Just now'}
          </span>
        </div>

        {/* Status of receipt */}
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#475569] uppercase tracking-wider">Status Badge</span>
          <span className="inline-flex items-center space-x-1 font-bold text-[#16A34A] bg-[#D1FAE5] px-2.5 py-1 rounded-full uppercase tracking-widest text-[10px]">
            <Check size={12} strokeWidth={3} className="mr-0.5" />
            <span>Success</span>
          </span>
        </div>

      </div>

      {/* Action CTA list */}
      <div className="p-6 sm:p-8 bg-[#F8FAFC] border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Copy full formatted receipt */}
        <button
          onClick={handleCopyFullReceipt}
          className="flex items-center justify-center space-x-2 py-3 px-4.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-slate-300 text-xs text-[#0F172A] font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          {copiedReceipt ? (
            <>
              <Check size={14} className="text-[#10B981]" />
              <span className="text-[#10B981]">Receipt Copied!</span>
            </>
          ) : (
            <>
              <ReceiptIcon size={14} />
              <span>Copy Full Receipt</span>
            </>
          )}
        </button>

        {/* View on Explorer */}
        {receipt.explorerUrl && (
          <a
            href={`${receipt.explorerUrl}/tx/${receipt.txHash}`}
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center justify-center space-x-2 py-3 px-4.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-slate-300 text-xs text-[#0F172A] font-bold shadow-xs active:scale-98 transition-all cursor-pointer font-sans"
          >
            <ExternalLink size={14} />
            <span>View on Arcscan</span>
          </a>
        )}

        {/* Start new payment */}
        <button
          onClick={onNewPayment}
          className="col-span-1 sm:col-span-2 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs tracking-wide shadow-xs active:scale-98 transition-all cursor-pointer mt-2"
        >
          <RefreshCw size={13} />
          <span>Send Another Payment</span>
        </button>
      </div>
    </div>
  );
}
