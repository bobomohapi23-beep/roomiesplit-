import React, { useState } from 'react';
import { Roommate, ExpenseCategory } from '../types';
import { X, Check, Users, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/balance';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Roommate[];
  activeMemberId: string;
  currencySymbol: string;
  onAddExpense: (expense: {
    title: string;
    amount: number;
    paidById: string;
    splitBetweenIds: string[];
    category: ExpenseCategory;
    date: string;
    notes?: string;
  }) => void;
}

const CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Groceries', value: 'groceries' },
  { label: 'Utilities & WiFi', value: 'utilities' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Takeout & Food', value: 'takeout' },
  { label: 'Rent', value: 'rent' },
  { label: 'Streaming', value: 'streaming' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Other', value: 'other' },
];

const PRESETS = [
  { title: "Trader Joe's", cat: 'groceries' as ExpenseCategory },
  { title: 'WiFi / Internet', cat: 'utilities' as ExpenseCategory },
  { title: 'Paper Towels & Soap', cat: 'supplies' as ExpenseCategory },
  { title: 'Pizza Night', cat: 'takeout' as ExpenseCategory },
  { title: 'Electric Bill', cat: 'utilities' as ExpenseCategory },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  members,
  activeMemberId,
  currencySymbol,
  onAddExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState(activeMemberId || members[0]?.id || '');
  const [splitBetweenIds, setSplitBetweenIds] = useState<string[]>(
    members.map((m) => m.id)
  );
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const splitCount = splitBetweenIds.length;
  const perPersonShare = splitCount > 0 ? numAmount / splitCount : 0;

  const toggleMemberSplit = (memberId: string) => {
    if (splitBetweenIds.includes(memberId)) {
      if (splitBetweenIds.length === 1) {
        setError('Expense must be split between at least 1 roommate.');
        return;
      }
      setError('');
      setSplitBetweenIds(splitBetweenIds.filter((id) => id !== memberId));
    } else {
      setError('');
      setSplitBetweenIds([...splitBetweenIds, memberId]);
    }
  };

  const selectAll = () => {
    setSplitBetweenIds(members.map((m) => m.id));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a description or title for the expense.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }
    if (splitBetweenIds.length === 0) {
      setError('At least one roommate must share the expense.');
      return;
    }

    onAddExpense({
      title: title.trim(),
      amount: Math.round(numAmount * 100) / 100,
      paidById,
      splitBetweenIds,
      category,
      date,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Shared Expense</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Split equally between selected roommates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => {
                    setTitle(p.title);
                    setCategory(p.cat);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Trader Joe's groceries, WiFi bill..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Amount ({currencySymbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-semibold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 text-base font-bold font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paid By & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Who Paid? *
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === activeMemberId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Split Equally Between */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Split Equally Between ({splitCount}/{members.length})
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium underline cursor-pointer"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {members.map((member) => {
                const isSelected = splitBetweenIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMemberSplit(member.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50 text-slate-900 font-medium'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs truncate">{member.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Calculation Preview Banner */}
            {numAmount > 0 && splitCount > 0 && (
              <div className="mt-3 p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Equal Split:</span>
                <span className="font-mono font-bold tabular-nums text-slate-900">
                  {formatCurrency(perPersonShare, currencySymbol)} / person
                </span>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt was in the kitchen counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Log Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
