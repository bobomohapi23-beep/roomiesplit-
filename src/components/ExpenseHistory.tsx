import React, { useState, useMemo } from 'react';
import { Expense, Settlement, Roommate } from '../types';
import { formatCurrency, formatDate } from '../utils/balance';
import {
  ShoppingCart,
  Zap,
  Package,
  Home,
  UtensilsCrossed,
  Film,
  Wrench,
  Receipt,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';

interface ExpenseHistoryProps {
  expenses: Expense[];
  settlements: Settlement[];
  members: Roommate[];
  currencySymbol: string;
  activeMember: Roommate | undefined;
  onDeleteExpense: (id: string) => void;
  onDeleteSettlement: (id: string) => void;
}

type TimelineItem =
  | { type: 'expense'; data: Expense; timestamp: number }
  | { type: 'settlement'; data: Settlement; timestamp: number };

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'groceries':
      return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
    case 'utilities':
      return <Zap className="w-4 h-4 text-amber-600" />;
    case 'supplies':
      return <Package className="w-4 h-4 text-blue-600" />;
    case 'rent':
      return <Home className="w-4 h-4 text-indigo-600" />;
    case 'takeout':
      return <UtensilsCrossed className="w-4 h-4 text-rose-600" />;
    case 'streaming':
      return <Film className="w-4 h-4 text-purple-600" />;
    case 'maintenance':
      return <Wrench className="w-4 h-4 text-slate-600" />;
    default:
      return <Receipt className="w-4 h-4 text-slate-600" />;
  }
};

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  settlements,
  members,
  currencySymbol,
  activeMember,
  onDeleteExpense,
  onDeleteSettlement,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expenses' | 'settlements'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const memberMap = useMemo(() => {
    const map = new Map<string, Roommate>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    if (filterType === 'all' || filterType === 'expenses') {
      expenses.forEach((e) => {
        items.push({
          type: 'expense',
          data: e,
          timestamp: new Date(e.createdAt || e.date).getTime(),
        });
      });
    }

    if (filterType === 'all' || filterType === 'settlements') {
      settlements.forEach((s) => {
        items.push({
          type: 'settlement',
          data: s,
          timestamp: new Date(s.createdAt || s.date).getTime(),
        });
      });
    }

    // Sort newest first
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses, settlements, filterType]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return timelineItems;
    const q = searchQuery.toLowerCase();

    return timelineItems.filter((item) => {
      if (item.type === 'expense') {
        const payer = memberMap.get(item.data.paidById)?.name.toLowerCase() || '';
        return (
          item.data.title.toLowerCase().includes(q) ||
          item.data.category.toLowerCase().includes(q) ||
          payer.includes(q) ||
          (item.data.notes && item.data.notes.toLowerCase().includes(q))
        );
      } else {
        const fromName = memberMap.get(item.data.fromId)?.name.toLowerCase() || '';
        const toName = memberMap.get(item.data.toId)?.name.toLowerCase() || '';
        return (
          fromName.includes(q) ||
          toName.includes(q) ||
          (item.data.method && item.data.method.toLowerCase().includes(q))
        );
      }
    });
  }, [timelineItems, searchQuery, memberMap]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      {/* Top Header & Search/Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Activity & Expense History</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of all shared expenses and settlements in the house
          </p>
        </div>

        {/* Filter Segmented Control & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-44 transition-all"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({expenses.length + settlements.length})
            </button>
            <button
              onClick={() => setFilterType('expenses')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'expenses'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setFilterType('settlements')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'settlements'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settled ({settlements.length})
            </button>
          </div>
        </div>
      </div>

      {/* History Feed */}
      <div className="mt-4 divide-y divide-slate-100">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No activity found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try clearing your search query.' : 'Log an expense to start tracking!'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            if (item.type === 'expense') {
              const expense = item.data;
              const payer = memberMap.get(expense.paidById);
              const splitCount = expense.splitBetweenIds.length;
              const perPersonShare = splitCount > 0 ? expense.amount / splitCount : 0;
              const isIncluded = activeMember && expense.splitBetweenIds.includes(activeMember.id);
              const isPayer = activeMember?.id === expense.paidById;

              return (
                <div
                  key={expense.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-4 px-4 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(expense.category)}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {expense.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">
                          {payer ? payer.name : 'Unknown'}
                        </span>
                        <span>paid</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(expense.date)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Split equal ({splitCount}{' '}
                          {splitCount === 1 ? 'roommate' : 'roommates'})
                        </span>
                      </div>

                      {expense.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono tabular-nums text-slate-900 block">
                        {formatCurrency(expense.amount, currencySymbol)}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 block">
                        {isPayer && isIncluded
                          ? `You lent ${formatCurrency(
                              expense.amount - perPersonShare,
                              currencySymbol
                            )}`
                          : isPayer
                          ? `You lent all ${formatCurrency(expense.amount, currencySymbol)}`
                          : isIncluded
                          ? `Your share: ${formatCurrency(perPersonShare, currencySymbol)}`
                          : 'Not in this split'}
                      </span>
                    </div>

                    {/* Delete action */}
                    <div className="relative">
                      {confirmDeleteId === expense.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <button
                            onClick={() => {
                              onDeleteExpense(expense.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 px-1 py-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(expense.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Settlement
              const settlement = item.data;
              const from = memberMap.get(settlement.fromId);
              const to = memberMap.get(settlement.toId);
              const isPayer = activeMember?.id === settlement.fromId;
              const isReceiver = activeMember?.id === settlement.toId;

              return (
                <div
                  key={settlement.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group bg-emerald-50/20 hover:bg-emerald-50/40 -mx-4 px-4 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">
                        {from?.name || 'Someone'} paid {to?.name || 'Someone'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-emerald-800">Settled Debt</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDate(settlement.date)}</span>
                        {settlement.method && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>via {settlement.method}</span>
                          </>
                        )}
                      </div>

                      {settlement.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {settlement.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono tabular-nums text-emerald-700 block">
                        {formatCurrency(settlement.amount, currencySymbol)}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {isPayer
                          ? 'You paid off debt'
                          : isReceiver
                          ? 'You received payment'
                          : 'Direct settlement'}
                      </span>
                    </div>

                    {/* Delete action */}
                    <div className="relative">
                      {confirmDeleteId === settlement.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <button
                            onClick={() => {
                              onDeleteSettlement(settlement.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 px-1 py-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(settlement.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Delete settlement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};
