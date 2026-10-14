import React, { useState, useEffect } from 'react';
import { Roommate } from '../types';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/balance';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Roommate[];
  currencySymbol: string;
  defaultFromId?: string;
  defaultToId?: string;
  defaultAmount?: number;
  onSettleUp: (settlement: {
    fromId: string;
    toId: string;
    amount: number;
    date: string;
    method?: string;
    notes?: string;
  }) => void;
}

const METHODS = ['Venmo', 'Zelle', 'Cash', 'Bank Transfer', 'Other'];

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  members,
  currencySymbol,
  defaultFromId,
  defaultToId,
  defaultAmount,
  onSettleUp,
}) => {
  const [fromId, setFromId] = useState(defaultFromId || members[0]?.id || '');
  const [toId, setToId] = useState(
    defaultToId || (members.length > 1 ? members[1]?.id : members[0]?.id || '')
  );
  const [amount, setAmount] = useState(defaultAmount ? defaultAmount.toFixed(2) : '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Venmo');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (defaultFromId) setFromId(defaultFromId);
    if (defaultToId) setToId(defaultToId);
    if (defaultAmount !== undefined && defaultAmount > 0) {
      setAmount(defaultAmount.toFixed(2));
    }
  }, [defaultFromId, defaultToId, defaultAmount]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const fromMember = members.find((m) => m.id === fromId);
  const toMember = members.find((m) => m.id === toId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) {
      setError('Please select both the paying and receiving roommate.');
      return;
    }
    if (fromId === toId) {
      setError('Payer and receiver cannot be the same person.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please enter a valid settlement amount.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onSettleUp({
        fromId,
        toId,
        amount: Math.round(numAmount * 100) / 100,
        date,
        method,
        notes: notes.trim() || undefined,
      });
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        {isSuccess ? (
          <div className="py-8 text-center animate-in zoom-in-90 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Debt Settled!
            </h3>
            <p className="text-xs text-slate-600">
              {fromMember?.name} paid {toMember?.name}{' '}
              {formatCurrency(numAmount, currencySymbol)}. Balance updated.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Settle Up Debt</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record a payment and balance it out
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
              {/* Visual Flow Indicator */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 block mb-1">Who Paid</span>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: fromMember?.avatarColor }}
                    />
                    <span>{fromMember?.name || 'Select'}</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400" />

                <div className="text-center">
                  <span className="text-[11px] text-slate-500 block mb-1">Who Received</span>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: toMember?.avatarColor }}
                    />
                    <span>{toMember?.name || 'Select'}</span>
                  </div>
                </div>
              </div>

              {/* Selectors for Payer and Receiver */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payer *
                  </label>
                  <select
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Receiver *
                  </label>
                  <select
                    value={toId}
                    onChange={(e) => setToId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Settled ({currencySymbol}) *
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

              {/* Method and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent via Venmo confirmation #124"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Submit Buttons */}
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
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Paid</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
