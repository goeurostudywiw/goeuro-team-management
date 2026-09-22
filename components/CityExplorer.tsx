'use client';

import React, { useState } from 'react';
import { MapPin, Building2, Euro, GraduationCap, Train, Users, Sparkles, ArrowRight } from 'lucide-react';

interface CityExplorerProps {
  isBurmese: boolean;
}

const cities = [
  {
    id: 'hamburg',
    name: 'Hamburg',
    state: 'Freie und Hansestadt Hamburg',
    tagline: 'GOEURO European Headquarters & Port Gateway',
    tagline_my: 'GOEURO ၏ ဂျာမနီဌာနချုပ် တည်ရှိရာ စီးပွားရေးဆိပ်ကမ်းမြို့တော်',
    avgStipend: '€1,180 – €1,450 / mo',
    livingCost: '€850 – €980 / mo',
    studentPop: '115,000+ Students',
    highlights: ['University of Hamburg (Excellence Cluster)', 'UKE Hamburg (Top University Hospital)', 'Europe’s 3rd Largest Port Logistics Hub'],
    highlights_my: ['ဟမ်းဘတ် တက္ကသိုလ်ကြီး (UHH)', 'UKE ထိပ်တန်း တက္ကသိုလ်ဆေးရုံကြီး', 'ဥရောပ၏ အကြီးမားဆုံး ကုန်သွယ်ဆိပ်ကမ်းလုပ်ငန်းများ'],
    badge: 'GOEURO HQ',
  },
  {
    id: 'munich',
    name: 'Munich (München)',
    state: 'Bavaria (Bayern)',
    tagline: 'High-Tech & Engineering Powerhouse',
    tagline_my: 'ကမ္ဘာ့ထိပ်တန်း အင်ဂျင်နီယာနှင့် နည်းပညာ မြို့တော်ကြီး',
    avgStipend: '€1,200 – €1,500 / mo',
    livingCost: '€950 – €1,150 / mo',
    studentPop: '130,000+ Students',
    highlights: ['Technical University of Munich (TUM #1 in Germany)', 'BMW, Siemens & Tech Headquarters', 'World-Class Healthcare & Clean Transit'],
    highlights_my: ['TUM ဂျာမနီ နံပါတ် ၁ နည်းပညာတက္ကသိုလ်', 'BMW, Siemens နည်းပညာဌာနချုပ်များ', 'အဆင့်မြင့် ဆေးရုံများနှင့် သန့်ရှင်းသော မြို့ပြစနစ်'],
    badge: 'Top Tech Hub',
  },
  {
    id: 'berlin',
    name: 'Berlin',
    state: 'Federal Capital',
    tagline: 'Global Startup Capital & International Culture',
    tagline_my: 'နိုင်ငံတကာ ယဉ်ကျေးမှုနှင့် Startup နည်းပညာဗဟိုချက်',
    avgStipend: '€1,050 – €1,300 / mo',
    livingCost: '€850 – €1,000 / mo',
    studentPop: '200,000+ Students',
    highlights: ['Charité – Universitätsmedizin (Europe’s Largest Clinic)', 'TU Berlin & Humboldt University', 'Vibrant International Student Communities'],
    highlights_my: ['Charité ဥရောပ၏ အကြီးဆုံး ဆေးတက္ကသိုလ်ကြီး', 'TU Berlin နည်းပညာတက္ကသိုလ်ကြီး', 'နိုင်ငံတကာ ကျောင်းသားပေါင်း ၂ သိန်းကျော်'],
    badge: 'Capital City',
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt am Main',
    state: 'Hesse (Hessen)',
    tagline: 'Financial Capital of Continental Europe',
    tagline_my: 'ဥရောပ ဗဟိုဘဏ်နှင့် ဘဏ္ဍာရေး စီးပွားရေးမြို့တော်',
    avgStipend: '€1,100 – €1,380 / mo',
    livingCost: '€900 – €1,050 / mo',
    studentPop: '75,000+ Students',
    highlights: ['European Central Bank & Frankfurt Airport Hub', 'Goethe University Frankfurt', 'Multinational Corporate Headquarters'],
    highlights_my: ['ဥရောပ ဗဟိုဘဏ်နှင့် လေကြောင်းပို့ဆောင်ရေးဗဟို', 'Goethe တက္ကသိုလ်ကြီး', 'ကမ္ဘာ့ကော်ပိုရိတ် လုပ်ငန်းကြီးများ တည်ရှိရာ'],
    badge: 'Finance Hub',
  },
  {
    id: 'leipzig',
    name: 'Leipzig & Dresden',
    state: 'Saxony (Sachsen)',
    tagline: 'Silicon Saxony & Most Affordable Living',
    tagline_my: 'နေထိုင်စရိတ် အသက်သာဆုံးနှင့် Silicon နည်းပညာစင်တာ',
    avgStipend: '€1,020 – €1,280 / mo',
    livingCost: '€700 – €850 / mo',
    studentPop: '90,000+ Students',
    highlights: ['TU Dresden (Excellence University)', 'Leipzig University (Founded 1409)', 'Affordable Student Housing (€250-€350/mo)'],
    highlights_my: ['TU Dresden ထိပ်တန်း တက္ကသိုလ်', '၁၄၀၉ ခုနှစ်ကတည်းက တည်ထောင်ခဲ့သော လိုက်ပ်ဇစ်တက္ကသိုလ်', 'ကျောင်းသား အဆောင်စရိတ် အလွန်သက်သာခြင်း'],
    badge: 'Best Value',
  },
];

