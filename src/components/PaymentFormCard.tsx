import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { formatUnits, parseUnits, isAddress } from 'viem';
import { Send, AlertCircle, Coins, HelpCircle, ExternalLink } from 'lucide-react';
import { ERC20_ABI } from '../lib/erc20';
import { ARC_TESTNET_USDC_ADDRESS } from '../config/arc';
import { arcTestnet } from './ReownAppKitProvider';

interface PaymentFormCardProps {
  onSend: (recipient: string, amount: string) => Promise<void>;
  isLoading: boolean;
  txStatus: string;
}

export function PaymentFormCard({ onSend, isLoading, txStatus }: PaymentFormCardProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isWrongChain = isConnected && chainId !== arcTestnet.id;

  // Local state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  // Fetch USDC Balance using useReadContract
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: ARC_TESTNET_USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !isWrongChain,
    }
  });

  const usdcBalance = rawBalance !== undefined ? formatUnits(rawBalance, 18) : '0';

  // Load from localStorage for convenience on mount
  useEffect(() => {
    const savedRecipient = localStorage.getItem('arcpay_last_recipient');
    const savedAmount = localStorage.getItem('arcpay_last_amount');
    if (savedRecipient) setRecipient(savedRecipient);
    if (savedAmount) setAmount(savedAmount);
  }, []);

  // Refetch balance when transaction status changes
  useEffect(() => {
    if (address && !isWrongChain) {
      refetchBalance();
    }
  }, [txStatus, address, isWrongChain, refetchBalance]);

  // Validation
  const validateForm = (): boolean => {
    const currentErrors: { recipient?: string; amount?: string } = {};

    // Validate recipient
    if (!recipient) {
      currentErrors.recipient = 'Recipient address is required.';
    } else if (!isAddress(recipient)) {
      currentErrors.recipient = 'Please enter a valid EVM address starting with 0x.';
    } else if (recipient.toLowerCase() === address?.toLowerCase()) {
      currentErrors.recipient = 'You cannot send USDC to yourself.';
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (!amount) {
      currentErrors.amount = 'Amount is required.';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      currentErrors.amount = 'Amount must be greater than 0.';
    } else if (rawBalance !== undefined) {
      const requiredUnits = parseUnits(amount, 18);
      if (rawBalance < requiredUnits) {
        currentErrors.amount = `Insufficient USDC balance. You have ${Number(usdcBalance).toFixed(2)} USDC.`;
      }
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    if (isWrongChain) return;

    if (validateForm()) {
      // Save last values for temporary convenience
      localStorage.setItem('arcpay_last_recipient', recipient);
      localStorage.setItem('arcpay_last_amount', amount);

      await onSend(recipient, amount);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 max-w-xl mx-auto transition-all">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F1F5F9]">
        <h2 className="text-xl font-bold text-[#0F172A] flex items-center space-x-2">
          <Coins className="text-[#2563EB]" size={20} />
          <span>New Payment</span>
        </h2>
        {isConnected && (
          <div className="text-right">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Your Balance</span>
            <span className="text-sm font-semibold text-[#16A34A] block">
              {rawBalance !== undefined ? `${Number(usdcBalance).toFixed(4)} USDC` : 'Loading...'}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Recipient Input */}
        <div>
          <label htmlFor="recipient" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
            Recipient Address
          </label>
          <div className="relative">
            <input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                if (errors.recipient) {
                  setErrors(prev => ({ ...prev, recipient: undefined }));
                }
              }}
              disabled={!isConnected || isWrongChain || isLoading}
              className={`w-full px-4.5 py-3 rounded-2xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all ${
                errors.recipient
                  ? 'border-[#EF4444] text-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB]'
              } disabled:bg-[#F8FAFC] disabled:text-[#475569]`}
            />
          </div>
          {errors.recipient && (
            <p className="flex items-center text-xs text-[#EF4444] mt-2 font-medium">
              <AlertCircle size={14} className="mr-1 inline animate-shake" />
              <span>{errors.recipient}</span>
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
            Amount (USDC)
          </label>
          <div className="relative rounded-2xl shadow-xs">
            <input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors(prev => ({ ...prev, amount: undefined }));
                }
              }}
              disabled={!isConnected || isWrongChain || isLoading}
              className={`w-full pl-4.5 pr-20 py-3 rounded-2xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all ${
                errors.amount
                  ? 'border-[#EF4444] text-[#EF4444] focus:border-[#EF4444]'
                  : 'border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB]'
              } disabled:bg-[#F8FAFC] disabled:text-[#475569]`}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-xs font-bold text-[#475569] tracking-wider uppercase font-mono">USDC</span>
            </div>
          </div>
          {errors.amount && (
            <p className="flex items-center text-xs text-[#EF4444] mt-2 font-medium">
              <AlertCircle size={14} className="mr-1 inline animate-shake" />
              <span>{errors.amount}</span>
            </p>
          )}
        </div>

        {/* Info Disclaimer */}
        <div className="bg-[#EFF6FF] border border-[#EFF6FF] rounded-2xl p-4 flex items-start space-x-3">
          <HelpCircle className="text-[#1D4ED8] shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-[#1D4ED8] font-sans leading-relaxed">
            <strong>Payment Helper:</strong> Arc uses USDC for gas, so keep enough testnet USDC in your wallet.
          </p>
        </div>

        {/* Submit action */}
        {isConnected ? (
          <button
            type="submit"
            disabled={isWrongChain || isLoading}
            className={`w-full py-3.5 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm tracking-wide rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              (isWrongChain || isLoading) ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400' : 'active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Awaiting signature...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Send USDC</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 mb-2 font-sans font-medium">Connect your wallet to perform a payment.</p>
          </div>
        )}
      </form>

      {/* Faucet access */}
      <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
        <a
          href="https://testnet.arcscan.app"
          target="_blank"
          referrerPolicy="no-referrer"
          className="inline-flex items-center space-x-1 text-xs font-bold text-[#1D4ED8] hover:text-[#2563EB] font-sans transition-colors cursor-pointer"
        >
          <span>Need Testnet USDC? Visit official Arc Faucet</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
