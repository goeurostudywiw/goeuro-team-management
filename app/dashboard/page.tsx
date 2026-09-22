'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import { useSync } from '@/components/SyncContext';
import TruthfulEmptyState from '@/components/TruthfulEmptyState';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  FileCheck,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  Video,
  TrendingUp,
  UserPlus,
  FileCheck2,
  ArrowRight,
  BookOpen,
  Wallet
} from 'lucide-react';

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const { currentUser, can } = useUserSession();
  const { isSyncing, triggerSync, notifySync } = useSync();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isBurmese = language === 'my';

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleSwitch = () => fetchStats();
    const handleSync = () => fetchStats();

    window.addEventListener('goeuro_user_switched', handleSwitch);
    window.addEventListener('goeuro_sync_event', handleSync);
    return () => {
      window.removeEventListener('goeuro_user_switched', handleSwitch);
      window.removeEventListener('goeuro_sync_event', handleSync);
    };
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: 'DONE' }),
      });
      if (res.ok) {
        notifySync('task_updated', { status: 'DONE' });
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isManagerOrAdmin = can('team:manage') || can('*');

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner (Notion White Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
              {t.dashboard.greeting} {currentUser?.name}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {currentUser?.title || currentUser?.role?.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {isBurmese
              ? 'GOEURO ၏ နေ့စဉ်လုပ်ငန်းများနှင့် ဂျာမနီပညာရေး လမ်းကြောင်း စီမံခန့်ခွဲမှု'
              : 'GOEURO Germany Ausbildung & Public University Daily Operations'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerSync(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-2xs transition btn-press"
            title="Sync all agency modules"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_command_palette'))}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-2xs transition btn-press"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-purple-600" />
            <span>Fast Search</span>
            <kbd className="text-[10px] font-mono px-1 rounded bg-white text-zinc-400 border border-zinc-200">⌘K</kbd>
          </button>
          <Link
            href="/tasks"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition btn-press hover-lift"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{t.tasks.createTask}</span>
          </Link>
          <Link
            href="/marketing"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition btn-press hover-lift"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.marketing.createContent}</span>
          </Link>
        </div>
      </div>

      {/* Germany Admissions Intake Radar Strip */}
      <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-black text-white rounded-2xl p-4 border border-purple-900/50 shadow-notion flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold tracking-wide uppercase text-purple-300">
                {isBurmese ? 'ဂျာမနီ တက္ကသိုလ် & AUSBILDUNG စည်းချက်' : 'Admissions Intake Radar 2026/2027'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Cycle
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 mt-0.5">
              {isBurmese
                ? 'Uni-Assist VPD လျှောက်ထားမှု & APS စစ်ဆေးခြင်း: ၄-၈ ပတ် ကြိုတင်ပြင်ဆင်ရန် | အိုဆူဘီဒေါင်း စာချုပ်ချုပ်ဆိုမှု: ဩဂုတ်/စက်တင်ဘာ ၂၀၂၆'
                : 'Winter 2026 Intake: Uni-Assist VPD & APS (4–8 wk lead) • Blocked Account €11,904 • Ausbildung Contracts finalize Aug/Sept.'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/integrations"
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center space-x-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Connectors</span>
          </Link>
          <Link
            href="/knowledge"
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition"
          >
            Visa & APS SOP →
          </Link>
        </div>
      </div>

      {/* Founder Weekly Management Review & Operations Guideline v1.2 Card */}
      <div className="bg-white rounded-2xl p-5 border border-purple-200/90 shadow-notion hover:border-purple-300 transition">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                Handbook Version 1.2
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Operating Standards Enforced</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-950 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>
                {isBurmese
                  ? 'Founder ၏ အပတ်စဉ် Management Review & လုပ်ငန်းလည်ပတ်မှု လမ်းညွှန်'
                  : "Founder's Weekly Management Review & Operations Guide"}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
              {isBurmese
                ? 'Section 8 မေးခွန်း ၅ ခု (Marketing, Student Journey, Accuracy, Ground Experience, Decision) အတိုင်း သုံးသပ်ပြီး အဆင့် ၇ ခုပါ စနစ်ဖြင့် မှတ်တမ်းတင်ဆောင်ရွက်ရန်။'
                : 'Upholding Section 8 Weekly Review across 5 areas (Marketing, Leads, German Accuracy, On-Ground, Executive Decisions) and Single Source of Truth records.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/guidelines"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition btn-press"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isBurmese ? 'လမ်းညွှန်စာအုပ် ဖွင့်ရန်' : 'Open Operations Hub'}</span>
            </Link>
            <Link
              href="/guidelines"
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition"
            >
              <span>{isBurmese ? 'Approval Matrix' : 'Approval Matrix (Sec 13)'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Founder Financial & Staff Payroll Quick Command Card */}
      <div className="bg-gradient-to-r from-purple-900 via-zinc-900 to-purple-950 rounded-2xl p-5 text-white shadow-md border border-purple-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-zinc-950 uppercase tracking-wider">
                👑 Founder Finance & Payroll
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                <span>●</span>
                <span>Sep 2026 Books Active</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-purple-300" />
              <span>
                {isBurmese
                  ? 'ဝင်ငွေ/ထွက်ငွေ အမြတ်စာရင်းနှင့် ဝန်ထမ်းလခ/ကော်မရှင် တွက်ချက်မှု'
                  : 'Corporate P&L, Ad Spend & Staff Payroll Management'}
              </span>
            </h3>
            <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed font-burmese">
              {isBurmese
                ? 'လစဉ် ကျောင်းအပ်ငွေ၊ Facebook/TikTok ကြော်ငြာစရိတ်၊ ဝန်ထမ်းလစာ (Base + Case/Lead Bonuses) များကို Founder သီးသန့် တွက်ချက်စီမံရန်။'
                : 'Executive control over monthly student revenues, advertising expenditures, and automated staff salary/commission calculation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/finance"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-100 shadow-sm transition btn-press cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-purple-700" />
              <span>{isBurmese ? 'ဘဏ္ဍာရေး စီမံခန့်ခွဲရန်' : 'Open Finance & Payroll'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Agency Velocity KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          href="/leads"
          className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-notion card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">{isBurmese ? 'ကျောင်းသား စုံစမ်းမှုများ' : 'Student Leads'}</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-zinc-950">{stats?.totalLeadsCount || 0}</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
              Pipeline
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Multi-channel incoming queue</div>
        </Link>

        <Link
          href="/cases"
          className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-notion card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">{isBurmese ? 'တက်ကြွ ကျောင်းသားဖိုင်' : 'Active Cases'}</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-zinc-950">{stats?.activeCasesCount || 0}</span>
            <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              Enrolled
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Checklists & Embassy prep</div>
        </Link>

        <Link
          href="/marketing"
          className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-notion card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">{isBurmese ? 'ထုတ်ဝေပြီး အကြောင်းအရာ' : 'Content Posts'}</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-zinc-950">{stats?.publishedContentCount || 0}</span>
            <span className="text-xs text-zinc-400">/ {stats?.contentTargetMonth || '20–30'} mo</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Slide 10 monthly target</div>
        </Link>

        <Link
          href="/marketing"
          className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-notion card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">{isBurmese ? 'ဟမ်းဘတ် ဗီဒီယိုများ' : 'Germany Reels'}</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-zinc-950">{stats?.germanyVideosCount || 0}</span>
            <span className="text-xs text-zinc-400">/ {stats?.germanyVideosTarget || '10–12'} mo</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Lu Min Myat Hamburg POV</div>
        </Link>
      </div>

      {/* Agency Conversion Funnel & Quick Action Command Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Conversion Funnel Widget */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                {isBurmese ? 'ကျောင်းသား လက်ခံမှု အဆင့်ဆင့် စွမ်းဆောင်ရည် (Conversion Funnel)' : 'Germany Admissions Conversion Funnel'}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Intake Velocity
            </span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {/* Stage 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700">1. Total Student Inquiries (Multi-channel)</span>
                <span className="font-bold text-zinc-900">{stats?.totalLeadsCount || 14} leads (100%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-full" />
              </div>
            </div>

            {/* Stage 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700">2. Profile Screened & Qualified (German A2/B1 or Uni Criteria)</span>
                <span className="font-bold text-zinc-900">
                  {Math.max(1, Math.round((stats?.totalLeadsCount || 14) * 0.65))} qualified (~65%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[65%]" />
              </div>
            </div>

            {/* Stage 3 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700">3. 1-on-1 Video Consultation Conducted & Pathway Selected</span>
                <span className="font-bold text-zinc-900">
                  {Math.max(1, Math.round((stats?.totalLeadsCount || 14) * 0.4))} consulted (~40%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[40%]" />
              </div>
            </div>

            {/* Stage 4 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-800">4. Enrolled Cases (Contract Signed & Visa Milestones Ongoing)</span>
                <span className="font-bold text-emerald-700">
                  {stats?.activeCasesCount || 1} active cases ({Math.round(((stats?.activeCasesCount || 1) / (stats?.totalLeadsCount || 14)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.max(15, Math.min(100, Math.round(((stats?.activeCasesCount || 1) / (stats?.totalLeadsCount || 14)) * 100)))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Command Bar */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              {isBurmese ? 'အမြန် လုပ်ဆောင်ချက်များ' : 'Agency Quick Actions'}
            </h3>
            <p className="text-[11px] text-zinc-400">Direct operational shortcuts</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/leads"
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/40 transition flex items-center justify-between text-xs font-semibold text-zinc-800 group"
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                <span>+ Log Walk-In Lead</span>
              </div>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/cases"
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/40 transition flex items-center justify-between text-xs font-semibold text-zinc-800 group"
            >
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                <span>+ Direct Case Enrollment</span>
              </div>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/meeting/counselor-room?role=counselor"
              target="_blank"
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 transition flex items-center justify-between text-xs font-bold text-purple-900 group"
            >
              <div className="flex items-center space-x-2">
                <Video className="w-3.5 h-3.5 text-purple-700" />
                <span>🎥 Launch Video Room</span>
              </div>
              <ArrowRight className="w-3 h-3 text-purple-700 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Truthful Launch Empty State Banner */}
      <TruthfulEmptyState
        completedTasksCount={stats?.completedTasksCount || 0}
        totalTasksCount={stats?.totalTasksCount || 0}
        publishedContentCount={stats?.publishedContentCount || 0}
        germanyVideosCount={stats?.germanyVideosCount || 0}
      />

      {/* Manager / Founder Overdue Tasks View */}
      {isManagerOrAdmin && stats?.overdueTasks && stats.overdueTasks.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold tracking-tight uppercase">
                {isBurmese ? 'စီမံခန့်ခွဲသူ ကြည့်ရှုမှု - သတ်မှတ်ရက်ကျော်လွန်နေသော တာဝန်များ' : 'Manager View: Overdue Team Deadlines'}
              </h2>
            </div>
            <Link href="/tasks" className="text-xs font-bold text-rose-700 hover:underline flex items-center">
              <span>{t.dashboard.viewAll}</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.overdueTasks.map((tItem: any) => (
              <div key={tItem.id} className="bg-white border border-rose-200 rounded-xl p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-rose-600">
                      {isBurmese ? 'ရက်လွန်' : 'Overdue'}: {new Date(tItem.dueDate).toLocaleDateString()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      {tItem.priority}
                    </span>
                  </div>
                  <div className="font-medium text-zinc-900 text-xs line-clamp-2">{tItem.title}</div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Assignee: {tItem.assignee?.name || 'Unassigned'}</span>
                  <span className="text-[10px] text-zinc-400">{tItem.team?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Work Dashboard (Notion Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: My Tasks */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-zinc-950 text-sm">{t.dashboard.myTasks}</h2>
            </div>
            <Link href="/tasks" className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center">
              <span>{t.dashboard.viewAll}</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {stats?.myTasks && stats.myTasks.length > 0 ? (
              stats.myTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-zinc-200/70 hover:border-purple-300 hover:bg-purple-50/20 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' :
                        task.priority === 'HIGH' ? 'bg-purple-100 text-purple-800' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {task.priority}
                      </span>
                      {task.team && (
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {task.team.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-zinc-50 hover:bg-purple-100 text-zinc-700 hover:text-purple-800 font-semibold border border-zinc-200 transition"
                  >
                    ✓ {t.tasks.markDone}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                {t.dashboard.emptyTasks}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pending Approvals for Me */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-zinc-950 text-sm">{t.dashboard.pendingApprovals}</h2>
            </div>
            <Link href="/marketing" className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center">
              <span>{t.dashboard.viewAll}</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {stats?.pendingApprovals && stats.pendingApprovals.length > 0 ? (
              stats.pendingApprovals.map((content: any) => (
                <div
                  key={content.id}
                  className="p-3 rounded-xl border border-purple-200/80 bg-purple-50/30 hover:bg-purple-50/60 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {content.stage === 'FACTUAL_REVIEW' ? 'Factual Review (Nay)' : 'Brand Approval (THN)'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {content.channel} • {content.format}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">{content.topic}</div>
                    <div className="text-[11px] text-zinc-500">
                      Author: {content.owner?.name} {content.pathway && `• ${content.pathway.name}`}
                    </div>
                  </div>

                  <Link
                    href="/marketing"
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                {t.dashboard.emptyApprovals}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Grid: Leads Needing Follow-up & Scheduled Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leads Needing Follow-up */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-zinc-950 text-sm">{t.dashboard.leadsNeedingFollowUp}</h2>
            </div>
            {can('lead:read') && (
              <Link href="/leads" className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center">
                <span>{t.dashboard.viewAll}</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            )}
          </div>

          {!can('lead:read') ? (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
              <ShieldCheck className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
              <p>{t.leads.restrictedNotice}</p>
            </div>
          ) : stats?.leadsNeedingFollowUp && stats.leadsNeedingFollowUp.length > 0 ? (
            <div className="space-y-2.5">
              {stats.leadsNeedingFollowUp.map((lead: any) => (
                <div key={lead.id} className="p-3 rounded-xl border border-zinc-200/80 hover:border-purple-300 transition flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">{lead.fullName}</div>
                    <div className="text-[11px] text-zinc-500">
                      {lead.preferredContact}: {lead.contactHandle} • {lead.interestedPathway?.name || 'General Inquiry'}
                    </div>
                  </div>
                  <Link
                    href="/leads"
                    className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-semibold hover:bg-purple-100"
                  >
                    {lead.stage}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400 space-y-2">
              <p>{t.dashboard.emptyFollowUps}</p>
              <Link
                href="/inquiry"
                target="_blank"
                className="inline-block text-purple-700 font-semibold hover:underline"
              >
                + {isBurmese ? 'အများပြည်သူ ဖောင်မှ စုံစမ်းမှု စမ်းသပ်ထည့်ရန်' : 'Submit a test inquiry via public portal'}
              </Link>
            </div>
          )}
        </div>

        {/* Scheduled Content / Weekly Rhythm */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-zinc-950 text-sm">{t.dashboard.scheduledContent}</h2>
            </div>
            <Link href="/marketing" className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center">
              <span>{t.dashboard.viewAll}</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          {stats?.scheduledContent && stats.scheduledContent.length > 0 ? (
            <div className="space-y-2.5">
              {stats.scheduledContent.map((item: any) => (
                <div key={item.id} className="p-3 rounded-xl border border-zinc-200/80 hover:border-purple-300 transition flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">{item.topic}</div>
                    <div className="text-[11px] text-zinc-500">
                      {item.channel} • {item.format} • Planned: {new Date(item.plannedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-xs text-zinc-500 bg-zinc-50/60 rounded-xl p-3.5 border border-zinc-200/60">
              <div className="font-bold text-zinc-800 mb-1.5 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>{isBurmese ? 'အပတ်စဉ် ထုတ်ဝေမှု စည်းချက် (Slide 7)' : 'Weekly Content Cadence (Slide 7):'}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-zinc-600">
                <li>• <strong>Mon</strong>: Lu Reel — Public University Hamburg</li>
                <li>• <strong>Tue</strong>: Carousel — Ausbildung FAQ & Requirements</li>
                <li>• <strong>Wed</strong>: Lu Reel — Germany Student Life reality</li>
                <li>• <strong>Thu</strong>: Explainer — Application / eligibility facts</li>
                <li>• <strong>Fri</strong>: Lu Reel — Myth vs Reality</li>
                <li>• <strong>Sat</strong>: Ausbildung Reel — Script by Nay / Video by Lu</li>
                <li>• <strong>Sun</strong>: Q&A / Inquiry collection for next week</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
