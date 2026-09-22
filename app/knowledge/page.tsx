'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import {
  BookOpen,
  Search,
  Plus,
  CheckCircle,
  HelpCircle,
  FileText,
  ShieldAlert,
  Sparkles,
  Calendar,
  X,
  Globe
} from 'lucide-react';

export default function KnowledgePage() {
  const { language, t } = useLanguage();
  const { can, currentUser } = useUserSession();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FAQ');
  const [contentEn, setContentEn] = useState('');
  const [contentMm, setContentMm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!contentEn.trim() && !contentMm.trim())) return;

    setSubmitting(true);
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          contentEn,
          contentMm,
          status: 'APPROVED',
        }),
      });
      setTitle('');
      setContentEn('');
      setContentMm('');
      setModalOpen(false);
      fetchKnowledge();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchEn = item.contentEn?.toLowerCase().includes(q);
      const matchMm = item.contentMm?.toLowerCase().includes(q);
      if (!matchTitle && !matchEn && !matchMm) return false;
    }
    return true;
  });

  const categories = [
    { id: '', label: 'All Categories' },
    { id: 'FAQ', label: 'Approved FAQs' },
    { id: 'SOP', label: 'Team SOPs' },
    { id: 'CONSULTATION_SCRIPT', label: 'Consultation Scripts' },
    { id: 'SERVICE_DESCRIPTION', label: 'Service Scope' },
    { id: 'BRAND_ASSET', label: 'Brand Guidelines' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                {t.knowledge.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                {items.length} articles
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {t.knowledge.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.knowledge.createItem}</span>
        </button>
      </div>

      {/* Notion Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200/90 shadow-notion flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bilingual search (English or မြန်မာစာ)..."
            className="w-full pl-10 pr-3 py-1.5 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-zinc-50/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                categoryFilter === c.id
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 border border-transparent hover:border-zinc-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200/90 text-zinc-400 text-xs shadow-notion">
          No knowledge items found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion hover:shadow-xs transition space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  {item.category}
                </span>
                <span className="text-[10px] font-semibold text-zinc-800 flex items-center space-x-1 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                  <CheckCircle className="w-3 h-3 text-purple-600" />
                  <span>Approved Answer</span>
                </span>
              </div>

              <h3 className="font-bold text-sm text-zinc-900 leading-snug">
                {item.title}
              </h3>

              {/* English text */}
              {item.contentEn && (
                <div className="text-xs text-zinc-700 bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 whitespace-pre-line leading-relaxed">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    English:
                  </span>
                  {item.contentEn}
                </div>
              )}

              {/* Burmese text */}
              {item.contentMm && (
                <div className="text-xs text-zinc-800 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100/80 font-burmese whitespace-pre-line leading-relaxed">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1 font-sans">
                    မြန်မာဘာသာ (Burmese):
                  </span>
                  {item.contentMm}
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Owner: <strong className="text-zinc-700">{item.ownerName}</strong></span>
                <span>Reviewed: {new Date(item.lastReviewDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Knowledge Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200/90">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-zinc-950">
                  {t.knowledge.createItem}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                >
                  <option value="FAQ">Approved FAQ</option>
                  <option value="SOP">Standard Operating Procedure (SOP)</option>
                  <option value="CONSULTATION_SCRIPT">Consultation Script</option>
                  <option value="SERVICE_DESCRIPTION">Service Scope Description</option>
                  <option value="BRAND_ASSET">Brand Asset & Guideline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Title / Question *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ausbildung Contract & B1 Requirement FAQ"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">English Content</label>
                <textarea
                  rows={3}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="Official English answer or SOP steps..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Burmese Content (မြန်မာဘာသာ)</label>
                <textarea
                  rows={3}
                  value={contentMm}
                  onChange={(e) => setContentMm(e.target.value)}
                  placeholder="အတည်ပြုထားသော မြန်မာဘာသာ အဖြေ..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-burmese focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition"
                >
                  {submitting ? 'Saving...' : 'Save Knowledge Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
