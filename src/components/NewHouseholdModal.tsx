import React, { useState } from 'react';
import { X, Home, KeyRound } from 'lucide-react';

interface NewHouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateHousehold: (name: string, yourName: string, initialRoommates: string[]) => void;
  onJoinHousehold: (code: string, yourName: string) => boolean;
}

export const NewHouseholdModal: React.FC<NewHouseholdModalProps> = ({
  isOpen,
  onClose,
  onCreateHousehold,
  onJoinHousehold,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [householdName, setHouseholdName] = useState('');
  const [yourName, setYourName] = useState('');
  const [roommatesInput, setRoommatesInput] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) {
      setError('Please provide a household or apartment name.');
      return;
    }
    if (!yourName.trim()) {
      setError('Please enter your name.');
      return;
    }

    const otherRoommates = roommatesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onCreateHousehold(householdName.trim(), yourName.trim(), otherRoommates);
    onClose();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter an invite code.');
      return;
    }
    if (!yourName.trim()) {
      setError('Please enter your name.');
      return;
    }

    const success = onJoinHousehold(joinCode.trim().toUpperCase(), yourName.trim());
    if (!success) {
      setError('Household with that code was not found. Check the code and try again.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'create' ? 'Create New Household' : 'Join Existing Household'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set up in under 30 seconds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'create'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Create Household</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('join');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'join'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Join with Code</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Household Name *
              </label>
              <input
                type="text"
                placeholder="e.g. 742 Evergreen Terrace, Unit 4B"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roommates (Optional, comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Jordan, Maya, Sam"
                value={roommatesInput}
                onChange={(e) => setRoommatesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                You can also add or invite roommates later with a link.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Create Household
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit Invite Code *
              </label>
              <input
                type="text"
                placeholder="e.g. ELM-402"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Taylor"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Join Household
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
