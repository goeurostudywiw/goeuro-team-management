'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import { useSync } from '@/components/SyncContext';
import LeadDetailModal from '@/components/LeadDetailModal';
import AddLeadModal from '@/components/AddLeadModal';
import {
  Users,
  Search,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Clock,
  PlugZap,
  Filter,
  Copy,
  Check,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  UserPlus,
  Download
} from 'lucide-react';

export default function LeadsPage() {
  const { language, t } = useLanguage();
  const { currentUser, can, allUsers } = useUserSession();
  const { isSyncing, notifySync, triggerSync } = useSync();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  // Filters
  const [stageFilter, setStageFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const [pathways, setPathways] = useState<any[]>([]);

  const exportLeadsCSV = () => {
    if (leads.length === 0) return;
    const targets = filteredLeads.length > 0 ? filteredLeads : leads;
    const headers = ['Full Name', 'Phone', 'Email', 'Preferred Contact', 'Contact Handle', 'Pathway', 'Education Status', 'Stage', 'Owner', 'Date'];
    const rows = targets.map((l) => [
      `"${(l.fullName || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.preferredContact || '').replace(/"/g, '""')}"`,
      `"${(l.contactHandle || '').replace(/"/g, '""')}"`,
      `"${(l.interestedPathway?.name || '').replace(/"/g, '""')}"`,
      `"${(l.educationStatus || '').replace(/"/g, '""')}"`,
      `"${(l.stage || '').replace(/"/g, '""')}"`,
      `"${(l.owner?.name || 'Unassigned').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `goeuro_student_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [leadsRes, pathRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/pathways'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(Array.isArray(data) ? data : []);
      } else {
        setLeads([]);
      }
      if (pathRes.ok) setPathways(await pathRes.json());
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  const copyHandle = (leadId: string, handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(handle);
    setCopiedLeadId(leadId);
    setTimeout(() => setCopiedLeadId(null), 2000);
  };

  const handleAdvanceStage = async (leadId: string, currentStage: string, leadName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stageOrder = [
      'NEW', 'CONTACTED', 'ASSESSMENT_NEEDED', 'QUALIFIED',
      'CONSULTATION_BOOKED', 'CONSULTATION_COMPLETED', 'APPLICATION_READY', 'CLOSED_WON'
    ];
    const currIdx = stageOrder.indexOf(currentStage);
    if (currIdx < stageOrder.length - 1) {
      const nextStage = stageOrder[currIdx + 1];
      try {
        await fetch(`/api/leads/${leadId}/contact`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: nextStage }),
        });
        notifySync('lead_advanced', { name: leadName, stage: nextStage });
        fetchLeads();
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchLeads();
    const handleSwitch = () => fetchLeads();
    const handleSync = () => fetchLeads();

    window.addEventListener('goeuro_user_switched', handleSwitch);
    window.addEventListener('goeuro_sync_event', handleSync);
    return () => {
      window.removeEventListener('goeuro_user_switched', handleSwitch);
      window.removeEventListener('goeuro_sync_event', handleSync);
    };
  }, []);

  if (!can('lead:read')) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 text-center max-w-xl mx-auto my-12 shadow-notion">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-4 border border-purple-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-950 mb-2">
          {language === 'my' ? 'ကိုယ်ရေးကိုယ်တာ အချက်အလက် ကာကွယ်မှု' : 'Lead Access Restricted'}
        </h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6 leading-relaxed">
          {t.leads.restrictedNotice}
        </p>
        <div className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-600 inline-block border border-zinc-200">
          Your active persona: <strong>{currentUser?.name}</strong> ({currentUser?.role?.name})
          <br />
          <span className="text-zinc-400">To view student leads, switch to THN (Admin), KMH (Counselor), or YYTT (Team Lead).</span>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter((lead) => {
    if (stageFilter && lead.stage !== stageFilter) return false;
    if (ownerFilter && lead.ownerId !== ownerFilter) return false;
    if (pathwayFilter && lead.interestedPathwayId !== pathwayFilter) return false;
    if (channelFilter && lead.channel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.fullName?.toLowerCase().includes(q);
      const matchHandle = lead.contactHandle?.toLowerCase().includes(q);
      const matchEmail = lead.email?.toLowerCase().includes(q);
      if (!matchName && !matchHandle && !matchEmail) return false;
    }
    return true;
  });

  const renderChannelBadge = (channel?: string) => {
    switch (channel) {
      case 'GOOGLE_FORM':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            🟢 Google Form
          </span>
        );
      case 'FACEBOOK':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            🔵 Facebook
          </span>
        );
      case 'TIKTOK':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-zinc-900 text-zinc-100 border border-zinc-700">
            ⚫ TikTok
          </span>
        );
      case 'LIVE_WEBHOOK':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            ⚡ Live Webhook
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            🟣 Web Portal
          </span>
        );
    }
  };

  const pipelineStages = [
    { id: 'NEW', label: t.leads.stages.NEW, dot: 'bg-zinc-400' },
    { id: 'CONTACTED', label: t.leads.stages.CONTACTED, dot: 'bg-blue-500' },
    { id: 'ASSESSMENT_NEEDED', label: t.leads.stages.ASSESSMENT_NEEDED, dot: 'bg-amber-500' },
    { id: 'QUALIFIED', label: t.leads.stages.QUALIFIED, dot: 'bg-purple-600' },
    { id: 'CONSULTATION_BOOKED', label: t.leads.stages.CONSULTATION_BOOKED, dot: 'bg-indigo-600' },
    { id: 'CONSULTATION_COMPLETED', label: t.leads.stages.CONSULTATION_COMPLETED, dot: 'bg-teal-500' },
    { id: 'APPLICATION_READY', label: t.leads.stages.APPLICATION_READY, dot: 'bg-sky-600' },
    { id: 'CLOSED_WON', label: t.leads.stages.CLOSED_WON, dot: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (Notion White Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-purple-600" />
            <span>{t.leads.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {t.leads.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {can('lead:write') && (
            <button
              onClick={() => setAddLeadOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition btn-press cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Add Student Lead</span>
            </button>
          )}

          <button
            onClick={exportLeadsCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition btn-press cursor-pointer"
            title="Download CSV spreadsheet for Excel"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => triggerSync(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition btn-press"
            title="Sync leads with connected channels"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            href="/integrations"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition"
          >
            <PlugZap className="w-3.5 h-3.5" />
            <span>Connectors</span>
          </Link>

          <div className="inline-flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'board' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Pro CRM Metric Funnel Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Inquiries</div>
          <div className="text-xl font-extrabold text-zinc-950 mt-0.5">{leads.length}</div>
          <div className="text-[10px] text-zinc-500">Across all channels</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">New Inquiries</div>
          <div className="text-xl font-extrabold text-blue-700 mt-0.5">
            {leads.filter((l) => l.stage === 'NEW').length}
          </div>
          <div className="text-[10px] text-zinc-500">Awaiting contact</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Qualified Leads</div>
          <div className="text-xl font-extrabold text-purple-700 mt-0.5">
            {leads.filter((l) => l.stage === 'QUALIFIED').length}
          </div>
          <div className="text-[10px] text-zinc-500">Germany eligible</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Consultations</div>
          <div className="text-xl font-extrabold text-indigo-700 mt-0.5">
            {leads.filter((l) => l.stage.includes('CONSULTATION')).length}
          </div>
          <div className="text-[10px] text-zinc-500">Video sessions booked</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Closed Won</div>
          <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
            {leads.filter((l) => l.stage === 'CLOSED_WON').length}
          </div>
          <div className="text-[10px] text-emerald-600">Case files generated</div>
        </div>
      </div>

      {/* Filter Bar (Notion Database Filters) */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200/90 shadow-notion flex flex-wrap items-center gap-2.5">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.leads.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-zinc-50/50"
          />
        </div>

        {/* Source Channel Filter */}
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Sources</option>
          <option value="GOOGLE_FORM">🟢 Google Forms</option>
          <option value="FACEBOOK">🔵 Facebook Ads</option>
          <option value="TIKTOK">⚫ TikTok Leads</option>
          <option value="WEB">🟣 Web Portal</option>
          <option value="LIVE_WEBHOOK">⚡ Live Webhook</option>
        </select>

        {/* Pathway Filter */}
        <select
          value={pathwayFilter}
          onChange={(e) => setPathwayFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Pathways</option>
          {pathways.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Owner Filter */}
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Owners</option>
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        {(pathwayFilter || ownerFilter || stageFilter || channelFilter || searchQuery) && (
          <button
            onClick={() => {
              setPathwayFilter('');
              setOwnerFilter('');
              setStageFilter('');
              setChannelFilter('');
              setSearchQuery('');
            }}
            className="text-xs text-purple-700 hover:underline px-2 font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content: Board or List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 text-center max-w-lg mx-auto my-8 shadow-notion">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-3 border border-purple-200">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-950 mb-1">
            {language === 'my' ? 'ကျောင်းသား စုံစမ်းမှု ၀ ခု' : 'Zero Leads in Queue (Pre-Launch)'}
          </h3>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            {t.leads.noLeads}
          </p>
          <Link
            href="/inquiry"
            target="_blank"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Submit a Test Student Inquiry</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : viewMode === 'board' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-3.5 min-w-[1600px] items-start">
            {pipelineStages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
              return (
                <div
                  key={stage.id}
                  className="w-56 shrink-0 bg-zinc-100/60 border border-zinc-200/80 rounded-2xl p-3 flex flex-col min-h-[380px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 mb-3 px-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      <span className="font-bold text-[11px] text-zinc-800 tracking-tight">
                        {stage.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setModalOpen(true);
                        }}
                        className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 hover:border-purple-300 shadow-notion hover:shadow-notion-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group hover-lift"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                            {lead.interestedPathway ? (
                              <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                                {lead.interestedPathway.name}
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                General
                              </span>
                            )}
                            {renderChannelBadge(lead.channel)}
                          </div>

                          <h4 className="text-xs font-extrabold text-zinc-900 group-hover:text-purple-700 transition">
                            {lead.fullName}
                          </h4>

                          <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
                            <span className="truncate mr-1">
                              {lead.preferredContact}: <span className="font-semibold text-zinc-800">{lead.contactHandle}</span>
                            </span>
                            <button
                              onClick={(e) => copyHandle(lead.id, lead.contactHandle, e)}
                              className="text-zinc-400 hover:text-purple-700 p-0.5 rounded transition shrink-0"
                              title="Copy contact handle"
                            >
                              {copiedLeadId === lead.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {lead.educationStatus}
                          </div>
                        </div>

                        {lead.isDuplicateOfId && (
                          <div className="mt-2 py-0.5 px-2 rounded-lg bg-amber-50 text-amber-800 text-[9px] font-bold flex items-center space-x-1 border border-amber-200">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            <span>Duplicate Detected</span>
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">
                            {lead.owner?.name?.split(' ')[0] || 'Unassigned'}
                          </span>
                          {lead.nextFollowUpDate && (
                            <span className="flex items-center space-x-0.5 text-zinc-500">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{new Date(lead.nextFollowUpDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>

                        {/* Quick Advance Button */}
                        {lead.stage !== 'CLOSED_WON' && (
                          <div className="mt-2 pt-1.5 border-t border-zinc-100/70 flex justify-end">
                            <button
                              onClick={(e) => handleAdvanceStage(lead.id, lead.stage, lead.fullName, e)}
                              className="text-[9px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200/80 transition flex items-center space-x-0.5 btn-press"
                              title="Advance to next pipeline stage"
                            >
                              <span>Next Stage</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="py-12 text-center text-[11px] text-zinc-400">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Source Channel</th>
                  <th className="px-4 py-3">Preferred Contact</th>
                  <th className="px-4 py-3">Pathway</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Next Follow-Up</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/70 transition">
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      <div>{lead.fullName}</div>
                      {lead.isDuplicateOfId && (
                        <span className="text-[10px] text-amber-600 font-medium">Duplicate</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {renderChannelBadge(lead.channel)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      <span className="font-bold">{lead.preferredContact}:</span> {lead.contactHandle}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {lead.interestedPathway?.name || 'General'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 font-medium">
                      {lead.owner?.name || <span className="text-zinc-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setModalOpen(true);
                        }}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900"
                      >
                        Manage & Convert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLead(null);
        }}
        onSaved={() => {
          fetchLeads();
          notifySync('lead_updated', { name: selectedLead?.fullName });
        }}
        lead={selectedLead}
      />

      {/* Manual Student Intake Modal */}
      <AddLeadModal
        isOpen={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onSaved={fetchLeads}
        pathways={pathways}
      />
    </div>
  );
}
