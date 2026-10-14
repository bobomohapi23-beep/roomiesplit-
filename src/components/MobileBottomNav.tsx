import React from 'react';
import { Home, ArrowLeftRight, Receipt, Users, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'overview' | 'trends' | 'debts' | 'expenses' | 'roommates';
  onTabChange: (tab: 'overview' | 'trends' | 'debts' | 'expenses' | 'roommates') => void;
  onOpenAddExpense: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAddExpense,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'overview' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </button>

        {/* Tab 2: Debts */}
        <button
          onClick={() => onTabChange('debts')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'debts' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Debts</span>
        </button>

        {/* Center: Add Expense floating CTA */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenAddExpense}
            className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer -mt-5"
            title="Add Shared Expense"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 3: History */}
        <button
          onClick={() => onTabChange('expenses')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'expenses' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Activity</span>
        </button>

        {/* Tab 4: Roommates */}
        <button
          onClick={() => onTabChange('roommates')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'roommates' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">House</span>
        </button>
      </div>
    </div>
  );
};
