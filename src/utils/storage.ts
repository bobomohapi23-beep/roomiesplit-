import { Household, Expense, Settlement, Roommate } from '../types';

const STORAGE_KEYS = {
  HOUSEHOLDS: 'roomiesplit_households_v1',
  ACTIVE_HOUSEHOLD_ID: 'roomiesplit_active_household_id_v1',
  ACTIVE_MEMBER_ID: 'roomiesplit_active_member_id_v1',
  EXPENSES: 'roomiesplit_expenses_v1',
  SETTLEMENTS: 'roomiesplit_settlements_v1',
};

const DEFAULT_MEMBERS: Roommate[] = [
  { id: 'usr_alex', name: 'Alex', avatarColor: '#0284c7', joinedAt: '2026-09-01' },
  { id: 'usr_jordan', name: 'Jordan', avatarColor: '#16a34a', joinedAt: '2026-09-01' },
  { id: 'usr_maya', name: 'Maya', avatarColor: '#d97706', joinedAt: '2026-09-01' },
  { id: 'usr_sam', name: 'Sam', avatarColor: '#9333ea', joinedAt: '2026-09-01' },
];

const DEFAULT_HOUSEHOLD: Household = {
  id: 'hh_elm_4b',
  name: 'Apartment 4B (Elm St.)',
  inviteCode: 'ELM-402',
  currencySymbol: '$',
  members: DEFAULT_MEMBERS,
  createdAt: '2026-09-01',
};

const getRecentDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    householdId: 'hh_elm_4b',
    title: "Trader Joe's Groceries & Olive Oil",
    amount: 88.00,
    paidById: 'usr_alex',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'groceries',
    date: getRecentDate(1),
    notes: 'Coffee beans, eggs, milk, fruits, dish soap, olive oil',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'exp_2',
    householdId: 'hh_elm_4b',
    title: 'High-speed Fiber WiFi',
    amount: 60.00,
    paidById: 'usr_jordan',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'utilities',
    date: getRecentDate(3),
    notes: 'Monthly Gigabit internet bill',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'exp_3',
    householdId: 'hh_elm_4b',
    title: 'Paper Towels & Trash Bags (Costco)',
    amount: 36.00,
    paidById: 'usr_maya',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'supplies',
    date: getRecentDate(5),
    notes: 'Bulk paper towels and heavy-duty kitchen bags',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'exp_4',
    householdId: 'hh_elm_4b',
    title: 'Friday Night Pizza Box',
    amount: 42.00,
    paidById: 'usr_sam',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_sam'], // Maya was out of town
    category: 'takeout',
    date: getRecentDate(6),
    notes: '2 Large pizzas from Corner Slice (Maya was away)',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  // September 2026
  {
    id: 'exp_sep_1',
    householdId: 'hh_elm_4b',
    title: 'September Electric & Gas Bill',
    amount: 114.00,
    paidById: 'usr_alex',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'utilities',
    date: '2026-09-22',
    notes: 'Late summer AC and heating power',
    createdAt: '2026-09-22T14:30:00.000Z',
  },
  {
    id: 'exp_sep_2',
    householdId: 'hh_elm_4b',
    title: 'Costco Food & Pantry Stock-up',
    amount: 156.00,
    paidById: 'usr_jordan',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'groceries',
    date: '2026-09-14',
    notes: 'Olive oil, oat milk, pasta, rice, and snacks',
    createdAt: '2026-09-14T11:00:00.000Z',
  },
  {
    id: 'exp_sep_3',
    householdId: 'hh_elm_4b',
    title: 'High-speed Fiber WiFi',
    amount: 60.00,
    paidById: 'usr_jordan',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'utilities',
    date: '2026-09-03',
    notes: 'September Gigabit internet',
    createdAt: '2026-09-03T09:00:00.000Z',
  },
  // August 2026
  {
    id: 'exp_aug_1',
    householdId: 'hh_elm_4b',
    title: 'Move-in Household Essentials & Cleaning',
    amount: 88.50,
    paidById: 'usr_maya',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'supplies',
    date: '2026-08-28',
    notes: 'Mop, broom, sponges, disinfectant, toilet cleaner',
    createdAt: '2026-08-28T16:00:00.000Z',
  },
  {
    id: 'exp_aug_2',
    householdId: 'hh_elm_4b',
    title: 'Trader Joe’s Weekly Staples',
    amount: 135.00,
    paidById: 'usr_alex',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'groceries',
    date: '2026-08-18',
    notes: 'Breakfast foods, produce, eggs, bread',
    createdAt: '2026-08-18T10:15:00.000Z',
  },
  {
    id: 'exp_aug_3',
    householdId: 'hh_elm_4b',
    title: 'High-speed Fiber WiFi',
    amount: 60.00,
    paidById: 'usr_jordan',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'utilities',
    date: '2026-08-04',
    notes: 'August internet bill',
    createdAt: '2026-08-04T09:00:00.000Z',
  },
  {
    id: 'exp_aug_4',
    householdId: 'hh_elm_4b',
    title: 'Apartment Keys & Locksmith Copies',
    amount: 45.00,
    paidById: 'usr_sam',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'maintenance',
    date: '2026-08-02',
    notes: 'Extra front door keys for all 4 roommates',
    createdAt: '2026-08-02T13:00:00.000Z',
  },
  // July 2026
  {
    id: 'exp_jul_1',
    householdId: 'hh_elm_4b',
    title: 'July Electric & Summer AC',
    amount: 98.00,
    paidById: 'usr_alex',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'utilities',
    date: '2026-07-25',
    notes: 'Power bill for peak summer heat',
    createdAt: '2026-07-25T15:20:00.000Z',
  },
  {
    id: 'exp_jul_2',
    householdId: 'hh_elm_4b',
    title: 'Shared Kitchen Utensils & Cookware',
    amount: 82.00,
    paidById: 'usr_sam',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'supplies',
    date: '2026-07-16',
    notes: 'Pots, pans, cutting boards for shared kitchen',
    createdAt: '2026-07-16T12:00:00.000Z',
  },
  {
    id: 'exp_jul_3',
    householdId: 'hh_elm_4b',
    title: 'High-speed Fiber WiFi Setup',
    amount: 75.00,
    paidById: 'usr_jordan',
    splitBetweenIds: ['usr_alex', 'usr_jordan', 'usr_maya', 'usr_sam'],
    category: 'utilities',
    date: '2026-07-02',
    notes: 'Activation and first month fiber internet',
    createdAt: '2026-07-02T09:00:00.000Z',
  },
];

