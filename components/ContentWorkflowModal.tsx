'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import {
  X,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Video,
  CheckCircle,
  TrendingUp,
  FileCheck,
  Globe,
  AlertCircle
} from 'lucide-react';

interface ContentWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  itemToEdit?: any;
}

export default function ContentWorkflowModal({
  isOpen,
  onClose,
  onSaved,
  itemToEdit,
}: ContentWorkflowModalProps) {
  const { language, t } = useLanguage();
  const { allUsers } = useUserSession();

  const [topic, setTopic] = useState('');
  const [pathwayId, setPathwayId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [pillar, setPillar] = useState('EDUCATION_40');
  const [channel, setChannel] = useState('TIKTOK');
  const [format, setFormat] = useState('REEL');
  const [targetAudience, setTargetAudience] = useState('');
  const [sourceLinks, setSourceLinks] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [factualReviewerId, setFactualReviewerId] = useState('');
  const [brandApproverId, setBrandApproverId] = useState('');

  // Results & Recording
  const [publishedUrl, setPublishedUrl] = useState('');
  const [views, setViews] = useState('0');
  const [clicks, setClicks] = useState('0');
  const [inquiries, setInquiries] = useState('0');
  const [qualified, setQualified] = useState('0');
  const [adSpend, setAdSpend] = useState('0');

  const [pathways, setPathways] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/pathways')
      .then((r) => r.json())
      .then((d) => setPathways(Array.isArray(d) ? d : []));

    fetch('/api/marketing/campaigns')
      .then((r) => r.json())
      .then((d) => setCampaigns(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setTopic(itemToEdit.topic || '');
      setPathwayId(itemToEdit.pathwayId || '');
      setCampaignId(itemToEdit.campaignId || '');
      setPillar(itemToEdit.pillar || 'EDUCATION_40');
      setChannel(itemToEdit.channel || 'TIKTOK');
      setFormat(itemToEdit.format || 'REEL');
      setTargetAudience(itemToEdit.targetAudience || '');
      try {
        const parsed = JSON.parse(itemToEdit.sourceLinks || '[]');
        setSourceLinks(Array.isArray(parsed) ? parsed.join('\n') : '');
      } catch (e) {
        setSourceLinks(itemToEdit.sourceLinks || '');
      }
      setAssetUrl(itemToEdit.assetUrl || '');
      setCallToAction(itemToEdit.callToAction || '');
      setPlannedDate(itemToEdit.plannedDate ? new Date(itemToEdit.plannedDate).toISOString().split('T')[0] : '');
      setFactualReviewerId(itemToEdit.factualReviewerId || '');
      setBrandApproverId(itemToEdit.brandApproverId || '');
      setPublishedUrl(itemToEdit.publishedUrl || '');

      try {
        const m = JSON.parse(itemToEdit.metrics || '{}');
        setViews(String(m.views || 0));
        setClicks(String(m.clicks || 0));
        setInquiries(String(m.inquiries || 0));
        setQualified(String(m.qualified || 0));
        setAdSpend(String(m.adSpend || 0));
      } catch (e) {
        // default
      }
    } else {
      setTopic('');
      setPathwayId(pathways[0]?.id || '');
      setCampaignId('');
      setPillar('EDUCATION_40');
      setChannel('TIKTOK');
      setFormat('REEL');
      setTargetAudience('Young adults / high school graduates in Myanmar interested in Germany');
      setSourceLinks('');
      setAssetUrl('');
      setCallToAction('Message GOEURO for a free profile assessment');
      setPlannedDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const nayUser = allUsers.find((u) => u.email === 'nay@goeuro.de');
      const thnUser = allUsers.find((u) => u.email === 'thn@goeuro.de');
      setFactualReviewerId(nayUser?.id || '');
      setBrandApproverId(thnUser?.id || '');

      setPublishedUrl('');
      setViews('0');
      setClicks('0');
      setInquiries('0');
      setQualified('0');
      setAdSpend('0');
    }
    setError('');
  }, [itemToEdit, isOpen, pathways, allUsers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    try {
      const sourceLinksArray = sourceLinks
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const metricsObj = {
        views: parseInt(views) || 0,
        clicks: parseInt(clicks) || 0,
        inquiries: parseInt(inquiries) || 0,
        qualified: parseInt(qualified) || 0,
        adSpend: parseFloat(adSpend) || 0,
      };

      if (itemToEdit) {
        const res = await fetch('/api/marketing/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: itemToEdit.id,
            assetUrl,
            callToAction,
            plannedDate,
            publishedUrl: publishedUrl || undefined,
            metrics: metricsObj,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update content');
        }
      } else {
        const res = await fetch('/api/marketing/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            pathwayId: pathwayId || null,
            campaignId: campaignId || null,
            pillar,
            channel,
            format,
            targetAudience,
            sourceLinks: sourceLinksArray,
            assetUrl,
            callToAction,
            plannedDate: plannedDate || null,
            factualReviewerId: factualReviewerId || null,
            brandApproverId: brandApproverId || null,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to create content');
        }
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async (nextStage: string) => {
    if (!itemToEdit) return;
    setLoading(true);
    setError('');
    try {
      const metricsObj = {
        views: parseInt(views) || 0,
        clicks: parseInt(clicks) || 0,
        inquiries: parseInt(inquiries) || 0,
        qualified: parseInt(qualified) || 0,
        adSpend: parseFloat(adSpend) || 0,
      };

      const res = await fetch('/api/marketing/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemToEdit.id,
          stage: nextStage,
          publishedUrl: publishedUrl || undefined,
          metrics: metricsObj,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Stage update failed');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStage = itemToEdit?.stage || 'IDEA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-notion-modal border border-zinc-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>{itemToEdit ? 'Content Item & Approval Pipeline' : t.marketing.createContent}</span>
            </h2>
            {itemToEdit && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                Current Stage: {itemToEdit.stage}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stage Advancement Quick Action Banner */}
        {itemToEdit && (
          <div className="my-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Workflow Action:
            </div>

            <div className="flex flex-wrap gap-2">
              {currentStage === 'IDEA' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('RESEARCH')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white hover:bg-black shadow-xs"
                >
                  Move to Research →
                </button>
              )}

              {currentStage === 'RESEARCH' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('DRAFT')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white hover:bg-black shadow-xs"
                >
                  Move to Draft →
                </button>
              )}

              {currentStage === 'DRAFT' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('FACTUAL_REVIEW')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                >
                  Submit for Factual Review (Nay) →
                </button>
              )}

              {currentStage === 'FACTUAL_REVIEW' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('BRAND_APPROVAL')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-xs flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Factual Accuracy (Nay) → Send to Brand Approval</span>
                </button>
              )}

              {currentStage === 'BRAND_APPROVAL' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('SCHEDULED')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-xs flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approve Brand Tone & Hook (THN) → Schedule Content</span>
                </button>
              )}

              {currentStage === 'SCHEDULED' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('PUBLISHED')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-950 text-white hover:bg-black shadow-xs flex items-center space-x-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Mark as Live / Published → Record Post URL</span>
                </button>
              )}

              {(currentStage === 'PUBLISHED' || currentStage === 'RESULTS_RECORDED') && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('RESULTS_RECORDED')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-xs flex items-center space-x-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Save Live Post URL & Attribution Metrics</span>
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Content Topic / Hook Title *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Why German Ausbildung gives a paid monthly stipend"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Service Pathway *
              </label>
              <select
                value={pathwayId}
                onChange={(e) => setPathwayId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50 font-semibold"
              >
                <option value="">-- General GOEURO Brand --</option>
                {pathways.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Campaign (Optional)
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              >
                <option value="">-- Standalone / Organic --</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Content Pillar *
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              >
                <option value="EDUCATION_40">Education (40%)</option>
                <option value="GERMANY_LIFE_20">Germany Life (20%)</option>
                <option value="APPLICATION_20">Application Process (20%)</option>
                <option value="TRUST_10">Trust & Proof (10%)</option>
                <option value="CONVERSION_10">Conversion CTA (10%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              >
                <option value="TIKTOK">TikTok</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="YOUTUBE">YouTube Shorts</option>
                <option value="TELEGRAM">Telegram Channel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              >
                <option value="REEL">Reel / Short Video (Lu)</option>
                <option value="CAROUSEL">Carousel Infographic</option>
                <option value="EXPLAINER">Long Explainer / Post</option>
                <option value="LIVE_QA">Live Q&A / AMA</option>
                <option value="STORY">Story / Update</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>Draft / Raw Footage Link</span>
              </label>
              <input
                type="url"
                value={assetUrl}
                onChange={(e) => setAssetUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="e.g. Message GOEURO for profile evaluation"
                className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
              <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Evidence & Source Links</span>
            </label>
            <textarea
              rows={2}
              value={sourceLinks}
              onChange={(e) => setSourceLinks(e.target.value)}
              placeholder="https://www.make-it-in-germany.com/..."
              className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50 font-mono"
            />
          </div>

          {/* Results Recording Section */}
          {(currentStage === 'PUBLISHED' || currentStage === 'RESULTS_RECORDED' || itemToEdit) && (
            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Published Post URL & Attribution Results</span>
                </span>
                <span className="text-[10px] text-purple-700 font-bold">Stage 7 & 8</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Live Post URL
                </label>
                <input
                  type="url"
                  value={publishedUrl}
                  onChange={(e) => setPublishedUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@goeuro/... or https://facebook.com/..."
                  className="w-full px-3.5 py-1.5 text-xs border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5">Views</label>
                  <input
                    type="number"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5">Clicks</label>
                  <input
                    type="number"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5">Inquiries</label>
                  <input
                    type="number"
                    value={inquiries}
                    onChange={(e) => setInquiries(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5">Qualified</label>
                  <input
                    type="number"
                    value={qualified}
                    onChange={(e) => setQualified(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5">Ad Spend (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={adSpend}
                    onChange={(e) => setAdSpend(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : itemToEdit ? 'Save Content Details' : 'Create Content Piece'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
