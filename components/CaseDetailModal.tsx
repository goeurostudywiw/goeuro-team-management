'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import {
  X,
  GraduationCap,
  CheckSquare,
  FileText,
  Repeat,
  Plus,
  Clock,
  ShieldCheck,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  caseItem: any;
}

export default function CaseDetailModal({ isOpen, onClose, onSaved, caseItem }: CaseDetailModalProps) {
  const { language } = useLanguage();
  const { allUsers, currentUser } = useUserSession();

  const [activeTab, setActiveTab] = useState<'checklist' | 'documents' | 'handover'>('checklist');

  // Case edits
  const [status, setStatus] = useState(caseItem?.status || 'ACTIVE');
  const [currentGermanLevel, setCurrentGermanLevel] = useState(caseItem?.currentGermanLevel || 'A1');
  const [targetIntake, setTargetIntake] = useState(caseItem?.targetIntake || 'Winter 2026');
  const [agreedScope, setAgreedScope] = useState(caseItem?.agreedScope || '');
  const [notes, setNotes] = useState(caseItem?.notes || '');
  const [checklist, setChecklist] = useState<any[]>([]);

  // Document add
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('TRANSCRIPT');
  const [docNotes, setDocNotes] = useState('');

  // Handover
  const [handoverToId, setHandoverToId] = useState('');
  const [handoverReason, setHandoverReason] = useState('Role change / Staff departure');
  const [handoverNotes, setHandoverNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (caseItem) {
      setStatus(caseItem.status || 'ACTIVE');
      setCurrentGermanLevel(caseItem.currentGermanLevel || 'A1');
      setTargetIntake(caseItem.targetIntake || 'Winter 2026');
      setAgreedScope(caseItem.agreedScope || '');
      setNotes(caseItem.notes || '');

      try {
        const parsed = JSON.parse(caseItem.checklist || '[]');
        setChecklist(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setChecklist([]);
      }
    }
  }, [caseItem, isOpen]);

  if (!isOpen || !caseItem) return null;

  const handleToggleChecklist = async (idx: number) => {
    const updated = [...checklist];
    updated[idx].isCompleted = !updated[idx].isCompleted;
    updated[idx].verifiedAt = updated[idx].isCompleted ? new Date() : null;
    updated[idx].verifiedBy = updated[idx].isCompleted ? currentUser?.name : null;
    setChecklist(updated);

    try {
      await fetch('/api/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: caseItem.id,
          checklist: updated,
        }),
      });
      onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      await fetch('/api/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: caseItem.id,
          status,
          currentGermanLevel,
          targetIntake,
          agreedScope,
          notes,
        }),
      });
      setMsg('Case details saved successfully');
      setTimeout(() => setMsg(''), 3000);
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setLoading(true);
    try {
      await fetch(`/api/cases/${caseItem.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: docName,
          documentType: docType,
          notes: docNotes,
        }),
      });
      setDocName('');
      setDocNotes('');
      onSaved();
      setMsg('Document metadata recorded');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverToId) return;

    setLoading(true);
    try {
      await fetch(`/api/cases/${caseItem.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: handoverToId,
          reason: handoverReason,
          handoverNotes,
        }),
      });
      setHandoverNotes('');
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-200/90 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                Student Case: {caseItem.studentName}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                {caseItem.pathway?.name}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 pl-9">
              Owner: <strong className="text-zinc-700">{caseItem.owner?.name}</strong> • Target Intake: <strong className="text-zinc-700">{caseItem.targetIntake || 'Winter 2026'}</strong>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div className="mt-3 p-2.5 text-xs rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-200">
            {msg}
          </div>
        )}

        {/* Tab Switcher (Notion Pill Toggle) */}
        <div className="flex space-x-1 my-4 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'checklist' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Admission Checklist ({checklist.filter((c) => c.isCompleted).length}/{checklist.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'documents' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Documents ({caseItem.documents?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('handover')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'handover' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Handover Record
          </button>
        </div>

        {/* TAB 1: Configurable Admission Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/80 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Case Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="ACTIVE">Active Preparation</option>
                  <option value="HOLD">On Hold</option>
                  <option value="COMPLETED">Enrolled / Arrived in Germany</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Current German Level</label>
                <select
                  value={currentGermanLevel}
                  onChange={(e) => setCurrentGermanLevel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="A0">A0</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Pathway Verification Milestones
                </span>
                <span className="text-[10px] text-zinc-400">Click to toggle verification</span>
              </div>

              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleChecklist(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    item.isCompleted
                      ? 'bg-purple-50/70 border-purple-200 text-purple-950 shadow-2xs'
                      : 'bg-white border-zinc-200/90 hover:border-purple-200 text-zinc-700 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      readOnly
                      className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className={`text-xs ${item.isCompleted ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  {item.isCompleted && item.verifiedBy && (
                    <span className="text-[10px] text-purple-700 font-semibold px-2 py-0.5 rounded-full bg-purple-100/60">
                      Verified by {item.verifiedBy}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleSaveGeneral}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition"
              >
                Save Updates
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Document Metadata */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <form onSubmit={handleAddDocument} className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-2.5">
              <span className="text-xs font-bold text-zinc-800 block">Record Document Metadata:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Document Name (e.g. B2 Goethe Cert)"
                  className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="TRANSCRIPT">Academic Transcripts</option>
                  <option value="LANGUAGE_CERT">German Language Certificate</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="CV">Lebenslauf (CV)</option>
                  <option value="MOTIVATION_LETTER">Anschreiben (Motivation)</option>
                  <option value="CONTRACT">Ausbildung Contract</option>
                  <option value="APS">APS Certificate</option>
                  <option value="VISA">Visa & Blocked Account</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition"
                >
                  + Add Document
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {caseItem.documents && caseItem.documents.length > 0 ? (
                caseItem.documents.map((d: any) => (
                  <div key={d.id} className="p-3 rounded-xl border border-zinc-200/90 bg-white flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-semibold text-zinc-900">{d.documentName}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{d.documentType}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      {d.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No documents recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Case Handover Record */}
        {activeTab === 'handover' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-zinc-900 text-white rounded-xl border border-zinc-800 text-xs">
              <span className="font-bold text-purple-300 block mb-0.5">Formal Counselor Handover Protocol</span>
              Transfer student case ownership seamlessly. An immutable handover audit trail is maintained when counselors change roles or leave.
            </div>

            <form onSubmit={handleHandover} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Handover To (New Counselor Owner) *
                </label>
                <select
                  required
                  value={handoverToId}
                  onChange={(e) => setHandoverToId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="">-- Select New Counselor --</option>
                  {allUsers
                    .filter((u) => u.id !== caseItem.ownerId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title || u.role.name})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason for Handover</label>
                <input
                  type="text"
                  required
                  value={handoverReason}
                  onChange={(e) => setHandoverReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Handover Notes</label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Key context, student preferences, pending uni-assist deadline..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition"
                >
                  Confirm Handover
                </button>
              </div>
            </form>

            {/* Handover History List */}
            {caseItem.handovers && caseItem.handovers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Past Handovers:
                </span>
                <div className="space-y-2">
                  {caseItem.handovers.map((h: any) => (
                    <div key={h.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs">
                      <div className="font-semibold text-zinc-900">
                        {h.fromUser?.name} → {h.toUser?.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">Reason: {h.reason}</div>
                      {h.handoverNotes && (
                        <div className="text-[11px] text-zinc-600 italic mt-1 bg-white p-2 rounded-lg border border-zinc-100">{h.handoverNotes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
