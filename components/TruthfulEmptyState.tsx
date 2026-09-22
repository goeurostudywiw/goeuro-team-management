'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import {
  Rocket,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Video,
  Target,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface TruthfulEmptyStateProps {
  completedTasksCount: number;
  totalTasksCount: number;
  publishedContentCount: number;
  germanyVideosCount: number;
}

export default function TruthfulEmptyState({
  completedTasksCount,
  totalTasksCount,
  publishedContentCount,
  germanyVideosCount,
}: TruthfulEmptyStateProps) {
  const { language } = useLanguage();
  const isBurmese = language === 'my';

  const roadmapWeeks = [
    {
      week: isBurmese ? 'အပတ်စဉ် ၁' : 'Week 1',
      title: isBurmese ? 'အခြေခံအုတ်မြစ် (Foundation)' : 'Foundation',
      desc: isBurmese
        ? 'Ausbildung နှင့် Public University ဝန်ဆောင်မှုစံနှုန်း၊ FAQ၊ ဆွေးနွေးမှု လမ်းညွှန်၊ ခေါင်းစဉ် ၁၅-၂၀ ရေးဆွဲခြင်း'
        : 'Finalize offers, FAQ, inquiry script, tracking sheet, 15–20 content topics',
      status: 'active',
    },
    {
      week: isBurmese ? 'အပတ်စဉ် ၂' : 'Week 2',
      title: isBurmese ? 'ထုတ်ဝေခြင်း (Publish)' : 'Publish',
      desc: isBurmese
        ? 'ဟမ်းဘတ်တိုက်ရိုက် ဗီဒီယိုများနှင့် Carousel များ စဉ်ဆက်မပြတ် လွှင့်တင်ခြင်း'
        : 'Launch consistent reels/carousels; test Ausbildung vs University messaging',
      status: 'upcoming',
    },
    {
      week: isBurmese ? 'အပတ်စဉ် ၃' : 'Week 3',
      title: isBurmese ? 'ဖြန့်ကြက်ခြင်း (Amplify)' : 'Amplify',
      desc: isBurmese
        ? 'တုံ့ပြန်မှုအကောင်းဆုံး ပို့စ်များကို Boost လုပ်ပြီး စိတ်ဝင်စားသူများကို ပြန်လည်ချိတ်ဆက်ခြင်း'
        : 'Boost best organic posts; retarget engaged audiences; refine CTA',
      status: 'upcoming',
    },
    {
      week: isBurmese ? 'အပတ်စဉ် ၄' : 'Week 4',
      title: isBurmese ? 'စနစ်တကျ ပြန်လည်သုံးသပ်ခြင်း (Optimize)' : 'Optimize',
      desc: isBurmese
        ? 'စုံစမ်းမှု အရည်အသွေး၊ ဆွေးနွေးမှုနှုန်းထားနှင့် ကုန်ကျစရိတ်ကို ပြန်လည်စိစစ်ခြင်း'
        : 'Review inquiry quality, consultation rate, CPL and winning topics',
      status: 'upcoming',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-[#150d2a] to-zinc-950 border border-purple-900/40 rounded-2xl p-6 sm:p-7 text-white shadow-lg mb-8 relative overflow-hidden">
      {/* Subtle Purple Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/60 text-purple-200 border border-purple-700/60">
            <Rocket className="w-3.5 h-3.5 text-purple-400" />
            <span>{isBurmese ? 'Pre-Launch မိတ်ဆက်ပြင်ဆင်မှု ကာလ — စုံစမ်းမှု ၀ ခု' : 'Stage 01: Pre-Launch Active — 0 Active Inquiries'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
            {isBurmese
              ? 'ပထမဆုံး ကျောင်းသားစုံစမ်းမှုများ မရောက်မီ အခြေခံစနစ် တည်ဆောက်ခြင်း'
              : 'Building the Repeatable Lead Engine Before Enrollments Scale'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            {isBurmese
              ? 'GOEURO သည် မိတ်ဆက်ပြင်ဆင်မှု အဆင့်တွင် ရှိနေပြီး မမှန်ကန်သော စုံစမ်းမှု အချက်အလက်အတုများ မပြသပါ။ ယခုအချိန်တွင် အရည်အသွေးမြင့် အကြောင်းအရာ ထုတ်လုပ်မှု၊ ယုံကြည်မှု တည်ဆောက်ခြင်းနှင့် အကြံပေးဆွေးနွေးမှု စံနှုန်းများ ပြည့်စုံစေရန် အဓိက လုပ်ဆောင်နေပါသည်။'
              : 'GOEURO does not display fabricated conversion numbers. Our primary pre-launch objective is consistent authority content, authentic Hamburg footage, and consultation readiness.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/inquiry"
            target="_blank"
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition text-xs sm:text-sm"
          >
            <span>{isBurmese ? 'အများပြည်သူ စုံစမ်းရန် စာမျက်နှာ' : 'Test Public Inquiry Portal'}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards (Slide 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-6 relative z-10">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 hover:border-purple-800/80 transition shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-medium">{isBurmese ? 'Content ထုတ်လုပ်မှု ပစ်မှတ်' : 'Content Output'}</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {publishedContentCount} <span className="text-sm font-semibold text-zinc-400">/ 20–30</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isBurmese ? 'လစဉ် ပုံမှန် ပို့စ်တင်နိုင်မှု ပစ်မှတ်' : 'Target: 20-30 pieces / month'}
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 hover:border-purple-800/80 transition shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-medium">{isBurmese ? 'ဂျာမနီ တိုက်ရိုက်ရုပ်သံ (Lu)' : 'Germany POV Videos'}</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {germanyVideosCount} <span className="text-sm font-semibold text-zinc-400">/ 10–12</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isBurmese ? 'ဟမ်းဘတ်ကျောင်းသားဘဝ တိုက်ရိုက်ရုပ်သံ' : 'Authentic Hamburg campus footage'}
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 hover:border-purple-800/80 transition shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-medium">{isBurmese ? 'ပြင်ဆင်မှု တာဝန်များ ပြီးစီးမှု' : 'Pre-Launch Tasks'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {completedTasksCount} <span className="text-sm font-semibold text-zinc-400">/ {totalTasksCount}</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isBurmese ? 'ပထမရက် ၃၀ အတွင်း ပြီးစီးမှု' : 'Launch sprint execution status'}
          </p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 hover:border-purple-800/80 transition shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-medium">{isBurmese ? 'စနစ် အသင့်ဖြစ်မှု' : 'System Readiness'}</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-purple-300 mt-1">
            {isBurmese ? 'အကြံပေး SOP နှင့် စစ်ဆေးချက် အသင့်ရှိ' : 'SOP & Screening Ready'}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isBurmese ? 'စုံစမ်းမှု ရောက်ရှိချိန် ချက်ချင်းစတင်နိုင်' : 'Instant intake upon first inquiry'}
          </p>
        </div>
      </div>

      {/* 30-Day Launch Roadmap (Slide 9) */}
      <div className="mt-6 pt-6 border-t border-zinc-800/80 relative z-10">
        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>{isBurmese ? 'ပထမရက် ၃၀ မိတ်ဆက်ပြင်ဆင်မှု လမ်းပြမြေပုံ' : 'GOEURO First 30-Day Pre-Launch Roadmap'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {roadmapWeeks.map((w, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition ${
                w.status === 'active'
                  ? 'bg-zinc-900/95 border-purple-500/70 shadow-sm ring-1 ring-purple-500/30'
                  : 'bg-zinc-900/40 border-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-purple-400 tracking-wider uppercase">{w.week}</span>
                {w.status === 'active' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-extrabold uppercase">
                    {isBurmese ? 'လက်ရှိ' : 'Current'}
                  </span>
                )}
              </div>
              <div className="font-bold text-white text-xs">{w.title}</div>
              <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{w.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
