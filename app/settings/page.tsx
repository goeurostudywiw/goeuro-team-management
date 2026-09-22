'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import AddStaffModal from '@/components/AddStaffModal';
import ReassignmentWizardModal from '@/components/ReassignmentWizardModal';
import TaskModal from '@/components/TaskModal';
import {
  Settings,
  Users,
  Shield,
  Layers,
  RotateCcw,
  History,
  Plus,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Crown,
  Palette,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import BrandLogo from '@/components/BrandLogo';
import BrandMascot from '@/components/BrandMascot';

export default function SettingsPage() {
  const { language, t } = useLanguage();
  const { currentUser, allUsers, refreshUsers, can } = useUserSession();

  const [activeTab, setActiveTab] = useState<'profiles' | 'brand' | 'users' | 'teams' | 'roles' | 'pathways' | 'reassign' | 'audit'>('profiles');

  // Modals
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedStaffForReassign, setSelectedStaffForReassign] = useState<string>('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newlyAddedStaff, setNewlyAddedStaff] = useState<any>(null);

  // Data
  const [teams, setTeams] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pathway creation state
  const [newPathwayName, setNewPathwayName] = useState('');
  const [newPathwayCode, setNewPathwayCode] = useState('');
  const [newPathwayDesc, setNewPathwayDesc] = useState('');

  // Role edit state
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      const [teamsRes, rolesRes, pathRes, auditRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/roles'),
        fetch('/api/pathways'),
        fetch('/api/audit'),
      ]);

      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (rolesRes.ok) {
        const rData = await rolesRes.json();
        setRoles(rData);
        if (rData.length > 0 && !selectedRole) {
          setSelectedRole(rData[0]);
          try {
            setEditingPermissions(JSON.parse(rData[0].permissions || '[]'));
          } catch (e) {
            setEditingPermissions([]);
          }
        }
      }
      if (pathRes.ok) setPathways(await pathRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleToggleUserStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: nextStatus }),
      });
      await refreshUsers();
      fetchSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePathway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPathwayName || !newPathwayCode) return;

    try {
      await fetch('/api/pathways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPathwayName,
          code: newPathwayCode,
          description: newPathwayDesc,
        }),
      });
      setNewPathwayName('');
      setNewPathwayCode('');
      setNewPathwayDesc('');
      fetchSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      await fetch('/api/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRole.id,
          permissions: editingPermissions,
        }),
      });
      fetchSettingsData();
      alert('Role permissions updated successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (permId: string) => {
    if (editingPermissions.includes(permId)) {
      setEditingPermissions(editingPermissions.filter((p) => p !== permId));
    } else {
      setEditingPermissions([...editingPermissions, permId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                {t.settings.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                Workspace Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {t.settings.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedStaffForReassign('');
              setReassignOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition"
          >
            <RotateCcw className="w-4 h-4 text-purple-700" />
            <span>Reassignment Wizard</span>
          </button>
          <button
            onClick={() => setAddStaffOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.settings.addStaffBtn}</span>
          </button>
        </div>
      </div>

      {/* Success banner after adding 6th staff member */}
      {newlyAddedStaff && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-4 text-xs text-purple-950 shadow-2xs">
          <div>
            <span className="font-bold block text-sm">Staff member added: {newlyAddedStaff.name} ({newlyAddedStaff.role?.name})</span>
            <p className="text-zinc-600 mt-0.5">
              Ready to verify acceptance test? Give them an operational task right now without modifying source code!
            </p>
          </div>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-xs shrink-0 transition"
          >
            + Give {newlyAddedStaff.name.split(' ')[0]} a Task Now
          </button>
        </div>
      )}

      {/* Tab Navigation (Notion Pill Toggle) */}
      <div className="flex space-x-1 p-1 bg-white rounded-2xl border border-zinc-200/90 shadow-notion overflow-x-auto text-xs font-semibold">
        {[
          { id: 'profiles', label: language === 'my' ? '👑 အဆင့် (၃) ခု အုပ်ချုပ်မှု' : '👑 3-Tier Governance', icon: Crown },
          { id: 'brand', label: language === 'my' ? '🎨 အမှတ်တံဆိပ်နှင့် Mascot' : '🎨 Brand & Mascot', icon: Palette },
          { id: 'users', label: t.settings.tabs.users, icon: Users },
          { id: 'teams', label: t.settings.tabs.teams, icon: Briefcase },
          { id: 'roles', label: t.settings.tabs.roles, icon: Shield },
          { id: 'pathways', label: t.settings.tabs.pathways, icon: Layers },
          { id: 'reassign', label: t.settings.tabs.reassign, icon: RotateCcw },
          { id: 'audit', label: t.settings.tabs.audit, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: 3-Tier Profile Governance */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-notion space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Crown className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-zinc-950">
                  {language === 'my' ? 'GOEURO အဆင့် (၃) ခု စီမံခန့်ခွဲမှုစနစ်' : 'GOEURO 3-Tier Access Governance'}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Corporate Tier Model
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
              Strict separation of concerns across Executive Leadership (Founder), System Infrastructure (Super Admin), and Operational Student Success (Consultant & Management).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1: Founder */}
            <div className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                  👑
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  Tier 1 • Supreme
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-950">1. Founder Profile</h4>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">Thet Htoo Naing</p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Ultimate executive authority, corporate direction, final brand validation, and agency growth oversight.
                </p>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Scope:</span>
                  <span className="font-bold text-zinc-900">Unrestricted (*)</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Active Account:</span>
                  <code className="text-purple-700 font-semibold">thn@goeuro.de</code>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Leadership:</span>
                  <span className="font-semibold text-zinc-800">Executive Director</span>
                </div>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">Founder Privileges:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Full organization configuration</li>
                  <li>Overriding approval on brand & marketing</li>
                  <li>Strategic financial & case oversight</li>
                </ul>
              </div>
            </div>

            {/* Tier 2: Super Admin */}
            <div className="bg-white rounded-2xl border-2 border-purple-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black shadow-sm">
                  ⚡
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-300">
                  Tier 2 • Systems
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-950">2. Super Admin Profile</h4>
                <p className="text-xs text-purple-800 font-semibold mt-0.5">System Administrator</p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Technical operations, IT security, audit log verification, role assignment, and database health.
                </p>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Scope:</span>
                  <span className="font-bold text-zinc-900">System Controls (*)</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Active Account:</span>
                  <code className="text-purple-700 font-semibold">admin@goeuro.de</code>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Security Level:</span>
                  <span className="font-semibold text-zinc-800">System Admin</span>
                </div>
              </div>

              <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200 text-[11px] text-purple-900 space-y-1">
                <span className="font-bold block">Super Admin Privileges:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Add/deactivate staff & reassignment wizard</li>
                  <li>Database backup & migration telemetry</li>
                  <li>Role-based permissions tuning</li>
                </ul>
              </div>
            </div>

            {/* Tier 3: Consultant & Management */}
            <div className="bg-white rounded-2xl border-2 border-blue-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
                  🎓
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                  Tier 3 • Operations
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-950">3. Consultant & Management</h4>
                <p className="text-xs text-blue-800 font-semibold mt-0.5">Counselors & Coordinators</p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Admissions counseling, student case tracking, visa documentation, and live video consulting sessions.
                </p>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Assigned Staff:</span>
                  <span className="font-bold text-zinc-900">5 Counselors</span>
                </div>
                <div className="text-[11px] text-zinc-500 truncate">
                  Kaung Myat Hein, Ye Yint Tun Thant, Nay Myo Thiha, etc.
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Consultation Room:</span>
                  <span className="font-semibold text-emerald-700">Full Video & Recording</span>
                </div>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <span className="font-bold block">Consultant Privileges:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Manage leads & student applications</li>
                  <li>Host in-house WebRTC video sessions</li>
                  <li>Upload checklist documents & handovers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Brand Guidelines & 3D Mascot */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-notion space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Palette className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-zinc-950">Official Brand Assets & Style Guidelines</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Brand Version 2.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
              Consistent corporate visual identity for GOEURO STUDY across light and dark surfaces, marketing campaigns, and student portals.
            </p>
          </div>

          {/* Logo Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Light Surface Logo</span>
              <div className="h-32 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-200/80 p-4">
                <BrandLogo variant="light" width={220} showBadge={false} />
              </div>
              <p className="text-[11px] text-zinc-500">
                Primary logo for white backdrops, documents, letters of acceptance, and invoices.
              </p>
            </div>

            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-sm space-y-4 text-white">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dark Surface Logo</span>
              <div className="h-32 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 p-4">
                <BrandLogo variant="dark" width={220} showBadge={false} />
              </div>
              <p className="text-[11px] text-zinc-400">
                Inverted logo with crisp white wordmark and vibrant purple mortarboard cap for dark interfaces.
              </p>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Corporate Color Palette</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#6D28D9] shrink-0 shadow-sm" />
                <div>
                  <div className="text-xs font-bold text-zinc-900">Royal Brand Purple</div>
                  <code className="text-xs text-purple-700 font-mono font-bold">#6D28D9</code>
                  <div className="text-[10px] text-zinc-400">Primary Brand Accent</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#09090B] shrink-0 shadow-sm" />
                <div>
                  <div className="text-xs font-bold text-zinc-900">Rich Obsidian Black</div>
                  <code className="text-xs text-zinc-800 font-mono font-bold">#09090B</code>
                  <div className="text-[10px] text-zinc-400">Typography & High Contrast</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-300 shrink-0 shadow-sm" />
                <div>
                  <div className="text-xs font-bold text-zinc-900">Clean Foundation White</div>
                  <code className="text-xs text-zinc-800 font-mono font-bold">#FFFFFF</code>
                  <div className="text-[10px] text-zinc-400">Surface Cleanliness</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Mascot EuroBot Showcase */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Official 3D Mascot: "EuroBot" Design & Anatomy
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Official Mascot Specs
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <BrandMascot variant="guide" />
              </div>
              <div className="lg:col-span-5 space-y-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                <BrandMascot variant="hero" speech="Hallo! I am EuroBot, your friendly Germany study guide!" />
                <ul className="text-xs text-zinc-600 space-y-2 pt-2">
                  <li><strong>Head:</strong> Features Graduation Mortarboard cap with gold tassel.</li>
                  <li><strong>Eyes:</strong> Curved friendly blue/cyan smiling LED visor.</li>
                  <li><strong>Chest:</strong> White chassis with embossed purple star emblem.</li>
                  <li><strong>Propulsion:</strong> Floating anti-gravity thruster base with glowing purple light.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Staff & Team Members */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950">Current Staff Members ({allUsers.length})</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                The 5 initial members from PPTX strategy + scalable 6th user support.
              </p>
            </div>
            <button
              onClick={() => setAddStaffOpen(true)}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
            >
              + Add Another Staff Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 border-b border-zinc-200/90 text-zinc-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-5 py-3">Role & Permissions</th>
                  <th className="px-5 py-3">Department(s)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-zinc-900">{u.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{u.email} • {u.title}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      <div className="flex flex-wrap gap-1">
                        {u.teams?.map((ut) => (
                          <span key={ut.team.id} className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200">
                            {ut.team.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-3">
                      <button
                        onClick={() => {
                          setSelectedStaffForReassign(u.id);
                          setReassignOpen(true);
                        }}
                        className="text-xs text-purple-700 font-semibold hover:underline"
                        title="Reassign work"
                      >
                        Reassign Work
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`text-xs font-semibold hover:underline ${
                          u.status === 'ACTIVE' ? 'text-rose-600' : 'text-purple-600'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Departments & Teams */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-950">{team.name}</h3>
                <span className="text-xs text-zinc-500 font-medium px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">
                  {team._count?.tasks || 0} Open Tasks
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{team.description}</p>
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  Manager: <strong className="text-zinc-800">{team.manager?.name || 'None designated'}</strong>
                </span>
                <span className="text-purple-700 font-semibold text-[11px]">
                  {team.members?.length || 0} Members
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Roles & Permissions Editor */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-notion space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Permissions are strictly assigned through roles, never hardcoded to names.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Role List */}
            <div className="space-y-1.5 lg:border-r lg:border-zinc-100 lg:pr-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Available Roles:
              </span>
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRole(r);
                    try {
                      setEditingPermissions(JSON.parse(r.permissions || '[]'));
                    } catch (e) {
                      setEditingPermissions([]);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition ${
                    selectedRole?.id === r.id
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="font-semibold">{r.name}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedRole?.id === r.id ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {r._count?.users || 0} users assigned
                  </div>
                </button>
              ))}
            </div>

            {/* Permission Checkboxes for Selected Role */}
            <div className="lg:col-span-3 space-y-4">
              {selectedRole ? (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950">{selectedRole.name} Permissions</h4>
                      <p className="text-xs text-zinc-500">{selectedRole.description}</p>
                    </div>
                    <button
                      onClick={handleSaveRolePermissions}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-zinc-950 hover:bg-black shadow-xs transition"
                    >
                      Save Permission Changes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_PERMISSIONS.map((p) => {
                      const hasWildcard = editingPermissions.includes('*');
                      const checked = hasWildcard || editingPermissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-2.5 ${
                            checked ? 'bg-purple-50/50 border-purple-200' : 'bg-zinc-50/60 border-zinc-200/90'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={hasWildcard && p.id !== '*'}
                            onChange={() => togglePermission(p.id)}
                            className="mt-0.5 rounded text-purple-600 focus:ring-purple-600"
                          />
                          <div>
                            <span className="font-bold text-xs text-zinc-900 block">{p.label}</span>
                            <span className="text-[11px] text-zinc-500 leading-tight">{p.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-400">Select a role to inspect or edit permissions.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Service Pathways */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathways.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    CODE: {p.code}
                  </span>
                  <span className="text-xs text-purple-600 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-950">{p.name}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{p.description}</p>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 text-center text-xs">
                  <div className="p-2 bg-zinc-50 rounded-xl">
                    <div className="text-zinc-400 text-[10px]">Content Items</div>
                    <div className="font-bold text-zinc-900 mt-0.5">{p._count?.content || 0}</div>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-xl">
                    <div className="text-zinc-400 text-[10px]">Inquiries</div>
                    <div className="font-bold text-zinc-900 mt-0.5">{p._count?.leads || 0}</div>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-xl">
                    <div className="text-zinc-400 text-[10px]">Student Cases</div>
                    <div className="font-bold text-zinc-900 mt-0.5">{p._count?.cases || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Pathway Form */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-notion space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-zinc-950">Add Future Pathway or Destination</h3>
            <form onSubmit={handleCreatePathway} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Pathway Name *</label>
                <input
                  type="text"
                  required
                  value={newPathwayName}
                  onChange={(e) => setNewPathwayName(e.target.value)}
                  placeholder="e.g. Germany Language School Pathway"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Unique Code *</label>
                <input
                  type="text"
                  required
                  value={newPathwayCode}
                  onChange={(e) => setNewPathwayCode(e.target.value)}
                  placeholder="e.g. GERMANY_LANGUAGE_PREP"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPathwayDesc}
                  onChange={(e) => setNewPathwayDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition"
              >
                + Create Pathway
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: Staff Offboarding & Reassignment */}
      {activeTab === 'reassign' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-notion space-y-4 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Staff Offboarding & Item Reassignment Tool</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Reassign all open tasks, active leads, draft content, and student cases in one clean operation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 text-xs space-y-2">
            <span className="font-bold text-purple-300 block">Zero Unowned Work Guarantee</span>
            <p className="text-zinc-300 leading-relaxed">
              When a team member changes roles or leaves GOEURO, our scalable architecture guarantees zero unowned work:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-400">
              <li>Open tasks transfer directly to the replacement staff member.</li>
              <li>Active inquiries and leads maintain continuous ownership without losing history.</li>
              <li>Active student cases create a formal handover record with timestamp and reason.</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setSelectedStaffForReassign('');
              setReassignOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Launch Reassignment Wizard</span>
          </button>
        </div>
      )}

      {/* TAB 6: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion overflow-hidden">
          <div className="p-5 border-b border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-950">System Activity & Audit Log</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Immutable record of assignments, approvals, status changes, and reassignments.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 border-b border-zinc-200/90 text-zinc-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/60 transition">
                    <td className="px-5 py-2.5 text-zinc-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5 font-semibold text-zinc-900">
                      {log.action}
                    </td>
                    <td className="px-5 py-2.5 text-purple-700 font-bold">
                      {log.entityType}
                    </td>
                    <td className="px-5 py-2.5 text-zinc-700">
                      {log.user?.name || 'System / Public'}
                    </td>
                    <td className="px-5 py-2.5 text-zinc-500 truncate max-w-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        onSaved={(createdUser) => {
          setNewlyAddedStaff(createdUser);
          fetchSettingsData();
        }}
      />

      {/* Reassignment Wizard Modal */}
      <ReassignmentWizardModal
        isOpen={reassignOpen}
        onClose={() => setReassignOpen(false)}
        onSaved={fetchSettingsData}
        initialFromUserId={selectedStaffForReassign}
      />

      {/* Task Modal to give work to newly added staff */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSaved={() => {
          setNewlyAddedStaff(null);
          fetchSettingsData();
        }}
        taskToEdit={newlyAddedStaff ? { assigneeId: newlyAddedStaff.id, title: `Onboard as ${newlyAddedStaff.title || 'Counselor'}` } : undefined}
      />
    </div>
  );
}
