'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import { useSync } from './SyncContext';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  GraduationCap,
  Clock,
  UserCheck,
  CheckCircle,
  Sparkles,
  Video,
  Copy,
  Check,
  Camera,
  Play,
  Download,
  Film,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  lead: any;
}

export default function LeadDetailModal({ isOpen, onClose, onSaved, lead }: LeadDetailModalProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { allUsers, currentUser } = useUserSession();
  const { notifySync } = useSync();

  const [stage, setStage] = useState(lead?.stage || 'NEW');
  const [ownerId, setOwnerId] = useState(lead?.ownerId || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [qualificationNotes, setQualificationNotes] = useState(lead?.qualificationNotes || '');

  // Contact logging
  const [contactType, setContactType] = useState('TELEGRAM_VIBER');
  const [contactSummary, setContactSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState(
    lead?.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : ''
  );

  // Conversion to Student Case
  const [convertMode, setConvertMode] = useState(false);
  const [agreedScope, setAgreedScope] = useState('Full Dual-Vocational / University Application Guidance');
  const [targetIntake, setTargetIntake] = useState('Winter 2026');
  const [currentGermanLevel, setCurrentGermanLevel] = useState('A1');
  const [targetGermanLevel, setTargetGermanLevel] = useState('B2');
  const [caseOwnerId, setCaseOwnerId] = useState(lead?.ownerId || currentUser?.id || '');
  const [showSnapshotPreview, setShowSnapshotPreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedMeetingLink, setCopiedMeetingLink] = useState(false);

  if (!isOpen || !lead) return null;

  const handleUpdateLead = async () => {
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          stage,
          ownerId: ownerId || null,
          notes,
          qualificationNotes,
          nextFollowUpDate: followUpDate || null,
        }),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSummary.trim()) return;

    setLoading(true);
    try {
      await fetch(`/api/leads/${lead.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactType,
          summary: contactSummary,
          followUpDate: followUpDate || null,
          updateStage: stage === 'NEW' ? 'CONTACTED' : stage,
        }),
      });
      setContactSummary('');
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = async () => {
    setLoading(true);
    try {
      await fetch(`/api/leads/${lead.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactType: 'MEETING',
          summary: '1-on-1 profile consultation scheduled with counselor.',
          followUpDate: followUpDate || null,
          updateStage: 'CONSULTATION_BOOKED',
        }),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreedScope,
          targetIntake,
          currentGermanLevel,
          targetGermanLevel,
          ownerId: caseOwnerId || currentUser?.id,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Conversion failed');
      }

      onSaved();
      notifySync('case_created', { studentName: lead.fullName });
      onClose();
      router.push('/cases');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-notion-modal border border-zinc-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                {lead.fullName}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {lead.interestedPathway?.name || 'General Pathway'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Source: {lead.utmSource} • Inquired: {new Date(lead.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Duplicate Review Alert */}
        {lead.isDuplicateOfId && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Duplicate Inquiry Detected:</span> This student has previously submitted an inquiry with matching contact details. Compare notes to avoid duplicated outreach.
            </div>
          </div>
        )}

        {/* In-House Zero-Cost Video Consultation Launcher */}
        <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-black rounded-xl p-3.5 border border-purple-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-extrabold text-white">In-House Video Consultation</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-900 text-purple-200 border border-purple-700">
                  $0.00 Free WebRTC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                1-on-1 profile assessment without Zoom fees or student app install.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3005';
                navigator.clipboard.writeText(`${origin}/meeting/consult-${lead.id}?role=student`);
                setCopiedMeetingLink(true);
                setTimeout(() => setCopiedMeetingLink(false), 2500);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center space-x-1"
              title="Copy student invitation link for Telegram/Viber"
            >
              {copiedMeetingLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMeetingLink ? 'Link Copied!' : 'Copy Student Link'}</span>
            </button>

            <Link
              href={`/meeting/consult-${lead.id}?role=counselor`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition flex items-center space-x-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Enter Room →</span>
            </Link>
          </div>
        </div>

        {/* Verified Consultation Attendance Proof ("လူစုံပါက SS ရိုက်ခြင်း") */}
        {lead.consultationSnapshotUrl && (
          <div className="my-3 p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div
                onClick={() => setShowSnapshotPreview(true)}
                className="relative cursor-pointer group shrink-0"
              >
                <img
                  src={lead.consultationSnapshotUrl}
                  alt="Attendance Proof"
                  className="w-20 h-12 object-cover rounded-lg border border-purple-500/60 group-hover:opacity-80 transition shadow-xs"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-lg transition">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-800">Verified Attendance Proof</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-200">
                    Auto-Captured SS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Auto-snapped when student and counselor joined the consultation room.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSnapshotPreview(true)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-300 transition shrink-0"
            >
              View Full Photo Proof
            </button>
          </div>
        )}

        {/* Consultation Recordings & Playback Tray */}
        {lead.recordings && lead.recordings.length > 0 && (
          <div className="my-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Film className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-zinc-200">Consultation Recordings ({lead.recordings.length})</h4>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {new Date(lead.recordings[0].createdAt).toLocaleDateString()}
              </span>
            </div>

            {lead.recordings.map((rec: any) => {
              const mins = Math.floor((rec.duration || 0) / 60);
              const secs = (rec.duration || 0) % 60;
              return (
                <div key={rec.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-300 flex items-center space-x-1.5">
                      <Play className="w-3 h-3 fill-purple-400 text-purple-400" />
                      <span>{mins}m {secs}s Session</span>
                    </span>
                    <a
                      href={rec.fileUrl}
                      download
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center space-x-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download .webm</span>
                    </a>
                  </div>
                  {/* HTML5 Native Video Player */}
                  <video
                    controls
                    playsInline
                    className="w-full max-h-48 rounded-lg bg-black border border-zinc-800 shadow-inner"
                    src={rec.fileUrl}
                  />
                  {rec.notes && (
                    <p className="text-[11px] text-zinc-400 italic">
                      {rec.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Fullscreen Snapshot Modal */}
        {showSnapshotPreview && lead.consultationSnapshotUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowSnapshotPreview(false)}
          >
            <div
              className="relative max-w-4xl w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">
                    Proof of Attendance: {lead.fullName}
                  </span>
                </div>
                <button
                  onClick={() => setShowSnapshotPreview(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={lead.consultationSnapshotUrl}
                alt="Full Proof"
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg my-2"
              />
              <div className="flex justify-between items-center p-2 text-xs text-zinc-400 border-t border-zinc-800">
                <span>Auto-Captured Attendance Verification Watermark</span>
                <a
                  href={lead.consultationSnapshotUrl}
                  download={`Attendance_Proof_${lead.fullName}.jpg`}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Lead Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px]">Contact Channel</span>
            <span className="font-semibold text-zinc-800">
              {lead.preferredContact}: <span className="text-purple-700 font-bold">{lead.contactHandle}</span>
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Education Background</span>
            <span className="font-semibold text-zinc-800">{lead.educationStatus}</span>
          </div>
          {lead.phone && (
            <div>
              <span className="text-zinc-400 block text-[11px]">Phone</span>
              <span className="font-semibold text-zinc-800">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div>
              <span className="text-zinc-400 block text-[11px]">Email</span>
              <span className="font-semibold text-zinc-800">{lead.email}</span>
            </div>
          )}
          <div className="sm:col-span-2">
            <span className="text-zinc-400 block text-[11px]">Student Inquired Notes</span>
            <span className="text-zinc-700 italic">{lead.notes || 'None provided'}</span>
          </div>
        </div>

        {/* Mode Selector / Conversion Switch (Notion Toggle) */}
        <div className="flex items-center justify-between p-1 rounded-xl bg-zinc-100 mb-4 text-xs font-semibold">
          <button
            onClick={() => setConvertMode(false)}
            className={`flex-1 py-1.5 rounded-lg transition ${
              !convertMode ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500'
            }`}
          >
            Lead Status & Contact Log
          </button>
          <button
            onClick={() => setConvertMode(true)}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1.5 ${
              convertMode ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-600 hover:text-purple-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Convert to Student Case (No Retyping)</span>
          </button>
        </div>

        {convertMode ? (
          /* Convert Lead to Student Case Form */
          <form onSubmit={handleConvertToCase} className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
              Transforming <strong>{lead.fullName}</strong> into an active student case. All contact info, pathway preference, and source data will transfer automatically.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Target Intake</label>
                <input
                  type="text"
                  value={targetIntake}
                  onChange={(e) => setTargetIntake(e.target.value)}
                  placeholder="e.g. Winter 2026"
                  className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Case Counselor Owner</label>
                <select
                  value={caseOwnerId}
                  onChange={(e) => setCaseOwnerId(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title || u.role.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Current German Level</label>
                <select
                  value={currentGermanLevel}
                  onChange={(e) => setCurrentGermanLevel(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50"
                >
                  <option value="A0">A0 (Complete Beginner)</option>
                  <option value="A1">A1 (Beginner Passed)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Target German Level</label>
                <select
                  value={targetGermanLevel}
                  onChange={(e) => setTargetGermanLevel(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50"
                >
                  <option value="B1">B1 (Ausbildung Minimum)</option>
                  <option value="B2">B2 (Ausbildung / Uni Recommended)</option>
                  <option value="C1">C1 (Direct University Degree)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Agreed Service Scope</label>
              <textarea
                rows={2}
                value={agreedScope}
                onChange={(e) => setAgreedScope(e.target.value)}
                className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setConvertMode(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
              >
                {loading ? 'Converting...' : 'Confirm Conversion & Open Case'}
              </button>
            </div>
          </form>
        ) : (
          /* Lead Status, Follow-Up & Contact Logging */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Pipeline Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-semibold"
                >
                  <option value="NEW">New Inquiry</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="ASSESSMENT_NEEDED">Assessment Needed</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CONSULTATION_BOOKED">Consultation Booked</option>
                  <option value="CONSULTATION_COMPLETED">Consultation Completed</option>
                  <option value="APPLICATION_READY">Application Ready</option>
                  <option value="CLOSED_LOST">Closed (Unqualified / Lost)</option>
                  <option value="CLOSED_WON">Converted to Student Case</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Assigned Counselor / Owner *</span>
                </label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium"
                >
                  <option value="">-- Unassigned --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title || u.role.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Next Follow-up Date</span>
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50"
                />
              </div>

              <div className="pt-5 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleBookConsultation}
                  className="w-full px-3.5 py-1.5 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl border border-purple-200 shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Book Consultation Call</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Counselor Qualification Notes
              </label>
              <textarea
                rows={2}
                value={qualificationNotes}
                onChange={(e) => setQualificationNotes(e.target.value)}
                placeholder="German level verified? Budget capability? Target year?"
                className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50"
              />
            </div>

            {/* Quick Contact Logger Form */}
            <form onSubmit={handleLogContact} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                Log Student Interaction / Note:
              </span>
              <div className="flex gap-2">
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-32 px-2.5 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                >
                  <option value="TELEGRAM_VIBER">Telegram/Viber</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Video Call / Meeting</option>
                </select>
                <input
                  type="text"
                  required
                  value={contactSummary}
                  onChange={(e) => setContactSummary(e.target.value)}
                  placeholder="Summary of conversation, questions answered..."
                  className="flex-1 px-3 py-1 text-xs border border-zinc-200 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-lg"
                >
                  Log
                </button>
              </div>
            </form>

            <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateLead}
                disabled={loading}
                className="px-4 py-1.5 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs"
              >
                {loading ? 'Saving...' : 'Save Lead Details'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
