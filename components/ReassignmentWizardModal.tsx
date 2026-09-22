'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import {
  X,
  RotateCcw,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ReassignmentWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialFromUserId?: string;
}

export default function ReassignmentWizardModal({
  isOpen,
  onClose,
  onSaved,
  initialFromUserId,
}: ReassignmentWizardModalProps) {
  const { language, t } = useLanguage();
  const { allUsers, refreshUsers } = useUserSession();

  const [fromUserId, setFromUserId] = useState(initialFromUserId || '');
  const [toUserId, setToUserId] = useState('');
  const [reassignTasks, setReassignTasks] = useState(true);
  const [reassignLeads, setReassignLeads] = useState(true);
  const [reassignContent, setReassignContent] = useState(true);
  const [reassignCases, setReassignCases] = useState(true);
  const [deactivateUser, setDeactivateUser] = useState(true);
  const [reason, setReason] = useState('Staff member departure / role change');

  const [loading, setLoading] = useState(false);
  const [resultStats, setResultStats] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUserId || !toUserId) {
      setError('Please select both departing staff and recipient staff.');
      return;
    }

    if (fromUserId === toUserId) {
      setError('Cannot reassign items to the same user.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId,
          toUserId,
          reassignTasks,
          reassignLeads,
          reassignContent,
          reassignCases,
          deactivateDepartingUser: deactivateUser,
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Reassignment failed');
      }

      const data = await res.json();
      setResultStats(data);
      await refreshUsers();
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200/90">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span>Staff Offboarding & Reassignment Wizard</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1 pl-9">
              Zero unowned work protocol when team members change roles or depart.
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {resultStats ? (
          /* Confirmation & Success Summary */
          <div className="my-4 space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span>Reassignment & Offboarding Completed!</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">
                All open items from <strong className="text-zinc-900">{resultStats.fromUser?.name}</strong> have been transferred to <strong className="text-zinc-900">{resultStats.toUser?.name}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-400">Tasks Reassigned</div>
                  <div className="font-bold text-zinc-900 mt-0.5">{resultStats.stats?.tasksReassigned}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-400">Leads Reassigned</div>
                  <div className="font-bold text-zinc-900 mt-0.5">{resultStats.stats?.leadsReassigned}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-400">Content Reassigned</div>
                  <div className="font-bold text-zinc-900 mt-0.5">{resultStats.stats?.contentReassigned}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-zinc-400">Cases Reassigned</div>
                  <div className="font-bold text-zinc-900 mt-0.5">{resultStats.stats?.casesReassigned}</div>
                </div>
              </div>
              {resultStats.deactivated && (
                <div className="text-[11px] text-purple-800 font-semibold pt-1">
                  ✓ Departing staff member account set to Inactive.
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition"
              >
                Close Wizard
              </button>
            </div>
          </div>
        ) : (
          /* Wizard Form */
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center space-x-1">
                  <UserX className="w-3.5 h-3.5 text-rose-500" />
                  <span>Departing Staff Member *</span>
                </label>
                <select
                  required
                  value={fromUserId}
                  onChange={(e) => setFromUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="">-- Select Departing Staff --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title || u.role.name}) {u.status === 'INACTIVE' ? '[Inactive]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reassign All Work To *</span>
                </label>
                <select
                  required
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="">-- Select Recipient Staff --</option>
                  {allUsers
                    .filter((u) => u.id !== fromUserId && u.status === 'ACTIVE')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title || u.role.name})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Scope Checkboxes */}
            <div className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-2">
              <span className="text-xs font-bold text-zinc-700 block">Select Work to Reassign:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2 text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reassignTasks}
                    onChange={(e) => setReassignTasks(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span>Open Tasks</span>
                </label>
                <label className="flex items-center space-x-2 text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reassignLeads}
                    onChange={(e) => setReassignLeads(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span>Active Leads</span>
                </label>
                <label className="flex items-center space-x-2 text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reassignContent}
                    onChange={(e) => setReassignContent(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span>Draft/Review Content</span>
                </label>
                <label className="flex items-center space-x-2 text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reassignCases}
                    onChange={(e) => setReassignCases(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span>Active Student Cases</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Audit Log Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deactivateUser}
                  onChange={(e) => setDeactivateUser(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-rose-600">Deactivate departing staff member account</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition"
              >
                {loading ? 'Reassigning...' : 'Execute Reassignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
