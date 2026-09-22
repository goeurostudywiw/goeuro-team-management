'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Briefcase,
  GraduationCap,
  Euro,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';

interface CalculatorProps {
  isBurmese: boolean;
  onSelectOption?: (info: any) => void;
}

const vocations = [
  {
    id: 'nursing',
    name: 'General Nursing & Healthcare (Pflegefachkraft)',
    name_my: 'အထွေထွေ သူနာပြုနှင့် ကျန်းမာရေးစောင့်ရှောက်မှု',
    y1: 1190,
    y2: 1260,
    y3: 1380,
    demand: 'Extreme High (Official Shortage Occupation)',
    demand_my: 'ဂျာမနီ အလိုအရှိဆုံး နံပါတ် ၁ အလုပ်အကိုင်',
  },
  {
    id: 'it',
    name: 'IT Application Development (Fachinformatiker)',
    name_my: 'IT ကွန်ပျူတာနှင့် Software နည်းပညာ',
    y1: 1050,
    y2: 1150,
    y3: 1290,
    demand: 'Very High (Tech Innovation Hubs)',
    demand_my: 'နည်းပညာကုမ္ပဏီကြီးများ အထူးလိုအပ်ချက်',
  },
  {
    id: 'mechatronics',
    name: 'Mechatronics & Automotive (Mechatroniker)',
    name_my: 'စက်မှုအင်ဂျင်နီယာနှင့် မော်တော်ကားနည်းပညာ',
    y1: 1080,
    y2: 1180,
    y3: 1320,
    demand: 'High (Automotive Excellence)',
    demand_my: 'ဂျာမန် ကားနှင့် စက်ရုံကြီးများ အဓိကလမ်းကြောင်း',
  },
  {
    id: 'hotel',
    name: 'Hotel & Hospitality Management (Hotelfachmann)',
    name_my: 'ဟိုတယ်နှင့် ဧည့်ဝတ်ကျေပွန်မှု စီမံခန့်ခွဲမှု',
    y1: 950,
    y2: 1050,
    y3: 1180,
    demand: 'High (Tourism & Event Centers)',
    demand_my: 'ဟိုတယ်လုပ်ငန်းစုကြီးများ အလုပ်အကိုင် အာမခံ',
  },
];

