import React, { useState } from 'react';
import { Household, Roommate } from '../types';
import { X, Copy, Check, UserPlus, QrCode, Users } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  onAddRoommate: (name: string) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  household,
  onAddRoommate,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `${window.location.origin}${window.location.pathname}?code=${household.inviteCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddRoommate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoommateName.trim()) return;
    onAddRoommate(newRoommateName.trim());
    setNewRoommateName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Invite Roommates</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Get everyone in {household.name} on the same page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Share Code Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Household Invite Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-base font-bold text-slate-900 tracking-wider text-center">
                {household.inviteCode}
              </div>
              <button
                onClick={copyCode}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share Link Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Direct Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 select-all focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Toggle QR code */}
          <div className="pt-1">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-500" />
              <span>{showQR ? 'Hide QR Code' : 'Show Phone Scan QR Code'}</span>
            </button>

            {showQR && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center animate-in fade-in duration-200">
                {/* Clean inline SVG QR code mock pattern */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-2">
                  <svg
                    className="w-36 h-36"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Corner positioning squares */}
                    <rect x="5" y="5" width="26" height="26" rx="2" fill="#0f172a" />
                    <rect x="9" y="9" width="18" height="18" fill="white" />
                    <rect x="13" y="13" width="10" height="10" fill="#0f172a" />

                    <rect x="69" y="5" width="26" height="26" rx="2" fill="#0f172a" />
                    <rect x="73" y="9" width="18" height="18" fill="white" />
                    <rect x="77" y="13" width="10" height="10" fill="#0f172a" />

                    <rect x="5" y="69" width="26" height="26" rx="2" fill="#0f172a" />
                    <rect x="9" y="73" width="18" height="18" fill="white" />
                    <rect x="13" y="77" width="10" height="10" fill="#0f172a" />

                    {/* QR data matrix bits */}
                    <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="24" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="24" width="6" height="6" fill="#0f172a" />
                    <rect x="8" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="20" y="44" width="6" height="6" fill="#0f172a" />
                    <rect x="34" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="44" y="44" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="68" y="44" width="6" height="6" fill="#0f172a" />
                    <rect x="82" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="56" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="64" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="56" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="76" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="84" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="76" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="82" width="6" height="6" fill="#0f172a" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Point phone camera to join {household.name} instantly
                </p>
              </div>
            )}
          </div>

          {/* Quick Add Roommate Section */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Add Roommate Directly
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Don't want to wait for them to click? Add their name now to start splitting immediately!
            </p>

            <form onSubmit={handleAddRoommate} className="flex gap-2">
              <input
                type="text"
                placeholder="Roommate's first name..."
                value={newRoommateName}
                onChange={(e) => setNewRoommateName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Current Household Members List */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Current Roommates ({household.members.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {household.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: m.avatarColor }}
                  />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
