'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Languages,
  Target,
  RotateCcw,
  Send,
  MessageSquare
} from 'lucide-react';

interface QuizProps {
  isBurmese: boolean;
  onComplete?: (result: any) => void;
}

export default function EligibilityQuiz({ isBurmese, onComplete }: QuizProps) {
  const [step, setStep] = useState(1);
  const [education, setEducation] = useState<string>('');
  const [germanLevel, setGermanLevel] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  const resetQuiz = () => {
    setStep(1);
    setEducation('');
    setGermanLevel('');
    setGoal('');
    setCompleted(false);
  };

  // Determine recommendation
  const getRecommendation = () => {
    if (goal === 'EARN_SALARY' || education === 'HIGH_SCHOOL' || education === 'MATRICULATION') {
      return {
        pathway: 'Dual Ausbildung (Vocational Training)',
        pathway_my: 'လစာရ Dual Ausbildung (အသက်မွေးဝမ်းကျောင်း)',
        match: '96%',
        desc_my: 'သင့်အခြေအနေအရ ဂျာမနီတွင် လစဉ် လစာ ယူရို ၁,၀၀၀ ကျော်ရရှိပြီး ကျူရှင်လခ အခမဲ့ဖြစ်သော Ausbildung သည် အသင့်တော်ဆုံး ဖြစ်ပါသည်။ Blocked account ငွေသွင်းရန် မလိုဘဲ အလုပ်အကိုင် အာမခံချက် အမြင့်မားဆုံး ရရှိပါမည်။',
        desc_en: 'Based on your background and target, a fully contracted German Ausbildung program with a €1,000+ monthly stipend is your optimal route. No €11,904 blocked account required!',
        recommendedVocation: 'Nursing / Healthcare or IT & Software Specialist',
        recommendedVocation_my: 'အထွေထွေ သူနာပြု သို့မဟုတ် IT ဆော့ဖ်ဝဲလ် အထူးပြု',
      };
    } else {
      return {
        pathway: 'Public University (Tuition-Free Degree)',
        pathway_my: 'ဂျာမနီ အစိုးရတက္ကသိုလ် (ကျူရှင်လခ အခမဲ့ ဘွဲ့/မဟာဘွဲ့)',
        match: '94%',
        desc_my: 'သင့်တွင် ဘွဲ့ဒီဂရီ သို့မဟုတ် အထက်တန်းပညာအရည်အချင်း ပြည့်စုံသဖြင့် ဂျာမနီ အဆင့်မြင့် အစိုးရ တက္ကသိုလ်များတွင် ကျူရှင်လခ ၀ ယူရိုဖြင့် တက်ရောက်နိုင်ပါသည်။ ဘွဲ့ရရှိပြီးပါက ၁၈ လ အလုပ်ရှာဖွေခွင့်နှင့် EU Blue Card ရရှိပါမည်။',
        desc_en: 'You qualify for 100% tuition-free state universities. After graduation, you are entitled to an 18-month job search visa leading directly to the EU Blue Card.',
        recommendedVocation: 'MSc Computer Science, Engineering, or Data Analytics',
        recommendedVocation_my: 'ကွန်ပျူတာသိပ္ပံ၊ အင်ဂျင်နီယာ သို့မဟုတ် စီးပွားရေးစီမံခန့်ခွဲမှု',
      };
    }
  };

  const rec = getRecommendation();

  return (
    <div className="w-full bg-gradient-to-br from-purple-950 via-zinc-950 to-zinc-900 text-white rounded-3xl p-6 sm:p-10 border border-purple-800/40 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>{isBurmese ? '၆၀ စက္ကန့်အတွင်း အရည်အချင်းစစ်ဆေးခြင်း' : 'Instant 60-Second Germany Matcher'}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {isBurmese
            ? 'သင့်အတွက် အကောင်းဆုံး ဂျာမနီလမ်းကြောင်းကို ရှာဖွေပါ'
            : 'Find Your Perfect Germany Study Pathway'}
        </h3>
        <p className="text-xs sm:text-sm text-purple-200/80">
          {isBurmese
            ? 'မေးခွန်း (၃) ခု ဖြေဆိုရုံဖြင့် သင့်ပညာအရည်အချင်းနှင့် ကိုက်ညီသော အခွင့်အလမ်းကို စစ်ဆေးနိုင်ပါသည်'
            : 'Answer 3 simple questions to see which educational route guarantees your highest visa success.'}
        </p>
      </div>

      {!completed ? (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step === s
                      ? 'bg-purple-600 text-white ring-4 ring-purple-600/30'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 hidden sm:inline">
                  {s === 1 ? 'Education' : s === 2 ? 'German' : 'Goal'}
                </span>
                {s < 3 && <div className="w-8 sm:w-16 h-0.5 bg-zinc-800 mx-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Education */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-xs font-bold text-zinc-200">
                {isBurmese ? '၁။ သင်၏ လက်ရှိ အမြင့်ဆုံး ပညာအရည်အချင်းကို ရွေးပါ:' : '1. What is your highest educational background?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'HIGH_SCHOOL', label: 'High School / GED / IGCSE', label_my: 'အထက်တန်းအောင် / GED / IGCSE' },
                  { id: 'BACHELOR', label: 'Bachelor’s Degree (Graduate)', label_my: 'တက္ကသိုလ် ဘွဲ့ရရှိပြီးသူ' },
                  { id: 'DIPLOMA', label: 'Diploma / AGTI / Technical', label_my: 'ဒီပလိုမာ / AGTI / စက်မှု' },
                  { id: 'STUDYING', label: 'Currently Enrolled University', label_my: 'တက္ကသိုလ် ဆဲဆဲ ကျောင်းသား' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setEducation(opt.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left transition btn-press ${
                      education === opt.id
                        ? 'border-purple-500 bg-purple-900/50 text-white'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{isBurmese ? opt.label_my : opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: German Level */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-xs font-bold text-zinc-200">
                {isBurmese ? '၂။ သင်၏ လက်ရှိ ဂျာမန်ဘာသာစကား ကျွမ်းကျင်မှု အဆင့်:' : '2. What is your current German language proficiency?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'A0', label: 'A0 (Complete Beginner / Never Studied)', label_my: 'A0 (စတင်လေ့လာမည့်သူ / မသင်ရသေးပါ)' },
                  { id: 'A1_A2', label: 'A1 – A2 (Basic Elementary German)', label_my: 'A1 - A2 (အခြေခံ သင်ယူနေဆဲ)' },
                  { id: 'B1', label: 'B1 (Intermediate / Preparing Exam)', label_my: 'B1 (စာမေးပွဲ ဖြေဆိုရန် ပြင်ဆင်နေသူ)' },
                  { id: 'B2_PLUS', label: 'B2+ (Upper Intermediate / Passed Certificate)', label_my: 'B2+ (Goethe/telc လက်မှတ် ရရှိထားသူ)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setGermanLevel(opt.id);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition btn-press ${
                      germanLevel === opt.id
                        ? 'border-purple-500 bg-purple-900/50 text-white'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{isBurmese ? opt.label_my : opt.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                ← {isBurmese ? 'အရင်မေးခွန်းသို့ ပြန်သွားရန်' : 'Back to Step 1'}
              </button>
            </div>
          )}

          {/* Step 3: Priority Goal */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-xs font-bold text-zinc-200">
                {isBurmese ? '၃။ ဂျာမနီသို့ သွားရောက်ရာတွင် သင်၏ အဓိက ရည်မှန်းချက်:' : '3. What is your primary priority in Germany?'}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: 'EARN_SALARY',
                    label: 'Earn a Monthly Stipend from Day 1 & Get Certified Job Contract',
                    label_my: 'လစဉ် လစာ (ယူရို ၁,၀၀၀+) ချက်ချင်းရရှိပြီး ၃ နှစ်အတွင်း အလုပ်အကိုင် အာမခံချက် ရယူလိုသည် (Ausbildung)',
                  },
                  {
                    id: 'DEGREE',
                    label: 'Earn a Prestigious Bachelor / Master Degree at a Tuition-Free State University',
                    label_my: 'အစိုးရတက္ကသိုလ်တွင် ကျူရှင်လခ အခမဲ့ဖြင့် နိုင်ငံတကာအသိအမှတ်ပြု ဘွဲ့/မဟာဘွဲ့ ရယူလိုသည်',
                  },
                  {
                    id: 'FAST_VISA',
                    label: 'Fastest Legal Transition to Germany with Full Work Rights',
                    label_my: 'တရားဝင် ဥရောပတွင် အမြဲတမ်း နေထိုင်အလုပ်လုပ်ကိုင်ခွင့် (PR / EU Blue Card) သို့ အမြန်ဆုံး လျှောက်လှမ်းလိုသည်',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setGoal(opt.id);
                      setCompleted(true);
                      if (onComplete) onComplete({ education, germanLevel, goal: opt.id });
                    }}
                    className={`p-4 rounded-2xl border text-left transition btn-press ${
                      goal === opt.id
                        ? 'border-purple-500 bg-purple-900/50 text-white'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{isBurmese ? opt.label_my : opt.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                ← {isBurmese ? 'အရင်မေးခွန်းသို့ ပြန်သွားရန်' : 'Back to Step 2'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="max-w-2xl mx-auto bg-zinc-900/90 border border-purple-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-purple-400 font-bold">
                {isBurmese ? 'သင်နှင့် အကိုက်ညီဆုံး လမ်းကြောင်း' : 'Your Recommended Germany Pathway'}
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {isBurmese ? rec.pathway_my : rec.pathway}
              </h4>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm text-center shrink-0">
              {rec.match} Profile Match
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {isBurmese ? rec.desc_my : rec.desc_en}
          </p>

          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/80 space-y-1 text-xs">
            <span className="font-bold text-purple-200">
              {isBurmese ? 'အကြံပြု အထူးပြု ဘာသာရပ်များ:' : 'Top Suggested Specializations:'}
            </span>
            <div className="text-white font-semibold">{isBurmese ? rec.recommendedVocation_my : rec.recommendedVocation}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                if (onComplete) {
                  onComplete({
                    education,
                    germanLevel,
                    goal,
                    matchedPathway: rec.pathway,
                    matchScore: rec.match,
                    field: rec.recommendedVocation,
                  });
                }
                const el = document.getElementById('consultation');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition btn-press cursor-pointer"
            >
              <span>{isBurmese ? 'ဤလမ်းကြောင်းအတွက် အခမဲ့ လျှောက်ထားမည်' : 'Proceed with this Pathway'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={resetQuiz}
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition btn-press"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBurmese ? 'ပြန်လည်စစ်ဆေးရန်' : 'Retake Quiz'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