export default function InteractiveCalculator({ isBurmese, onSelectOption }: CalculatorProps) {
  const [activeTab, setActiveTab] = useState<'ausbildung' | 'university'>('ausbildung');
  const [selectedVocation, setSelectedVocation] = useState(vocations[0]);
  const [uniDegree, setUniDegree] = useState<'bachelor' | 'master'>('bachelor');

  // Ausbildung Calculations
  const avgMonthly = Math.round((selectedVocation.y1 + selectedVocation.y2 + selectedVocation.y3) / 3);
  const totalThreeYears = (selectedVocation.y1 + selectedVocation.y2 + selectedVocation.y3) * 12;
  const estimatedKyatsMonthly = Math.round(avgMonthly * 4600 / 100000); // in Lakhs approx

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-purple-100 shadow-xl shadow-purple-950/5 p-6 sm:p-10 relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5 text-purple-700" />
            <span>{isBurmese ? 'တိုက်ရိုက် ဘဏ္ဍာရေးနှင့် လစာ တွက်ချက်စက်' : 'Interactive Germany Financial Simulator'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950">
            {isBurmese
              ? 'ဂျာမနီပညာသင်ကြားရေး ကုန်ကျစရိတ်နှင့် လစာ တွက်ချက်ကြည့်ပါ'
              : 'Calculate Your Costs, Stipend & Real Savings'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {isBurmese
              ? 'လစဉ်ရရှိမည့် လစာ၊ ကျူရှင်လခ သက်သာမှုနှင့် Blocked Account လို/မလို ချက်ချင်း စစ်ဆေးပါ'
              : 'Real numbers based on official German federal regulations and employer collective agreements.'}
          </p>
        </div>

        {/* Pathway Mode Switcher Pill */}
        <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 border border-zinc-200 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('ausbildung')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition btn-press ${
              activeTab === 'ausbildung'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Ausbildung (Paid Stipend)</span>
          </button>
          <button
            onClick={() => setActiveTab('university')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition btn-press ${
              activeTab === 'university'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Public University (€0 Tuition)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Ausbildung Calculator */}
      {activeTab === 'ausbildung' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                {isBurmese ? 'အသက်မွေးဝမ်းကျောင်း ဘာသာရပ် ရွေးချယ်ပါ' : 'Select Vocational Field:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vocations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVocation(v)}
                    className={`p-3.5 rounded-2xl border text-left transition btn-press flex flex-col justify-between ${
                      selectedVocation.id === v.id
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                        : 'border-zinc-200 hover:border-purple-200 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-zinc-900">
                      {isBurmese ? v.name_my : v.name}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[11px]">
                      <span className="text-purple-700 font-extrabold">€{v.y1} – €{v.y3}/mo</span>
                      <span className="text-zinc-400 text-[10px]">3 Years</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Demand Badge */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isBurmese ? selectedVocation.demand_my : selectedVocation.demand}</span>
            </div>

            {/* Yearly Stipend Ladder */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-bold text-zinc-700">
                {isBurmese ? '၃ နှစ်တာ လစဉ် လစာတိုးတက်မှုဇယား' : 'Year-by-Year Stipend Progression:'}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Year 1</div>
                  <div className="text-base font-black text-purple-700 mt-0.5">€{selectedVocation.y1}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">/ month</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Year 2</div>
                  <div className="text-base font-black text-purple-700 mt-0.5">€{selectedVocation.y2}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">/ month</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Year 3</div>
                  <div className="text-base font-black text-purple-700 mt-0.5">€{selectedVocation.y3}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">/ month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-300">
                {isBurmese ? 'ဘဏ္ဍာရေး အနှစ်ချုပ်' : 'Financial Breakdown'}
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Guaranteed</span>
              </span>
            </div>

            <div>
              <div className="text-xs text-zinc-400">
                {isBurmese ? '၃ နှစ်တာ စုစုပေါင်း ရရှိမည့် လစာ' : 'Total 3-Year Guaranteed Stipend:'}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                €{totalThreeYears.toLocaleString()}
              </div>
              <div className="text-xs text-purple-300 font-semibold mt-1">
                ≈ {isBurmese ? `တစ်လလျှင် မြန်မာငွေ သိန်း ${estimatedKyatsMonthly} ခန့်` : `Avg. ~€${avgMonthly} / month net earnings`}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{isBurmese ? 'ကျူရှင်လခ' : 'Tuition Fees'}:</span>
                <span className="font-extrabold text-emerald-400">0 € (100% Free)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{isBurmese ? 'Blocked Account (€11,904)' : 'Blocked Account (€11,904)'}:</span>
                <span className="font-extrabold text-emerald-400">WAIVED (မလိုပါ)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">{isBurmese ? 'ဂျာမန်ဘာသာစကား သတ်မှတ်ချက်' : 'Language Prerequisite'}:</span>
                <span className="font-bold text-purple-200">Goethe / telc B1–B2</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSelectOption) {
                  onSelectOption({
                    type: 'ausbildung',
                    title: selectedVocation.name,
                    stipend: `€${selectedVocation.y1}–€${selectedVocation.y3}/mo (3-yr total €${totalThreeYears.toLocaleString()})`
                  });
                } else {
                  const el = document.getElementById('consultation');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition btn-press cursor-pointer"
            >
              <span>{isBurmese ? 'ဤလမ်းကြောင်းဖြင့် အခမဲ့ စတင်လျှောက်ထားရန်' : 'Apply for this Ausbildung'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Public University Calculator */}
      {activeTab === 'university' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                {isBurmese ? 'တက်ရောက်လိုသော ဘွဲ့အမျိုးအစား' : 'Target University Degree Level:'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUniDegree('bachelor')}
                  className={`p-4 rounded-2xl border text-left transition btn-press ${
                    uniDegree === 'bachelor'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                      : 'border-zinc-200 hover:border-purple-200 bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-zinc-900">Bachelor of Science / Arts</div>
                  <div className="text-xs text-zinc-500 mt-1">3 Years • 180 ECTS Credits</div>
                  <div className="text-xs text-purple-700 font-bold mt-2">100% Tuition-Free</div>
                </button>

                <button
                  onClick={() => setUniDegree('master')}
                  className={`p-4 rounded-2xl border text-left transition btn-press ${
                    uniDegree === 'master'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20'
                      : 'border-zinc-200 hover:border-purple-200 bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-zinc-900">Master of Science / Arts</div>
                  <div className="text-xs text-zinc-500 mt-1">2 Years • 120 ECTS Credits</div>
                  <div className="text-xs text-purple-700 font-bold mt-2">100% Tuition-Free</div>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2 text-xs">
              <div className="font-bold text-purple-950 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>{isBurmese ? 'တက္ကသိုလ်ကျောင်းသားများအတွက် အကျိုးခံစားခွင့်များ' : 'German State University Highlights:'}</span>
              </div>
              <ul className="space-y-1 text-zinc-700">
                <li>• <strong>ကျူရှင်လခ လုံးဝမရှိ:</strong> အစိုးရတက္ကသိုလ်များဖြစ်၍ ပြည်နယ်အစိုးရမှ ကျူရှင်လခ အပြည့်အဝ စိုက်ထုတ်ပေးပါသည်။</li>
                <li>• <strong>အချိန်ပိုင်း အလုပ်လုပ်ခွင့်:</strong> တစ်နှစ်လျှင် ရက်ပေါင်း ၁၄၀ တရားဝင် အချိန်ပိုင်း အလုပ်လုပ်ခွင့်ရှိပါသည်။</li>
                <li>• <strong>ဘွဲ့ရပြီး ၁၈ လ အလုပ်ရှာဖွေခွင့်:</strong> ဂျာမနီတွင် အမြဲတမ်းအလုပ်နှင့် EU Blue Card ရရှိရန် အလွန်အခွင့်အလမ်းကောင်းမွန်ပါသည်။</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-300">
                {isBurmese ? 'တက္ကသိုလ် ဘဏ္ဍာရေး အကျဉ်း' : 'Estimated Investment'}
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                <Euro className="w-3 h-3" />
                <span>0 € Tuition</span>
              </span>
            </div>

            <div>
              <div className="text-xs text-zinc-400">
                {isBurmese ? 'US / UK / AUS နှင့် နှိုင်းယှဉ်လျှင် သက်သာမည့် ကျူရှင်လခ' : 'Estimated Tuition Savings vs UK/US:'}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
                +€45,000 Saved
              </div>
              <div className="text-xs text-zinc-300 mt-1">
                {isBurmese ? 'ဂျာမနီတွင် ကျူရှင်လခ ဝ€ သာ ကုန်ကျသဖြင့် ကျပ်သိန်းပေါင်း ထောင်ချီ သက်သာပါသည်' : 'You only pay standard living costs via your own Sperrkonto'}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Semester Ticket (ရထား/ဘတ်စ်ကား အခမဲ့):</span>
                <span className="font-bold text-white">€150 – €350 / 6 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Blocked Account (မိမိကိုယ်ပိုင် သုံးစွဲငွေ):</span>
                <span className="font-bold text-purple-300">€11,904 / year</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Job Seeker Visa Upon Graduation:</span>
                <span className="font-bold text-emerald-400">18 Months Full Rights</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSelectOption) {
                  onSelectOption({
                    type: 'university',
                    title: uniDegree === 'bachelor' ? 'Bachelor Degree (3 Years)' : 'Master Degree (2 Years)',
                    stipend: '0 € Tuition-Free State University'
                  });
                } else {
                  const el = document.getElementById('consultation');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition btn-press cursor-pointer"
            >
              <span>{isBurmese ? 'တက္ကသိုလ် လျှောက်ထားရန် ဆွေးနွေးမည်' : 'Book University Consultation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
