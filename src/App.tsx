/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Household, Expense, Settlement, Roommate, ExpenseCategory } from './types';
import {
  getInitialData,
  persistHouseholds,
  persistExpenses,
  persistSettlements,
  persistActiveHouseholdId,
  persistActiveMemberId,
  getRandomAvatarColor,
  generateInviteCode,
} from './utils/storage';
import { calculateBalances, calculateSimplifiedDebts } from './utils/balance';
import { Header } from './components/Header';
import { HouseholdBar } from './components/HouseholdBar';
import { BalanceSummary } from './components/BalanceSummary';
import { WhoOwesWhom } from './components/WhoOwesWhom';
import { ExpenseHistory } from './components/ExpenseHistory';
import { RoommatesTab } from './components/RoommatesTab';
import { SpendingTrendsChart } from './components/SpendingTrendsChart';
import { AddExpenseModal } from './components/AddExpenseModal';
import { SettleUpModal } from './components/SettleUpModal';
import { InviteModal } from './components/InviteModal';
import { NewHouseholdModal } from './components/NewHouseholdModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const initial = useMemo(() => getInitialData(), []);

  const [households, setHouseholds] = useState<Household[]>(initial.households);
  const [activeHouseholdId, setActiveHouseholdId] = useState<string>(initial.activeHouseholdId);
  const [activeMemberId, setActiveMemberId] = useState<string>(initial.activeMemberId);
  const [expenses, setExpenses] = useState<Expense[]>(initial.expenses);
  const [settlements, setSettlements] = useState<Settlement[]>(initial.settlements);

  // Tab state
  const [currentTab, setCurrentTab] = useState<'overview' | 'trends' | 'expenses' | 'debts' | 'roommates'>('overview');

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [settlePreFill, setSettlePreFill] = useState<{
    fromId?: string;
    toId?: string;
    amount?: number;
  }>({});
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNewHouseholdOpen, setIsNewHouseholdOpen] = useState(false);

  // Notification banner or toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check URL parameter for invite code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const match = households.find((h) => h.inviteCode.toUpperCase() === code.toUpperCase());
      if (match) {
        setActiveHouseholdId(match.id);
        persistActiveHouseholdId(match.id);
        showToast(`Switched to household: ${match.name}`);
      } else {
        // Invite code from someone else's link
        setIsNewHouseholdOpen(true);
      }
    }
  }, [households]);

  // Current Household
  const currentHousehold = useMemo(() => {
    return (
      households.find((h) => h.id === activeHouseholdId) ||
      households[0] || {
        id: 'hh_default',
        name: 'My Household',
        inviteCode: 'MY-HOME',
        currencySymbol: '$',
        members: [],
        createdAt: new Date().toISOString(),
      }
    );
  }, [households, activeHouseholdId]);

  // Current Active Persona
  const activeMember = useMemo(() => {
    return currentHousehold.members.find((m) => m.id === activeMemberId) || currentHousehold.members[0];
  }, [currentHousehold, activeMemberId]);

  // Filter expenses and settlements for active household
  const householdExpenses = useMemo(() => {
    return expenses.filter((e) => e.householdId === currentHousehold.id);
  }, [expenses, currentHousehold.id]);

  const householdSettlements = useMemo(() => {
    return settlements.filter((s) => s.householdId === currentHousehold.id);
  }, [settlements, currentHousehold.id]);

  // Real-time balance calculations
  const balances = useMemo(() => {
    return calculateBalances(
      currentHousehold.members,
      householdExpenses,
      householdSettlements
    );
  }, [currentHousehold.members, householdExpenses, householdSettlements]);

  // Simplified debts (who owes whom)
  const simplifiedDebts = useMemo(() => {
    return calculateSimplifiedDebts(
      currentHousehold.members,
      householdExpenses,
      householdSettlements
    );
  }, [currentHousehold.members, householdExpenses, householdSettlements]);

  // Member selection
  const handleSelectMember = (memberId: string) => {
    setActiveMemberId(memberId);
    persistActiveMemberId(memberId);
    const m = currentHousehold.members.find((x) => x.id === memberId);
    if (m) showToast(`Viewing as ${m.name}`);
  };

  // Household selection
  const handleSelectHousehold = (householdId: string) => {
    setActiveHouseholdId(householdId);
    persistActiveHouseholdId(householdId);
    const target = households.find((h) => h.id === householdId);
    if (target && target.members.length > 0) {
      setActiveMemberId(target.members[0].id);
      persistActiveMemberId(target.members[0].id);
    }
  };

  // Add Expense Handler
  const handleAddExpense = (newExp: {
    title: string;
    amount: number;
    paidById: string;
    splitBetweenIds: string[];
    category: ExpenseCategory;
    date: string;
    notes?: string;
  }) => {
    const expense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      householdId: currentHousehold.id,
      title: newExp.title,
      amount: newExp.amount,
      paidById: newExp.paidById,
      splitBetweenIds: newExp.splitBetweenIds,
      category: newExp.category,
      date: newExp.date,
      notes: newExp.notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [expense, ...expenses];
    setExpenses(updated);
    persistExpenses(updated);
    showToast(`Logged "${expense.title}" ($${expense.amount.toFixed(2)})`);
  };

  // Delete Expense Handler
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    persistExpenses(updated);
    showToast('Expense deleted');
  };

  // Settle Up Handler
  const handleSettleUp = (newStl: {
    fromId: string;
    toId: string;
    amount: number;
    date: string;
    method?: string;
    notes?: string;
  }) => {
    const settlement: Settlement = {
      id: `stl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      householdId: currentHousehold.id,
      fromId: newStl.fromId,
      toId: newStl.toId,
      amount: newStl.amount,
      date: newStl.date,
      method: newStl.method,
      notes: newStl.notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [settlement, ...settlements];
    setSettlements(updated);
    persistSettlements(updated);

    const fromName = currentHousehold.members.find((m) => m.id === newStl.fromId)?.name || 'Roommate';
    const toName = currentHousehold.members.find((m) => m.id === newStl.toId)?.name || 'Roommate';
    showToast(`${fromName} paid ${toName} $${newStl.amount.toFixed(2)}`);
  };

  // Delete Settlement Handler
  const handleDeleteSettlement = (id: string) => {
    const updated = settlements.filter((s) => s.id !== id);
    setSettlements(updated);
    persistSettlements(updated);
    showToast('Settlement record removed');
  };

  // Open Settle Up with prefilled data
  const handleOpenSettleWithPrefill = (fromId?: string, toId?: string, amount?: number) => {
    setSettlePreFill({ fromId, toId, amount });
    setIsSettleUpOpen(true);
  };

  // Add Roommate to current household
  const handleAddRoommate = (name: string) => {
    const newMember: Roommate = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      avatarColor: getRandomAvatarColor(currentHousehold.members.length),
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const updatedHouseholds = households.map((h) => {
      if (h.id === currentHousehold.id) {
        return {
          ...h,
          members: [...h.members, newMember],
        };
      }
      return h;
    });

    setHouseholds(updatedHouseholds);
    persistHouseholds(updatedHouseholds);
    showToast(`Added ${name} to ${currentHousehold.name}`);
  };

  // Create New Household
  const handleCreateHousehold = (
    name: string,
    yourName: string,
    initialRoommates: string[]
  ) => {
    const creatorId = `usr_${Date.now()}`;
    const members: Roommate[] = [
      {
        id: creatorId,
        name: yourName,
        avatarColor: getRandomAvatarColor(0),
        joinedAt: new Date().toISOString().split('T')[0],
      },
    ];

    initialRoommates.forEach((rName, idx) => {
      members.push({
        id: `usr_${Date.now()}_${idx + 1}`,
        name: rName,
        avatarColor: getRandomAvatarColor(idx + 1),
        joinedAt: new Date().toISOString().split('T')[0],
      });
    });

    const newHh: Household = {
      id: `hh_${Date.now()}`,
      name,
      inviteCode: generateInviteCode(name),
      currencySymbol: '$',
      members,
      createdAt: new Date().toISOString(),
    };

    const updated = [newHh, ...households];
    setHouseholds(updated);
    persistHouseholds(updated);

    setActiveHouseholdId(newHh.id);
    persistActiveHouseholdId(newHh.id);

    setActiveMemberId(creatorId);
    persistActiveMemberId(creatorId);

    showToast(`Created ${name}! Invite roommates with code ${newHh.inviteCode}`);
  };

  // Join Existing Household with Code
  const handleJoinHousehold = (code: string, yourName: string): boolean => {
    const targetIndex = households.findIndex(
      (h) => h.inviteCode.toUpperCase() === code.toUpperCase()
    );

    if (targetIndex === -1) {
      return false;
    }

    const targetHh = households[targetIndex];
    // Check if user name already exists
    let user = targetHh.members.find(
      (m) => m.name.toLowerCase() === yourName.toLowerCase()
    );

    let updatedHouseholds = [...households];

    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: yourName,
        avatarColor: getRandomAvatarColor(targetHh.members.length),
        joinedAt: new Date().toISOString().split('T')[0],
      };

      const updatedHh = {
        ...targetHh,
        members: [...targetHh.members, user],
      };

      updatedHouseholds[targetIndex] = updatedHh;
      setHouseholds(updatedHouseholds);
      persistHouseholds(updatedHouseholds);
    }

    setActiveHouseholdId(targetHh.id);
    persistActiveHouseholdId(targetHh.id);

    setActiveMemberId(user.id);
    persistActiveMemberId(user.id);

    showToast(`Joined ${targetHh.name} as ${yourName}!`);
    return true;
  };

  // Reset to default demo data
  const handleResetDemo = () => {
    localStorage.clear();
    const fresh = getInitialData();
    setHouseholds(fresh.households);
    setActiveHouseholdId(fresh.activeHouseholdId);
    setActiveMemberId(fresh.activeMemberId);
    setExpenses(fresh.expenses);
    setSettlements(fresh.settlements);
    showToast('Reset to default Apartment 4B demo data');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20 md:pb-12 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Household Selector & Active Member Persona Bar */}
      <HouseholdBar
        household={currentHousehold}
        households={households}
        activeMember={activeMember}
        onSelectMember={handleSelectMember}
        onSelectHousehold={handleSelectHousehold}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenNewHousehold={() => setIsNewHouseholdOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Top: Running Balance & Roommate Roster */}
            <BalanceSummary
              activeMember={activeMember}
              balances={balances}
              members={currentHousehold.members}
              currencySymbol={currentHousehold.currencySymbol}
              onOpenSettleUp={(fromId, toId, amount) =>
                handleOpenSettleWithPrefill(fromId, toId, amount)
              }
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            />

            {/* Monthly Household Spending Trends Chart */}
            <SpendingTrendsChart
              expenses={householdExpenses}
              currencySymbol={currentHousehold.currencySymbol}
            />

            {/* Split Grid: Who Owes Whom (Left) & Expense History (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-6">
                <WhoOwesWhom
                  debts={simplifiedDebts}
                  members={currentHousehold.members}
                  activeMember={activeMember}
                  currencySymbol={currentHousehold.currencySymbol}
                  onSettleDebt={(fromId, toId, amount) =>
                    handleOpenSettleWithPrefill(fromId, toId, amount)
                  }
                />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <ExpenseHistory
                  expenses={householdExpenses}
                  settlements={householdSettlements}
                  members={currentHousehold.members}
                  currencySymbol={currentHousehold.currencySymbol}
                  activeMember={activeMember}
                  onDeleteExpense={handleDeleteExpense}
                  onDeleteSettlement={handleDeleteSettlement}
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === 'trends' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <SpendingTrendsChart
              expenses={householdExpenses}
              currencySymbol={currentHousehold.currencySymbol}
            />

            {/* Monthly Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Historical Monthly Ledger
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Total shared spend recorded across each billing period
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3">Expenses Logged</th>
                      <th className="py-2.5 px-3">Top Category</th>
                      <th className="py-2.5 px-3 text-right">Average / Item</th>
                      <th className="py-2.5 px-3 text-right">Total Household Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {(() => {
                      const byMonth: Record<string, { total: number; count: number; cats: Record<string, number> }> = {};
                      householdExpenses.forEach((exp) => {
                        const mKey = exp.date ? exp.date.substring(0, 7) : 'Unknown';
                        if (!byMonth[mKey]) byMonth[mKey] = { total: 0, count: 0, cats: {} };
                        byMonth[mKey].total += exp.amount;
                        byMonth[mKey].count += 1;
                        byMonth[mKey].cats[exp.category] = (byMonth[mKey].cats[exp.category] || 0) + exp.amount;
                      });

                      const sortedKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));
                      if (sortedKeys.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                              No expenses recorded yet.
                            </td>
                          </tr>
                        );
                      }

                      return sortedKeys.map((key) => {
                        const item = byMonth[key];
                        let topCat = 'General';
                        let maxVal = 0;
                        Object.entries(item.cats).forEach(([cat, val]) => {
                          if (val > maxVal) {
                            maxVal = val;
                            topCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                          }
                        });

                        const dateObj = new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]) - 1, 1);
                        const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                        return (
                          <tr key={key} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3 font-sans font-bold text-slate-900">{monthLabel}</td>
                            <td className="py-3 px-3 text-slate-600">{item.count} items</td>
                            <td className="py-3 px-3 font-sans text-slate-600">{topCat}</td>
                            <td className="py-3 px-3 text-right text-slate-600">
                              {currentHousehold.currencySymbol}{(item.total / item.count).toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                              {currentHousehold.currencySymbol}{item.total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'debts' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <WhoOwesWhom
              debts={simplifiedDebts}
              members={currentHousehold.members}
              activeMember={activeMember}
              currencySymbol={currentHousehold.currencySymbol}
              onSettleDebt={(fromId, toId, amount) =>
                handleOpenSettleWithPrefill(fromId, toId, amount)
              }
            />

            <BalanceSummary
              activeMember={activeMember}
              balances={balances}
              members={currentHousehold.members}
              currencySymbol={currentHousehold.currencySymbol}
              onOpenSettleUp={(fromId, toId, amount) =>
                handleOpenSettleWithPrefill(fromId, toId, amount)
              }
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            />
          </div>
        )}

        {currentTab === 'expenses' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <ExpenseHistory
              expenses={householdExpenses}
              settlements={householdSettlements}
              members={currentHousehold.members}
              currencySymbol={currentHousehold.currencySymbol}
              activeMember={activeMember}
              onDeleteExpense={handleDeleteExpense}
              onDeleteSettlement={handleDeleteSettlement}
            />
          </div>
        )}

        {currentTab === 'roommates' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <RoommatesTab
              household={currentHousehold}
              balances={balances}
              currencySymbol={currentHousehold.currencySymbol}
              onAddRoommate={handleAddRoommate}
              onOpenInvite={() => setIsInviteOpen(true)}
              onSelectMember={handleSelectMember}
              activeMemberId={activeMemberId}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        members={currentHousehold.members}
        activeMemberId={activeMemberId}
        currencySymbol={currentHousehold.currencySymbol}
        onAddExpense={handleAddExpense}
      />

      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        members={currentHousehold.members}
        currencySymbol={currentHousehold.currencySymbol}
        defaultFromId={settlePreFill.fromId}
        defaultToId={settlePreFill.toId}
        defaultAmount={settlePreFill.amount}
        onSettleUp={handleSettleUp}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        household={currentHousehold}
        onAddRoommate={handleAddRoommate}
      />

      <NewHouseholdModal
        isOpen={isNewHouseholdOpen}
        onClose={() => setIsNewHouseholdOpen(false)}
        onCreateHousehold={handleCreateHousehold}
        onJoinHousehold={handleJoinHousehold}
      />
    </div>
  );
}