const DEFAULT_SETTLEMENTS: Settlement[] = [
  {
    id: 'stl_1',
    householdId: 'hh_elm_4b',
    fromId: 'usr_jordan',
    toId: 'usr_alex',
    amount: 15.00,
    date: getRecentDate(2),
    method: 'Venmo',
    notes: 'Partial payback for groceries',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getInitialData() {
  try {
    const rawHouseholds = localStorage.getItem(STORAGE_KEYS.HOUSEHOLDS);
    let households: Household[] = rawHouseholds ? JSON.parse(rawHouseholds) : [];

    if (!households || households.length === 0) {
      households = [DEFAULT_HOUSEHOLD];
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(DEFAULT_SETTLEMENTS));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_HOUSEHOLD_ID, DEFAULT_HOUSEHOLD.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, DEFAULT_MEMBERS[0].id);
    }

    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    let expenses: Expense[] = rawExpenses ? JSON.parse(rawExpenses) : DEFAULT_EXPENSES;
    if (expenses.length <= 4 && DEFAULT_EXPENSES.length > 4) {
      expenses = DEFAULT_EXPENSES;
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    }

    const rawSettlements = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    const settlements: Settlement[] = rawSettlements ? JSON.parse(rawSettlements) : DEFAULT_SETTLEMENTS;

    const activeHouseholdId = localStorage.getItem(STORAGE_KEYS.ACTIVE_HOUSEHOLD_ID) || households[0].id;
    const currentHousehold = households.find((h) => h.id === activeHouseholdId) || households[0];

    let activeMemberId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER_ID);
    if (!activeMemberId || !currentHousehold.members.some((m) => m.id === activeMemberId)) {
      activeMemberId = currentHousehold.members[0]?.id || '';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, activeMemberId);
    }

    return {
      households,
      activeHouseholdId: currentHousehold.id,
      activeMemberId,
      expenses,
      settlements,
    };
  } catch (e) {
    console.error('Failed to load local storage:', e);
    return {
      households: [DEFAULT_HOUSEHOLD],
      activeHouseholdId: DEFAULT_HOUSEHOLD.id,
      activeMemberId: DEFAULT_MEMBERS[0].id,
      expenses: DEFAULT_EXPENSES,
      settlements: DEFAULT_SETTLEMENTS,
    };
  }
}

export function persistHouseholds(households: Household[]) {
  localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households));
}

export function persistExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function persistSettlements(settlements: Settlement[]) {
  localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
}

export function persistActiveHouseholdId(id: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_HOUSEHOLD_ID, id);
}

export function persistActiveMemberId(id: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, id);
}

const AVATAR_COLORS = [
  '#0284c7', // Sky blue
  '#16a34a', // Emerald green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#ea580c', // Orange
  '#4f46e5', // Indigo
];

export function getRandomAvatarColor(index: number = 0): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function generateInviteCode(householdName: string): string {
  const prefix = householdName
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'APT';
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
}
