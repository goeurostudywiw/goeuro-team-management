'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  Building,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Calculator,
  Lock
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function FinancePayrollPage() {
  const { language } = useLanguage();
  const isBurmese = language === 'my';
  const { currentUser, can } = useUserSession();

  const isFounder = currentUser?.role?.name === 'Founder' || currentUser?.email === 'thn@goeuro.de';
  const hasFinanceAccess = isFounder || can('finance:view') || can('*');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payroll'>('overview');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [currencyMode, setCurrencyMode] = useState<'MMK' | 'EUR'>('MMK');
  const exchangeRate = 4500; // 1 EUR = 4,500 MMK

  // Data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txSummary, setTxSummary] = useState<any>({
    totalIncomeEur: 0,
    totalExpenseEur: 0,
    netProfitEur: 0,
    totalIncomeMmk: 0,
    totalExpenseMmk: 0,
    netProfitMmk: 0,
    profitMargin: 0,
  });

  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<any>({
    totalPayrollMmk: 0,
    totalPayrollEur: 0,
    staffCount: 0,
    paidCount: 0,
    pendingCount: 0,
  });

  const [loading, setLoading] = useState(true);

  // Filter state for transactions
  const [txFilterType, setTxFilterType] = useState<string>('ALL');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('ALL');

  // Modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [newTxData, setNewTxData] = useState({
    title: '',
    category: 'TUITION_FEE',
    amount: '',
    currency: 'MMK',
    paymentMethod: 'KBZPAY',
    description: '',
    status: 'CONFIRMED',
    date: new Date().toISOString().split('T')[0],
  });

  const [isEditPayrollModalOpen, setIsEditPayrollModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);

  // Fetch Finance Data
  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [txRes, prRes] = await Promise.all([
        fetch(`/api/finance/transactions?month=${selectedMonth}`),
        fetch(`/api/finance/payroll?month=${selectedMonth}`),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
        setTxSummary(txData.summary || {});
      }

      if (prRes.ok) {
        const prData = await prRes.json();
        setPayrolls(prData.payrolls || []);
        setPayrollSummary(prData.summary || {});
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFinanceAccess) {
      fetchFinanceData();
    }
  }, [selectedMonth, hasFinanceAccess]);

  // Handle Add Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxData.title || !newTxData.amount) return;

    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTxData,
          type: newTxType,
          exchangeRate,
          createdById: currentUser?.id,
        }),
      });

      if (res.ok) {
        setIsAddTxModalOpen(false);
        setNewTxData({
          title: '',
          category: newTxType === 'INCOME' ? 'TUITION_FEE' : 'MARKETING_AD_SPEND',
          amount: '',
          currency: 'MMK',
          paymentMethod: 'KBZPAY',
          description: '',
          status: 'CONFIRMED',
          date: new Date().toISOString().split('T')[0],
        });
        fetchFinanceData();
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTx = async (id: string) => {
    if (!confirm(isBurmese ? 'ဤမှတ်တမ်းကို ဖျက်ရန် သေချာပါသလား?' : 'Delete this financial transaction?')) return;
    try {
      await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' });
      fetchFinanceData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Staff Payroll
  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayroll) return;

    try {
      const res = await fetch('/api/finance/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedPayroll.userId || selectedPayroll.user?.id,
          month: selectedMonth,
          baseSalary: selectedPayroll.baseSalary,
          currency: selectedPayroll.currency,
          caseCommissions: selectedPayroll.caseCommissions,
          leadBonuses: selectedPayroll.leadBonuses,
          performanceBonus: selectedPayroll.performanceBonus,
          deductions: selectedPayroll.deductions,
          casesCount: selectedPayroll.casesCount,
          leadsCount: selectedPayroll.leadsCount,
          status: selectedPayroll.status,
          paymentMethod: selectedPayroll.paymentMethod,
          notes: selectedPayroll.notes,
        }),
      });

      if (res.ok) {
        setIsEditPayrollModalOpen(false);
        setSelectedPayroll(null);
        fetchFinanceData();
      }
    } catch (err) {
      console.error('Failed to update payroll:', err);
    }
  };

  // Handle Quick Status Change on Payroll
  const handleTogglePayrollStatus = async (payroll: any, nextStatus: 'APPROVED' | 'PAID') => {
    try {
      if (payroll.isDraft) {
        // Must save first if draft
        await fetch('/api/finance/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: payroll.userId || payroll.user?.id,
            month: selectedMonth,
            baseSalary: payroll.baseSalary,
            currency: payroll.currency,
            caseCommissions: payroll.caseCommissions,
            leadBonuses: payroll.leadBonuses,
            performanceBonus: payroll.performanceBonus,
            deductions: payroll.deductions,
            casesCount: payroll.casesCount,
            leadsCount: payroll.leadsCount,
            status: nextStatus,
            paymentMethod: payroll.paymentMethod,
            notes: payroll.notes,
          }),
        });
      } else {
        await fetch('/api/finance/payroll', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payrollId: payroll.id,
            status: nextStatus,
          }),
        });
      }
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to update payroll status:', err);
    }
  };

  // Handle Founder Batch Approve All
  const handleBatchApproveAll = async () => {
    try {
      await fetch('/api/finance/payroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_ALL',
          month: selectedMonth,
        }),
      });
      fetchFinanceData();
    } catch (err) {
      console.error(err);
    }
  };

  // Format amount based on currencyMode
  const formatMoney = (mmkAmount: number, eurAmount?: number) => {
    if (currencyMode === 'EUR') {
      const val = eurAmount !== undefined ? eurAmount : mmkAmount / exchangeRate;
      return `€ ${Math.round(val).toLocaleString()}`;
    }
    const val = mmkAmount !== undefined ? mmkAmount : (eurAmount || 0) * exchangeRate;
    return `${Math.round(val).toLocaleString()} MMK`;
  };

  // Format in Lakhs (e.g. 191.2 သိန်း)
  const formatLakhs = (mmk: number) => {
    const lakhs = (mmk / 100000).toFixed(1);
    return isBurmese ? `${lakhs} သိန်း` : `${lakhs} Lakhs`;
  };

  // 1. Guard check: Restrict to Founder & Executive Finance
  if (!hasFinanceAccess) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
              {isBurmese ? 'Founder သီးသန့် ဘဏ္ဍာရေး ထိန်းချုပ်မှု' : 'Confidential Financial & Payroll Portal'}
            </h2>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
              {isBurmese
                ? 'ဝင်ငွေ၊ ထွက်ငွေ၊ အမြတ်စာရင်းနှင့် ဝန်ထမ်းလစာ/ကော်မရှင်တွက်ချက်မှုများသည် Founder (Thet Htoo Naing) နှင့် အဆင့်မြင့် ဘဏ္ဍာရေး အုပ်ချုပ်သူများသာ ကြည့်ရှုစီမံနိုင်သော လျှို့ဝှက်ချက် ဖြစ်ပါသည်။'
                : 'Corporate revenues, ad spend expenses, and staff payroll calculations are confidential executive assets reserved for the Founder & Executive Leadership.'}
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Required Role: Founder or Executive Permission (`finance:view`)</span>
          </div>
        </div>
      </div>
    );
  }

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilterType !== 'ALL' && tx.type !== txFilterType) return false;
    if (txCategoryFilter !== 'ALL' && tx.category !== txCategoryFilter) return false;
    return true;
  });

  // Calculate Net Profit considering Payroll
  const totalPayrollMmk = payrollSummary.totalPayrollMmk || 0;
  const totalPayrollEur = payrollSummary.totalPayrollEur || 0;
  const actualNetProfitMmk = (txSummary.totalIncomeMmk || 0) - (txSummary.totalExpenseMmk || 0) - totalPayrollMmk;
  const actualNetProfitEur = (txSummary.totalIncomeEur || 0) - (txSummary.totalExpenseEur || 0) - totalPayrollEur;
  const actualMargin = txSummary.totalIncomeMmk > 0 ? (actualNetProfitMmk / txSummary.totalIncomeMmk) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                {isBurmese ? 'ဘဏ္ဍာရေး၊ ဝင်ငွေ/ထွက်ငွေနှင့် ဝန်ထမ်းလစာ စီမံခန့်ခွဲမှု' : 'Finance, P&L & Staff Payroll Hub'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                <span>👑</span>
                <span>Founder Control</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {isBurmese
                ? 'ကျောင်းသားဝန်ဆောင်ခ ဝင်ငွေ၊ Facebook/TikTok ကြော်ငြာစရိတ်၊ ရုံးသုံးစရိတ်များနှင့် ဝန်ထမ်းလခ/ကော်မရှင် တွက်ချက်မှု စနစ်။'
                : 'Executive cash flow, student revenue reconciliation, paid ad spend, and automated staff payroll calculations.'}
            </p>
          </div>
        </div>

        {/* Top Actions: Month Selector, Currency Toggle, New Transaction */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5 bg-zinc-50 border border-zinc-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700">
            <Calendar className="w-4 h-4 text-purple-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-zinc-900 font-bold"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-10">October 2026</option>
            </select>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center p-0.5 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
            <button
              onClick={() => setCurrencyMode('MMK')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currencyMode === 'MMK' ? 'bg-white text-purple-700 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              MMK (ကျပ်)
            </button>
            <button
              onClick={() => setCurrencyMode('EUR')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currencyMode === 'EUR' ? 'bg-white text-purple-700 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              EUR (€)
            </button>
          </div>

          {/* Add Transaction Button */}
          <button
            onClick={() => {
              setNewTxType('INCOME');
              setNewTxData({ ...newTxData, category: 'TUITION_FEE' });
              setIsAddTxModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBurmese ? '+ ဝင်ငွေ ထည့်မည်' : '+ Add Income'}</span>
          </button>

          <button
            onClick={() => {
              setNewTxType('EXPENSE');
              setNewTxData({ ...newTxData, category: 'MARKETING_AD_SPEND' });
              setIsAddTxModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBurmese ? '+ ထွက်ငွေ ထည့်မည်' : '+ Add Expense'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Executive P&L Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>{isBurmese ? 'စုစုပေါင်း ဝင်ငွေ (Total Revenue)' : 'Gross Income'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {formatMoney(txSummary.totalIncomeMmk, txSummary.totalIncomeEur)}
          </div>
          <div className="text-xs text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>{formatLakhs(txSummary.totalIncomeMmk)}</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {transactions.filter((t) => t.type === 'INCOME').length} Payments
            </span>
          </div>
        </div>

        {/* Card 2: Operating Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>{isBurmese ? 'လုပ်ငန်းသုံး စရိတ် (Operating Cost)' : 'Operating Expenses'}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {formatMoney(txSummary.totalExpenseMmk, txSummary.totalExpenseEur)}
          </div>
          <div className="text-xs text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>Ads & Operations</span>
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
              {transactions.filter((t) => t.type === 'EXPENSE').length} Entries
            </span>
          </div>
        </div>

        {/* Card 3: Staff Payroll Cost */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>{isBurmese ? 'ဝန်ထမ်းလခနှင့် ကော်မရှင် (Payroll)' : 'Staff Payroll & Bonus'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {formatMoney(totalPayrollMmk, totalPayrollEur)}
          </div>
          <div className="text-xs text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>{payrollSummary.staffCount} Staff Members</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
              {payrollSummary.paidCount} Paid / {payrollSummary.pendingCount} Pending
            </span>
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-gradient-to-br from-purple-950 via-zinc-950 to-purple-950 p-5 rounded-2xl text-white shadow-md shadow-purple-950/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200">
            <span>{isBurmese ? 'အသားတင် အမြတ် (Net Profit)' : 'Net Operating Profit'}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatMoney(actualNetProfitMmk, actualNetProfitEur)}
          </div>
          <div className="text-xs text-purple-200/80 flex items-center justify-between pt-1 border-t border-white/10">
            <span>Margin: {actualMargin.toFixed(1)}%</span>
            <span className="font-bold text-amber-300">
              {actualNetProfitMmk >= 0 ? '✓ Profitable' : '⚠ Deficit'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex space-x-1 p-1 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: isBurmese ? '📊 ဘဏ္ဍာရေး အနှစ်ချုပ် (P&L)' : '📊 P&L Overview', icon: TrendingUp },
          { id: 'transactions', label: isBurmese ? '💳 ဝင်ငွေ/ထွက်ငွေ မှတ်တမ်း' : '💳 Incomes & Expenses', icon: CreditCard },
          { id: 'payroll', label: isBurmese ? '👥 ဝန်ထမ်းလခနှင့် ကော်မရှင် တွက်ချက်စက်' : '👥 Staff Payroll & Commissions', icon: Calculator },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-zinc-950 text-white shadow-xs font-bold'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB 1: P&L Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Financial Statement Breakdown */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                {isBurmese ? 'အရှုံး/အမြတ် အစီရင်ခံစာ (Statement of P&L)' : 'Profit & Loss Statement'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedMonth} ({isBurmese ? 'လစဉ် ငွေစာရင်းရှင်းတမ်း' : 'Monthly Financial Performance'})
              </p>
            </div>

            {/* Income Streams */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                <span className="flex items-center space-x-1.5 text-emerald-700">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>၁။ ဝင်ငွေ အရင်းအမြစ်များ (Operating Incomes)</span>
                </span>
                <span className="text-emerald-700">{formatMoney(txSummary.totalIncomeMmk, txSummary.totalIncomeEur)}</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-600 pl-4">
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• Ausbildung ကျောင်းအပ် ဝန်ဆောင်ခ (Placement Fees)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(15750000, 3500)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• Uni-Assist VPD နှင့် တက္ကသိုလ် လျှောက်ထားကြေး</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(2025000, 450)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• ကျမ်းသစ္စာ ဘာသာပြန်နှင့် APS စာရွက်စာတမ်းကြေး</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(1350000, 300)}</span>
                </div>
              </div>
            </div>

            {/* Expense Streams */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                <span className="flex items-center space-x-1.5 text-rose-700">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>၂။ ကုန်ကျစရိတ်များ (Operating Expenses)</span>
                </span>
                <span className="text-rose-700">{formatMoney(txSummary.totalExpenseMmk, txSummary.totalExpenseEur)}</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-600 pl-4">
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• Facebook & TikTok ကြော်ငြာစရိတ် (Marketing Ad Spend)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(2700000, 600)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• ဂျာမနီ ဟမ်းဘတ်ဌာနချုပ်နှင့် လေဆိပ်ကြိုဆိုရေး (Hamburg Liaison)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(2925000, 650)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• ရုံးခန်းစရိတ်နှင့် အင်တာနက် (Yangon Office & Utilities)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(1125000, 250)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• Cloud Server, WebRTC & Software လိုင်စင်ကြေးများ</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(540000, 120)}</span>
                </div>
              </div>
            </div>

            {/* Staff Payroll Cost */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                <span className="flex items-center space-x-1.5 text-blue-700">
                  <Users className="w-4 h-4" />
                  <span>၃။ ဝန်ထမ်းလစာနှင့် ကော်မရှင် (Staff Payroll & Commission)</span>
                </span>
                <span className="text-blue-700">{formatMoney(totalPayrollMmk, totalPayrollEur)}</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-600 pl-4">
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• အခြေခံလစာ စုစုပေါင်း (Total Base Salaries)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(5800000, 1288)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• Case အောင်မြင်မှု ကော်မရှင် (Case Commissions)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(1175000, 261)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-zinc-100">
                  <span>• Marketing Lead နှင့် စွမ်းဆောင်ရည် ဘောနပ်စ် (Bonuses)</span>
                  <span className="font-semibold text-zinc-900">{formatMoney(525000, 116)}</span>
                </div>
              </div>
            </div>

            {/* Final Net Summary */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between font-black text-sm">
              <span className="text-purple-950">
                {isBurmese ? 'အသားတင် ကျန်ရှိသော အမြတ် (Net Operating Profit):' : 'Final Net Operating Income:'}
              </span>
              <span className="text-emerald-700 text-base">
                {formatMoney(actualNetProfitMmk, actualNetProfitEur)} ({actualMargin.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Right: Currency & Bank Account Quick Balances */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-950 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-purple-600" />
                <span>{isBurmese ? 'ဘဏ်နှင့် ပိုက်ဆံအိတ် လက်ကျန်' : 'Treasury & Accounts'}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>KBZPay Official Account</span>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>
                  <div className="text-base font-black text-zinc-900">
                    {formatMoney(8450000)}
                  </div>
                  <div className="text-[11px] text-zinc-400">Used for local MMK student fees & payroll</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Germany Commercial Bank (EUR)</span>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>
                  <div className="text-base font-black text-zinc-900">
                    € 8,240.00
                  </div>
                  <div className="text-[11px] text-zinc-400">Hamburg Liaison desk, Uni-Assist & ads</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>AYA Pay Corporate</span>
                    <span className="text-emerald-600 font-bold">Active</span>
                  </div>
                  <div className="text-base font-black text-zinc-900">
                    {formatMoney(3200000)}
                  </div>
                </div>
              </div>

              {/* Conversion Reference */}
              <div className="p-3 rounded-xl bg-purple-50 text-[11px] text-purple-900 space-y-1 border border-purple-100">
                <span className="font-bold block">Exchange Rate Reference:</span>
                <p className="text-purple-800">
                  1 EUR = {exchangeRate.toLocaleString()} MMK (အလိုအလျောက် ပြောင်းလဲတွက်ချက်သည်)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Income & Expenses Ledger */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-zinc-500">{isBurmese ? 'အမျိုးအစား:' : 'Type:'}</span>
              <div className="flex items-center space-x-1 text-xs">
                {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTxFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      txFilterType === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {t === 'ALL' ? (isBurmese ? 'အားလုံး' : 'All') : t === 'INCOME' ? (isBurmese ? 'ဝင်ငွေ' : 'Income') : (isBurmese ? 'ထွက်ငွေ' : 'Expense')}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-zinc-500">
              Showing <strong>{filteredTransactions.length}</strong> transactions in {selectedMonth}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-200/80">
                <tr>
                  <th className="px-4 py-3">{isBurmese ? 'ရက်စွဲ' : 'Date'}</th>
                  <th className="px-4 py-3">{isBurmese ? 'အမျိုးအစား' : 'Type'}</th>
                  <th className="px-4 py-3">{isBurmese ? 'ခေါင်းစဉ်နှင့် အသေးစိတ်' : 'Title & Description'}</th>
                  <th className="px-4 py-3">{isBurmese ? 'ကဏ္ဍ' : 'Category'}</th>
                  <th className="px-4 py-3">{isBurmese ? 'ပေးချေမှုပုံစံ' : 'Payment Method'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'ပမာဏ (MMK)' : 'Amount (MMK)'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'ပမာဏ (EUR)' : 'Amount (EUR)'}</th>
                  <th className="px-4 py-3 text-center">{isBurmese ? 'အခြေအနေ' : 'Status'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'လုပ်ဆောင်ချက်' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-zinc-400">
                      {isBurmese ? 'ဤလအတွက် ငွေကြေးမှတ်တမ်း မရှိသေးပါ။' : 'No transactions recorded for this period.'}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    const amountEur = tx.amountInEur || (tx.currency === 'EUR' ? tx.amount : tx.amount / exchangeRate);
                    const amountMmk = tx.currency === 'MMK' ? tx.amount : tx.amount * exchangeRate;

                    return (
                      <tr key={tx.id} className="hover:bg-zinc-50/80 transition">
                        <td className="px-4 py-3 font-medium text-zinc-600 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span>{isIncome ? '↓ Income' : '↑ Expense'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-bold text-zinc-900">{tx.title}</div>
                          {tx.description && <div className="text-[11px] text-zinc-500 truncate">{tx.description}</div>}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-700">
                            {tx.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 font-semibold text-[11px] whitespace-nowrap">
                          {tx.paymentMethod}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isIncome ? '+' : '-'}{Math.round(amountMmk).toLocaleString()} MMK
                        </td>
                        <td className={`px-4 py-3 text-right font-medium text-zinc-500 whitespace-nowrap`}>
                          € {Math.round(amountEur).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteTx(tx.id)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 3: Staff Payroll & Commission Calculator */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-zinc-950">
                  {isBurmese ? 'ဝန်ထမ်းလခနှင့် ကော်မရှင် တွက်ချက်မှုစာရင်း' : 'Staff Salary & Commission Calculation'}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800">
                  {selectedMonth}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isBurmese
                  ? 'အခြေခံလစာ + Case အောင်မြင်မှု ကော်မရှင် (၁ သိန်း/Case) + Lead ဘောနပ်စ် (၅ ထောင်/Lead) + အထူးစွမ်းဆောင်ရည် ဘောနပ်စ်။'
                  : 'Automated breakdown: Base Salary + Closed Case Commissions + Qualified Lead Bonuses + Founder Discretionary Bonus.'}
              </p>
            </div>

            {/* Founder Batch Approve All Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchApproveAll}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-200" />
                <span>{isBurmese ? 'Founder အားလုံး အတည်ပြုမည်' : 'Founder Approve All'}</span>
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-200/80">
                <tr>
                  <th className="px-4 py-3">{isBurmese ? 'ဝန်ထမ်းအမည်' : 'Staff Member'}</th>
                  <th className="px-4 py-3">{isBurmese ? 'ရာထူး / ဌာန' : 'Role / Title'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'အခြေခံလစာ' : 'Base Salary'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'Case ကော်မရှင်' : 'Case Commission'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'Lead ဘောနပ်စ်' : 'Lead Bonus'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'အထူး ဘောနပ်စ်' : 'Bonus'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'ဖြတ်တောက်ငွေ' : 'Deductions'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'အသားတင် လခ' : 'Net Salary'}</th>
                  <th className="px-4 py-3 text-center">{isBurmese ? 'အခြေအနေ' : 'Status'}</th>
                  <th className="px-4 py-3 text-right">{isBurmese ? 'စီမံခန့်ခွဲရန်' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payrolls.map((p) => {
                  const staffUser = p.user;
                  const isPaid = p.status === 'PAID';
                  const isApproved = p.status === 'APPROVED';

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/80 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={staffUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-zinc-900">{staffUser?.name || 'Staff Member'}</div>
                            <div className="text-[10px] text-zinc-400">{staffUser?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">
                        <div className="font-semibold text-zinc-800">{staffUser?.title || 'Counselor'}</div>
                        <div className="text-[10px] text-zinc-400">{staffUser?.role?.name}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-zinc-700 whitespace-nowrap">
                        {Math.round(p.baseSalary).toLocaleString()} {p.currency}
                      </td>
                      <td className="px-4 py-3.5 text-right text-emerald-700 font-semibold whitespace-nowrap">
                        +{Math.round(p.caseCommissions).toLocaleString()}
                        {p.casesCount > 0 && <span className="text-[10px] text-zinc-400 block">({p.casesCount} Cases)</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right text-blue-700 font-semibold whitespace-nowrap">
                        +{Math.round(p.leadBonuses).toLocaleString()}
                        {p.leadsCount > 0 && <span className="text-[10px] text-zinc-400 block">({p.leadsCount} Leads)</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right text-purple-700 font-semibold whitespace-nowrap">
                        +{Math.round(p.performanceBonus).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-rose-600 font-semibold whitespace-nowrap">
                        -{Math.round(p.deductions).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="text-sm font-black text-purple-950">
                          {Math.round(p.netSalary).toLocaleString()} {p.currency}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          ~€ {Math.round(p.currency === 'EUR' ? p.netSalary : p.netSalary / exchangeRate)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isApproved
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                        {/* Payslip Voucher */}
                        <button
                          onClick={() => {
                            setPayslipData(p);
                            setIsPayslipModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold transition"
                          title="Generate Payslip"
                        >
                          {isBurmese ? 'စလစ်ထုတ်' : 'Slip'}
                        </button>

                        {/* Edit Calculator */}
                        <button
                          onClick={() => {
                            setSelectedPayroll({ ...p });
                            setIsEditPayrollModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-semibold transition"
                        >
                          {isBurmese ? 'တွက်ချက်' : 'Calculate'}
                        </button>

                        {/* Quick Mark Paid */}
                        {!isPaid && (
                          <button
                            onClick={() => handleTogglePayrollStatus(p, 'PAID')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition"
                          >
                            {isBurmese ? 'လခထုတ်ပေးပြီး' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Transaction (Income / Expense) */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                    newTxType === 'INCOME' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {newTxType === 'INCOME' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-base text-zinc-950">
                  {newTxType === 'INCOME'
                    ? isBurmese
                      ? 'ဝင်ငွေ မှတ်တမ်းအသစ် ထည့်သွင်းခြင်း'
                      : 'Record Income Transaction'
                    : isBurmese
                    ? 'ထွက်ငွေ မှတ်တမ်းအသစ် ထည့်သွင်းခြင်း'
                    : 'Record Operating Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddTxModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {isBurmese ? 'ခေါင်းစဉ် / ကျောင်းသားအမည်' : 'Transaction Title / Student Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTxData.title}
                  onChange={(e) => setNewTxData({ ...newTxData, title: e.target.value })}
                  placeholder={newTxType === 'INCOME' ? 'Aung Kyaw Moe - Ausbildung Placement Fee' : 'Facebook Lead Ads Spend'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'ပမာဏ' : 'Amount'} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newTxData.amount}
                    onChange={(e) => setNewTxData({ ...newTxData, amount: e.target.value })}
                    placeholder="1500000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'ငွေကြေး' : 'Currency'}
                  </label>
                  <select
                    value={newTxData.currency}
                    onChange={(e) => setNewTxData({ ...newTxData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="MMK">MMK (Myanmar Kyats)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'ကဏ္ဍ' : 'Category'}
                  </label>
                  <select
                    value={newTxData.category}
                    onChange={(e) => setNewTxData({ ...newTxData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    {newTxType === 'INCOME' ? (
                      <>
                        <option value="TUITION_FEE">Ausbildung Placement Fee</option>
                        <option value="CONSULTATION_FEE">Uni-Assist VPD Consultation Fee</option>
                        <option value="TRANSLATION_APS">Certified Translation / APS Legalization</option>
                        <option value="MISC">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="MARKETING_AD_SPEND">Marketing Ad Spend (Facebook/TikTok)</option>
                        <option value="HAMBURG_LIAISON">Hamburg Ground Operations & Welcome</option>
                        <option value="OFFICE_RENT">Office Rent & Utilities</option>
                        <option value="TECH_SUBSCRIPTION">Software & Hosting Subscriptions</option>
                        <option value="SALARY_PAYROLL">Direct Salary Payout</option>
                        <option value="MISC">Other Operating Expense</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'ပေးချေမှုစနစ်' : 'Payment Channel'}
                  </label>
                  <select
                    value={newTxData.paymentMethod}
                    onChange={(e) => setNewTxData({ ...newTxData, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="KBZPAY">KBZPay</option>
                    <option value="AYA">AYA Pay / Bank</option>
                    <option value="CB">CB Bank</option>
                    <option value="BANK_TRANSFER">EUR Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {isBurmese ? 'မှတ်ချက် / အသေးစိတ်' : 'Notes / Reference Details'}
                </label>
                <textarea
                  rows={2}
                  value={newTxData.description}
                  onChange={(e) => setNewTxData({ ...newTxData, description: e.target.value })}
                  placeholder="e.g. Receipt #2026-092 for Autumn 2026 Intake enrollment"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                    newTxType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Staff Payroll & Recalculate */}
      {isEditPayrollModalOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-950">
                    {isBurmese ? 'ဝန်ထမ်းလခနှင့် ကော်မရှင် ပြင်ဆင်တွက်ချက်ခြင်း' : 'Calculate Staff Salary & Commission'}
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedPayroll.user?.name} ({selectedMonth})</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditPayrollModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayroll} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'အခြေခံလစာ' : 'Base Salary'} ({selectedPayroll.currency})
                  </label>
                  <input
                    type="number"
                    value={selectedPayroll.baseSalary}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, baseSalary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'အောင်မြင်သော Case အရေအတွက်' : 'Closed Cases Count'}
                  </label>
                  <input
                    type="number"
                    value={selectedPayroll.casesCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value, 10) || 0;
                      setSelectedPayroll({
                        ...selectedPayroll,
                        casesCount: count,
                        caseCommissions: count * 100000,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'Case ကော်မရှင်ငွေ' : 'Case Commission'} ({selectedPayroll.currency})
                  </label>
                  <input
                    type="number"
                    value={selectedPayroll.caseCommissions}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, caseCommissions: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'Lead ဘောနပ်စ်' : 'Lead Bonus'} ({selectedPayroll.currency})
                  </label>
                  <input
                    type="number"
                    value={selectedPayroll.leadBonuses}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, leadBonuses: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'Founder အထူးဘောနပ်စ်' : 'Founder Bonus'} ({selectedPayroll.currency})
                  </label>
                  <input
                    type="number"
                    value={selectedPayroll.performanceBonus}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, performanceBonus: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-purple-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'ဖြတ်တောက်ငွေ (Deductions)' : 'Deductions'} ({selectedPayroll.currency})
                  </label>
                  <input
                    type="number"
                    value={selectedPayroll.deductions}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, deductions: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-rose-600"
                  />
                </div>
              </div>

              {/* Real-time Calculated Net Pay */}
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                <span className="font-bold text-purple-950">
                  {isBurmese ? 'တွက်ချက်ရရှိသော အသားတင်လခ (Net Pay):' : 'Calculated Net Salary:'}
                </span>
                <span className="text-base font-black text-purple-950">
                  {(
                    (parseFloat(selectedPayroll.baseSalary) || 0) +
                    (parseFloat(selectedPayroll.caseCommissions) || 0) +
                    (parseFloat(selectedPayroll.leadBonuses) || 0) +
                    (parseFloat(selectedPayroll.performanceBonus) || 0) -
                    (parseFloat(selectedPayroll.deductions) || 0)
                  ).toLocaleString()}{' '}
                  {selectedPayroll.currency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'အခြေအနေ' : 'Approval Status'}
                  </label>
                  <select
                    value={selectedPayroll.status}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold"
                  >
                    <option value="DRAFT">DRAFT (မူကြမ်း)</option>
                    <option value="APPROVED">APPROVED (Founder အတည်ပြုပြီး)</option>
                    <option value="PAID">PAID (လခထုတ်ပေးပြီး)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {isBurmese ? 'လခလွှဲပြောင်းမည့် စနစ်' : 'Payout Channel'}
                  </label>
                  <select
                    value={selectedPayroll.paymentMethod}
                    onChange={(e) => setSelectedPayroll({ ...selectedPayroll, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold"
                  >
                    <option value="KBZPAY">KBZPay</option>
                    <option value="AYA">AYA Pay / Bank</option>
                    <option value="CB">CB Bank</option>
                    <option value="BANK_TRANSFER">EUR Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {isBurmese ? 'မှတ်ချက် / တွက်ချက်မှုမှတ်တမ်း' : 'Calculation Notes'}
                </label>
                <textarea
                  rows={2}
                  value={selectedPayroll.notes || ''}
                  onChange={(e) => setSelectedPayroll({ ...selectedPayroll, notes: e.target.value })}
                  placeholder="Notes on case bonus or adjustments..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditPayrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-xs font-bold text-white shadow-xs"
                >
                  Save & Apply Calculation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Payslip Voucher */}
      {isPayslipModalOpen && payslipData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-zinc-200 space-y-6 print:m-0 print:border-none">
            {/* Voucher Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <BrandLogo variant="light" width={140} showBadge={false} />
                <p className="text-[10px] text-zinc-500 mt-1">
                  GOEURO STUDY • Official Germany Education Agency
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                  Official Payslip
                </span>
                <div className="text-xs font-bold text-zinc-900 mt-1">{selectedMonth}</div>
              </div>
            </div>

            {/* Staff Details */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Employee Name:</span>
                <strong className="text-zinc-900">{payslipData.user?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Position / Title:</span>
                <span className="text-zinc-800 font-medium">{payslipData.user?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Channel:</span>
                <span className="text-zinc-800 font-semibold">{payslipData.paymentMethod || 'KBZPay'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-700">{payslipData.status}</span>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Earnings Breakdown
              </div>
              <div className="space-y-1.5 border-t border-zinc-100 pt-2">
                <div className="flex justify-between text-zinc-700">
                  <span>Base Salary</span>
                  <span className="font-semibold">{Math.round(payslipData.baseSalary).toLocaleString()} {payslipData.currency}</span>
                </div>
                {payslipData.caseCommissions > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Case Conversion Commission ({payslipData.casesCount} Cases)</span>
                    <span className="font-semibold">+{Math.round(payslipData.caseCommissions).toLocaleString()} {payslipData.currency}</span>
                  </div>
                )}
                {payslipData.leadBonuses > 0 && (
                  <div className="flex justify-between text-blue-700">
                    <span>Qualified Leads Bonus ({payslipData.leadsCount} Leads)</span>
                    <span className="font-semibold">+{Math.round(payslipData.leadBonuses).toLocaleString()} {payslipData.currency}</span>
                  </div>
                )}
                {payslipData.performanceBonus > 0 && (
                  <div className="flex justify-between text-purple-700">
                    <span>Founder Discretionary Bonus</span>
                    <span className="font-semibold">+{Math.round(payslipData.performanceBonus).toLocaleString()} {payslipData.currency}</span>
                  </div>
                )}
                {payslipData.deductions > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Deductions</span>
                    <span className="font-semibold">-{Math.round(payslipData.deductions).toLocaleString()} {payslipData.currency}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Net Salary Total */}
            <div className="p-4 rounded-xl bg-purple-950 text-white flex items-center justify-between font-black">
              <span className="text-xs uppercase tracking-wider text-purple-200">Net Take-Home Pay:</span>
              <span className="text-lg text-emerald-400">
                {Math.round(payslipData.netSalary).toLocaleString()} {payslipData.currency}
              </span>
            </div>

            {/* Founder Verification Signature Box */}
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
              <div>
                <span className="block text-zinc-400 text-[10px]">Verified & Authorized by:</span>
                <strong className="text-zinc-900 font-bold">Thet Htoo Naing (Founder)</strong>
              </div>
              <div className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[10px] rounded-md">
                GOEURO AUTHENTICATED
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setIsPayslipModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
