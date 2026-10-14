import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/balance';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Calendar, Layers, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SpendingTrendsChartProps {
  expenses: Expense[];
  currencySymbol: string;
}

interface MonthlyData {
  monthKey: string; // '2026-08'
  label: string; // 'Aug 2026'
  shortLabel: string; // 'Aug'
  total: number;
  count: number;
  groceries: number;
  utilities: number;
  supplies: number;
  takeout: number;
  rent: number;
  other: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  groceries: '#059669', // emerald
  utilities: '#d97706', // amber
  supplies: '#2563eb', // blue
  takeout: '#e11d48', // rose
  rent: '#7c3aed', // violet
  other: '#64748b', // slate
};

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
  expenses,
  currencySymbol,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'area' | 'stacked'>('bar');

  // Aggregate expenses month-by-month
  const monthlyData: MonthlyData[] = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const monthMap: Record<string, MonthlyData> = {};

    expenses.forEach((expense) => {
      if (!expense.date) return;
      const [year, month] = expense.date.split('-');
      if (!year || !month) return;

      const key = `${year}-${month}`;
      if (!monthMap[key]) {
        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const shortLabel = dateObj.toLocaleDateString('en-US', { month: 'short' });

        monthMap[key] = {
          monthKey: key,
          label,
          shortLabel,
          total: 0,
          count: 0,
          groceries: 0,
          utilities: 0,
          supplies: 0,
          takeout: 0,
          rent: 0,
          other: 0,
        };
      }

      const entry = monthMap[key];
      entry.total += expense.amount;
      entry.count += 1;

      // Group into primary categories
      const cat = expense.category;
      if (cat === 'groceries') entry.groceries += expense.amount;
      else if (cat === 'utilities') entry.utilities += expense.amount;
      else if (cat === 'supplies') entry.supplies += expense.amount;
      else if (cat === 'takeout') entry.takeout += expense.amount;
      else if (cat === 'rent') entry.rent += expense.amount;
      else entry.other += expense.amount;
    });

    // Sort chronologically by YYYY-MM
    return Object.values(monthMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [expenses]);

  // High-level statistics
  const stats = useMemo(() => {
    if (monthlyData.length === 0) {
      return { totalSpend: 0, avgMonthly: 0, peakMonth: null, momDelta: null };
    }

    const totalSpend = monthlyData.reduce((acc, m) => acc + m.total, 0);
    const avgMonthly = totalSpend / monthlyData.length;

    let peakMonth = monthlyData[0];
    monthlyData.forEach((m) => {
      if (m.total > peakMonth.total) peakMonth = m;
    });

    // Month-over-month calculation for the latest 2 months
    let momDelta: { percent: number; isIncrease: boolean; diff: number } | null = null;
    if (monthlyData.length >= 2) {
      const current = monthlyData[monthlyData.length - 1].total;
      const previous = monthlyData[monthlyData.length - 2].total;
      if (previous > 0) {
        const diff = current - previous;
        const percent = Math.abs((diff / previous) * 100);
        momDelta = {
          percent: Math.round(percent * 10) / 10,
          isIncrease: diff > 0,
          diff: Math.abs(diff),
        };
      }
    }

    return { totalSpend, avgMonthly, peakMonth, momDelta };
  }, [monthlyData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyData = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[190px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 font-medium">
            <span className="text-slate-300">{data.label}</span>
            <span className="text-slate-400">{data.count} {data.count === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="mb-2">
            <span className="text-slate-400 block text-[11px]">Total Household Spend</span>
            <span className="text-base font-bold font-mono tabular-nums text-white">
              {formatCurrency(data.total, currencySymbol)}
            </span>
          </div>

          {chartType === 'stacked' && (
            <div className="space-y-1 pt-1.5 border-t border-slate-800 text-[11px] font-mono tabular-nums">
              {data.groceries > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Groceries
                  </span>
                  <span>{formatCurrency(data.groceries, currencySymbol)}</span>
                </div>
              )}
              {data.utilities > 0 && (
                <div className="flex items-center justify-between text-amber-400">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Utilities
                  </span>
                  <span>{formatCurrency(data.utilities, currencySymbol)}</span>
                </div>
              )}
              {data.supplies > 0 && (
                <div className="flex items-center justify-between text-blue-400">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Supplies
                  </span>
                  <span>{formatCurrency(data.supplies, currencySymbol)}</span>
                </div>
              )}
              {data.takeout > 0 && (
                <div className="flex items-center justify-between text-rose-400">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Takeout
                  </span>
                  <span>{formatCurrency(data.takeout, currencySymbol)}</span>
                </div>
              )}
              {data.other > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Other
                  </span>
                  <span>{formatCurrency(data.other, currencySymbol)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">Household Spending Trends</h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              · Month-by-Month Breakdown
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracking collective household living costs over time
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              chartType === 'bar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
          <button
            onClick={() => setChartType('stacked')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              chartType === 'stacked'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Category</span>
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              chartType === 'area'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trend Area</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mb-6">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
            Average Monthly
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(stats.avgMonthly, currencySymbol)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            across {monthlyData.length} {monthlyData.length === 1 ? 'month' : 'months'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
            Total Tracked
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(stats.totalSpend, currencySymbol)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {expenses.length} shared expenses
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
            Peak Month
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {stats.peakMonth ? formatCurrency(stats.peakMonth.total, currencySymbol) : '$0.00'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            {stats.peakMonth?.label || 'N/A'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
            MoM Spending
          </span>
          {stats.momDelta ? (
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {stats.momDelta.percent}%
              </span>
              <span
                className={`flex items-center text-xs font-semibold ${
                  stats.momDelta.isIncrease ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {stats.momDelta.isIncrease ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{stats.momDelta.isIncrease ? 'higher' : 'lower'}</span>
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-400">Needs 2+ mos</span>
          )}
          <span className="text-[10px] text-slate-400 block mt-0.5">
            vs prior month
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      {monthlyData.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No monthly data to chart yet</p>
          <p className="text-xs text-slate-400 mt-1">Log shared expenses with dates to view trends.</p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                  activeDot={{ r: 5, fill: '#0f172a' }}
                />
              </AreaChart>
            ) : chartType === 'stacked' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="groceries" stackId="a" fill={CATEGORY_COLORS.groceries} name="Groceries" />
                <Bar dataKey="utilities" stackId="a" fill={CATEGORY_COLORS.utilities} name="Utilities" />
                <Bar dataKey="supplies" stackId="a" fill={CATEGORY_COLORS.supplies} name="Supplies" />
                <Bar dataKey="takeout" stackId="a" fill={CATEGORY_COLORS.takeout} name="Takeout" />
                <Bar dataKey="rent" stackId="a" fill={CATEGORY_COLORS.rent} name="Rent" />
                <Bar dataKey="other" stackId="a" fill={CATEGORY_COLORS.other} name="Other" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  fill="#0f172a"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Legend (when in Stacked mode) */}
      {chartType === 'stacked' && (
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.groceries }} />
            <span>Groceries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.utilities }} />
            <span>Utilities</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.supplies }} />
            <span>Supplies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.takeout }} />
            <span>Takeout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS.other }} />
            <span>Other</span>
          </div>
        </div>
      )}
    </div>
  );
};
