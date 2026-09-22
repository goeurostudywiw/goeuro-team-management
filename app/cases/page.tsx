'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import { useSync } from '@/components/SyncContext';
import CaseDetailModal from '@/components/CaseDetailModal';
import AddCaseModal from '@/components/AddCaseModal';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Plus,
  Download,
  FileCheck2
} from 'lucide-react';

export default function CasesPage() {
  const { language, t } = useLanguage();
  const { currentUser, can } = useUserSession();
  const { isSyncing, triggerSync, notifySync } = useSync();

  const [cases, setCases] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addCaseOpen, setAddCaseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState('');

  const exportCasesCSV = () => {
    if (cases.length === 0) return;
    const targets = filteredCases.length > 0 ? filteredCases : cases;
    const headers = ['Student Name', 'Pathway', 'Target Intake', 'German Level', 'Status', 'Counselor', 'Created Date'];
    const rows = targets.map((c) => [
      `"${(c.studentName || '').replace(/"/g, '""')}"`,
      `"${(c.pathway?.name || '').replace(/"/g, '""')}"`,
      `"${(c.targetIntake || '').replace(/"/g, '""')}"`,
      `"${(c.currentGermanLevel || '').replace(/"/g, '""')}"`,
      `"${(c.status || '').replace(/"/g, '""')}"`,
      `"${(c.owner?.name || 'Unassigned').replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `goeuro_student_cases_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const [casesRes, pathRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/pathways'),
      ]);
      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(Array.isArray(data) ? data : []);
      } else {
        setCases([]);
      }
      if (pathRes.ok) {
        setPathways(await pathRes.json());
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    const handleSwitch = () => fetchCases();
    const handleSync = () => fetchCases();

    window.addEventListener('goeuro_user_switched', handleSwitch);
    window.addEventListener('goeuro_sync_event', handleSync);
    return () => {
      window.removeEventListener('goeuro_user_switched', handleSwitch);
      window.removeEventListener('goeuro_sync_event', handleSync);
    };
  }, []);

  if (!can('case:read')) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 text-center max-w-xl mx-auto my-12 shadow-notion">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-950 mb-2">
          {language === 'my' ? 'ကျောင်းသားဖိုင်တွဲများ ကြည့်ရှုခွင့် ကန့်သတ်ချက်' : 'Student Case Access Restricted'}
        </h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6 leading-relaxed">
          You do not have permission to view active student case admission files.
        </p>
        <div className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-600 inline-block border border-zinc-200">
          Your active persona: <strong className="text-zinc-900">{currentUser?.name}</strong> ({currentUser?.role?.name})
        </div>
      </div>
    );
  }

  const filteredCases = cases.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (pathwayFilter && c.pathway?.code !== pathwayFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.studentName?.toLowerCase().includes(q);
      const matchPathway = c.pathway?.name?.toLowerCase().includes(q);
      const matchIntake = c.targetIntake?.toLowerCase().includes(q);
      if (!matchName && !matchPathway && !matchIntake) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                {t.cases.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                {cases.length} cases
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {t.cases.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {can('case:write') && (
            <button
              onClick={() => setAddCaseOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition btn-press cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Enroll New Student</span>
            </button>
          )}

          <button
            onClick={exportCasesCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition btn-press cursor-pointer"
            title="Download CSV spreadsheet for Excel"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => triggerSync(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition btn-press"
            title="Sync student cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            href="/leads"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition shrink-0"
          >
            <span>From Pipeline →</span>
          </Link>
        </div>
      </div>

      {/* Case Lifecycle Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Active Cases</div>
          <div className="text-xl font-extrabold text-zinc-950 mt-0.5">{cases.length}</div>
          <div className="text-[10px] text-zinc-500">In German admission pipeline</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Checklists Ongoing</div>
          <div className="text-xl font-extrabold text-purple-700 mt-0.5">
            {cases.filter((c) => c.status === 'INTAKE' || c.status === 'ACTIVE').length}
          </div>
          <div className="text-[10px] text-zinc-500">Document verification phase</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Visa Processing</div>
          <div className="text-xl font-extrabold text-blue-700 mt-0.5">
            {cases.filter((c) => c.status === 'VISA_PROCESSING').length}
          </div>
          <div className="text-[10px] text-zinc-500">Embassy appointment ready</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Enroute to Germany</div>
          <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
            {cases.filter((c) => c.status === 'ENROUTE' || c.status === 'DEPARTED').length}
          </div>
          <div className="text-[10px] text-emerald-600">Visa issued & flying</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200/90 shadow-notion flex flex-wrap items-center gap-2.5">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.cases.searchPlaceholder}
            className="w-full pl-10 pr-3 py-1.5 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-zinc-50/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active (Checklist in Progress)</option>
          <option value="VISA_PROCESSING">Visa in Processing</option>
          <option value="ENROUTE">Enroute to Germany</option>
          <option value="COMPLETED">Completed / Arrived</option>
        </select>

        <select
          value={pathwayFilter}
          onChange={(e) => setPathwayFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Pathways</option>
          <option value="AUSBILDUNG">Germany Ausbildung</option>
          <option value="PUBLIC_UNIVERSITY">Public University</option>
        </select>

        {(statusFilter || pathwayFilter || searchQuery) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setPathwayFilter('');
              setSearchQuery('');
            }}
            className="text-xs text-purple-700 hover:underline px-2 font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 text-center max-w-lg mx-auto my-8 shadow-notion">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-950 mb-1">
            {language === 'my' ? 'ကျောင်းသားဖိုင် မရှိသေးပါ (Pre-Launch)' : 'No Student Cases Yet (Pre-Launch)'}
          </h3>
          <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
            {t.dashboard.emptyCases}
          </p>
          <Link
            href="/leads"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
          >
            <span>Go to Lead Pipeline to Convert Inquiries</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => {
            let checklistItems: any[] = [];
            try {
              checklistItems = JSON.parse(c.checklist || '[]');
            } catch (e) {}
            const completedCount = checklistItems.filter((i) => i.isCompleted).length;

            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setModalOpen(true);
                }}
                className="bg-white p-5 rounded-2xl border border-zinc-200/90 hover:border-purple-300 shadow-notion hover:shadow-notion-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {c.pathway?.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      c.status === 'VISA_PROCESSING' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      c.status === 'ENROUTE' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-purple-700 transition">
                    {c.studentName}
                  </h3>

                  <div className="text-xs text-zinc-500 mt-1.5 flex items-center space-x-2">
                    <span>Intake: <strong className="text-zinc-800">{c.targetIntake}</strong></span>
                    <span className="text-zinc-300">•</span>
                    <span>German: <strong className="text-zinc-800">{c.currentGermanLevel}</strong> <span className="text-zinc-400">({c.targetGermanLevel})</span></span>
                  </div>

                  {/* Milestone Pills Preview */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {checklistItems.slice(0, 4).map((item: any, idx: number) => {
                      const labelText = item.label || item.title || `Milestone ${idx + 1}`;
                      const shortText = labelText.split(' ')[0];
                      return (
                        <span
                          key={idx}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition ${
                            item.isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                          }`}
                        >
                          {item.isCompleted ? '✓' : '○'} {shortText}
                        </span>
                      );
                    })}
                    {checklistItems.length > 4 && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-50 text-zinc-400 border border-zinc-200">
                        +{checklistItems.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Progress Bar for Admission Checklist */}
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[11px] text-zinc-500 mb-1 font-medium">
                      <span>Checklist Completion</span>
                      <span className="font-bold text-purple-700">{completedCount} / {checklistItems.length} Verified</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center space-x-1.5 text-zinc-600">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Counselor: <strong className="text-zinc-800">{c.owner?.name?.split(' ')[0] || 'Unassigned'}</strong></span>
                  </span>
                  <span className="text-purple-600 font-bold group-hover:translate-x-0.5 transition-transform duration-150 flex items-center">
                    Manage Case →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Detail Modal */}
      <CaseDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCase(null);
        }}
        onSaved={() => {
          fetchCases();
          notifySync('case_updated', { studentName: selectedCase?.studentName });
        }}
        caseItem={selectedCase}
      />

      {/* Direct Case Enrollment Modal */}
      <AddCaseModal
        isOpen={addCaseOpen}
        onClose={() => setAddCaseOpen(false)}
        onSaved={fetchCases}
        pathways={pathways}
      />
    </div>
  );
}
