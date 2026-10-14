import React from 'react';
import { Roommate, MemberBalance } from '../types';
import { formatCurrency } from '../utils/balance';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, DollarSign, Wallet } from 'lucide-react';

interface BalanceSummaryProps {
  activeMember: Roommate | undefined;
  balances: Record<string, MemberBalance>;
  members: Roommate[];
  currencySymbol: string;
  onOpenSettleUp: (fromId?: string, toId?: string, amount?: number) => void;
  onOpenAddExpense: () => void;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  activeMember,
  balances,
  members,
  currencySymbol,
  onOpenSettleUp,
  onOpenAddExpense,
}) => {
  const activeBalance = activeMember ? balances[activeMember.id] : undefined;
  const netAmount = activeBalance ? activeBalance.net : 0;

  // Total household spending
  const totalHouseholdSpent = Object.values(balances).reduce(
    (acc, b) => acc + b.totalPaid,
    0
  );

  return (
    <div className="space-y-6">
      {/* Hero Active Member Card */}
      {activeMember && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <span>Personal Position</span>
                <span aria-hidden="true">·</span>
                <span>Viewing as {activeMember.name}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-baseline gap-2">
                <span className="font-mono tabular-nums">
                  {formatCurrency(netAmount, currencySymbol)}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {netAmount > 0.01
                    ? 'owed to you'
                    : netAmount < -0.01
                    ? 'you owe in total'
                    : 'all squared away'}
                </span>
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              {netAmount < -0.01 ? (
                <button
                  onClick={() => onOpenSettleUp(activeMember.id, undefined, Math.abs(netAmount))}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Settle Up What You Owe</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenSettleUp()}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Settle Up</span>
                </button>
              )}
              <button
                onClick={onOpenAddExpense}
                className="px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-slate-600" />
                <span>Log Expense</span>
              </button>
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">You've Paid</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(activeBalance?.totalPaid || 0, currencySymbol)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Your Fair Share</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(activeBalance?.totalShare || 0, currencySymbol)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 block mb-0.5">Total House Spent</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-700">
                {formatCurrency(totalHouseholdSpent, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Roommates Net Balance Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Roommate Balances</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Net balance for each household member
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {members.map((member) => {
            const b = balances[member.id];
            const net = b ? b.net : 0;
            const isOwed = net > 0.01;
            const owes = net < -0.01;
            const isSelf = activeMember?.id === member.id;

            return (
              <div
                key={member.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelf
                    ? 'border-slate-400/80 bg-slate-50/70'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-slate-900 block truncate">
                        {member.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-medium text-slate-500 block">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isOwed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </div>
                  ) : owes ? (
                    <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <div className="text-xl font-bold font-mono tabular-nums tracking-tight">
                    {isOwed ? (
                      <span className="text-emerald-700">
                        +{formatCurrency(net, currencySymbol)}
                      </span>
                    ) : owes ? (
                      <span className="text-rose-700">
                        {formatCurrency(net, currencySymbol)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">$0.00</span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                    {isOwed ? 'gets back' : owes ? 'owes to house' : 'settled up'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>Paid: {currencySymbol}{b?.totalPaid.toFixed(2) || '0.00'}</span>
                  <span>Share: {currencySymbol}{b?.totalShare.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
