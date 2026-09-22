'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import { playSuccessSound } from '@/lib/audio';
import BrandLogo from '@/components/BrandLogo';
import BrandMascot from '@/components/BrandMascot';
import {
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight,
  Clock,
  HelpCircle,
  Award,
  Layers,
  Search,
  Check,
  UserCheck,
  Send,
  Sliders,
  Scale,
  Building,
  AlertCircle,
  Globe2
} from 'lucide-react';

export default function GuidelinesPage() {
  const { language } = useLanguage();
  const isBurmese = language === 'my';
  const { currentUser, allUsers } = useUserSession();

  const [activeTab, setActiveTab] = useState<'mandate' | 'review' | 'matrix' | 'roadmap' | 'conduct'>('mandate');

  // Digital Sign-Off State
  const [hasSigned, setHasSigned] = useState(false);
  const [signTimestamp, setSignTimestamp] = useState<string | null>(null);

  // Founder Weekly Review interactive state
  const [weeklyActions, setWeeklyActions] = useState<{
    keep: string[];
    adjust: string[];
    blocked: { issue: string; owner: string; deadline: string }[];
  }>({
    keep: [
      'Daily Telegram response within 1 business day acknowledgement',
      'Publishing verified firsthand Germany student life reels',
      'Case-by-case evaluation before accepting paid service fees'
    ],
    adjust: [
      'Refine Ausbildung nursing language intake scripts',
      'Optimize TikTok lead ad CTA link to direct Pathway Check form'
    ],
    blocked: [
      {
        issue: 'Uni-Assist Winter 2026 VPD deadline clarification for engineering bachelor applicants',
        owner: 'Nay Myo Thiha',
        deadline: 'Friday 5:00 PM'
      }
    ]
  });

  const [newKeep, setNewKeep] = useState('');
  const [newAdjust, setNewAdjust] = useState('');
  const [newBlocked, setNewBlocked] = useState({ issue: '', owner: 'Kaung Myat Htine', deadline: 'Next Monday' });

  // Approval matrix interactive tester
  const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(0);

  const handleSignAcknowledgement = () => {
    playSuccessSound();
    setHasSigned(true);
    setSignTimestamp(new Date().toLocaleString());
  };

  const addKeepItem = () => {
    if (!newKeep.trim()) return;
    setWeeklyActions({ ...weeklyActions, keep: [...weeklyActions.keep, newKeep.trim()] });
    setNewKeep('');
  };

  const addAdjustItem = () => {
    if (!newAdjust.trim()) return;
    setWeeklyActions({ ...weeklyActions, adjust: [...weeklyActions.adjust, newAdjust.trim()] });
    setNewAdjust('');
  };

  const addBlockedItem = () => {
    if (!newBlocked.issue.trim()) return;
    setWeeklyActions({
      ...weeklyActions,
      blocked: [...weeklyActions.blocked, { ...newBlocked }]
    });
    setNewBlocked({ issue: '', owner: 'Kaung Myat Htine', deadline: 'Next Monday' });
  };

  const matrixRules = [
    {
      action: isBurmese ? 'ပုံမှန် inquiry reply နှင့် follow-up' : 'Routine Inquiry Reply & Follow-Up',
      actors: isBurmese ? 'ကောင်းမြတ်ဟိန်း သို့မဟုတ် assign ရထားသော case owner (၅ ဦးလုံး ပြန်ခွင့်ရှိ)' : 'Kaung Myat Htine or assigned case owner (All 5 members permitted)',
      requirement: isBurmese ? 'Approved script / service scope အတွင်း ဆောင်ရွက်' : 'Must operate within approved scripts & verified service scope',
      level: 'SELF_EXECUTE',
      badge: isBurmese ? '၅ ဦးလုံး ပြန်ခွင့်ရှိ' : 'All 5 Staff Permitted'
    },
    {
      action: isBurmese ? 'Ausbildung requirement နှင့် deadline အချက်အလက်' : 'Ausbildung Requirements & Deadline Fact Check',
      actors: isBurmese ? 'နေမျိုးသီဟ (Ausbildung Pathway Specialist)' : 'Nay Myo Thiha (Ausbildung SME)',
      requirement: isBurmese ? 'Public claim မထုတ်မီ reviewer record တင်ပြီးမှ ထုတ်ရမည်' : 'Must record official source verification before public posting',
      level: 'PEER_REVIEW',
      badge: isBurmese ? 'နေမျိုးသီဟ စစ်ဆေးရန်' : 'Nay Myo Thiha Review'
    },
    {
      action: isBurmese ? 'University application criteria စစ်ဆေးချက်' : 'University Application & Uni-Assist Criteria',
      actors: isBurmese ? 'Assigned admissions reviewer' : 'Assigned Admissions Reviewer',
      requirement: isBurmese ? 'Official institution source (uni-assist, university portal) ဖြင့် record တင်' : 'Official institution source record mandatory',
      level: 'PEER_REVIEW',
      badge: isBurmese ? 'Official Source စစ်ရန်' : 'Official Source Required'
    },
    {
      action: isBurmese ? 'Brand claim, campaign, ad budget ceiling' : 'Brand Claims, Marketing Campaigns & Ad Spend',
      actors: isBurmese ? 'သက်ထူးနိုင် (Founder)' : 'Thet Htoo Naing (Founder)',
      requirement: isBurmese ? 'သက်ထူးနိုင် approval မရမချင်း publish / ad spend လုံးဝ မလုပ်ရ' : 'Strict Founder approval required prior to publish/spend',
      level: 'FOUNDER_APPROVAL',
      badge: isBurmese ? 'Founder Approval မဖြစ်မနေ လိုသည်' : 'Founder Approval Mandatory'
    },
    {
      action: isBurmese ? 'Partnership, refund exception, policy exception' : 'Partnerships, Refund Exceptions & Policy Waivers',
      actors: isBurmese ? 'သက်ထူးနိုင် (Founder)' : 'Thet Htoo Naing (Founder)',
      requirement: isBurmese ? 'စာဖြင့် approval နှင့် reason record သီးခြား သတ်မှတ်ရမည်' : 'Written approval record with formal business rationale',
      level: 'FOUNDER_APPROVAL',
      badge: isBurmese ? 'စာဖြင့် အတည်ပြုချက် လိုသည်' : 'Written Founder Sign-Off'
    },
    {
      action: isBurmese ? 'Complaint, privacy သို့မဟုတ် reputational incident' : 'Student Complaints, Privacy or Reputational Incident',
      actors: isBurmese ? 'လက်ခံရရှိသူမှ log လုပ်ပြီး သက်ထူးနိုင် ထံ ချက်ချင်း တင်ပြ' : 'Receiving member logs; escalate immediately to Thet Htoo Naing',
      requirement: isBurmese ? 'သက်ထူးနိုင် ထံ ချက်ချင်း တင်ပြပြီး resolution owner သတ်မှတ်' : 'Immediate escalation to Founder; assign designated resolution owner',
      level: 'URGENT_ESCALATE',
      badge: isBurmese ? 'အရေးပေါ် Escalate လုပ်ရန်' : 'Urgent Escalation'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-24 text-zinc-900">
      {/* 1. Header Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-600 text-white uppercase tracking-wider">
                  Version 1.2 • Sep 2026
                </span>
                <span className="text-zinc-400 text-xs">Official Operating Manual</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-purple-400" />
                <span>
                  {isBurmese ? 'GOEURO STUDY Founder Growth & Team Operations လမ်းညွှန်' : 'GOEURO STUDY Operations & Governance Hub'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
                {isBurmese
                  ? 'Founder & Growth Lead ၏ ဆုံးဖြတ်ပိုင်ခွင့်၊ အဖွဲ့ဝင်များ၏ တာဝန်၊ Meeting စနစ်၊ Single Source of Truth Recordkeeping နှင့် အပတ်စဉ် စစ်ဆေးရမည့် စည်းမျဉ်းများ။'
                  : 'Official operating handbook defining decision boundaries, the 7 core records, weekly founder reviews, and team compliance standards.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 transition flex items-center space-x-2"
              >
                <span>Dashboard သို့</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Quick Notice Banner on Legal Independence */}
          <div className="mt-6 p-3.5 rounded-2xl bg-purple-950/50 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
              <span>
                <strong>{isBurmese ? 'တရားဝင် သီးခြားရပ်တည်မှု:' : 'Corporate Independence:'}</strong>{' '}
                {isBurmese
                  ? 'GOEURO သည် What Is GED (WIG) နှင့် ပတ်သက်ခြင်းမရှိဘဲ What Is WorldWise International Group Ltd အောက်တွင် သီးခြား ရပ်တည်သည်။'
                  : 'GOEURO STUDY operates under What Is WorldWise International Group Ltd, completely separate from What Is GED (WIG).'}
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-300">
              Approved
            </span>
          </div>

          {/* Tabs Navigation */}
          <div className="mt-8 flex items-center space-x-2 overflow-x-auto pb-1 text-xs border-b border-zinc-800">
            {[
              { id: 'mandate', label: isBurmese ? '၁။ Vision & တာဝန်ခွဲဝေမှု' : '1. Vision & Mandate', icon: Users },
              { id: 'review', label: isBurmese ? '၂။ Founder အပတ်စဉ် Review' : '2. Founder Review (Sec 8)', icon: Sparkles },
              { id: 'matrix', label: isBurmese ? '၃။ Approval & Escalation' : '3. Approval Matrix (Sec 13)', icon: Sliders },
              { id: 'roadmap', label: isBurmese ? '၄။ ၉၀ ရက် Roadmap & Budget' : '4. 90-Day Roadmap (Sec 10)', icon: Layers },
              { id: 'conduct', label: isBurmese ? '၅။ စည်းမျဉ်း & Sign-Off' : '5. Code & Sign-Off (Sec 14)', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#FBFBFE] text-zinc-950 border-t-2 border-purple-600'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* =========================================================================
            TAB 1: VISION, MISSION, TEAM ROSTER & MANDATES
           ========================================================================= */}
        {activeTab === 'mandate' && (
          <div className="space-y-8 animate-fade-in">
            {/* Mission & Vision Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Official Mission
                  </span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950">
                  {isBurmese ? 'မြန်မာကျောင်းသားများနှင့် ကမ္ဘာ့အဆင့်မီ ပညာရေး' : 'Bridging Myanmar to Top-Tier German Universities'}
                </h3>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {isBurmese
                    ? 'မြန်မာနိုင်ငံမှ ရည်မှန်းချက်ရှိသော ကျောင်းသားများနှင့် ကမ္ဘာ့အဆင့်မီ ပညာရေးအခွင့်အလမ်းများကို ချိတ်ဆက်ပေးရန်၊ ဂျာမနီရှိ အရည်အသွေးမြင့် တက္ကသိုလ်များမှ စတင်၍ လမ်းညွှန်ပျိုးထောင်ရန်။'
                    : 'To bridge the gap between ambitious students in Myanmar and world-class educational opportunities, starting with top-tier universities in Germany.'}
                </p>
                <div className="text-[11px] text-zinc-500 font-mono italic">
                  &quot;To bridge the gap between ambitious students in Myanmar and world-class educational opportunities...&quot;
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Official Vision
                  </span>
                  <Compass className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950">
                  {isBurmese ? 'ဥရောပပညာရေးအတွက် ထိပ်တန်း လမ်းညွှန်ဝင်ပေါက်' : 'Premier Gateway for European Education'}
                </h3>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {isBurmese
                    ? 'ဥရောပပညာရေးအတွက် ထိပ်တန်းလမ်းညွှန်ဝင်ပေါက်တစ်ခု ဖြစ်လာပြီး ပြည့်စုံသော လမ်းညွှန်မှုနှင့် ပံ့ပိုးမှုဝန်ဆောင်မှုများကို ဥရောပသမဂ္ဂနိုင်ငံအားလုံးအထိ ချဲ့ထွင်ရန်။'
                    : 'To become the premier gateway for European education, expanding our comprehensive guidance and support services to cover all European Union nations.'}
                </p>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                  <strong>⚠️ {isBurmese ? 'သတိပြုရန် စည်းမျဉ်း:' : 'Strict Rule:'}</strong>{' '}
                  {isBurmese
                    ? 'လက်ရှိတွင် Germany Public University နှင့် Ausbildung (၂) ခုကိုသာ service scope အဖြစ် ဆောင်ရွက်မည်။ အခြား EU နိုင်ငံများသည် Vision သာဖြစ်ပြီး လက်ရှိဝန်ဆောင်မှုဟု Marketing တွင် မဖော်ပြရ။'
                    : 'Currently only Germany Public University & Ausbildung are active service scopes. Other EU nations are part of our long-term Vision and MUST NOT be marketed as current services.'}
                </div>
              </div>
            </div>

            {/* Founder Boundary vs Execution */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {isBurmese ? '၁။ Founder ၏ အဓိကတာဝန်နှင့် ဆုံးဖြတ်ပိုင်ခွင့် (Section 1)' : '1. Founder Decision Boundary & Delegation'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {isBurmese
                      ? 'နေ့စဉ် message ဖြေခြင်းအစပြု ကိုယ်တိုင်လုပ်ခြင်းထက် အပတ်စဉ် ရလဒ်နှင့် အခက်အခဲအပေါ် ဆုံးဖြတ်ချက်ချခြင်း'
                      : 'Operating balance between Founder authority, delegated execution, and weekly evidence.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-950 text-white uppercase">
                  Governance
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                {/* Col 1: Founder Sole Authority */}
                <div className="p-6 space-y-3 bg-purple-50/30">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-700" />
                    <span>{isBurmese ? 'သက်ထူးနိုင် ကိုယ်တိုင်ဆုံးဖြတ်' : 'Founder Sole Decisions'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Positioning & Brand Promise:</strong> Official claims and service guarantees</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Campaign Objective & Budget Ceiling:</strong> Paid ad spend limits</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Partnership Acceptance & Public Claims:</strong> MOUs, university tie-ups</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Service Policy & Escalations:</strong> Policy exceptions and refund decisions</span>
                    </li>
                  </ul>
                </div>

                {/* Col 2: Delegated Execution */}
                <div className="p-6 space-y-3">
                  <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBurmese ? 'လွှဲအပ်နိုင်သော Execution' : 'Delegated Execution'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span>Content production, posting schedule, inquiry follow-up</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span>Approved plan အတိုင်း asset ထုတ်ခြင်း၊ campaign run ခြင်း</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span>Partner research နှင့် due diligence အချက်အလက် စုစည်းခြင်း</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span>Approved scope အတွင်း student case operation ဆောင်ရွက်ခြင်း</span>
                    </li>
                  </ul>
                </div>

                {/* Col 3: Weekly Evidence */}
                <div className="p-6 space-y-3 bg-zinc-50/50">
                  <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isBurmese ? 'အပတ်စဉ်ကြည့်ရမည့် သက်သေ' : 'Weekly Required Evidence'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Qualified inquiry များ၏ အဓိက မေးခွန်းနှင့် အရင်းအမြစ်</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Channel အလိုက် ad spend, qualified inquiry, booked consultations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Partner lead quality, complaints, referral outcomes</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Response time, case milestones, unresolved issues</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Team Roster & Assigned Responsibilities */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {isBurmese ? 'လက်ရှိအဖွဲ့ဝင်များနှင့် တာဝန်များ (Official Team Roster)' : 'Official Team Roster & Designated Roles'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isBurmese ? 'Guideline Version 1.2 အတိုင်း တရားဝင် တာဝန်ပေးအပ်ထားသော အဖွဲ့ဝင်များ' : 'Key leadership and execution owners recognized in Guideline v1.2'}
                  </p>
                </div>
                <Users className="w-5 h-5 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {[
                  {
                    name: 'Thet Htoo Naing (သက်ထူးနိုင်)',
                    title: 'Founder and Growth Lead',
                    email: 'thn@goeuro.de',
                    duties: isBurmese ? 'Positioning, budget, partnerships, brand approval, final policy' : 'Strategic governance, brand approval, ad spend ceiling, final policy',
                    badge: 'Tier 1 • Founder',
                    badgeCls: 'bg-amber-100 text-amber-900 border-amber-200'
                  },
                  {
                    name: 'Kaung Myat Htine (ကောင်းမြတ်ဟိန်း)',
                    title: 'Student Journey and Case Lead',
                    email: 'kmh@goeuro.de',
                    duties: isBurmese ? 'Inquiry assignment, consultation outcomes, student case milestones' : 'End-to-end student admissions, case milestones, inquiry lead intake',
                    badge: 'Tier 3 • Consultant',
                    badgeCls: 'bg-purple-100 text-purple-900 border-purple-200'
                  },
                  {
                    name: 'Ye Yint Tun Thant (ရဲရင့်ထွန်းသန့်)',
                    title: 'Campaign Operations Coordinator',
                    email: 'yytt@goeuro.de',
                    duties: isBurmese ? 'Production calendar, content ownership, publish dates, channel metrics' : 'Marketing campaigns, content production calendar, publish scheduling',
                    badge: 'Tier 3 • Consultant',
                    badgeCls: 'bg-purple-100 text-purple-900 border-purple-200'
                  },
                  {
                    name: 'Lu Min Myat (လူမင်းမြတ်)',
                    title: 'Germany Experience and Content Lead',
                    email: 'lu@goeuro.de',
                    duties: isBurmese ? 'Firsthand Germany student experience, Hamburg ground realities' : 'Germany firsthand life content, Hamburg ground operations, living guidance',
                    badge: 'Tier 3 • Consultant',
                    badgeCls: 'bg-purple-100 text-purple-900 border-purple-200'
                  },
                  {
                    name: 'Nay Myo Thiha (နေမျိုးသီဟ)',
                    title: 'Ausbildung Pathway Specialist',
                    email: 'nay@goeuro.de',
                    duties: isBurmese ? 'Ausbildung requirements, employer vetting, German language criteria' : 'Vocational training requirements, German contract vetting, SME review',
                    badge: 'Tier 3 • Consultant',
                    badgeCls: 'bg-purple-100 text-purple-900 border-purple-200'
                  },
                  {
                    name: 'System Admin (Super Admin)',
                    title: 'IT & System Security Lead',
                    email: 'admin@goeuro.de',
                    duties: isBurmese ? 'Platform security, WebRTC room recording, database backup' : 'Platform governance, database security, WebRTC video meeting infrastructure',
                    badge: 'Tier 2 • Super Admin',
                    badgeCls: 'bg-zinc-100 text-zinc-900 border-zinc-200'
                  }
                ].map((member, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-50/60 border border-zinc-200/80 hover:border-purple-200 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${member.badgeCls}`}>
                        {member.badge}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">{member.email}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950">{member.name}</h4>
                      <p className="text-[11px] text-purple-700 font-semibold">{member.title}</p>
                    </div>
                    <p className="text-[11px] text-zinc-600 pt-1 border-t border-zinc-100 leading-relaxed">
                      {member.duties}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Policy on No False Claims */}
            <div className="p-6 rounded-3xl bg-rose-50/80 border border-rose-200 text-zinc-800 space-y-3">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{isBurmese ? 'မဖြစ်မနေ လိုက်နာရမည့် Claim တားမြစ်ချက် (Section 3)' : 'Strict Ban on Unverified Public Claims'}</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed font-semibold">
                {isBurmese
                  ? '“လူတိုင်း သွားနိုင်သည်”၊ “Visa သေချာသည်” သို့မဟုတ် “Job/Training place ရမည်” ဟူသော claim များကို Marketing နှင့် စကားပြောဆိုမှုတိုင်းတွင် လုံးဝ (လုံးဝ) မသုံးပါနှင့်။'
                  : 'NEVER use ungrounded promises like "Everyone is eligible", "Guaranteed Visa", or "Job/Training Place Guaranteed". All pathways depend on authoritative German institutions.'}
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-rose-200/60 text-xs text-zinc-700">
                <strong>{isBurmese ? 'တရားဝင် သတ်မှတ်ထားသော Brand Promise:' : 'Approved Official Brand Promise:'}</strong><br />
                <span className="italic text-purple-900 font-medium">
                  {isBurmese
                    ? '“Germany လမ်းကြောင်းကို သင့်အခြေအနေအလိုက် ရှင်းလင်းစွာစစ်ဆေး၊ လျှောက်ထားရန် ပြင်ဆင်ပြီး အဆင့်တိုင်းကို မှတ်တမ်းတင်လိုက်ပါမည်။”'
                    : '"We thoroughly evaluate your profile against current German standards, prepare your tailored application, and track every single step with full transparency."'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: FOUNDER WEEKLY MANAGEMENT REVIEW (SECTION 8)
           ========================================================================= */}
        {activeTab === 'review' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header intro */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Section 8 Operational Engine
                </span>
                <span className="text-xs text-zinc-400 font-mono">Website Dashboard (မကြာခင်ရမည်) &rarr; LIVE NOW</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                {isBurmese ? 'Founder ၏ အပတ်စဉ် Management Review စနစ်' : "Founder's Weekly Management Review System"}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {isBurmese
                  ? 'Founder က အပတ်စဉ် shared dashboard ကို စစ်ပါ။ Owner တစ်ဦးစီက ပြီးခဲ့သည့်အပတ် ရလဒ်၊ ယခုအပတ် next action နှင့် Founder ဆုံးဖြတ်ရန်လိုသော အချက်ကို meeting မတိုင်မီ ထည့်ထားရမည်။ Founder ၏ review သည် team ၏ routine coordination meeting များကို အစားမထိုးပါ။'
                  : 'Weekly structured sync evaluating performance across Marketing, Student Journey, Accuracy, Ground Experience, and Executive Decisions.'}
              </p>
            </div>

            {/* The 5 Weekly Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  area: isBurmese ? '၁။ Marketing' : '1. Marketing',
                  question: isBurmese ? 'ဘယ် content / ကမ်ပိန်းက qualified inquiry ရစေသလဲ?' : 'Which content/campaign generated qualified inquiries?',
                  owner: isBurmese ? 'သက်ထူးနိုင် + ရဲရင့်ထွန်းသန့်' : 'THN + Ye Yint',
                  color: 'border-purple-200 bg-purple-50/40 text-purple-950'
                },
                {
                  area: isBurmese ? '၂။ Student Journey' : '2. Student Journey',
                  question: isBurmese ? 'Inquiry ဘယ်အဆင့်မှာ ရပ်နေသလဲ၊ follow-up လွတ်နေသလား?' : 'Where are inquiries stuck, any missed follow-up gaps?',
                  owner: isBurmese ? 'ကောင်းမြတ်ဟိန်း' : 'Kaung Myat Htine',
                  color: 'border-blue-200 bg-blue-50/40 text-blue-950'
                },
                {
                  area: isBurmese ? '၃။ Accuracy' : '3. Accuracy',
                  question: isBurmese ? 'Requirement သို့မဟုတ် deadline ဘာပြောင်းလဲမှု ရှိသလဲ?' : 'Any official German requirement or deadline changes?',
                  owner: isBurmese ? 'နေမျိုးသီဟ + reviewer' : 'Nay Myo Thiha',
                  color: 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                },
                {
                  area: isBurmese ? '၄။ Experience' : '4. Ground Experience',
                  question: isBurmese ? 'Germany firsthand content တွင် ဘာက အသုံးဝင်သလဲ?' : 'What firsthand Germany student content resonated?',
                  owner: isBurmese ? 'လူမင်းမြတ်' : 'Lu Min Myat',
                  color: 'border-amber-200 bg-amber-50/40 text-amber-950'
                },
                {
                  area: isBurmese ? '၅။ Executive Decision' : '5. Decision',
                  question: isBurmese ? 'နောက်အပတ် ဘာကို ဆက်လုပ်၊ ပြင်၊ ရပ်မလဲ?' : 'Next week: What to Keep, Adjust, or Stop?',
                  owner: isBurmese ? 'သက်ထူးနိုင် (Founder)' : 'Thet Htoo Naing',
                  color: 'border-zinc-300 bg-zinc-100/60 text-zinc-950'
                },
              ].map((q, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${q.color} space-y-2 flex flex-col justify-between shadow-2xs`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{q.area}</span>
                    <p className="text-xs font-bold mt-1 leading-snug">{q.question}</p>
                  </div>
                  <div className="pt-2 border-t border-black/5 text-[11px] font-semibold text-zinc-600">
                    Lead: {q.owner}
                  </div>
                </div>
              ))}
            </div>

            {/* Founder Weekly Decision Output Engine (Keep, Adjust, Blocked) */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h4 className="text-base font-bold text-zinc-950">
                    {isBurmese ? 'Founder ၏ အပတ်စဉ် Output သုံးရပ် (Keep, Adjust, Blocked)' : "Founder's Weekly Output Board"}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {isBurmese
                      ? 'ရလဒ်မကောင်းသောသူကို အပြစ်ရှာခြင်းမဟုတ်ဘဲ skill, capacity, process သို့မဟုတ် offer ဘယ်မှာ လိုအပ်နေသလဲ သုံးသပ်ခြင်း'
                      : 'Blameless operational review evaluating skill, capacity, process, and offer improvements.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSuccessSound();
                    alert(isBurmese ? 'အပတ်စဉ် Review မှတ်တမ်းကို သိမ်းဆည်းပြီးပါပြီ!' : 'Weekly Review log saved to audit trail.');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {isBurmese ? 'အစည်းအဝေး မှတ်တမ်း အတည်ပြုသိမ်းဆည်းရန်' : 'Save Weekly Review Audit'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Keep / Continue */}
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 uppercase">
                    <span className="flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>(၁) ဆက်လုပ်မည့်အလုပ် (Keep)</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                      {weeklyActions.keep.length}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-800">
                    {weeklyActions.keep.map((item, idx) => (
                      <li key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newKeep}
                      onChange={(e) => setNewKeep(e.target.value)}
                      placeholder={isBurmese ? 'အသစ်ထည့်ရန်...' : 'Add keep item...'}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={addKeepItem}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Column 2: Adjust / Improve */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase">
                    <span className="flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      <span>(၂) ပြင်မည့်အလုပ် (Adjust)</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                      {weeklyActions.adjust.length}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-800">
                    {weeklyActions.adjust.map((item, idx) => (
                      <li key={idx} className="p-2.5 rounded-xl bg-white border border-amber-100 shadow-2xs leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newAdjust}
                      onChange={(e) => setNewAdjust(e.target.value)}
                      placeholder={isBurmese ? 'အသစ်ထည့်ရန်...' : 'Add adjust item...'}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      onClick={addAdjustItem}
                      className="px-2.5 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Column 3: Blocked / Escalations */}
                <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 uppercase">
                    <span className="flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>(၃) Blocked Issues & Owner</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">
                      {weeklyActions.blocked.length}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-800">
                    {weeklyActions.blocked.map((item, idx) => (
                      <li key={idx} className="p-2.5 rounded-xl bg-white border border-rose-100 shadow-2xs space-y-1">
                        <p className="font-semibold text-zinc-950">{item.issue}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-100">
                          <span>Owner: <strong className="text-zinc-800">{item.owner}</strong></span>
                          <span>Due: <strong className="text-rose-700">{item.deadline}</strong></span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 space-y-2">
                    <input
                      type="text"
                      value={newBlocked.issue}
                      onChange={(e) => setNewBlocked({ ...newBlocked, issue: e.target.value })}
                      placeholder={isBurmese ? 'Blocked အကြောင်းအရာ...' : 'Issue description...'}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newBlocked.owner}
                        onChange={(e) => setNewBlocked({ ...newBlocked, owner: e.target.value })}
                        placeholder="Owner"
                        className="w-1/2 px-2.5 py-1 text-[11px] bg-white border border-zinc-200 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newBlocked.deadline}
                        onChange={(e) => setNewBlocked({ ...newBlocked, deadline: e.target.value })}
                        placeholder="Deadline"
                        className="w-1/2 px-2.5 py-1 text-[11px] bg-white border border-zinc-200 rounded-lg"
                      />
                      <button
                        onClick={addBlockedItem}
                        className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: APPROVAL & ESCALATION MATRIX (SECTION 13)
           ========================================================================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Section 13 Compliance Matrix
                </span>
                <Sliders className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                {isBurmese ? 'Approval နှင့် Escalation လမ်းကြောင်းများ' : 'Approval & Escalation Authority Matrix'}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {isBurmese
                  ? 'Founder မရှိသည့်အချိန်တွင် approved policy အတွင်း routine work ကို ဆက်လုပ်နိုင်သည်။ Policy exception လိုသည့်ကိစ္စကို အာမခံချက်မပေးဘဲ “စစ်ဆေးပြီး ပြန်အကြောင်းကြားမည်” ဟုသာ ပြောပါ။'
                  : 'Clear operational lines defining who can execute directly vs who must request written Founder approval.'}
              </p>
            </div>

            {/* Matrix Table */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">ကိစ္စ (Action / Area)</th>
                      <th className="py-3 px-4 font-bold">လုပ်ဆောင်သူ (Authorized Actor)</th>
                      <th className="py-3 px-4 font-bold">အတည်ပြု / တင်ပြရန် (Requirement)</th>
                      <th className="py-3 px-4 font-bold">အဆင့် (Authority Level)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {matrixRules.map((rule, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedActionIndex(idx)}
                        className={`hover:bg-purple-50/40 transition cursor-pointer ${
                          selectedActionIndex === idx ? 'bg-purple-50/60 font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-zinc-950">{rule.action}</td>
                        <td className="py-3.5 px-4 text-zinc-700">{rule.actors}</td>
                        <td className="py-3.5 px-4 text-zinc-600">{rule.requirement}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              rule.level === 'FOUNDER_APPROVAL'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : rule.level === 'URGENT_ESCALATE'
                                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {rule.badge}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Decision Checker */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 to-purple-950 text-white space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{isBurmese ? 'မိမိလုပ်ဆောင်မည့် လုပ်ငန်းကို စစ်ဆေးရန် (Interactive Checker)' : 'Instant Authority Validator'}</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {selectedActionIndex !== null ? matrixRules[selectedActionIndex].action : 'Select an action from the table above'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Can I proceed directly?</div>
                  <div className="text-sm font-bold text-white">
                    {selectedActionIndex === 0
                      ? '✅ Yes (Within approved script/scope)'
                      : selectedActionIndex === 1 || selectedActionIndex === 2
                      ? '⚠️ Yes, but source review must be recorded'
                      : '🛑 No (Founder sign-off required)'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Authorized Lead</div>
                  <div className="text-sm font-bold text-purple-200">
                    {selectedActionIndex !== null ? matrixRules[selectedActionIndex].actors : 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Escalation Protocol</div>
                  <div className="text-sm font-bold text-amber-300">
                    If in doubt: Log & Escalate to Thet Htoo Naing
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: 90-DAY OPERATIONAL ROADMAP & BUDGET GATES (SECTIONS 5 & 10)
           ========================================================================= */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Section 10 Roadmap
                </span>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                {isBurmese ? 'ပထမ ၉၀ ရက် လုပ်ငန်းအစီအစဉ် (First 90-Day Execution Plan)' : 'First 90-Day Operational Execution Plan'}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {isBurmese
                  ? 'ပထမ hire ကို workload evidence အပေါ်မူတည်၍ ရွေးပါ။ Content backlog ဖြစ်လျှင် part-time editor; university accuracy ဖြစ်လျှင် admissions specialist; follow-up backlog ဖြစ်လျှင် case coordinator ကို ဦးစားပေးပါ။'
                  : 'Structured progression from foundational setup to validation and capacity-conscious scaling.'}
              </p>
            </div>

            {/* 3 Phases Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phase 1 */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-4 relative overflow-hidden">
                <div className="w-1.5 h-full bg-purple-600 absolute left-0 top-0" />
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
                    Phase 1 (ရက် ၁ မှ ၃၀)
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">
                    {isBurmese ? 'အခြေခံ အဆောက်အအုံနှင့် Positioning' : 'Positioning & Core Setup'}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isBurmese ? 'သက်ထူးနိုင် အတည်ပြုရမည့်အရာ' : 'Founder Approval Deliverables'}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-zinc-700">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Positioning and Brand Promise lock</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Two pathway pages (Uni + Ausbildung)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Website Pathway Check form live</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Content approval & baseline budget ceiling</span>
                  </li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-4 relative overflow-hidden">
                <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0" />
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                    Phase 2 (ရက် ၃၁ မှ ၆၀)
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Active Now</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">
                    {isBurmese ? 'ချန်နယ် စမ်းသပ်ခြင်းနှင့် Funnel ပြင်ဆင်ခြင်း' : 'Channel Testing & Scope Refinement'}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isBurmese ? 'မြင်တွေ့ရမည့် ရလဒ်' : 'Target Outcomes'}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-zinc-700">
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">→</span>
                    <span>Test Facebook vs. TikTok engagement</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">→</span>
                    <span>Consultation script & service scope refinement</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">→</span>
                    <span>Identify conversion bottlenecks in CRM</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">→</span>
                    <span>Pilot cadence: 2 short videos, 1 FAQ post, 1 firsthand experience reel weekly</span>
                  </li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-4 relative overflow-hidden">
                <div className="w-1.5 h-full bg-zinc-300 absolute left-0 top-0" />
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 uppercase">
                    Phase 3 (ရက် ၆၁ မှ ၉၀)
                  </span>
                  <span className="text-xs text-zinc-400">Upcoming</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">
                    {isBurmese ? 'Scale ချဲ့ထွင်ခြင်းနှင့် Team တိုးချဲ့ခြင်း' : 'Scaling & Evidence-Based Hiring'}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isBurmese ? 'ဆုံးဖြတ်ချက်' : 'Strategic Decisions'}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-zinc-700">
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-[10px] font-bold shrink-0">•</span>
                    <span>Evaluate repeatable campaign scaling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-[10px] font-bold shrink-0">•</span>
                    <span>Hire based on workload evidence (Part-time editor vs Admissions vs Coordinator)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-[10px] font-bold shrink-0">•</span>
                    <span>Maintain service quality without burning team capacity</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Budget Gates (Section 5) */}
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h4 className="text-base font-bold text-zinc-950">
                  {isBurmese ? '၅။ Marketing Budget ဆုံးဖြတ်ချက်နှင့် Budget Gates (Section 5)' : 'Marketing Budget Gates'}
                </h4>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="text-xs font-bold text-purple-900 uppercase">Gate 1: Test Approval</div>
                  <p className="text-xs text-zinc-600">
                    Message, landing page, owner, tracking, maximum spend clear ဖြစ်မှ စတင် run ရမည်။
                  </p>
                  <div className="text-[11px] text-rose-700 font-semibold">
                    🛑 ရပ်ရမည့်အခြေအနေ: CTA မပြည့်စုံ၊ Claim မစစ်ရသေး။
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="text-xs font-bold text-purple-900 uppercase">Gate 2: Weekly Review</div>
                  <p className="text-xs text-zinc-600">
                    Qualified inquiry နှင့် consultation တိုးတက်မှုရှိမှသာ budget ဆက်သုံးမည်။
                  </p>
                  <div className="text-[11px] text-rose-700 font-semibold">
                    🛑 ရပ်ရမည့်အခြေအနေ: Views တက်သော်လည်း inquiry quality မရှိ၊ backlog ဖြစ်။
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="text-xs font-bold text-purple-900 uppercase">Gate 3: Scale Decision</div>
                  <p className="text-xs text-zinc-600">
                    Repeatable lead quality ရှိပြီး ကောင်းမြတ်ဟိန်း counselor capacity လုံလောက်မှ scale မည်။
                  </p>
                  <div className="text-[11px] text-rose-700 font-semibold">
                    🛑 ရပ်ရမည့်အခြေအနေ: Case service ပေးနိုင်စွမ်းထက် lead ပိုဝင်လာ။
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CODE OF CONDUCT, DIGITAL SIGN-OFF & SOURCES (SECTIONS 11, 12, 14)
           ========================================================================= */}
        {activeTab === 'conduct' && (
          <div className="space-y-8 animate-fade-in">
            {/* The 7 Core Records (Section 12) */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {isBurmese ? '၁၂။ မှတ်တမ်းတင်ခြင်းအတွက် တစ်ခုတည်းသော စနစ် (Single Source of Truth)' : '12. Single Source of Truth System'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isBurmese
                      ? 'GOEURO STUDY Team Management App ကို record ၏ အဓိကနေရာအဖြစ် သုံးပါ။ Chat history တစ်ခုတည်းကို case record ဟု မယူပါနှင့်။'
                      : 'The GOEURO Web Platform is the definitive record for all agency workflows.'}
                  </p>
                </div>
                <FileText className="w-5 h-5 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: '1. Inquiry CRM', link: '/leads', owner: 'Kaung Myat Htine', desc: 'Consent, channel, qualification' },
                  { name: '2. Student Cases', link: '/cases', owner: 'Kaung Myat Htine / Counselor', desc: 'Agreed scope, checklist, milestones' },
                  { name: '3. Content Hub', link: '/marketing', owner: 'Ye Yint / Lu Min Myat', desc: 'Brief, factual review, publish links' },
                  { name: '4. Campaigns & Spend', link: '/marketing', owner: 'Thet Htoo Naing / Ye Yint', desc: 'Audience, budget ceiling, actual spend' },
                  { name: '5. Meeting Minutes', link: '/dashboard', owner: 'Meeting Lead', desc: 'Agenda, decisions, due dates' },
                  { name: '6. Complaint Log', link: '/settings', owner: 'Receiver -> THN', desc: 'Impact, owner, resolution action' },
                  { name: '7. Knowledge Base', link: '/knowledge', owner: 'Assigned Specialist', desc: 'Verified official criteria' },
                ].map((rec, idx) => (
                  <Link
                    key={idx}
                    href={rec.link}
                    className="p-3.5 rounded-2xl bg-zinc-50/60 border border-zinc-200 hover:border-purple-300 hover:bg-purple-50/20 transition block space-y-1"
                  >
                    <div className="text-xs font-bold text-zinc-950 flex items-center justify-between">
                      <span>{rec.name}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </div>
                    <div className="text-[10px] text-purple-700 font-semibold">Lead: {rec.owner}</div>
                    <div className="text-[10px] text-zinc-500">{rec.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Official Source Verification Links (Section 14) */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h4 className="text-base font-bold text-zinc-950">
                    {isBurmese ? 'တရားဝင် စစ်ဆေးရန် ရင်းမြစ်များ (Official Verification Sources)' : 'Authoritative German Verification Sources'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {isBurmese ? 'အချက်အလက် မသေချာပါက အောက်ပါ တရားဝင် Website များတွင်သာ တိုက်ရိုက် စစ်ဆေးပါ' : 'Cross-check all student requirements directly with these official platforms'}
                  </p>
                </div>
                <Globe2 className="w-5 h-5 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: 'Make it in Germany',
                    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/training',
                    desc: 'German Federal Government Portal for Vocational Training & Ausbildung'
                  },
                  {
                    name: 'Uni-Assist e.V.',
                    url: 'https://www.uni-assist.de/en/how-to-apply/',
                    desc: 'Official University Application Processing Portal (VPD, Criteria, Deadlines)'
                  },
                  {
                    name: 'German Embassy Yangon',
                    url: 'https://rangun.diplo.de/mm-en/service/2296512-2296512',
                    desc: 'Official Visa Regulations, Sperrkonto Requirements & Appointment Protocols'
                  },
                  {
                    name: 'DataReportal Myanmar',
                    url: 'https://datareportal.com/reports/digital-2026-myanmar',
                    desc: 'Digital Channel Demographics, Myanmar Reach & Communication Trends'
                  }
                ].map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-zinc-50 hover:bg-purple-50/40 border border-zinc-200/80 hover:border-purple-300 transition block space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-950 group-hover:text-purple-700">
                      <span>{src.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-600 transition" />
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{src.desc}</p>
                    <div className="text-[10px] text-purple-600 font-mono pt-1">Visit Official Portal →</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Digital Member Acknowledgement Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-white shadow-xl shadow-purple-950/20 border border-purple-800/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 text-[11px] font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-purple-300" />
                    <span>Member Acknowledgement (Section 14)</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isBurmese ? 'အဖွဲ့ဝင်များ လိုက်နာရမည့် စည်းမျဉ်း သဘောတူလက်မှတ်' : 'Digital Member Sign-Off & Ethics Pledge'}
                  </h3>
                </div>
                {hasSigned ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified & Signed • {signTimestamp}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSignAcknowledgement}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition cursor-pointer flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isBurmese ? 'ဖတ်ရှုနားလည်ပြီး လက်ခံပါသည် (Sign)' : 'I Agree & Sign Acknowledgement'}</span>
                  </button>
                )}
              </div>

              {/* Exact Text from Page 10 */}
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-xs sm:text-sm text-zinc-200 leading-relaxed font-serif space-y-3">
                <p>
                  &quot;{isBurmese
                    ? 'ကျွန်ုပ်သည် GOEURO STUDY ၏ role, communication, approval, data access နှင့် recordkeeping စည်းမျဉ်းများကို ဖတ်ရှုနားလည်ပြီး မိမိတာဝန်အတွင်း လိုက်နာဆောင်ရွက်မည်။ မရှင်းလင်းသည့်အချက်ရှိပါက သက်ဆိုင်ရာ Lead ထံ မေးမြန်းမည်။'
                    : 'I have read, understood, and agree to uphold GOEURO STUDY rules regarding my assigned role, communication etiquette, approval thresholds, data privacy, and single source of truth recordkeeping. If any ambiguity arises, I will consult the designated lead before taking external action.'}&quot;
                </p>
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                  <span>Authorized Staff: <strong className="text-white">{currentUser?.name || 'Staff Member'}</strong> ({currentUser?.email})</span>
                  <span>Role: <strong className="text-purple-300">{currentUser?.title || currentUser?.role?.name}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
