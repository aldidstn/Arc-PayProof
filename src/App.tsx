import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useBlock } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { ReownAppKitProvider, arcTestnet } from './components/ReownAppKitProvider';
import { Header } from './components/Header';
import { PaymentFormCard } from './components/PaymentFormCard';
import { TransactionStatusCard } from './components/TransactionStatusCard';
import { ReceiptCard } from './components/ReceiptCard';
import { ARC_TESTNET, ARC_TESTNET_USDC_ADDRESS } from './config/arc';
import { ERC20_ABI } from './lib/erc20';
import { TxStatus, Receipt } from './lib/receipt';
import { ShieldCheck, Database, Zap, Sparkles } from 'lucide-react';

function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Active form data being processed
  const [activeRecipient, setActiveRecipient] = useState('');
  const [activeAmount, setActiveAmount] = useState('');

  // Transaction tracking state
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<Receipt | undefined>(undefined);

  // Wagmi Write Contract hook
  const { writeContractAsync } = useWriteContract();

  // Wagmi Wait for Transactionhook
  const { data: txReceipt, isSuccess, isError, error: waitError, isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch block info to retrieve on-chain timestamp
  const { data: block } = useBlock({
    blockNumber: txReceipt?.blockNumber,
    query: {
      enabled: !!txReceipt?.blockNumber,
    }
  });

  const isWrongChain = isConnected && chainId !== arcTestnet.id;

  // Hydrate pending transaction state on reload/mount (Edge Case handling)
  useEffect(() => {
    const savedHash = localStorage.getItem('arcpay_pending_hash');
    const savedRecipient = localStorage.getItem('arcpay_pending_recipient');
    const savedAmount = localStorage.getItem('arcpay_pending_amount');

    if (savedHash && savedRecipient && savedAmount) {
      setTxHash(savedHash as `0x${string}`);
      setActiveRecipient(savedRecipient);
      setActiveAmount(savedAmount);
      setTxStatus('submitted');
    }
  }, []);

  // Update receipt once transaction state resolves or block loaded
  useEffect(() => {
    if (txHash) {
      if (isWaiting) {
        setTxStatus('submitted');
      } else if (isSuccess && txReceipt) {
        // Compose block timestamp or accurate fallback
        const dateObj = block?.timestamp 
          ? new Date(Number(block.timestamp) * 1000) 
          : new Date();

        const formattedDate = dateObj.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const completedReceipt: Receipt = {
          status: 'confirmed',
          amount: activeAmount,
          symbol: 'USDC',
          network: 'Arc Testnet',
          from: txReceipt.from,
          to: activeRecipient,
          txHash: txHash,
          blockNumber: txReceipt.blockNumber,
          timestamp: formattedDate,
          gasUsed: txReceipt.gasUsed,
          explorerUrl: ARC_TESTNET.blockExplorerUrl
        };

        setReceipt(completedReceipt);
        setTxStatus('confirmed');

        // Clear temporary hydration variables
        localStorage.removeItem('arcpay_pending_hash');
        localStorage.removeItem('arcpay_pending_recipient');
        localStorage.removeItem('arcpay_pending_amount');
      } else if (isError || waitError) {
        setTxStatus('failed');
        setErrorMessage(waitError?.message || 'Transaction reverted or failed to execute on Arc Testnet.');
        localStorage.removeItem('arcpay_pending_hash');
      }
    }
  }, [txHash, isWaiting, isSuccess, isError, txReceipt, waitError, block, activeAmount, activeRecipient]);

  // Initiate Transaction
  const handleSendUSDC = async (recipient: string, amount: string) => {
    if (!isConnected) return;
    if (isWrongChain) {
      switchChain?.({ chainId: arcTestnet.id });
      return;
    }

    try {
      setTxStatus('awaiting_wallet');
      setErrorMessage('');
      setReceipt(undefined);
      setActiveRecipient(recipient);
      setActiveAmount(amount);

      // Perform transfer write call
      const hash = await writeContractAsync({
        address: ARC_TESTNET_USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseUnits(amount, 18)],
      } as any);

      setTxHash(hash);
      setTxStatus('submitted');

      // Set temporary state for reload retention (Edge Case handling)
      localStorage.setItem('arcpay_pending_hash', hash);
      localStorage.setItem('arcpay_pending_recipient', recipient);
      localStorage.setItem('arcpay_pending_amount', amount);

    } catch (err: any) {
      console.error('USDC Transfer failed:', err);
      // Handle user rejection vs actual failures
      if (err.message?.includes('rejected') || err.message?.includes('User denied') || err.message?.includes('UserRejectedRequestError')) {
        setTxStatus('rejected');
      } else {
        setTxStatus('failed');
        setErrorMessage(err.shortMessage || err.message || 'An error occurred while signing or executing the payment request.');
      }
    }
  };

  // Reset payment workflow
  const handleReset = () => {
    setTxHash(undefined);
    setTxStatus('idle');
    setErrorMessage('');
    setReceipt(undefined);
    localStorage.removeItem('arcpay_pending_hash');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans transition-all duration-300">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-[#EFF6FF] border border-[#EFF6FF] px-3.5 py-1.5 rounded-full text-[#1D4ED8] text-xs font-bold uppercase tracking-wider mb-4.5">
            <Sparkles size={12} />
            <span>Fast Settlement</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Send USDC. <br className="sm:hidden" /> Get instant on-chain proof.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            ArcPay Receipt creates a clean payment receipt directly from confirmed Arc transaction data. No database required.
          </p>

          {/* Trust Badges section */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#475569]">
              <Database size={15} className="text-[#06B6D4]" />
              <span>Full No-Database Architecture</span>
            </div>
            <div className="hidden sm:block h-1.5 w-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#475569]">
              <ShieldCheck size={15} className="text-[#10B981]" />
              <span>Verified On-chain receipts</span>
            </div>
            <div className="hidden sm:block h-1.5 w-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#475569]">
              <Zap size={15} className="text-[#F59E0B]" />
              <span>Deterministic Sub-second Finality</span>
            </div>
          </div>
        </div>

        {/* Dynamic content rendering cards based on status */}
        <div className="space-y-6">
          
          {/* Wrong Network Notification Card */}
          {isWrongChain && (
            <div className="bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-3xl p-6 text-center max-w-xl mx-auto mb-6">
              <h4 className="text-md font-bold text-[#EF4444]">Wrong Network Detected</h4>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                You are currently connected to an unsupported network. Please switch to Arc Testnet to proceed with your payment securely.
              </p>
              <button
                onClick={() => switchChain?.({ chainId: arcTestnet.id })}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Switch to Arc Testnet
              </button>
            </div>
          )}

          {/* Payment Form visible under idle and wallet signature processes */}
          {txStatus !== 'confirmed' && (
            <PaymentFormCard 
              onSend={handleSendUSDC} 
              isLoading={txStatus === 'awaiting_wallet' || txStatus === 'submitted'} 
              txStatus={txStatus}
            />
          )}

          {/* Transaction status card */}
          {txStatus !== 'idle' && txStatus !== 'confirmed' && (
            <TransactionStatusCard
              status={txStatus}
              txHash={txHash}
              errorMessage={errorMessage}
              onRetry={handleReset}
              explorerUrl={ARC_TESTNET.blockExplorerUrl}
            />
          )}

          {/* Confirmed Receipt Card */}
          {txStatus === 'confirmed' && receipt && (
            <ReceiptCard 
              receipt={receipt} 
              onNewPayment={handleReset} 
            />
          )}

        </div>
      </main>

      <footer className="bg-white border-t border-[#E2E8F0] py-6 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-[#475569] font-sans">
            Built for Arc Testnet. Testnet tokens have no real-world value.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ReownAppKitProvider>
      <Dashboard />
    </ReownAppKitProvider>
  );
}
