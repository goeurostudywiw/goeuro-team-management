'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import BrandMascot from '@/components/BrandMascot';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Globe,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Crown,
  ShieldAlert,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/dashboard';

  const { language, setLanguage } = useLanguage();
  const isBurmese = language === 'my';
  const { login, loginDemo, allUsers, currentUser } = useUserSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isDemoAllowed = process.env.NEXT_PUBLIC_ENABLE_DEMO !== 'false';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (currentUser) {
      router.push(redirectPath);
    }
  }, [currentUser, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(isBurmese ? 'အီးမေးလ်နှင့် စကားဝှက် ထည့်သွင်းပါ' : 'Please enter email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleQuickDemoLogin = async (user: any) => {
    setDemoLoadingId(user.id);
    setError('');
    const res = await loginDemo(user.id);
    setDemoLoadingId(null);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setError(res.error || 'Quick login failed');
    }
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Goeuro2026!');
  };

  // Group users into 3 Profile Tiers
  const founderUsers = allUsers.filter((u) => u.role?.name === 'Founder' || u.email === 'thn@goeuro.de');
  const superAdminUsers = allUsers.filter((u) => u.role?.name === 'Super Admin' || u.email === 'admin@goeuro.de');
  const consultantUsers = allUsers.filter(
    (u) =>
      u.role?.name === 'Consultant & Management' ||
      (!founderUsers.some((f) => f.id === u.id) && !superAdminUsers.some((s) => s.id === u.id) && u.email !== 'viewer@partner.de')
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBurmese ? 'အများပြည်သူ ကြည့်ရှုသည့် ဝဘ်ဆိုဒ်သို့' : 'Public Website'}</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLanguage(isBurmese ? 'en' : 'my')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-2xs transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>{isBurmese ? 'Switch to English' : 'မြန်မာဘာသာ'}</span>
          </button>
        </div>
      </div>

      {/* Center Auth Area */}
      <div className="max-w-4xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Members Workspace Login Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BrandLogo variant="light" width={150} showBadge={false} />
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/80">
                Staff Only
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                {isBurmese ? 'GOEURO Members Workspace' : 'Members Workspace Sign In'}
              </h1>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {isBurmese
                  ? 'Founder၊ Super Admin နှင့် Consultant & Management အဖွဲ့ဝင်များအတွက် သီးသန့် ဝင်ပေါက်။'
                  : 'Authorized personnel portal for Germany university admissions, Ausbildung contracts, and student consultations.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'အဖွဲ့ဝင် အီးမေးလ်' : 'Staff Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="thn@goeuro.de"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-700">
                  {isBurmese ? 'စကားဝှက်' : 'Password'} *
                </label>
                <span className="text-[11px] text-zinc-400">
                  Default: <code className="text-purple-600 font-mono font-semibold">Goeuro2026!</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-zinc-950 hover:bg-black shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>TLS / OAuth 2.0 Encrypted</span>
            </span>
            <Link href="/" className="text-purple-600 hover:underline">
              Visit Public Portal →
            </Link>
          </div>
        </div>

        {/* Right Side: 3-Tier Profile Persona Selector OR Production Security Panel */}
        <div className="lg:col-span-6 space-y-4">
          {!isDemoAllowed ? (
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3 border-b border-zinc-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-950">
                    {isBurmese ? 'တရားဝင် အဖွဲ့ဝင်များအတွက် လုံခြုံရေးစည်းမျဉ်း' : 'Institutional Security Guard'}
                  </h2>
                  <p className="text-[11px] text-zinc-500">Production Mode Active • Strict Access Control</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-600 leading-relaxed font-burmese">
                <p>
                  {isBurmese
                    ? 'ဤစနစ်သည် GOEURO Education Agency ၏ တရားဝင် ခွင့်ပြုချက်ရ ဝန်ထမ်းများ၊ အတိုင်ပင်ခံများနှင့် တာဝန်ရှိသူများအတွက်သာ ဖြစ်ပါသည်။'
                    : 'This system is strictly reserved for authorized GOEURO Education Agency staff, counselors, and executives.'}
                </p>
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-[11px]">
                  <div className="flex items-center space-x-2 text-zinc-900 font-bold">
                    <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isBurmese ? 'အကောင့်ဝင်ရောက်မှု စည်းကမ်းချက်များ' : 'Authentication Protocol'}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-600 pl-1">
                    <li>{isBurmese ? 'ကုမ္ပဏီထုတ်ပေးထားသော အီးမေးလ် (@goeuro.de) ဖြင့်သာ ဝင်ရောက်ပါ' : 'Use your assigned institutional @goeuro.de email'}</li>
                    <li>{isBurmese ? 'ကျောင်းသားကိုယ်ရေးအချက်အလက်များနှင့် ငွေစာရင်းများကို အထူးကာကွယ်ထားပါသည်' : 'Student confidential data and financial ledgers are protected'}</li>
                    <li>{isBurmese ? 'စကားဝှက် မေ့လျော့ပါက IT Admin သို့ ဆက်သွယ်ပါ' : 'Contact admin@goeuro.de for credential recovery'}</li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Server: Oracle Cloud VPS</span>
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Encrypted Session</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                    {isBurmese ? 'အဆင့် (၃) ခုဖြင့် ခွဲခြားထားသော အကောင့်များ' : '3-Tier Profile Quick Switcher'}
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  1-Click Sign-in
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Select any profile below to immediately authenticate and test permissions for that specific organizational tier.
              </p>

              <div className="space-y-4 pt-1">
              {/* Profile Tier 1: Founder */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Tier 1: Founder (Full Sovereignty)</span>
                </div>
                {founderUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl border-2 border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        👑
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-950 truncate">{u.name}</div>
                        <div className="text-[10px] text-amber-800 font-semibold truncate">{u.title || 'Founder'} • {u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fillCredentials(u.email)}
                        className="px-2 py-1 text-[10px] font-semibold text-zinc-600 hover:bg-white rounded-lg border border-zinc-200"
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        disabled={demoLoadingId === u.id}
                        onClick={() => handleQuickDemoLogin(u)}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                      >
                        {demoLoadingId === u.id ? '...' : 'Enter 👑'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Tier 2: Super Admin */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-700">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Tier 2: Super Admin (System & Security)</span>
                </div>
                {superAdminUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl border-2 border-purple-200/80 bg-purple-50/40 hover:bg-purple-50 transition flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        ⚡
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-950 truncate">{u.name}</div>
                        <div className="text-[10px] text-purple-800 font-semibold truncate">{u.title || 'Super Admin'} • {u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fillCredentials(u.email)}
                        className="px-2 py-1 text-[10px] font-semibold text-zinc-600 hover:bg-white rounded-lg border border-zinc-200"
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        disabled={demoLoadingId === u.id}
                        onClick={() => handleQuickDemoLogin(u)}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition"
                      >
                        {demoLoadingId === u.id ? '...' : 'Enter ⚡'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Tier 3: Consultant & Management */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Tier 3: Consultant & Management</span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {consultantUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-2.5 rounded-xl border border-zinc-200 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                          {u.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-900 truncate">{u.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{u.title || 'Consultant'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fillCredentials(u.email)}
                          className="px-2 py-1 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg border border-zinc-200"
                        >
                          Fill
                        </button>
                        <button
                          type="button"
                          disabled={demoLoadingId === u.id}
                          onClick={() => handleQuickDemoLogin(u)}
                          className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition"
                        >
                          {demoLoadingId === u.id ? '...' : 'Log In →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-zinc-400 space-y-1">
        <p>© 2026 GOEURO Education Agency. All rights reserved.</p>
        <p className="text-[11px]">Hamburg, Germany & Southeast Asia Operations</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
