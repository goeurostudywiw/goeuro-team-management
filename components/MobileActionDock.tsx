'use client';

import React from 'react';
import { Phone, MessageCircle, Sparkles, Calendar } from 'lucide-react';

interface MobileDockProps {
  isBurmese: boolean;
}

export default function MobileActionDock({ isBurmese }: MobileDockProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-purple-900/40 px-3 py-2 shadow-2xl">
      <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
        {/* 1. Phone / Hotline */}
        <a
          href="tel:+95945000000"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white transition active:scale-95"
        >
          <Phone className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-bold mt-0.5">
            {isBurmese ? 'ဖုန်းခေါ်' : 'Call'}
          </span>
        </a>

        {/* 2. Telegram */}
        <a
          href="https://t.me/goeurostudy"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white transition active:scale-95"
        >
          <MessageCircle className="w-4 h-4 text-sky-400" />
          <span className="text-[10px] font-bold mt-0.5">Telegram</span>
        </a>

        {/* 3. Quick Matcher */}
        <a
          href="#eligibility"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white transition active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">
            {isBurmese ? 'စစ်ဆေးမည်' : 'Matcher'}
          </span>
        </a>

        {/* 4. Book Free Consultation */}
        <a
          href="#consultation"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-purple-600 text-white font-bold transition active:scale-95 shadow-md shadow-purple-600/30"
        >
          <Calendar className="w-4 h-4 text-white" />
          <span className="text-[10px] font-bold mt-0.5">
            {isBurmese ? 'စာရင်းသွင်း' : 'Book'}
          </span>
        </a>
      </div>
    </div>
  );
}
