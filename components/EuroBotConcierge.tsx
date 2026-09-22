'use client';

import React, { useState } from 'react';
import BrandMascot from './BrandMascot';
import {
  MessageSquare,
  X,
  Send,
  HelpCircle,
  Calendar,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PhoneCall,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

interface ConciergeProps {
  isBurmese: boolean;
}

const quickFaqs = [
  {
    q: 'How much money do I need for Germany?',
    q_my: 'ဂျာမနီသွားဖို့ ငွေဘယ်လောက်ကုန်ကျပါသလဲ။',
    a: 'For an Ausbildung, you do NOT need a €11,904 blocked account because you earn €1,000–€1,400/month from Day 1! You only need standard translation, visa application, and plane ticket fees. For Public Universities, an annual €11,904 Sperrkonto (Blocked Account) is legally required for living expenses, but tuition is 0 €.',
    a_my: 'Ausbildung အတွက် လစဉ်လစာ (ယူရို ၁,၀၀၀+) ရရှိသောကြောင့် ယူရို ၁၁,၉၀၄ Sperrkonto သွင်းရန် မလိုပါ! ဘာသာပြန်ကြေး၊ ဗီဇာကြေးနှင့် လေယာဉ်လက်မှတ်သာ ကုန်ကျပါမည်။ အစိုးရတက္ကသိုလ်အတွက်မူ ကျူရှင်လခ အခမဲ့ဖြစ်သော်လည်း နေထိုင်စရိတ်အတွက် Sperrkonto လိုအပ်ပါသည်။',
  },
  {
    q: 'Can I apply for Ausbildung with high school education?',
    q_my: 'ဆယ်တန်း/အထက်တန်းအောင်ရုံဖြင့် Ausbildung လျှောက်နိုင်ပါသလား။',
    a: 'Yes, absolutely! High school completion, GED, or IGCSE is fully recognized for German dual vocational Ausbildung. The most essential requirement is German language proficiency (Goethe or telc B1/B2 level).',
    a_my: 'ဟုတ်ကဲ့၊ အပြည့်အဝ လျှောက်ထားနိုင်ပါသည်! အထက်တန်းအောင်၊ GED သို့မဟုတ် IGCSE ရှိပါက ဂျာမနီ Ausbildung ကို တိုက်ရိုက် လျှောက်ထားနိုင်ပြီး အဓိက အရေးကြီးဆုံးမှာ ဂျာမန်စာ B1/B2 အောင်မြင်ရန် ဖြစ်ပါသည်။',
  },
  {
    q: 'When is the next Germany intake?',
    q_my: 'နောက်ထပ် ဂျာမနီ ကျောင်း/အလုပ် ဝင်ခွင့် ဘယ်အချိန်ရှိပါသလဲ။',
    a: 'Major intakes are Winter Intake (September/October 2026) and Summer Intake (March/April 2027). Application preparation and visa scheduling typically require 4 to 6 months in advance.',
    a_my: 'အဓိက ဝင်ခွင့်များမှာ စက်တင်ဘာ/အောက်တိုဘာ ၂၀၂၆ (ဆောင်းရာသီဝင်ခွင့်) နှင့် မတ်/ဧပြီ ၂၀၂၇ (နွေရာသီဝင်ခွင့်) တို့ဖြစ်ပြီး လျှောက်ထားရန် အနည်းဆုံး ၄ လမှ ၆ လ ကြိုတင် ပြင်ဆင်ရပါမည်။',
  },
];

export default function EuroBotConcierge({ isBurmese }: ConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <>
      {/* Floating Mascot Launcher Button in Bottom-Right */}
      <aside aria-label="EuroBot AI Concierge" className="fixed bottom-[4.25rem] sm:bottom-6 right-3 sm:right-6 z-30 sm:z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-zinc-950 text-white shadow-xl shadow-purple-900/40 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 border-2 border-purple-400/40 cursor-pointer"
          title="Chat with EuroBot AI Concierge"
        >
          <div className="relative">
            <BrandMascot variant="avatar" size={32} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>
          <span className="hidden md:inline font-bold text-xs pr-2 tracking-wide">
            {isBurmese ? 'EuroBot ကို မေးမြန်းမည်' : 'Ask EuroBot'}
          </span>
        </button>
      </aside>

      {/* Expandable Glassmorphic Modal Concierge */}
      {isOpen && (
        <aside
          aria-label="EuroBot Chat Window"
          className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[380px] max-h-[82vh] bg-zinc-950/95 text-white backdrop-blur-2xl rounded-3xl border border-purple-500/40 shadow-2xl z-50 flex flex-col overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-900 via-zinc-900 to-zinc-950 border-b border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <BrandMascot variant="avatar" size={34} />
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>EuroBot Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-purple-300">
                  {isBurmese ? 'ဂျာမနီပညာသင် အထူးအကြံပေး' : 'Germany Education Advisor'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh] text-left">
            <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-800/60 text-xs text-purple-200 leading-relaxed">
              {isBurmese
                ? 'မင်္ဂလာပါ! ကျွန်တော်က EuroBot ဖြစ်ပါတယ်။ ဂျာမနီပညာသင်ကြားရေးနှင့် ပတ်သက်ပြီး သိလိုသည်များကို အောက်ပါမေးခွန်းများမှတစ်ဆင့် ချက်ချင်း ဖတ်ရှုနိုင်ပါသည်:'
                : 'Hallo! I am EuroBot. What would you like to know about studying, working, or Ausbildung in Germany? Select a topic below:'}
            </div>

            {/* Quick Question Buttons */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {isBurmese ? 'အမေးများသော အချက်များ:' : 'Frequently Inquired:'}
              </div>
              {quickFaqs.map((faq, i) => (
                <div key={i} className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/60">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full p-2.5 text-left text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-between gap-2 hover:bg-zinc-800/50 transition"
                  >
                    <span>{isBurmese ? faq.q_my : faq.q}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-purple-400 shrink-0 transition-transform ${
                        activeFaq === i ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {activeFaq === i && (
                    <div className="p-3 text-[11px] text-zinc-300 leading-relaxed bg-purple-950/30 border-t border-zinc-800">
                      {isBurmese ? faq.a_my : faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Direct Connect Actions */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {isBurmese ? 'တိုက်ရိုက် ဆက်သွယ်ရန်:' : 'Direct Connect:'}
              </div>

              <a
                href="#consultation"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition btn-press shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isBurmese ? 'အခမဲ့ အကြံပေးဆွေးနွေးမှု စာရင်းသွင်းမည်' : 'Book Free Consultation'}</span>
              </a>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="https://t.me/goeurostudy"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-center font-semibold transition"
                >
                  Telegram Channel
                </a>
                <a
                  href="tel:+95945000000"
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-center font-semibold transition"
                >
                  Hotline / Viber
                </a>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
