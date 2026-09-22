'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import { X, UserPlus, Shield, Users, Mail, User, Briefcase } from 'lucide-react';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (newUser?: any) => void;
}

export default function AddStaffModal({ isOpen, onClose, onSaved }: AddStaffModalProps) {
  const { language, t } = useLanguage();
  const { refreshUsers, allUsers } = useUserSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [roleId, setRoleId] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [managerId, setManagerId] = useState('');

  const [roles, setRoles] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/roles')
        .then((r) => r.json())
        .then((d) => {
          setRoles(Array.isArray(d) ? d : []);
          if (Array.isArray(d) && d.length > 0) {
            const defaultR = d.find((r: any) => r.name.includes('Counselor')) || d[0];
            setRoleId(defaultR.id);
          }
        });

      fetch('/api/teams')
        .then((r) => r.json())
        .then((d) => setTeams(Array.isArray(d) ? d : []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !roleId) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          title,
          roleId,
          teamIds: selectedTeamIds,
          managerId: managerId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add staff member');
      }

      const createdUser = await res.json();
      await refreshUsers();
      onSaved(createdUser);
      onClose();
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
                <UserPlus className="w-5 h-5" />
              </div>
              <span>{language === 'my' ? 'ဝန်ထမ်းသစ် ထည့်သွင်းရန်' : 'Add Staff Member (Scalable 6th User)'}</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1 pl-9">
              Assign departmental teams and roles dynamically without changing code.
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

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Su Su Hlaing"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="susu@goeuro.de"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Junior Ausbildung Counselor"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">System Role & Permissions *</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department / Team Assignment */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Department / Teams (Cross-functional assignment supported)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80">
              {teams.map((t) => {
                const checked = selectedTeamIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center space-x-2 text-xs text-zinc-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTeam(t.id)}
                      className="rounded text-purple-600 focus:ring-purple-600"
                    />
                    <span className="font-medium">{t.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Reporting Lead / Manager */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Reporting Lead / Manager (Optional)</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              <option value="">-- No Direct Reporting Lead --</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title || u.role.name})
                </option>
              ))}
            </select>
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
              className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition"
            >
              {loading ? 'Adding Staff...' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
