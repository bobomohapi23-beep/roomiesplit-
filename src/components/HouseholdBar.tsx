import React from 'react';
import { Household, Roommate } from '../types';
import { Share2, UserCheck, ChevronDown, PlusCircle, RotateCcw } from 'lucide-react';

interface HouseholdBarProps {
  household: Household;
  households: Household[];
  activeMember: Roommate | undefined;
  onSelectMember: (memberId: string) => void;
  onSelectHousehold: (householdId: string) => void;
  onOpenInvite: () => void;
  onOpenNewHousehold: () => void;
  onResetDemo: () => void;
}

export const HouseholdBar: React.FC<HouseholdBarProps> = ({
  household,
  households,
  activeMember,
  onSelectMember,
  onSelectHousehold,
  onOpenInvite,
  onOpenNewHousehold,
  onResetDemo,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Household Info & Invite */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select
              value={household.id}
              onChange={(e) => onSelectHousehold(e.target.value)}
              className="appearance-none font-bold text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors pl-3 pr-8 py-1.5 rounded-lg text-sm cursor-pointer border-0 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Code</span>
            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {household.inviteCode}
            </span>
          </div>

          <button
            onClick={onOpenInvite}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Invite roommates with link or code"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Invite Roommates</span>
          </button>

          <button
            onClick={onOpenNewHousehold}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Create a new household in 30 seconds"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>New House</span>
          </button>
        </div>

        {/* Right: Active Persona Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 mr-1">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Active Persona:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {household.members.map((member) => {
              const isSelected = activeMember?.id === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: member.avatarColor }}
                  />
                  <span>{member.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onResetDemo}
            className="ml-auto md:ml-2 text-slate-400 hover:text-slate-600 text-xs p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline text-[11px]">Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
