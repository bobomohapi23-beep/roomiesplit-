import React from 'react';
import { Roommate, SimplifiedDebt } from '../types';
import { formatCurrency } from '../utils/balance';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WhoOwesWhomProps {
  debts: SimplifiedDebt[];
  members: Roommate[];
  activeMember: Roommate | undefined;
  currencySymbol: string;
  onSettleDebt: (fromId: string, toId: string, amount: number) => void;
}

export const WhoOwesWhom: React.FC<WhoOwesWhomProps> = ({
  debts,
  members,
  activeMember,
  currencySymbol,
  onSettleDebt,
}) => {
  const memberMap = new Map<string, Roommate>();
  members.forEach((m) => memberMap.set(m.id, m));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Who Owes Whom</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Minimal transactions required to settle all debts in the household
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Simplified Math</span>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Everyone is all settled up!
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No pending debts between roommates. Log new shared expenses anytime to keep track automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((debt, index) => {
            const debtor = memberMap.get(debt.fromId);
            const creditor = memberMap.get(debt.toId);
            if (!debtor || !creditor) return null;

            const isDebtor = activeMember?.id === debtor.id;
            const isCreditor = activeMember?.id === creditor.id;

            return (
              <div
                key={`${debt.fromId}-${debt.toId}-${index}`}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isDebtor
                    ? 'border-rose-200/90 bg-rose-50/30'
                    : isCreditor
                    ? 'border-emerald-200/90 bg-emerald-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Visual Flow: Debtor -> Creditor */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Debtor Avatar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: debtor.avatarColor }}
                    >
                      {debtor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-900 block truncate">
                        {debtor.name}
                      </span>
                      {isDebtor && (
                        <span className="text-[10px] font-semibold text-rose-700 block">
                          (You)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transfer Indicator */}
                  <div className="flex items-center gap-1.5 px-2 text-slate-400 shrink-0">
                    <span className="text-xs text-slate-500 font-medium hidden xs:inline">
                      owes
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Creditor Avatar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: creditor.avatarColor }}
                    >
                      {creditor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-900 block truncate">
                        {creditor.name}
                      </span>
                      {isCreditor && (
                        <span className="text-[10px] font-semibold text-emerald-700 block">
                          (You)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Settle Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono tabular-nums text-slate-900 block">
                      {formatCurrency(debt.amount, currencySymbol)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isDebtor
                        ? 'you owe them'
                        : isCreditor
                        ? 'they owe you'
                        : 'unsettled balance'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSettleDebt(debt.fromId, debt.toId, debt.amount)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Settle Up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
