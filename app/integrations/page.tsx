'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useSync } from '@/components/SyncContext';
import {
  PlugZap,
  Copy,
  Check,
  Play,
  FileSpreadsheet,
  Share2,
  Video,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const GOOGLE_SCRIPT_CODE = `/**
 * GOEURO Google Forms Live Connector
 * Paste this into: Google Forms > ⋮ > Script editor
 * Then add trigger: onFormSubmit
 */
function onFormSubmit(e) {
  var endpoint = "http://localhost:3005/api/integrations/google-form";
  var itemResponses = e.response.getItemResponses();
  var payload = {
    formTitle: e.source.getTitle(),
    timestamp: new Date().toISOString(),
    responseId: e.response.getId()
  };

  for (var i = 0; i < itemResponses.length; i++) {
    var title = itemResponses[i].getItem().getTitle();
    var response = itemResponses[i].getResponse();
    payload[title] = response;
  }

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(endpoint, options);
  } catch (err) {
    Logger.log("Error sending to GOEURO: " + err);
  }
}`;

export default function IntegrationsPage() {
  const { language } = useLanguage();
  const isBurmese = language === 'my';
  const { isSyncing, triggerSync, notifySync } = useSync();

  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/integrations/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load integration logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s for live stream
    const handleSync = () => fetchLogs();
    window.addEventListener('goeuro_sync_event', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('goeuro_sync_event', handleSync);
    };
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const runSimulation = async (type: 'google-form' | 'facebook' | 'tiktok' | 'live-webhook') => {
    setSimulating(type);
    setToastMsg(null);

    let endpoint = '';
    let payload: any = {};

    if (type === 'google-form') {
      endpoint = '/api/integrations/google-form';
      payload = {
        formTitle: 'Germany Ausbildung 2026 Registration Form',
        'Full Name': 'Htet Aung Kyaw',
        'Phone Number': '09450012345',
        'Telegram Handle': '@htet_ausbildung',
        'Email Address': 'htetaung@gmail.com',
        'Preferred Contact Method': 'TELEGRAM',
        'Interested Pathway': 'Germany Ausbildung (Vocational Training)',
        'Education Background': 'High School / Matriculation Passed',
        'German Proficiency': 'A2 Goethe Passed',
        'Questions': 'Interested in IT Specialist or Hotel Ausbildung in Hamburg.',
      };
    } else if (type === 'facebook') {
      endpoint = '/api/integrations/facebook';
      payload = {
        fullName: 'May Thinzar Nwe',
        phoneNumber: '09790098765',
        email: 'maythinzar@outlook.com',
        adId: 'fb_ad_ausbildung_autumn26',
        adName: 'Ausbildung Nursing & Stipend Reel Ad',
        campaignName: 'Yangon & Mandalay Autumn 2026 Boost',
        pathway: 'AUSBILDUNG',
        educationStatus: 'BACHELOR',
      };
    } else if (type === 'tiktok') {
      endpoint = '/api/integrations/tiktok';
      payload = {
        fullName: 'Zin Ko Ko',
        phone: '09250077889',
        tiktokHandle: 'zinko_germany',
        preferredContact: 'VIBER',
        videoTitle: 'How I study tuition-free in Hamburg (Bio Link Form)',
        campaignName: 'Hamburg POV Lu Series',
        pathway: 'PUBLIC_UNIVERSITY',
        educationStatus: 'HIGH_SCHOOL',
        notes: 'Inquiring after seeing Lu Min Myat campus tour video.',
      };
    } else {
      endpoint = '/api/integrations/live-webhook';
      payload = {
        fullName: 'Khin Myo Thant',
        contactHandle: '@khinmyo_tg',
        preferredContact: 'TELEGRAM',
        pathwayCode: 'AUSBILDUNG',
        educationStatus: 'DIPLOMA',
        channel: 'ZAPIER_WEBHOOK',
        notes: 'External landing page inquiry via Zapier.',
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        const leadName = payload.fullName || payload['Full Name'] || 'New Student Lead';
        setToastMsg(`✓ Ingestion simulated successfully! Lead created: ${leadName} (ID: ${data.leadId})`);
        fetchLogs();
        notifySync('lead_created', {
          name: leadName,
          channel: type.toUpperCase(),
        });
        triggerSync();
      } else {
        setToastMsg(`Error: ${data.error || 'Simulation failed'}`);
      }
    } catch (err: any) {
      setToastMsg(`Network error: ${err.message}`);
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shrink-0">
            <PlugZap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                Live Data & Ingestion Connectors
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                Multi-Channel
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Connect external lead sources seamlessly: Google Forms, Facebook Lead Ads, TikTok, and Universal Webhooks.
            </p>
          </div>
        </div>

        <Link
          href="/leads"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition shrink-0"
        >
          <span>View In Lead Pipeline →</span>
        </Link>
      </div>

      {/* Interactive 1-Click Live Simulator Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              1-Click Live Ingestion Simulator
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            Click any button to test instant live ingestion into the CRM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => runSimulation('google-form')}
            disabled={!!simulating}
            className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Simulate Google Form</span>
              </span>
              <Play className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[10px] text-emerald-700 leading-tight">
              Injects a student registration with German level & Telegram handle.
            </p>
          </button>

          <button
            onClick={() => runSimulation('facebook')}
            disabled={!!simulating}
            className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-sky-900">
              <span className="flex items-center space-x-1.5">
                <Share2 className="w-4 h-4 text-sky-600" />
                <span>Simulate Facebook Lead Ad</span>
              </span>
              <Play className="w-3 h-3 text-sky-600 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[10px] text-sky-700 leading-tight">
              Injects a Meta Leadgen payload with ad ID & campaign attribution.
            </p>
          </button>

          <button
            onClick={() => runSimulation('tiktok')}
            disabled={!!simulating}
            className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
              <span className="flex items-center space-x-1.5">
                <Video className="w-4 h-4 text-purple-600" />
                <span>Simulate TikTok Bio Lead</span>
              </span>
              <Play className="w-3 h-3 text-purple-600 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[10px] text-zinc-600 leading-tight">
              Injects a TikTok inquiry from Lu Min Myat Hamburg POV reel.
            </p>
          </button>

          <button
            onClick={() => runSimulation('live-webhook')}
            disabled={!!simulating}
            className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span className="flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-purple-600" />
                <span>Simulate Live Webhook</span>
              </span>
              <Play className="w-3 h-3 text-purple-600 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[10px] text-purple-700 leading-tight">
              Injects a custom JSON payload via universal webhook.
            </p>
          </button>
        </div>

        {toastMsg && (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Connectors Grid (4 Notion Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Google Forms & Sheets */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Google Forms & Sheets</h3>
                  <span className="text-[11px] text-zinc-400">Live Ingestion via Google Apps Script</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stats['GOOGLE_FORM'] || 0} received
              </span>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Every student submission in your Google Form streams directly into GOEURO with duplicate screening and counselor auto-assignment.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Webhook Endpoint URL:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value="http://localhost:3005/api/integrations/google-form"
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700"
                />
                <button
                  onClick={() => copyToClipboard('http://localhost:3005/api/integrations/google-form', 'gform_url')}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                  title="Copy URL"
                >
                  {copiedKey === 'gform_url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => setShowScriptCode(!showScriptCode)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-between transition"
            >
              <span className="flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Google Apps Script Snippet (Copy & Paste)</span>
              </span>
              {showScriptCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showScriptCode && (
              <div className="mt-2.5 p-3 rounded-xl bg-zinc-950 text-zinc-200 border border-zinc-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-zinc-400">Code.gs</span>
                  <button
                    onClick={() => copyToClipboard(GOOGLE_SCRIPT_CODE, 'gscript_code')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition flex items-center space-x-1"
                  >
                    {copiedKey === 'gscript_code' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'gscript_code' ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-2 bg-black/50 rounded-lg text-[10px] text-emerald-300 font-mono">
                  {GOOGLE_SCRIPT_CODE}
                </pre>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[10px]">
                  <li>Open Google Form &rarr; click ⋮ &rarr; <strong>Script editor</strong>.</li>
                  <li>Paste the code snippet and save.</li>
                  <li>Click <strong>Triggers</strong> &rarr; Add trigger for <strong>onFormSubmit</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Facebook Lead Ads & Messenger */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Facebook Lead Ads & Messenger</h3>
                  <span className="text-[11px] text-zinc-400">Meta Graph Webhook Connector</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {stats['FACEBOOK'] || 0} received
              </span>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Meta Lead Ads and Facebook Messenger inquiries are tagged with campaign names, ad set IDs, and routed to counselors.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Meta Callback URL:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value="http://localhost:3005/api/integrations/facebook"
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700"
                />
                <button
                  onClick={() => copyToClipboard('http://localhost:3005/api/integrations/facebook', 'fb_url')}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                >
                  {copiedKey === 'fb_url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Meta Verify Token:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value="goeuro_fb_verify_token_2026"
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700"
                />
                <button
                  onClick={() => copyToClipboard('goeuro_fb_verify_token_2026', 'fb_token')}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                >
                  {copiedKey === 'fb_token' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-500">
            Supports Meta Webhook subscriptions for <code className="text-zinc-800 font-semibold">leadgen</code> and <code className="text-zinc-800 font-semibold">messages</code>.
          </div>
        </div>

        {/* Card 3: TikTok Lead Generation */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-zinc-950 text-white">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">TikTok Lead Gen & Bio Forms</h3>
                  <span className="text-[11px] text-zinc-400">Hamburg POV Reel Lead Router</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {stats['TIKTOK'] || 0} received
              </span>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Captures leads generated from Lu Min Myat's authentic Hamburg student reality reels with video attribution tags.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                TikTok Webhook URL:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value="http://localhost:3005/api/integrations/tiktok"
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700"
                />
                <button
                  onClick={() => copyToClipboard('http://localhost:3005/api/integrations/tiktok', 'tt_url')}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                >
                  {copiedKey === 'tt_url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-500">
            Attribution parameters: <code className="text-purple-700 font-semibold">utm_source=tiktok&utm_medium=bio_link</code>
          </div>
        </div>

        {/* Card 4: Universal Live Webhook & API Key */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Universal Live Webhook</h3>
                  <span className="text-[11px] text-zinc-400">Zapier, Make, n8n & Custom Webhooks</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {stats['LIVE_WEBHOOK'] || 0} received
              </span>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Post arbitrary JSON from external landing pages, Typeform, or automations with instant CRM creation.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Universal Endpoint:
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value="http://localhost:3005/api/integrations/live-webhook"
                  className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-700"
                />
                <button
                  onClick={() => copyToClipboard('http://localhost:3005/api/integrations/live-webhook', 'live_url')}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition"
                >
                  {copiedKey === 'live_url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>JSON format: <code className="text-zinc-800 font-semibold">&#123; fullName, contactHandle, pathwayCode &#125;</code></span>
          </div>
        </div>
      </div>

      {/* Real-Time Ingestion Activity Stream */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-zinc-950">Real-Time Ingestion Activity Stream</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Live feed of incoming webhooks from Google Forms, Meta, TikTok, and APIs.
              </p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
          >
            Refresh Feed
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 border-b border-zinc-200/90 text-zinc-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Channel Source</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                    No webhook events recorded yet. Click one of the 1-Click Simulator buttons above to test!
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let channelBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {log.channel}
                    </span>
                  );

                  if (log.channel === 'GOOGLE_FORM') {
                    channelBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Google Form
                      </span>
                    );
                  } else if (log.channel === 'FACEBOOK') {
                    channelBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        Facebook Ad
                      </span>
                    );
                  } else if (log.channel === 'TIKTOK') {
                    channelBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-100 border border-zinc-800">
                        TikTok
                      </span>
                    );
                  }

                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/60 transition">
                      <td className="px-5 py-3">{channelBadge}</td>
                      <td className="px-5 py-3 font-semibold text-zinc-900">
                        {log.leadName || 'Inquiry'}
                      </td>
                      <td className="px-5 py-3 text-zinc-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString()} • {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'DUPLICATE'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPayload(log.payload)}
                          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
                        >
                          Payload
                        </button>
                        <Link
                          href="/leads"
                          className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                        >
                          CRM Board →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200/90 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950">Raw Ingested Webhook Payload</h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                ✕
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-80 whitespace-pre-wrap">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(selectedPayload), null, 2);
                } catch (e) {
                  return selectedPayload;
                }
              })()}
            </pre>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
