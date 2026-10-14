import React, { useState } from 'react';
import { Household, Roommate, MemberBalance } from '../types';
import { formatCurrency } from '../utils/balance';
import { UserPlus, Share2, Shield, Sparkles, Check, Copy } from 'lucide-react';

interface RoommatesTabProps {
  household: Household;
  balances: Record<string, MemberBalance>;
  currencySymbol: string;
  onAddRoommate: (name: string) => void;
  onOpenInvite: () => void;
  onSelectMember: (memberId: string) => void;
  activeMemberId: string;
}

export const RoommatesTab: React.FC<RoommatesTabProps> = ({
  household,
  balances,
  currencySymbol,
  onAddRoommate,
  onOpenInvite,
  onSelectMember,
  activeMemberId,
}) => {
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddRoommate(name.trim());
    setName('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Household Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Active Household
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {household.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-800">
              <span>Code: {household.inviteCode}</span>
              <button
                onClick={copyCode}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={onOpenInvite}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Add Roommate Directly */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Add a Roommate
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Add anyone living in the house so expenses can be divided with them right away.
          </p>

          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="text"
              placeholder="Roommate name (e.g. Taylor)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </form>
        </div>
      </div>

      {/* Roommates Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Roommates ({household.members.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {household.members.map((member) => {
            const b = balances[member.id];
            const net = b ? b.net : 0;
            const isSelf = activeMemberId === member.id;

            return (
              <div
                key={member.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {member.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Active Persona
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block">
                      Joined {member.joinedAt || 'Recently'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums block ${
                        net > 0.01
                          ? 'text-emerald-700'
                          : net < -0.01
                          ? 'text-rose-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {net > 0.01
                        ? `+${formatCurrency(net, currencySymbol)}`
                        : formatCurrency(net, currencySymbol)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {net > 0.01 ? 'is owed' : net < -0.01 ? 'owes' : 'even'}
                    </span>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => onSelectMember(member.id)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Switch To
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* House Etiquette & Design Philosophy */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 text-slate-700">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Why RoomieSplit Works for Roommates</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          Traditional spreadsheets get abandoned, and group chats lead to awkward chasing. 
          RoomieSplit is designed around a single truth: <strong>everyone must adopt it in under 30 seconds</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-0.5">Equal Splits by Default</span>
            <span>Automatically shares expenses among all housemates with 1 click.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-0.5">Automated Settlement</span>
            <span>Mathematical debt reduction so 4 roommates only need minimal transfers.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-0.5">No Passwords to Forget</span>
            <span>Join via link or code, pick your name, and log expenses immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
