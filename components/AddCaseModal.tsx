'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import { useSync } from './SyncContext';
import { playSuccessSound } from '@/lib/audio';
import {
  X,
  GraduationCap,
  Sparkles,
  Calendar,
  UserCheck,
  AlertCircle,
  FileCheck2
} from 'lucide-react';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  pathways: any[];
}

export default function AddCaseModal({
  isOpen,
  onClose,
  onSaved,
  pathways,
}: AddCaseModalProps) {
  const { language } = useLanguage();
  const isBurmese = language === 'my';
  const { allUsers, currentUser } = useUserSession();
  const { notifySync } = useSync();

  const [studentName, setStudentName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [pathwayId, setPathwayId] = useState(pathways[0]?.id || '');
  const [targetIntake, setTargetIntake] = useState('Winter 2026');
  const [currentGermanLevel, setCurrentGermanLevel] = useState('A2');
  const [ownerId, setOwnerId] = useState(currentUser?.id || '');
  const [agreedScope, setAgreedScope] = useState('Full Admission, Blocked Account & Visa Service');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !pathwayId) {
      setError(isBurmese ? 'ကျောင်းသား အမည်နှင့် လမ်းကြောင်း ရွေးချယ်ပါ' : 'Student Name and Pathway are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName.trim(),
          contactInfo: contactInfo.trim() || undefined,
          pathwayId,
          targetIntake,
          currentGermanLevel,
          ownerId: ownerId || currentUser?.id,
          agreedScope,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll case');
      }

      playSuccessSound();
      notifySync('case_created', { name: studentName });
      onSaved();
      onClose();

      setStudentName('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-notion-modal w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                {isBurmese ? 'တိုက်ရိုက် ကျောင်းသားဖိုင် ဖွင့်လှစ်ခြင်း' : 'Direct Student Case Enrollment'}
              </h3>
              <p className="text-xs text-zinc-500">
                {isBurmese ? 'စာချုပ်ချုပ်ဆိုပြီးသော သို့မဟုတ် တိုက်ရိုက်လျှောက်ထားသူများ' : 'Enroll walk-in student directly into active visa & admission pipeline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-5 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {isBurmese ? 'ကျောင်းသား အမည်' : 'Student Full Name'} *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Zin Mar Oo"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {isBurmese ? 'ဆက်သွယ်ရန် (ဖုန်း / Telegram / Viber)' : 'Contact Info (Phone / Telegram / Viber)'}
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. @zinmaroo or 09-798123456"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'ပညာသင် လမ်းကြောင်း' : 'Germany Pathway'} *
              </label>
              <select
                value={pathwayId}
                onChange={(e) => setPathwayId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                {pathways.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'ရည်မှန်းသော Intake' : 'Target Intake Term'} *
              </label>
              <select
                value={targetIntake}
                onChange={(e) => setTargetIntake(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="Winter 2026">Winter Intake 2026 (Oct)</option>
                <option value="Summer 2027">Summer Intake 2027 (Apr)</option>
                <option value="Winter 2027">Winter Intake 2027 (Oct)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'ဂျာမန်ဘာသာ အဆင့်' : 'Current German Level'}
              </label>
              <select
                value={currentGermanLevel}
                onChange={(e) => setCurrentGermanLevel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="A0">A0 (Beginner)</option>
                <option value="A1">A1 Completed</option>
                <option value="A2">A2 Completed</option>
                <option value="B1">B1 Certified</option>
                <option value="B2">B2 Certified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'တာဝန်ခံ အကြံပေး' : 'Case Owner (Counselor)'}
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title || u.role?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {isBurmese ? 'သဘောတူထားသော ဝန်ဆောင်မှု အကျုံးဝင်မှု' : 'Agreed Scope of Service'}
            </label>
            <input
              type="text"
              value={agreedScope}
              onChange={(e) => setAgreedScope(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {isBurmese ? 'ကနဦး မှတ်ချက်' : 'Case Notes & Deadlines'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Passport already issued; preparing motivation letter for Hamburg hospital Ausbildung."
              className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Enrolling...</span>
              ) : (
                <>
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{isBurmese ? 'ဖိုင်တွဲ စာရင်းသွင်းမည်' : 'Enroll Student Case'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
