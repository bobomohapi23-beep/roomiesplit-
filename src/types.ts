export interface Roommate {
  id: string;
  name: string;
  avatarColor: string;
  email?: string;
  phone?: string;
  joinedAt: string;
}

export type ExpenseCategory = 
  | 'groceries'
  | 'utilities'
  | 'supplies'
  | 'rent'
  | 'takeout'
  | 'streaming'
  | 'maintenance'
  | 'other';

export interface Expense {
  id: string;
  householdId: string;
  title: string;
  amount: number;
  paidById: string; // Roommate ID
  splitBetweenIds: string[]; // Roommate IDs sharing equally
  category: ExpenseCategory;
  date: string; // 'YYYY-MM-DD'
  notes?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  householdId: string;
  fromId: string; // Debtor who paid
  toId: string; // Creditor who received
  amount: number;
  date: string; // 'YYYY-MM-DD'
  method?: string; // 'Venmo' | 'Zelle' | 'Cash' | 'Bank Transfer' | 'Other'
  notes?: string;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  currencySymbol: string;
  members: Roommate[];
  createdAt: string;
}

export interface SimplifiedDebt {
  fromId: string;
  toId: string;
  amount: number;
}

export interface MemberBalance {
  roommate: Roommate;
  net: number; // positive = owed money, negative = owes money
  totalPaid: number;
  totalShare: number;
}
