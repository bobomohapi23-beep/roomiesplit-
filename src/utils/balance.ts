import { Roommate, Expense, Settlement, MemberBalance, SimplifiedDebt } from '../types';

export function calculateBalances(
  members: Roommate[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, MemberBalance> {
  const balances: Record<string, MemberBalance> = {};

  // Initialize for all members
  members.forEach((m) => {
    balances[m.id] = {
      roommate: m,
      net: 0,
      totalPaid: 0,
      totalShare: 0,
    };
  });

  // Process Expenses
  expenses.forEach((expense) => {
    const payer = balances[expense.paidById];
    if (payer) {
      payer.totalPaid += expense.amount;
      payer.net += expense.amount;
    }

    const participants = expense.splitBetweenIds.filter((id) => balances[id]);
    if (participants.length > 0) {
      const share = expense.amount / participants.length;
      participants.forEach((pid) => {
        balances[pid].totalShare += share;
        balances[pid].net -= share;
      });
    }
  });

  // Process Settlements
  settlements.forEach((settlement) => {
    const fromMember = balances[settlement.fromId];
    const toMember = balances[settlement.toId];

    if (fromMember) {
      fromMember.net += settlement.amount; // paid off debt, balance rises toward 0 or positive
    }
    if (toMember) {
      toMember.net -= settlement.amount; // received payment, owed amount decreases
    }
  });

  // Rounding fix to avoid floating point precision issues like -0.000000001
  Object.values(balances).forEach((b) => {
    b.net = Math.round(b.net * 100) / 100;
    b.totalPaid = Math.round(b.totalPaid * 100) / 100;
    b.totalShare = Math.round(b.totalShare * 100) / 100;
    // Normalize -0 to 0
    if (Math.abs(b.net) < 0.005) {
      b.net = 0;
    }
  });

  return balances;
}

/**
 * Calculates minimal simplified transactions to settle all household debts
 * using a greedy matching algorithm between debtors and creditors.
 */
export function calculateSimplifiedDebts(
  members: Roommate[],
  expenses: Expense[],
  settlements: Settlement[]
): SimplifiedDebt[] {
  const balances = calculateBalances(members, expenses, settlements);

  interface BalanceNode {
    id: string;
    amount: number;
  }

  const debtors: BalanceNode[] = [];
  const creditors: BalanceNode[] = [];

  Object.values(balances).forEach((b) => {
    if (b.net < -0.01) {
      debtors.push({ id: b.roommate.id, amount: Math.abs(b.net) });
    } else if (b.net > 0.01) {
      creditors.push({ id: b.roommate.id, amount: b.net });
    }
  });

  // Sort descending by magnitude
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settleAmount * 100) / 100;

    if (roundedAmount > 0) {
      simplified.push({
        fromId: debtor.id,
        toId: creditor.id,
        amount: roundedAmount,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.009) {
      dIdx++;
    }
    if (creditor.amount < 0.009) {
      cIdx++;
    }
  }

  return simplified;
}

export function formatCurrency(amount: number, symbol = '$'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${symbol}${absAmount}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}
