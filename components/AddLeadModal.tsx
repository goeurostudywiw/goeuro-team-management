'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import { useSync } from './SyncContext';
import { playChimeSound } from '@/lib/audio';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  GraduationCap,
  FileText,
  UserCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  pathways: any[];
}

export default function AddLeadModal({
  isOpen,
  onClose,
  onSaved,
  pathways,
}: AddLeadModalProps) {
  const { language } = useLanguage();
  const isBurmese = language === 'my';
  const { allUsers, currentUser } = useUserSession();
  const { notifySync } = useSync();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState('VIBER');
  const [contactHandle, setContactHandle] = useState('');
  const [interestedPathwayId, setInterestedPathwayId] = useState('');
  const [educationStatus, setEducationStatus] = useState('High School Graduate');
  const [ownerId, setOwnerId] = useState(currentUser?.id || '');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactHandle.trim()) {
      setError(isBurmese ? 'အမည်နှင့် ဆက်သွယ်ရန် လိပ်စာ ထည့်သွင်းပါ' : 'Full Name and Contact Handle are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          preferredContact,
          contactHandle: contactHandle.trim(),
          interestedPathwayId: interestedPathwayId || null,
          educationStatus,
          ownerId: ownerId || null,
          notes: notes.trim() || null,
          utmSource: 'staff_manual_intake',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add lead');
      }

      playChimeSound();
      notifySync('lead_created', { name: fullName });
      onSaved();
      onClose();

      // Reset
      setFullName('');
      setPhone('');
      setEmail('');
      setContactHandle('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-notion-modal w-full max-w-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                {isBurmese ? 'ကျောင်းသားသစ် စာရင်းသွင်းရန် (Manual Lead Intake)' : 'Add New Student Lead'}
              </h3>
              <p className="text-xs text-zinc-500">
                {isBurmese ? 'ရုံးသို့ တိုက်ရိုက်လာရောက်သူ သို့မဟုတ် ဖုန်း/Viber စုံစမ်းမေးမြန်းမှုများ' : 'Log walk-in, phone call, or direct Viber inquiries into CRM'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {isBurmese ? 'ကျောင်းသား အမည်' : 'Student Full Name'} *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aung Myo Thu"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Contact Handle & Preferred Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'ဆက်သွယ်ရမည့် လမ်းကြောင်း' : 'Preferred Channel'} *
              </label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="VIBER">Viber Number</option>
                <option value="TELEGRAM">Telegram Username</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Direct Phone Call</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'ဆက်သွယ်ရန် ဖုန်း / Handle' : 'Contact Handle / ID'} *
              </label>
              <input
                type="text"
                required
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                placeholder="+95 9 123456789 or @handle"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {isBurmese ? 'အရန် ဖုန်းနံပါတ်' : 'Backup Phone'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+95 9 ..."
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {isBurmese ? 'အီးမေးလ်' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Pathway & Education Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'စိတ်ဝင်စားသော လမ်းကြောင်း' : 'Interested Pathway'}
              </label>
              <select
                value={interestedPathwayId}
                onChange={(e) => setInterestedPathwayId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="">Select Pathway (Optional)</option>
                {pathways.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                {isBurmese ? 'ပညာအရည်အချင်း' : 'Education Status'} *
              </label>
              <select
                value={educationStatus}
                onChange={(e) => setEducationStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="High School Graduate">High School Graduate (Matriculation)</option>
                <option value="Diploma Holder">Diploma Holder</option>
                <option value="University Student (1st/2nd Year)">University Student (1st/2nd Year)</option>
                <option value="Bachelor Degree Holder">Bachelor Degree Holder</option>
                <option value="Master Degree Holder">Master Degree Holder</option>
              </select>
            </div>
          </div>

          {/* Assignee Counselor */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              {isBurmese ? 'တာဝန်ယူမည့် အကြံပေးပုဂ္ဂိုလ် (Counselor)' : 'Assign Counselor'}
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              <option value="">Unassigned (Open Queue)</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title || u.role?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Intake Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {isBurmese ? 'ကနဦး ဆွေးနွေးချက် / မှတ်ချက်' : 'Intake Notes & Background'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Inquired about IT Ausbildung in Hamburg; already passed A2 Goethe exam."
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
                <span>Adding Lead...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isBurmese ? 'စာရင်းသွင်းမည်' : 'Save Student Lead'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
