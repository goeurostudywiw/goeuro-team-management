'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import {
  Globe,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Send,
  ShieldCheck,
  Video,
  Sparkles,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

export default function PublicInquiryPage() {
  const { language, setLanguage, t } = useLanguage();
  const isBurmese = language === 'my';

  const [pathways, setPathways] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [preferredContact, setPreferredContact] = useState('TELEGRAM');
  const [contactHandle, setContactHandle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pathwayId, setPathwayId] = useState('');
  const [educationStatus, setEducationStatus] = useState('HIGH_SCHOOL');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(true);

  const [utmSource, setUtmSource] = useState('public_web');
  const [utmMedium, setUtmMedium] = useState('organic');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/pathways')
      .then((r) => r.json())
      .then((d) => {
        setPathways(Array.isArray(d) ? d : []);
        if (Array.isArray(d) && d.length > 0) setPathwayId(d[0].id);
      });

    // Extract UTM parameters if present in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('utm_source')) setUtmSource(params.get('utm_source') || 'public_web');
      if (params.get('utm_medium')) setUtmMedium(params.get('utm_medium') || 'organic');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactHandle.trim() || !consent) {
      setError('Please fill in required fields and consent to be contacted.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/inquiry/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          preferredContact,
          contactHandle,
          email: email || undefined,
          phone: phone || undefined,
          pathwayId: pathwayId || null,
          educationStatus,
          notes,
          utmSource,
          utmMedium,
          consent,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
      {/* Language Switch Bar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLanguage(isBurmese ? 'en' : 'my')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-zinc-200/90 text-zinc-700 shadow-2xs hover:bg-zinc-50 transition"
        >
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          <span>{isBurmese ? 'Switch to English' : 'မြန်မာဘာသာသို့ ပြောင်းရန်'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <span>🇩🇪 {isBurmese ? 'ဂျာမနီ ပညာရေးနှင့် အလုပ်သင် တရားဝင် လမ်းညွှန်မှု' : 'Official Germany Study & Vocational Pathways'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
          {t.inquiryPage.heroTitle}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          {t.inquiryPage.heroSubtitle}
        </p>

        {/* 2 Core Pathways Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-notion flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-950">
                {isBurmese ? 'ဂျာမနီ Ausbildung (အလုပ်သင်)' : 'Germany Ausbildung'}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                {isBurmese
                  ? 'လစဉ် လစာထောက်ပံ့ကြေး (€900-€1,300) ရရှိပြီး ၃ နှစ် အလုပ်သင်လက်မှတ် ရရှိမည့် လမ်းကြောင်း။'
                  : 'Paid vocational training with monthly stipend and work contract. B1/B2 German required.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-notion flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-zinc-950 text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-950">
                {isBurmese ? 'ဂျာမနီ အစိုးရတက္ကသိုလ်' : 'Public Universities'}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                {isBurmese
                  ? 'ကျောင်းလခ လုံးဝအခမဲ့ (Tuition-free) ဖြင့် ကမ္ဘာ့အဆင့်မီ တက္ကသိုလ်များတွင် ဘွဲ့ဒီဂရီ ရယူနိုင်ခြင်း။'
                  : 'Tuition-free Bachelor & Master degrees at accredited German state institutions.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inquiry Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-6 sm:p-8 max-w-2xl mx-auto">
        {submitted ? (
          /* Success Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-950">
              {t.inquiryPage.successTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              {t.inquiryPage.successDesc}
            </p>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-700 max-w-sm mx-auto text-left space-y-1">
              <div><strong>Student Name:</strong> {fullName}</div>
              <div><strong>Contact Channel:</strong> {preferredContact} ({contactHandle})</div>
              <div><strong>Status:</strong> Under Counselor Profile Assessment</div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFullName('');
                  setContactHandle('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition"
              >
                {isBurmese ? 'နောက်ထပ် စုံစမ်းမှု ပေးပို့ရန်' : 'Submit Another Inquiry'}
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-zinc-950 hover:bg-black shadow-xs transition"
              >
                {isBurmese ? 'GOEURO လုပ်ငန်းခွင်သို့ ပြန်သွားရန်' : 'View in Private Workspace →'}
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <div>
            <div className="border-b border-zinc-100 pb-4 mb-5">
              <h2 className="text-lg font-bold text-zinc-950">
                {t.inquiryPage.formTitle}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t.inquiryPage.formSubtitle}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.inquiryPage.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.inquiryPage.fullNamePlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.inquiryPage.preferredContact} *
                  </label>
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="TELEGRAM">Telegram</option>
                    <option value="VIBER">Viber</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PHONE">Direct Phone Call</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>

                {/* Handle or Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.inquiryPage.contactHandle} *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactHandle}
                    onChange={(e) => setContactHandle(e.target.value)}
                    placeholder={t.inquiryPage.contactHandlePlaceholder}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Interested Pathway */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.inquiryPage.pathwayInterest} *
                  </label>
                  <select
                    value={pathwayId}
                    onChange={(e) => setPathwayId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    {pathways.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Current Education Status */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.inquiryPage.educationStatus} *
                  </label>
                  <select
                    value={educationStatus}
                    onChange={(e) => setEducationStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="HIGH_SCHOOL">{t.inquiryPage.educationOptions.HIGH_SCHOOL}</option>
                    <option value="BACHELOR">{t.inquiryPage.educationOptions.BACHELOR}</option>
                    <option value="DIPLOMA">{t.inquiryPage.educationOptions.DIPLOMA}</option>
                    <option value="WORKING">{t.inquiryPage.educationOptions.WORKING}</option>
                    <option value="GED">{t.inquiryPage.educationOptions.GED}</option>
                    <option value="OTHER">{t.inquiryPage.educationOptions.OTHER}</option>
                  </select>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.inquiryPage.notes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.inquiryPage.notesPlaceholder}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span className="leading-snug">{t.inquiryPage.consent}</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? t.inquiryPage.submitting : t.inquiryPage.submitBtn}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner (Slide 11: DOs & DON'Ts) */}
      <div className="max-w-2xl mx-auto mt-8 p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 text-xs shadow-notion space-y-2">
        <div className="font-bold text-purple-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>{isBurmese ? 'GOEURO ၏ ပွင့်လင်းမြင်သာမှု ကတိကဝတ်' : 'GOEURO Ethics & Transparency Commitment'}</span>
        </div>
        <p className="leading-relaxed text-zinc-300">
          {isBurmese
            ? 'ကျွန်ုပ်တို့သည် ဗီဇာနှင့် တက္ကသိုလ်ဝင်ခွင့် အလွန်အကျွံ ကတိအတုများ မပေးပါ။ သင့်ပညာအရည်အချင်းနှင့် ဂျာမန်ဘာသာစကားအဆင့်ကို မှန်ကန်စွာ စစ်ဆေးပြီး အမှန်တကယ် လက်တွေ့ကျသော လမ်းကြောင်းကိုသာ အကြံပြုပါမည်။'
            : 'We do not promise guaranteed admissions or visas. We provide factual eligibility screening, authentic Hamburg living reality, and transparent procedural guidance.'}
        </p>
      </div>
    </div>
  );
}
