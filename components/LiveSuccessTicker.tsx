'use client';

import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Building2, GraduationCap } from 'lucide-react';

interface TickerProps {
  isBurmese: boolean;
}

const verifiedMilestones = [
  {
    name: 'Ma Sandar',
    pathway: 'Nursing Ausbildung',
    city: 'Hamburg',
    achievement: '€1,240/mo Contract Signed',
    achievement_my: 'တစ်လ €1,240 လစာရ သူနာပြုစာချုပ် ချုပ်ဆိုပြီး',
    type: 'contract',
    time: '2 hours ago',
  },
  {
    name: 'Ko Min Thant',
    pathway: 'B2 German Certificate',
    city: 'Goethe-Institut',
    achievement: 'Score: 86/100 Passed',
    achievement_my: 'B2 အောင်မြင်ပြီး (ရမှတ် ၈၆/၁၀၀)',
    type: 'german',
    time: '5 hours ago',
  },
  {
    name: 'Ma Hnin Ei Phyu',
    pathway: 'MSc Computer Science',
    city: 'TU Dresden',
    achievement: 'Tuition-Free Admission',
    achievement_my: 'TU Dresden တက္ကသိုလ်ဝင်ခွင့်ရရှိပြီး (ကျူရှင်လခ ဝ€)',
    type: 'university',
    time: '1 day ago',
  },
  {
    name: 'Ko Aung Kyaw Swar',
    pathway: 'National Visa (Type D)',
    city: 'German Embassy Yangon',
    achievement: 'Official Visa Issued',
    achievement_my: 'ဂျာမနီ သံရုံး ဗီဇာ အောင်မြင်စွာ ရရှိပြီး',
    type: 'visa',
    time: 'Yesterday',
  },
  {
    name: 'Ma Thinzar Lwin',
    pathway: 'Hotel Management Ausbildung',
    city: 'Munich',
    achievement: '€1,080/mo Stipend Approved',
    achievement_my: 'မြူးနစ်မြို့ ဟိုတယ် Ausbildung ခွင့်ပြုချက်ရရှိ',
    type: 'contract',
    time: '2 days ago',
  },
  {
    name: 'Ko Zin Myo Htet',
    pathway: 'Mechatronics Ausbildung',
    city: 'Stuttgart',
    achievement: 'German Chamber (IHK) Registered',
    achievement_my: 'IHK ကုန်သည်ကြီးများအသင်း မှတ်ပုံတင်ပြီး',
    type: 'ihk',
    time: '3 days ago',
  },
];

export default function LiveSuccessTicker({ isBurmese }: TickerProps) {
  return (
    <div className="w-full bg-zinc-950 border-y border-purple-900/40 py-2.5 overflow-hidden relative select-none">
      {/* Left/Right Edge Shadow Blur for Infinite Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <div className="flex items-center space-x-6 animate-marquee whitespace-nowrap">
        {/* Render twice for continuous loop */}
        {[...verifiedMilestones, ...verifiedMilestones].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-800/40 text-xs shadow-xs transition hover:border-purple-600/70"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-white text-[11px] sm:text-xs">{item.name}</span>
            <span className="text-zinc-500 text-[10px]">•</span>
            <span className="text-purple-300 font-semibold text-[11px] sm:text-xs">
              {item.pathway} ({item.city})
            </span>
            <span className="text-zinc-500 text-[10px]">•</span>
            <span className="text-emerald-400 font-bold text-[11px] sm:text-xs">
              {isBurmese ? item.achievement_my : item.achievement}
            </span>
            <span className="text-[10px] text-zinc-500 italic ml-1">({item.time})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
