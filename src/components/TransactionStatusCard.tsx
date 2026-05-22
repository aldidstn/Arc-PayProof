import React from 'react';
import { TxStatus } from '../lib/receipt';
import { CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';

interface TransactionStatusCardProps {
  status: TxStatus;
  txHash?: string;
  errorMessage?: string;
  onRetry?: () => void;
  explorerUrl?: string;
}

export function TransactionStatusCard({
  status,
  txHash,
  errorMessage,
  onRetry,
  explorerUrl,
}: TransactionStatusCardProps) {
  if (status === 'idle') return null;

  // Visual helper lists
  const steps = [
    {
      id: 1,
      title: 'Wallet Confirmation',
      description: 'Sign the transaction in your connected wallet.',
      icon: Clock,
      status:
        status === 'awaiting_wallet'
          ? 'active'
          : status === 'rejected'
          ? 'failed'
          : (status as string) === 'idle'
          ? 'upcoming'
          : 'completed',
    },
    {
      id: 2,
      title: 'Transaction Submitted',
      description: 'Waiting for high-speed sub-second finality on Arc.',
      icon: Loader2,
      status:
        status === 'submitted'
          ? 'active'
          : status === 'failed'
          ? 'failed'
          : ['confirmed'].includes(status)
          ? 'completed'
          : 'upcoming',
    },
    {
      id: 3,
      title: 'Receipt Confirmed',
      description: 'On-chain payment proof is generated and verified.',
      icon: CheckCircle2,
      status: status === 'confirmed' ? 'completed' : status === 'failed' ? 'failed' : 'upcoming',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 max-w-xl mx-auto shadow-sm transition-all animate-fade-in mt-6" aria-live="polite">
      <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Payment Progress</h3>

      {/* Steps Visual List */}
      <div className="space-y-6 relative border-l-2 border-[#F1F5F9] ml-4.5 pl-6.5">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          let badgeColor = 'bg-slate-100 text-slate-400';
          let textColor = 'text-slate-400';

          if (step.status === 'completed') {
            badgeColor = 'bg-[#D1FAE5] text-[#10B981]';
            textColor = 'text-[#0F172A]';
          } else if (step.status === 'active') {
            badgeColor = 'bg-[#EFF6FF] text-[#2563EB] ring-4 ring-[#EFF6FF]';
            textColor = 'text-[#0F172A] font-medium';
          } else if (step.status === 'failed') {
            badgeColor = 'bg-red-100 text-[#EF4444]';
            textColor = 'text-red-500';
          }

          return (
            <div key={step.id} className="relative">
              {/* Node Indicator */}
              <div
                className={`absolute -left-12 top-0.5 w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all ${badgeColor}`}
                title={step.status}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 size={16} />
                ) : step.status === 'active' && step.id === 2 ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <StepIcon size={14} />
                )}
              </div>

              {/* Text content */}
              <div>
                <h4 className={`text-sm font-bold tracking-tight ${textColor}`}>{step.title}</h4>
                <p className="text-xs text-[#475569] mt-0.5 leading-relaxed font-sans">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction rejection details */}
      {status === 'rejected' && (
        <div className="mt-8 bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex items-start space-x-3">
          <AlertCircle className="text-[#F59E0B] shrink-0 mt-0.5" size={17} />
          <div className="flex-1">
            <h5 className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">Transaction Rejected</h5>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed font-sans">
              Transaction rejected in wallet. No payment was sent. Please try again when ready.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 bg-[#F59E0B] hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Retry Payment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transaction failed details */}
      {status === 'failed' && (
        <div className="mt-8 bg-red-50 border border-red-200/50 rounded-2xl p-4 flex items-start space-x-3">
          <XCircle className="text-[#EF4444] shrink-0 mt-0.5" size={17} />
          <div className="flex-1">
            <h5 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">Transaction Failed</h5>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed font-sans">
              {errorMessage || 'The on-chain transaction failed on Arc Testnet. No confirmed receipt was created.'}
            </p>
            
            {txHash && explorerUrl && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#2563EB] hover:underline mt-2 cursor-pointer font-sans"
              >
                <span>View error on Arcscan</span>
                <ArrowRight size={12} />
              </a>
            )}

            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 block bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Retry Payment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transaction submitted details */}
      {status === 'submitted' && txHash && (
        <div className="mt-8 pt-5 border-t border-[#F1F5F9]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Submitted Hash</span>
              <span className="text-xs font-mono text-[#0F172A] mt-1 block select-all bg-[#F1F5F9] px-2 py-1 rounded">
                ${txHash.substring(0, 16)}...${txHash.substring(txHash.length - 12)}
              </span>
            </div>
            {explorerUrl && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] px-3.5 py-2 rounded-xl transition-all cursor-pointer font-sans"
              >
                <span>Track on Arcscan</span>
                <ArrowRight size={12} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