export default function CityExplorer({ isBurmese }: CityExplorerProps) {
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  return (
    <div className="w-full bg-[#FAFAFC] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-purple-700" />
            <span>{isBurmese ? 'ဂျာမနီမြို့ကြီးများ လမ်းညွှန်' : 'German Study Destinations'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            {isBurmese ? 'သင်နေထိုင် ပညာသင်ကြားမည့် ဂျာမနီမြို့ကြီးများ' : 'Explore Germany’s Top Student Cities'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500">
            {isBurmese
              ? 'ဟမ်းဘတ်၊ မြူးနစ်၊ ဘာလင် စသည့် မြို့ကြီးများ၏ နေထိုင်စရိတ်၊ ပျမ်းမျှလစာနှင့် ကျောင်းသားဘဝကို လေ့လာပါ'
              : 'From our European headquarters in Hamburg to Bavaria and Berlin, discover where your career will flourish.'}
          </p>
        </div>

        {/* City Selector Buttons */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto space-x-2.5 pb-4 mb-8 no-scrollbar">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition btn-press flex items-center space-x-2 ${
                selectedCity.id === city.id
                  ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/20'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/90'
              }`}
            >
              <span>{city.name}</span>
              {city.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCity.id === city.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {city.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selected City Detailed Feature Box */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div>
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">{selectedCity.state}</div>
              <h4 className="text-2xl sm:text-3xl font-black text-zinc-950 mt-1">{selectedCity.name}</h4>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
                {isBurmese ? selectedCity.tagline_my : selectedCity.tagline}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-semibold">
                  <Euro className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isBurmese ? 'Ausbildung လစာ' : 'Avg. Stipend'}</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-purple-950 mt-1">
                  {selectedCity.avgStipend}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{isBurmese ? 'နေထိုင်စရိတ်' : 'Est. Living Cost'}</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-zinc-900 mt-1">
                  {selectedCity.livingCost}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px] font-semibold">
                  <Users className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{isBurmese ? 'ကျောင်းသားဦးရေ' : 'Student Base'}</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-zinc-900 mt-1">
                  {selectedCity.studentPop}
                </div>
              </div>
            </div>

            {/* Key Advantages */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-zinc-800">
                {isBurmese ? 'မြို့၏ အဓိက အားသာချက်များနှင့် ထိပ်တန်းကျောင်းများ:' : 'City Advantages & Academic Institutions:'}
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-600">
                {(isBurmese ? selectedCity.highlights_my : selectedCity.highlights).map((h, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-purple-900 via-zinc-950 to-zinc-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4 text-left">
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{isBurmese ? 'GOEURO ၏ မြို့တွင်း ထောက်ပံ့မှု' : 'GOEURO On-Ground Presence'}</span>
            </div>

            <h5 className="text-lg font-extrabold text-white">
              {isBurmese ? `${selectedCity.name} သို့ ရောက်ရှိချိန် ဝန်ဆောင်မှုများ` : `Direct Support in ${selectedCity.name}`}
            </h5>

            <p className="text-xs text-purple-100/90 leading-relaxed">
              {isBurmese
                ? `GOEURO သည် ${selectedCity.name} မြို့ရှိ အလုပ်ရှင်ဆေးရုံများ၊ ကုမ္ပဏီများနှင့် တိုက်ရိုက်ချိတ်ဆက်ထားပြီး လေဆိပ်ကြိုဆိုခြင်း၊ အဆောင်နေရာရှာဖွေခြင်းနှင့် မြို့တော်ခန်းမ နေထိုင်ခွင့် (Anmeldung) မှတ်ပုံတင်ခြင်းများကို တိုက်ရိုက်ကူညီပါသည်။`
                : `Our liaison network directly coordinates with local vocational schools, university admission boards, and municipal registration offices (Bürgeramt) across ${selectedCity.name}.`}
            </p>

            <div className="pt-2">
              <a
                href="#consultation"
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition btn-press shadow-md"
              >
                <span>{isBurmese ? `${selectedCity.name} လမ်းကြောင်း မေးမြန်းမည်` : `Explore Opportunities in ${selectedCity.name}`}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
