'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import { useSync } from '@/components/SyncContext';
import ContentWorkflowModal from '@/components/ContentWorkflowModal';
import CampaignModal from '@/components/CampaignModal';
import {
  Megaphone,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function MarketingPage() {
  const { language, t } = useLanguage();
  const { can } = useUserSession();
  const { isSyncing, triggerSync, notifySync } = useSync();

  const [contentItems, setContentItems] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('');
  const [viewTab, setViewTab] = useState<'board' | 'calendar' | 'campaigns'>('board');

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchMarketingData = async () => {
    try {
      const [contentRes, campRes, pathRes] = await Promise.all([
        fetch('/api/marketing/content'),
        fetch('/api/marketing/campaigns'),
        fetch('/api/pathways'),
      ]);

      if (contentRes.ok) setContentItems(await contentRes.json());
      if (campRes.ok) setCampaigns(await campRes.json());
      if (pathRes.ok) setPathways(await pathRes.json());
    } catch (err) {
      console.error('Failed to load marketing ops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
    const handleSync = () => fetchMarketingData();
    const handleSwitch = () => fetchMarketingData();

    window.addEventListener('goeuro_sync_event', handleSync);
    window.addEventListener('goeuro_user_switched', handleSwitch);
    return () => {
      window.removeEventListener('goeuro_sync_event', handleSync);
      window.removeEventListener('goeuro_user_switched', handleSwitch);
    };
  }, []);

  const filteredContent = contentItems.filter((item) => {
    if (selectedPathwayId && item.pathwayId !== selectedPathwayId) return false;
    return true;
  });

  const stages = [
    { id: 'IDEA', label: t.marketing.stages.IDEA, dot: 'bg-zinc-400' },
    { id: 'RESEARCH', label: t.marketing.stages.RESEARCH, dot: 'bg-blue-500' },
    { id: 'DRAFT', label: t.marketing.stages.DRAFT, dot: 'bg-indigo-500' },
    { id: 'FACTUAL_REVIEW', label: t.marketing.stages.FACTUAL_REVIEW, dot: 'bg-amber-500' },
    { id: 'BRAND_APPROVAL', label: t.marketing.stages.BRAND_APPROVAL, dot: 'bg-purple-600' },
    { id: 'SCHEDULED', label: t.marketing.stages.SCHEDULED, dot: 'bg-sky-500' },
    { id: 'PUBLISHED', label: t.marketing.stages.PUBLISHED, dot: 'bg-emerald-500' },
    { id: 'RESULTS_RECORDED', label: t.marketing.stages.RESULTS_RECORDED, dot: 'bg-purple-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (Notion White Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 flex items-center space-x-2.5">
            <Megaphone className="w-6 h-6 text-purple-600" />
            <span>{t.marketing.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {t.marketing.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerSync(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition btn-press"
            title="Sync marketing operations"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Ops</span>
          </button>

          <button
            onClick={() => setCampaignModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.marketing.createCampaign}</span>
          </button>
          <button
            onClick={() => {
              setSelectedItem(null);
              setContentModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.marketing.createContent}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Pathway Filter Bar (Notion Style) */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200/90 shadow-notion flex flex-wrap items-center justify-between gap-3">
        {/* Pathway Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedPathwayId('')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedPathwayId === ''
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {t.marketing.pathwayTabAll}
          </button>
          {pathways.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPathwayId(p.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                selectedPathwayId === p.id
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {p.code === 'AUSBILDUNG' ? '🇩🇪 Ausbildung' : '🎓 Public University'}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-xs">
          <button
            onClick={() => setViewTab('board')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewTab === 'board' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            8-Stage Board
          </button>
          <button
            onClick={() => setViewTab('calendar')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewTab === 'calendar' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Weekly Cadence
          </button>
          <button
            onClick={() => setViewTab('campaigns')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewTab === 'campaigns' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Campaigns & ROI
          </button>
        </div>
      </div>

      {/* View: 8-Stage Workflow Board */}
      {viewTab === 'board' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-3.5 min-w-[1700px] items-start">
            {stages.map((st) => {
              const stageItems = filteredContent.filter((i) => i.stage === st.id);
              return (
                <div
                  key={st.id}
                  className="w-56 shrink-0 bg-zinc-100/60 border border-zinc-200/80 rounded-2xl p-3 flex flex-col min-h-[420px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 mb-3 px-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className="font-bold text-[11px] text-zinc-800 tracking-tight">
                        {st.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700">
                      {stageItems.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setContentModalOpen(true);
                        }}
                        className="bg-white p-3.5 rounded-xl border border-zinc-200/80 hover:border-purple-400 shadow-notion hover:shadow-notion-hover transition cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1.5">
                            <span className="font-bold text-purple-700">{item.channel}</span>
                            <span>{item.format}</span>
                          </div>

                          {item.pathway && (
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${
                              item.pathway.code === 'AUSBILDUNG'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                            }`}>
                              {item.pathway.code === 'AUSBILDUNG' ? 'Ausbildung' : 'Public Uni'}
                            </span>
                          )}

                          <h4 className="text-xs font-bold text-zinc-900 group-hover:text-purple-700 transition leading-snug line-clamp-3">
                            {item.topic}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                          <span>Owner: {item.owner?.name?.split(' ')[0] || 'Unassigned'}</span>
                          {item.publishedUrl && (
                            <span className="text-purple-700 font-bold flex items-center">
                              Live <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </span>
                          )}
                        </div>

                        {item.stage === 'FACTUAL_REVIEW' && (
                          <div className="mt-2 pt-1.5 border-t border-amber-100 text-[10px] text-amber-800 font-bold flex items-center space-x-1">
                            <FileCheck className="w-3 h-3 text-amber-600" />
                            <span>Needs Nay's Review</span>
                          </div>
                        )}
                        {item.stage === 'BRAND_APPROVAL' && (
                          <div className="mt-2 pt-1.5 border-t border-purple-100 text-[10px] text-purple-700 font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-purple-600" />
                            <span>Needs THN's Approval</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {stageItems.length === 0 && (
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
      )}

      {/* View: Weekly Content Cadence (Slide 7) */}
      {viewTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-6 space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-zinc-950">
              GOEURO Weekly Content Cadence (Slide 7: Lu & Team Rhythm)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Lu becomes the recurring Germany face; the team supplies research, hooks, calendar, and lead follow-up behind him.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[
              { day: 'MON', focus: 'Public University', format: 'Lu Reel (Hamburg)', owner: 'Lu Min Myat', pillar: 'Life / Study' },
              { day: 'TUE', focus: 'Ausbildung FAQ', format: 'Carousel', owner: 'Nay Myo Thiha', pillar: 'Education' },
              { day: 'WED', focus: 'Germany Life Reality', format: 'Lu Reel (Hamburg)', owner: 'Lu Min Myat', pillar: 'Germany Life' },
              { day: 'THU', focus: 'Application & Eligibility', format: 'Explainer / Graphic', owner: 'Ye Yint Tun Thant', pillar: 'Application' },
              { day: 'FRI', focus: 'Myth vs Reality', format: 'Lu Reel (Hamburg)', owner: 'Lu Min Myat', pillar: 'Trust & Proof' },
              { day: 'SAT', focus: 'Ausbildung Deep-Dive', format: 'Ausbildung Reel', owner: 'Nay (Script) + Lu', pillar: 'Education' },
              { day: 'SUN', focus: 'Q&A / Live', format: 'AMA & Inquiry Intake', owner: 'Kaung Myat Hein', pillar: 'Conversion' },
            ].map((slot, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-xs text-zinc-950">{slot.day}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {slot.pillar}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-zinc-900">{slot.focus}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{slot.format}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200 text-[10px] font-semibold text-zinc-600">
                  Lead: {slot.owner}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: Campaigns & ROI */}
      {viewTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion p-6 space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-zinc-950">Campaigns & Attribution Tracking</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Monitor marketing spend, content output, and inquiry generation by campaign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    {camp.pathway?.name || 'Multi-Pathway'}
                  </span>
                  <span className="text-xs font-semibold text-zinc-600">
                    Budget: €{camp.budget || 0}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{camp.name}</h4>
                  <p className="text-xs text-zinc-600 mt-1">{camp.objective}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200 text-center text-xs">
                  <div>
                    <div className="text-zinc-400 text-[10px]">Content Items</div>
                    <div className="font-bold text-zinc-800">{camp._count?.content || 0}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[10px]">Inquiries</div>
                    <div className="font-bold text-zinc-800">{camp._count?.leads || 0}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[10px]">Status</div>
                    <div className="font-bold text-purple-700">{camp.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Item Modal */}
      <ContentWorkflowModal
        isOpen={contentModalOpen}
        onClose={() => {
          setContentModalOpen(false);
          setSelectedItem(null);
        }}
        onSaved={() => {
          fetchMarketingData();
          notifySync('content_updated', { topic: selectedItem?.topic });
        }}
        itemToEdit={selectedItem}
      />

      {/* Campaign Modal */}
      <CampaignModal
        isOpen={campaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        onSaved={() => {
          fetchMarketingData();
          notifySync('content_updated');
        }}
      />
    </div>
  );
}
