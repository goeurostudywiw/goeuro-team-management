'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import BrandMascot from '@/components/BrandMascot';
import LiveSuccessTicker from '@/components/LiveSuccessTicker';
import InteractiveCalculator from '@/components/InteractiveCalculator';
import EligibilityQuiz from '@/components/EligibilityQuiz';
import CityExplorer from '@/components/CityExplorer';
import EuroBotConcierge from '@/components/EuroBotConcierge';
import MobileActionDock from '@/components/MobileActionDock';
import TiltCard from '@/components/TiltCard';
import ScrollReveal from '@/components/ScrollReveal';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Globe2,
  ShieldCheck,
  Building2,
  FileCheck,
  Send,
  Star,
  Clock,
  MapPin,
  Lock,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Calculator,
  Compass,
  Check,
  Users,
  Award,
  PhoneCall
} from 'lucide-react';

export default function PublicLandingPage() {
  const [lang, setLang] = useState<'en' | 'my'>('my');
  const isBurmese = lang === 'my';

  // Inquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pathway: 'AUSBILDUNG',
    germanLevel: 'A0',
    educationLevel: 'High School graduate',
    notes: '',
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Discreet staff keyboard shortcut: Ctrl+Shift+L or Cmd+Shift+L
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        window.location.href = '/login';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for quiz and calculator handoffs
  const handleCalculatorSelect = (info: any) => {
    setFormData((prev) => ({
      ...prev,
      pathway: info.type === 'ausbildung' ? 'AUSBILDUNG' : 'PUBLIC_UNIVERSITY',
      notes: `Interested in: ${info.title || info.type}. Expected stipend/tuition: ${info.stipend || 'Tuition-Free'}.`,
    }));
    const el = document.getElementById('consultation');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuizComplete = (result: any) => {
    setFormData((prev) => ({
      ...prev,
      pathway: result.matchedPathway?.includes('Ausbildung') ? 'AUSBILDUNG' : 'PUBLIC_UNIVERSITY',
      germanLevel: result.germanLevel || prev.germanLevel,
      educationLevel: result.education || prev.educationLevel,
      notes: `Eligibility Quiz Result: ${result.matchedPathway} (${result.matchScore}% Match). Target Vocation: ${result.field || 'General'}.`,
    }));
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/inquiry/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          pathway: 'AUSBILDUNG',
          germanLevel: 'A0',
          educationLevel: 'High School graduate',
          notes: '',
        });
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-zinc-900 flex flex-col font-sans selection:bg-purple-600 selection:text-white pb-20 md:pb-0">
      {/* 1. Corporate Top Announcement Bar */}
      <div className="bg-gradient-to-r from-zinc-950 via-purple-950 to-zinc-950 text-white text-xs py-2 px-4 border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white tracking-wide uppercase">
              Germany Intake 2026
            </span>
            <span className="hidden sm:inline text-zinc-300">
              {isBurmese
                ? '🇩🇪 ၂၀၂၆ ဂျာမနီ အခမဲ့ တက္ကသိုလ်များနှင့် လစာရ Ausbildung လျှောက်လွှာများကို လက်ခံနေပါပြီ။'
                : '🇩🇪 Applications are now open for German State Universities & Paid Ausbildung Programs.'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLang(isBurmese ? 'en' : 'my')}
              className="flex items-center space-x-1.5 text-zinc-300 hover:text-white transition cursor-pointer text-xs font-semibold px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
            >
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span>{isBurmese ? 'English' : 'မြန်မာဘာသာ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <BrandLogo variant="light" width={165} showBadge={false} />
            </Link>

            <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-zinc-600">
              <a href="#pathways" className="hover:text-purple-700 transition">
                {isBurmese ? 'ပညာသင်လမ်းကြောင်းများ' : 'Study Pathways'}
              </a>
              <a href="#calculator" className="hover:text-purple-700 transition flex items-center space-x-1">
                <Calculator className="w-3.5 h-3.5 text-purple-600" />
                <span>{isBurmese ? 'လစာတွက်ချက်စက်' : 'Stipend Calculator'}</span>
              </a>
              <a href="#eligibility" className="hover:text-purple-700 transition flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBurmese ? 'အရည်အချင်းစစ်ဆေး' : 'Eligibility Quiz'}</span>
              </a>
              <a href="#cities" className="hover:text-purple-700 transition flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <span>{isBurmese ? 'ဂျာမနီမြို့များ' : 'German Cities'}</span>
              </a>
              <a href="#why-us" className="hover:text-purple-700 transition">
                {isBurmese ? 'အဘယ်ကြောင့် GOEURO' : 'Why GOEURO'}
              </a>
              <a href="#faq" className="hover:text-purple-700 transition">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="#consultation"
              className="inline-flex items-center space-x-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 hover:shadow-lg transition cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">{isBurmese ? 'အခမဲ့ ဆွေးနွေးခွင့်ရယူပါ' : 'Book Free Consultation'}</span>
              <span className="sm:hidden">{isBurmese ? 'ဆွေးနွေးရန်' : 'Consult'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* 2b. Live Verified Social Proof Ticker */}
      <LiveSuccessTicker isBurmese={isBurmese} />

      {/* 3. Hero Section (Linear & Apple 3D Caliber) */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-purple-50/60 via-white to-[#FDFDFE]">
        {/* Ambient 3D Animated Mesh Lighting & Floating Orbs */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-tr from-purple-500/20 via-indigo-400/15 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-[-50px] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10 pointer-events-none animate-float-3d" />
        <div className="absolute bottom-10 left-[-50px] w-80 h-80 bg-blue-400/15 rounded-full blur-3xl -z-10 pointer-events-none animate-float-3d-delay" />
        {/* Subtle Tech Dot-Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(147,51,234,0.06)_1px,transparent_1px)] [background-size:28px_28px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200/90 text-purple-900 text-xs font-bold tracking-wide shadow-2xs hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-700 animate-pulse" />
                <span>GOEURO STUDY • Official Germany Education Agency</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-tight sm:leading-tight lg:leading-[1.15]">
                {isBurmese ? (
                  <>
                    ဂျာမနီ အခမဲ့ တက္ကသိုလ်များနှင့် <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-purple-900 to-zinc-950 drop-shadow-xs">
                      လစဉ် လစာရ Ausbildung
                    </span>{' '}
                    တရားဝင် လျှောက်ထားရေး လမ်းညွှန်။
                  </>
                ) : (
                  <>
                    Your Direct Pathway to <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-purple-900 to-zinc-950 drop-shadow-xs">
                      Germany Higher Education
                    </span>{' '}
                    & Paid Ausbildung.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl font-burmese">
                {isBurmese
                  ? 'ဂျာမနီနိုင်ငံ အစိုးရ တက္ကသိုလ်များတွင် ကျူရှင်လခမဲ့ (0 €) ပညာသင်ယူနိုင်မည့် အခွင့်အလမ်းများနှင့် လစဉ် လစာရရှိမည့် Dual Ausbildung အသက်မွေးဝမ်းကျောင်း ပရိုဂရမ်များအတွက် ဗီဇာ၊ စာရွက်စာတမ်းမှသည် ဂျာမနီ ဟမ်းဘတ်ဌာနချုပ်မှ ကြိုဆိုရေးအထိ တိကျသေချာစွာ လမ်းညွှန်ဝန်ဆောင်မှုပေးပါသည်။'
                  : 'Empowering ambitious students with tuition-free public universities, fully contracted vocational Ausbildung programs with monthly stipends (€1,000+), and expert visa transition to Hamburg, Munich, and Berlin.'}
              </p>

              {/* Action Buttons with High Conversion Touchpoints */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#consultation"
                  className="px-6 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-lg shadow-purple-700/30 flex items-center justify-center space-x-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-purple-lg active:translate-y-0.5 cursor-pointer btn-glow"
                >
                  <Calendar className="w-4 h-4 text-purple-200" />
                  <span>{isBurmese ? 'အခမဲ့ ဆွေးနွေးခွင့် စာရင်းသွင်းပါ' : 'Request Free Consultation'}</span>
                </a>
                <a
                  href="#eligibility"
                  className="px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-950 text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isBurmese ? '၆၀ စက္ကန့် အရည်အချင်းစစ်ဆေးရန်' : 'Test 60s Eligibility Quiz'}</span>
                </a>
                <a
                  href="#calculator"
                  className="px-4 py-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 text-sm font-semibold flex items-center justify-center space-x-2 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  <Calculator className="w-4 h-4 text-purple-700" />
                  <span>{isBurmese ? 'လစာတွက်စက်' : 'Stipend Calculator'}</span>
                </a>
              </div>

              {/* Highlights 3D Interactive Trust Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-4 border-t border-zinc-200/80">
                <TiltCard maxTilt={8} glare={true} className="rounded-2xl">
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100/90 shadow-sm hover:shadow-md transition">
                    <div className="text-xl sm:text-2xl font-black text-purple-700">0 €</div>
                    <div className="text-[11px] sm:text-xs text-zinc-600 font-medium mt-0.5">
                      {isBurmese ? 'ကျူရှင်လခ ကင်းလွတ်ခွင့်' : 'Tuition-Free Universities'}
                    </div>
                  </div>
                </TiltCard>

                <TiltCard maxTilt={8} glare={true} className="rounded-2xl">
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100/90 shadow-sm hover:shadow-md transition">
                    <div className="text-xl sm:text-2xl font-black text-zinc-950">€1,000+</div>
                    <div className="text-[11px] sm:text-xs text-zinc-600 font-medium mt-0.5">
                      {isBurmese ? 'လစဉ် ပျမ်းမျှ လစာ' : 'Avg. Monthly Stipend'}
                    </div>
                  </div>
                </TiltCard>

                <TiltCard maxTilt={8} glare={true} className="rounded-2xl">
                  <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100/90 shadow-sm hover:shadow-md transition">
                    <div className="text-xl sm:text-2xl font-black text-emerald-600">Direct</div>
                    <div className="text-[11px] sm:text-xs text-zinc-600 font-medium mt-0.5">
                      {isBurmese ? 'တိုက်ရိုက် စာချုပ်ချုပ်ဆိုမှု' : 'Direct Employer Contract'}
                    </div>
                  </div>
                </TiltCard>
              </div>
            </div>

            {/* Right Hero: EuroBot Mascot 3D Showcase with Floating Perspective Badges */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Floating 3D Badge 1: Dual Ausbildung Contract */}
              <div className="absolute -top-6 -left-2 sm:-left-6 z-30 animate-float-3d">
                <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl shadow-purple-900/10 border border-purple-200/80 flex items-center space-x-2 text-xs font-bold text-zinc-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>🇩🇪 Ausbildung</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-extrabold">€1,400/mo</span>
                </div>
              </div>

              {/* Floating 3D Badge 2: Free Public University */}
              <div className="absolute -top-8 -right-2 sm:-right-4 z-30 animate-float-3d-delay">
                <div className="px-3 py-2 rounded-2xl bg-gradient-to-r from-zinc-950 to-purple-950 text-white shadow-xl shadow-zinc-900/20 border border-purple-500/40 flex items-center space-x-2 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  <span>State Unis</span>
                  <span className="text-emerald-400 text-[11px] font-extrabold">0 € Tuition</span>
                </div>
              </div>

              {/* Floating 3D Badge 3: Hamburg HQ Desk */}
              <div className="absolute -bottom-4 -left-2 sm:-left-4 z-30 animate-float-3d">
                <div className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg border border-purple-100 flex items-center space-x-1.5 text-[11px] font-bold text-zinc-800">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Hamburg HQ Liaison</span>
                </div>
              </div>

              {/* Interactive 3D Tilt Card Container */}
              <TiltCard maxTilt={10} glare={true} className="w-full max-w-sm sm:max-w-md">
                <div className="relative w-full p-6 sm:p-7 bg-white/80 backdrop-blur-xl rounded-3xl border border-purple-200/80 shadow-2xl shadow-purple-900/10 text-center overflow-hidden">
                  {/* Subtle Background Glow behind EuroBot */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-fuchsia-500/5 to-transparent rounded-3xl pointer-events-none" />

                  <BrandMascot
                    variant="hero"
                    speech={
                      isBurmese
                        ? 'မင်္ဂလာပါ! ကျွန်တော်က EuroBot ပါ။ ဂျာမနီပညာသင်ကြားရေး အိပ်မက်အတွက် အတူတူပြင်ဆင်ကြမယ်! 🇩🇪'
                        : "Hallo! I'm EuroBot. Ready to begin your Germany education journey? Let's talk! 🇩🇪"
                    }
                  />

                  <div className="mt-4 pt-3 border-t border-purple-100/80 flex items-center justify-between text-xs text-zinc-500 px-1 relative z-10">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700">Senior Advisors Online</span>
                    </span>
                    <span className="font-medium text-zinc-600">Hamburg & Southeast Asia Desk</span>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Official Mission, Vision & Brand Promise (Guideline v1.2) */}
      <section className="py-12 bg-white border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="slide-up">
            {/* Brand Promise Card */}
            <div className="bg-gradient-to-r from-purple-950 via-zinc-950 to-purple-950 text-white p-8 rounded-3xl shadow-xl shadow-purple-950/15 mb-8 border border-purple-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-200 text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>{isBurmese ? 'တရားဝင် အာမခံချက် (Official Brand Promise)' : 'Official Brand Promise'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-burmese leading-snug">
                    {isBurmese
                      ? '“Germany လမ်းကြောင်းကို သင့်အခြေအနေအလိုက် ရှင်းလင်းစွာစစ်ဆေး၊ လျှောက်ထားရန် ပြင်ဆင်ပြီး အဆင့်တိုင်းကို မှတ်တမ်းတင်လိုက်ပါမည်။”'
                      : '"We thoroughly evaluate your profile against current German standards, prepare your tailored application, and track every single step with full transparency."'}
                  </h3>
                  <p className="text-xs text-purple-200/90 leading-relaxed max-w-3xl font-burmese">
                    {isBurmese
                      ? 'GOEURO STUDY သည် လေထိုးရောင်းချခြင်းမရှိဘဲ Myanmar ကျောင်းသား တစ်ဦးချင်းစီ၏ အခြေအနေကို သက်ဆိုင်ရာ ဂျာမနီ အစိုးရနှင့် တက္ကသိုလ် သတ်မှတ်ချက်များအတိုင်း တိကျစွာ လမ်းညွှန်ပေးသော ပရော်ဖက်ရှင်နယ် အေဂျင်စီ ဖြစ်သည်။'
                      : 'We operate with strict verification integrity. Case outcomes depend on authoritative German institutions; our role is providing realistic, transparent, end-to-end guidance.'}
                  </p>
                </div>
                <div className="shrink-0 flex items-center space-x-3">
                  <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                    <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Active Services</div>
                    <div className="text-sm font-bold text-white mt-0.5">2 Verified Pathways</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission & Vision Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-purple-100/80 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                  <Globe2 className="w-4 h-4" />
                  <span>Our Mission</span>
                </div>
                <h4 className="text-base font-bold text-zinc-950 font-burmese">
                  {isBurmese ? 'မြန်မာကျောင်းသားများနှင့် ကမ္ဘာ့အဆင့်မီ ပညာရေး' : 'Bridging Myanmar to Top-Tier German Education'}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-burmese">
                  {isBurmese
                    ? 'မြန်မာနိုင်ငံမှ ရည်မှန်းချက်ရှိသော ကျောင်းသားများနှင့် ကမ္ဘာ့အဆင့်မီ ပညာရေးအခွင့်အလမ်းများကို ချိတ်ဆက်ပေးရန်၊ ဂျာမနီရှိ အရည်အသွေးမြင့် တက္ကသိုလ်များမှ စတင်၍ လမ်းညွှန်ပျိုးထောင်ရန်။'
                    : 'To bridge the gap between ambitious students in Myanmar and world-class educational opportunities, starting with top-tier universities in Germany.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-purple-100/80 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Our Vision</span>
                </div>
                <h4 className="text-base font-bold text-zinc-950 font-burmese">
                  {isBurmese ? 'ဥရောပပညာရေးအတွက် ထိပ်တန်း လမ်းညွှန်ဝင်ပေါက်' : 'Premier Gateway for European Education'}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-burmese">
                  {isBurmese
                    ? 'ဥရောပပညာရေးအတွက် ထိပ်တန်းလမ်းညွှန်ဝင်ပေါက်တစ်ခု ဖြစ်လာပြီး ပြည့်စုံသော လမ်းညွှန်မှုနှင့် ပံ့ပိုးမှုဝန်ဆောင်မှုများကို ဥရောပသမဂ္ဂနိုင်ငံအားလုံးအထိ ချဲ့ထွင်ရန်။'
                    : 'To become the premier gateway for European education, expanding our comprehensive guidance and support services to cover all European Union nations.'}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Dual Study Pathways */}
      <section id="pathways" className="py-20 bg-white border-y border-zinc-200/80 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/5 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="slide-up">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                {isBurmese ? 'တရားဝင် လမ်းကြောင်း (၂) ခု' : 'Proven Educational Routes'}
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-burmese">
                {isBurmese
                  ? 'သင့်အရည်အချင်းနှင့် ကိုက်ညီသော ဂျာမနီ ပညာသင် လမ်းကြောင်းကို ရွေးချယ်ပါ'
                  : 'Choose the Germany Program That Fits Your Career Goals'}
              </h3>
              <p className="text-sm text-zinc-600 font-burmese">
                {isBurmese
                  ? 'လမ်းကြောင်းနှစ်ခုလုံးသည် ဂျာမနီတွင် တရားဝင် နေထိုင်ခွင့်၊ နိုင်ငံတကာ အသိအမှတ်ပြု ဒီဂရီများနှင့် အမြဲတမ်း နေထိုင်ခွင့် (PR) အထိ ရရှိစေပါသည်။'
                  : 'Both pathways provide full residency rights, world-recognized German qualifications, and pathways to permanent EU residency.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pathway 1: Ausbildung with 3D Tilt */}
            <ScrollReveal animation="slide-up" delay={100}>
              <TiltCard maxTilt={6} glare={true} className="h-full rounded-3xl">
                <div id="ausbildung" className="h-full rounded-3xl border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/50 via-white to-white p-8 space-y-6 shadow-lg shadow-purple-900/5 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200/60 shadow-2xs">
                      {isBurmese ? 'လစာရ အသက်မွေးဝမ်းကျောင်း' : 'Paid Dual VET'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-zinc-950">Ausbildung (Vocational Training)</h4>
                    <p className="text-xs text-purple-700 font-semibold mt-0.5">Dual Practical Study & Paid Work Contract</p>
                    <p className="text-sm text-zinc-600 mt-3 leading-relaxed font-burmese">
                      {isBurmese
                        ? 'ကျောင်းတွင် သီအိုရီ (၂) ရက် တက်ရောက်ပြီး ဂျာမနီ ကုမ္ပဏီကြီးများတွင် လစာရ လက်တွေ့လုပ်ငန်းခွင် (၃) ရက် ဆင်းရသော ဂျာမနီ၏ အောင်မြင်ဆုံး ပညာသင်စနစ် ဖြစ်ပါသည်။'
                        : 'Study theory 2 days a week in vocational college and gain paid on-the-job training 3 days a week with a certified German employer.'}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Monthly Stipend:</strong> €950 – €1,400 per month from Day 1</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Popular Fields:</strong> Nursing, IT & Software, Hotel, Mechatronics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Tuition Fee:</strong> Fully Funded / Company-sponsored</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Language Requirement:</strong> B1 / B2 Goethe, telc, or ÖSD</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <a
                      href="#consultation"
                      className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md shadow-purple-700/20 hover:shadow-lg"
                    >
                      <span>{isBurmese ? 'Ausbildung အကြောင်း မေးမြန်းရန်' : 'Apply for Ausbildung'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Pathway 2: Public Universities with 3D Tilt */}
            <ScrollReveal animation="slide-up" delay={200}>
              <TiltCard maxTilt={6} glare={true} className="h-full rounded-3xl">
                <div id="universities" className="h-full rounded-3xl border-2 border-zinc-200 bg-white p-8 space-y-6 shadow-lg shadow-zinc-900/5 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-md shadow-zinc-950/20">
                      <GraduationCap className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-2xs">
                      {isBurmese ? 'အခမဲ့ တက္ကသိုလ်များ' : 'Tuition-Free Higher Ed'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-zinc-950">Public University (Bachelor / Master)</h4>
                    <p className="text-xs text-purple-700 font-semibold mt-0.5">Top-Ranked German State Universities</p>
                    <p className="text-sm text-zinc-600 mt-3 leading-relaxed font-burmese">
                      {isBurmese
                        ? 'ကမ္ဘာ့ထိပ်တန်း TU9 နှင့် အစိုးရ တက္ကသိုလ်ကြီးများတွင် ကျူရှင်လခ လုံးဝ မပေးရဘဲ (0 €) နိုင်ငံတကာ ဘွဲ့ဒီဂရီများ ရယူနိုင်ပါသည်။'
                        : 'Earn an internationally recognized degree at top research universities (TU9, Excellence Clusters) with zero tuition fees.'}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Tuition Fee:</strong> 0 € (Only €150-€350 semester fee including transit pass)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Programs:</strong> Computer Science, Automotive, Business, Data Science</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Language:</strong> English-taught or German-taught available</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Post-Study Visa:</strong> 18-month job seeker visa upon graduation</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <a
                      href="#consultation"
                      className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md shadow-zinc-950/20 hover:shadow-lg"
                    >
                      <span>{isBurmese ? 'တက္ကသိုလ် လျှောက်ထားရန် မေးမြန်းမည်' : 'Apply for University'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. Interactive Financial & Stipend Calculator (Linear/Apple Caliber) */}
      <section id="calculator" className="py-20 bg-gradient-to-b from-[#FDFDFE] to-purple-50/30 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="slide-up">
            <InteractiveCalculator isBurmese={isBurmese} onSelectOption={handleCalculatorSelect} />
          </ScrollReveal>
        </div>
      </section>

      {/* 6. 60-Second Eligibility Quiz Component */}
      <section id="eligibility" className="py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="scale-in">
            <EligibilityQuiz isBurmese={isBurmese} onComplete={handleQuizComplete} />
          </ScrollReveal>
        </div>
      </section>

      {/* 7. German Cities Explorer Component */}
      <section id="cities" className="py-20 bg-[#FDFDFE] border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="slide-up">
            <CityExplorer isBurmese={isBurmese} />
          </ScrollReveal>
        </div>
      </section>

      {/* 8. Why Choose GOEURO */}
      <section id="why-us" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="slide-up">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">The GOEURO Advantage</h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-burmese">
                {isBurmese ? 'အဘယ်ကြောင့် GOEURO ကို ယုံကြည်စွာ ရွေးချယ်ကြသနည်း' : 'Built for Transparency, Safety, and Results'}
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal animation="slide-up" delay={50}>
              <TiltCard maxTilt={8} glare={true} className="h-full rounded-2xl">
                <div className="h-full bg-[#FAF9FE] p-6 rounded-2xl border border-purple-100/90 shadow-sm hover:shadow-md transition space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 font-burmese">Hamburg On-Ground Team</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-burmese">
                    {isBurmese
                      ? 'ဂျာမနီ ဟမ်းဘတ်မြို့တွင် ကိုယ်တိုင်ရုံးခန်းရှိပြီး ကျောင်း၊ အလုပ်ရှင် HR များနှင့် သံရုံးဆိုင်ရာများကို တိုက်ရိုက် ဆက်သွယ်ဆောင်ရွက်ပေးပါသည်။'
                      : 'Direct liaison with German vocational schools, employer HRs, and state immigration authorities in Germany.'}
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={150}>
              <TiltCard maxTilt={8} glare={true} className="h-full rounded-2xl">
                <div className="h-full bg-[#FAF9FE] p-6 rounded-2xl border border-purple-100/90 shadow-sm hover:shadow-md transition space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 font-burmese">Document Verification</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-burmese">
                    {isBurmese
                      ? 'ဂျာမနီ စံချိန်စံညွှန်းမီ CV၊ Anschreiben နှင့် အသိအမှတ်ပြု ကျမ်းသစ္စာကျိန်ဆို ဘာသာပြန်ခြင်းများကို တိကျစွာ ဆောင်ရွက်ပေးပါသည်။'
                      : 'Strict German standard CV formatting, motivation letters (Anschreiben), and certified translations.'}
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={250}>
              <TiltCard maxTilt={8} glare={true} className="h-full rounded-2xl">
                <div className="h-full bg-[#FAF9FE] p-6 rounded-2xl border border-purple-100/90 shadow-sm hover:shadow-md transition space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 font-burmese">Zero Hidden Costs</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-burmese">
                    {isBurmese
                      ? 'အဆင့်တိုင်းအတွက် ပွင့်လင်းမြင်သာသော စာချုပ်နှင့် အခကြေးငွေစာရင်းများဖြင့် လုံခြုံစိတ်ချစွာ ဝန်ဆောင်မှုပေးပါသည်။'
                      : 'Clear milestones, itemized fee schedules, and full accountability across every stage of the student journey.'}
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={350}>
              <TiltCard maxTilt={8} glare={true} className="h-full rounded-2xl">
                <div className="h-full bg-[#FAF9FE] p-6 rounded-2xl border border-purple-100/90 shadow-sm hover:shadow-md transition space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 font-burmese">Dedicated Counselor</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-burmese">
                    {isBurmese
                      ? 'ကျောင်းသားတစ်ဦးချင်းစီအတွက် သီးသန့် အကြံပေးပုဂ္ဂိုလ် သတ်မှတ်ပေးပြီး မိဘများနှင့်ပါ ဗီဒီယိုခေါ်ဆို ဆွေးနွေးပေးပါသည်။'
                      : 'One-on-one personalized counseling with regular video reviews and parent consultation sessions.'}
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion */}
      <section id="faq" className="py-20 bg-[#FBFBFE] border-t border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="slide-up">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Frequently Asked Questions</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-burmese">
                {isBurmese ? 'ဂျာမနီပညာသင်ကြားရေး အမေးများသော မေးခွန်းများ' : 'Everything You Need to Know About Studying in Germany'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 font-burmese">
                {isBurmese
                  ? 'လစာရ Ausbildung နှင့် အခမဲ့ တက္ကသိုလ် လျှောက်ထားမှုဆိုင်ရာ အချက်အလက်များ'
                  : 'Direct answers to the most common questions from students and parents.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {[
              {
                q: 'How much is the monthly stipend for an Ausbildung in Germany?',
                q_my: 'ဂျာမနီ Ausbildung တွင် လစဉ် လစာမည်မျှ ရရှိပါသလဲ။',
                a: 'Ausbildung apprentices receive a paid monthly stipend ranging between €950 and €1,400 per month depending on the vocation (e.g. Nursing: €1,150–€1,350/mo, IT: €1,000–€1,200/mo, Hospitality: €900–€1,100/mo). The stipend increases each year of the 3-year contract, and tuition is completely free.',
                a_my: 'Ausbildung တက်ရောက်သူများသည် မိမိရွေးချယ်သော ဘာသာရပ်အလိုက် (သူနာပြု၊ IT၊ ဟိုတယ် စသည်) လစဉ် ယူရို ၉၅၀ မှ ၁,၄၀၀ (တစ်လလျှင် သိန်း ၄၀ ကျော်) ထောက်ပံ့ကြေး လစာကို ပထမနှစ်မှ စတင်ကာ ၃ နှစ်တာလုံး တိုးမြှင့်ရရှိမည် ဖြစ်ပါသည်။ ကျူရှင်လခ လုံးဝ ပေးရန်မလိုပါ။'
              },
              {
                q: 'Are German state universities genuinely free of tuition fees?',
                q_my: 'ဂျာမနီ အစိုးရ တက္ကသိုလ်များသည် အမှန်တကယ် ကျူရှင်လခ အခမဲ့ ဖြစ်ပါသလား။',
                a: 'Yes! State universities across 15 of Germany’s 16 federal states charge 0 € tuition fees for both domestic and international students. Students only pay a statutory semester ticket fee of €150 to €350 every 6 months, which includes regional transit on public trains and buses.',
                a_my: 'ဟုတ်ကဲ့၊ အမှန်တကယ် အခမဲ့ ဖြစ်ပါသည်။ နိုင်ငံတကာ ကျောင်းသားများအတွက် ကျူရှင်လခ ဝ ယူရို ဖြစ်ပြီး၊ ၆ လတစ်ကြိမ် Semester Ticket ကြေး (ယူရို ၁၅၀-၃၅၀) သာ ပေးသွင်းရကာ ထိုကတ်ဖြင့် ပြည်နယ်တစ်ခုလုံး ဘတ်စကား၊ ရထားများကို အခမဲ့ စီးနင်းနိုင်ပါသည်။'
              },
              {
                q: 'What German language proficiency level is required?',
                q_my: 'ဂျာမန်ဘာသာစကား မည်သည့် အဆင့်အထိ လိုအပ်ပါသလဲ။',
                a: 'For Ausbildung programs, Goethe-Zertifikat, telc, or ÖSD B1 or B2 is required. For English-taught Public University degrees, IELTS 6.0–6.5 is required (German B1 recommended for life). For German-taught degrees, TestDaF 4 or DSH 2 is required.',
                a_my: 'Ausbildung အတွက် Goethe သို့မဟုတ် telc B1/B2 လိုအပ်ပါသည်။ အင်္ဂလိပ်ဘာသာဖြင့် သင်ကြားသော တက္ကသိုလ်များအတွက် IELTS 6.0-6.5 လိုအပ်ပြီး၊ ဂျာမန်ဘာသာဖြင့် တက်ရောက်လိုပါက TestDaF 4 သို့မဟုတ် DSH 2 လိုအပ်ပါသည်။'
              },
              {
                q: 'Do I need a Sperrkonto (Blocked Account) for an Ausbildung?',
                q_my: 'Ausbildung လျှောက်ထားပါက Sperrkonto (Blocked Account) ငွေသွင်းရန် လိုအပ်ပါသလား။',
                a: 'In most cases, NO! Because a certified Ausbildung contract provides a legally binding training salary (€1,000+/mo), the German immigration office (Ausländerbehörde) accepts the contract as independent proof of financial means, waiving the requirement for the €11,904 blocked account.',
                a_my: 'များသောအားဖြင့် မလိုပါ! အကြောင်းမှာ ဂျာမနီ အလုပ်ရှင်နှင့် တရားဝင် ချုပ်ဆိုထားသော Ausbildung စာချုပ်တွင် လစဉ်လစာ ဖော်ပြထားသောကြောင့် ဂျာမနီ သံရုံးက Blocked Account ငွေသွင်းရန် မလိုအပ်ဘဲ ကင်းလွတ်ခွင့် ပေးထားပါသည်။'
              },
              {
                q: 'Can students work part-time or bring family members to Germany?',
                q_my: 'ကျောင်းတက်ရင်း အချိန်ပိုင်း အလုပ်လုပ်ခွင့်နှင့် မိသားစု ခေါ်ယူခွင့် ရှိပါသလား။',
                a: 'Yes. International students in Germany are legally permitted to work 140 full days or 280 half days per calendar year. Degree graduates receive an 18-month Job Seeker Visa to secure permanent employment leading directly to EU Blue Card and permanent residency.',
                a_my: 'ဥပဒေအရ တစ်နှစ်လျှင် ရက်ပေါင်း ၁၄၀ အချိန်ပိုင်း အလုပ်လုပ်ခွင့် ရရှိပြီး၊ ဘွဲ့ရရှိပြီးပါက ၁၈ လ အလုပ်ရှာဖွေခွင့် ဗီဇာ ရရှိကာ ထာဝရနေထိုင်ခွင့် (PR / EU Blue Card) သို့ ဆက်လက် လျှောက်ထားနိုင်ပါသည်။'
              },
              {
                q: 'What is GOEURO’s role in the visa and transition process?',
                q_my: 'ဗီဇာနှင့် ဂျာမနီရောက်ရှိရေးတွင် GOEURO က မည်သို့ ကူညီဆောင်ရွက်ပေးပါသလဲ။',
                a: 'GOEURO operates an official liaison team in Hamburg, Germany. We handle certified translations, motivation letters, Uni-Assist VPD submissions, employer contract negotiation, and conduct mock German visa interviews to ensure zero rejection rates.',
                a_my: 'GOEURO သည် ဂျာမနီ ဟမ်းဘတ်မြို့တွင် တိုက်ရိုက် ရုံးခန်းရှိပြီး ကျောင်း၊ အလုပ်ရှင်များနှင့် တိုက်ရိုက် ဆက်သွယ်ပေးခြင်း၊ ကျမ်းသစ္စာကျိန်ဆို ဘာသာပြန်ခြင်း၊ သံရုံး အင်တာဗျူး အစမ်းလေ့ကျင့်ပေးခြင်းနှင့် ဂျာမနီလေဆိပ် ကြိုဆိုရေးအထိ တာဝန်ယူ ဆောင်ရွက်ပေးပါသည်။'
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <ScrollReveal key={idx} animation="slide-up" delay={idx * 40}>
                  <div
                    className="rounded-2xl border border-zinc-200/90 overflow-hidden bg-white shadow-2xs hover:border-purple-200 hover:shadow-xs transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-zinc-50 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 font-burmese">
                          {isBurmese ? faq.q_my : faq.q}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-purple-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 bg-purple-50/20 font-burmese">
                        {isBurmese ? faq.a_my : faq.a}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Online Consultation Booking Form */}
      <section id="consultation" className="py-20 bg-white border-t border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal animation="scale-in">
            <div className="bg-gradient-to-br from-purple-950 via-zinc-950 to-zinc-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-purple-800/40">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto text-center space-y-3 mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-800/80 text-purple-200 border border-purple-700/50">
                {isBurmese ? 'အခမဲ့ တိုက်ရိုက် ဆွေးနွေးခွင့်' : 'Complimentary Assessment'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-burmese">
                {isBurmese ? 'ဂျာမနီပညာသင်ခရီးအတွက် ယခုပင် စာရင်းပေးသွင်းပါ' : 'Book Your 1-on-1 Consultation Session'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-burmese">
                {isBurmese
                  ? 'ဟမ်းဘတ်နှင့် အရှေ့တောင်အာရှရှိ GOEURO ပညာရေးအကြံပေးများက ၂၄ နာရီအတွင်း သင့်အား ဆက်သွယ်ဆွေးနွေးပေးပါမည်။'
                  : 'Our licensed educational counselors in Hamburg & Southeast Asia will evaluate your profile and contact you within 24 hours.'}
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center space-y-4 border border-emerald-400/40">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white font-burmese">
                  {isBurmese ? 'စာရင်းသွင်းမှု အောင်မြင်ပါသည်!' : 'Inquiry Submitted Successfully!'}
                </h4>
                <p className="text-xs text-zinc-200 max-w-md mx-auto font-burmese">
                  {isBurmese
                    ? 'ကျေးဇူးတင်ပါသည်။ ကျွန်ုပ်တို့၏ အကြံပေးမှ ဖုန်း (သို့) Viber ဖြင့် အမြန်ဆုံး ပြန်လည်ဆက်သွယ်ပေးပါမည်။'
                    : 'Thank you! Our counselor has received your details and will get in touch via phone and email to confirm your consultation schedule.'}
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 transition cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 max-w-xl mx-auto">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-200 mb-1">
                      {isBurmese ? 'အမည် အပြည့်အစုံ' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Kyaw Kyaw"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-200 mb-1">
                      {isBurmese ? 'ဖုန်းနံပါတ် / Viber' : 'Phone / Viber'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+95 9 123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    {isBurmese ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-200 mb-1">
                      {isBurmese ? 'စိတ်ဝင်စားသော လမ်းကြောင်း' : 'Interested Pathway'} *
                    </label>
                    <select
                      value={formData.pathway}
                      onChange={(e) => setFormData({ ...formData, pathway: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    >
                      <option value="AUSBILDUNG">Ausbildung (Paid Dual Vocational)</option>
                      <option value="PUBLIC_UNIVERSITY">Public University (Free Tuition)</option>
                      <option value="LANGUAGE_PREP">German Language Preparation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-200 mb-1">
                      {isBurmese ? 'ဂျာမန်ဘာသာ အဆင့်' : 'Current German Level'}
                    </label>
                    <select
                      value={formData.germanLevel}
                      onChange={(e) => setFormData({ ...formData, germanLevel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    >
                      <option value="A0">A0 (Complete Beginner)</option>
                      <option value="A1">A1 Level</option>
                      <option value="A2">A2 Level</option>
                      <option value="B1">B1 Level</option>
                      <option value="B2">B2 Level or above</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    {isBurmese ? 'မေးမြန်းလိုသည့် အကြောင်းအရာ (သို့) မှတ်ချက်' : 'Questions / Notes / Preferred Vocation'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isBurmese ? 'ဥပမာ- သူနာပြု Ausbildung လျှောက်ထားလိုပါသည်' : 'e.g., Interested in Nursing or IT Ausbildung in 2026'}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/40 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isBurmese ? 'ဆွေးနွေးခွင့် စာရင်းသွင်းမည်' : 'Submit Consultation Request'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 11. Corporate Footer with Discreet Portal Access */}
      <footer className="bg-zinc-950 text-zinc-400 text-xs pt-14 pb-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-800/80">
            <div className="space-y-3 md:col-span-2">
              <BrandLogo variant="dark" width={175} showBadge={false} />
              <p className="text-zinc-400 text-xs max-w-md leading-relaxed font-burmese">
                {isBurmese
                  ? 'GOEURO STUDY သည် ဂျာမနီ အစိုးရ တက္ကသိုလ်ဝင်ခွင့်များ၊ Dual Ausbildung အသက်မွေးဝမ်းကျောင်း စာချုပ်များနှင့် ဗီဇာလုပ်ငန်းစဉ်များကို တရားဝင် တိကျစွာ လမ်းညွှန်ဆောင်ရွက်ပေးသော ပရော်ဖက်ရှင်နယ် အေဂျင်စီ ဖြစ်သည်။'
                  : 'GOEURO STUDY is an international education agency specializing in direct university admissions, visa facilitation, and dual vocational Ausbildung placement across Germany.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hamburg, Germany (HQ)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>Southeast Asia Regional Desk</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Programs & Tools</h5>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li><a href="#ausbildung" className="hover:text-white transition">Germany Ausbildung</a></li>
                <li><a href="#universities" className="hover:text-white transition">Public Universities</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Stipend Calculator</a></li>
                <li><a href="#eligibility" className="hover:text-white transition">60s Eligibility Quiz</a></li>
                <li><a href="#cities" className="hover:text-white transition">German Cities Guide</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Company & Governance</h5>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li><a href="#why-us" className="hover:text-white transition">About GOEURO</a></li>
                <li><a href="#consultation" className="hover:text-white transition">Free Consultation</a></li>
                <li><a href="#faq" className="hover:text-white transition">Frequently Asked Questions</a></li>
                <li><a href="#pathways" className="hover:text-white transition">Privacy & Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-zinc-500 space-y-2">
            <p className="leading-relaxed">
              <strong className="text-zinc-400">Corporate Structure & Integrity:</strong> GOEURO STUDY operates as an independent European educational initiative under What Is WorldWise International Group Ltd, distinct and separate from What Is GED (WIG). All practices comply with the official GOEURO Operations Guideline (Version 1.2, Sep 2026).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-[11px] gap-2 pt-2">
              <p>© 2026 GOEURO Education Agency. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <span>Hamburg • Berlin • Munich • Dresden</span>
                <Link
                  href="/login"
                  className="text-zinc-700 hover:text-zinc-500 transition text-[11px] select-none"
                  title="Internal Operations (Ctrl+Shift+L)"
                >
                  🔒
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 12. Floating EuroBot AI Concierge Widget */}
      <EuroBotConcierge isBurmese={isBurmese} />

      {/* 13. Mobile Bottom Action Dock (Sticky on small screens) */}
      <MobileActionDock isBurmese={isBurmese} />
    </div>
  );
}
