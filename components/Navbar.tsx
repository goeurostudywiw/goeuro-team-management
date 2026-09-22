'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import {
  LayoutDashboard,
  CheckSquare,
  Megaphone,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  ExternalLink,
  Globe,
  UserCheck,
  Menu,
  X,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  LogOut,
  PlugZap,
  Search,
  RefreshCw,
  Video,
  FileText,
  Wallet
} from 'lucide-react';
import { useSync } from './SyncContext';

import BrandLogo from './BrandLogo';
import BrandMascot from './BrandMascot';

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, allUsers, switchUser, logout, can } = useUserSession();
  const { isSyncing, lastSyncedAt, triggerSync, badgeCounts } = useSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // If on login page, public root page, or meeting room, hide internal workspace navbar (each has its own header)
  if (pathname === '/login' || pathname === '/' || pathname?.startsWith('/meeting')) {
    return null;
  }

  // If on the public inquiry page, display simplified Notion-style public header
  if (pathname === '/inquiry') {
    return (
      <header className="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <BrandLogo variant="light" width={150} showBadge={false} />
          </Link>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition"
            >
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span>{language === 'en' ? 'မြန်မာစာ' : 'English'}</span>
            </button>
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white transition shadow-xs"
            >
              Staff Workspace
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const getBadge = (href: string) => {
    if (href === '/leads' && badgeCounts.newLeads > 0) {
      return {
        count: badgeCounts.newLeads,
        cls: 'bg-emerald-500 text-white animate-pulse shadow-xs',
      };
    }
    if (href === '/marketing' && badgeCounts.pendingApprovals > 0) {
      return {
        count: badgeCounts.pendingApprovals,
        cls: 'bg-amber-500 text-white shadow-xs',
      };
    }
    if (href === '/tasks' && badgeCounts.openTasks > 0) {
      return {
        count: badgeCounts.openTasks,
        cls: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
      };
    }
    if (href === '/cases' && badgeCounts.activeCases > 0) {
      return {
        count: badgeCounts.activeCases,
        cls: 'bg-purple-100 text-purple-700 border border-purple-200',
      };
    }
    return null;
  };

  const isBurmese = language === 'my';

  const navItems = [
    { href: '/dashboard', label: isBurmese ? 'ပင်မ' : 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: isBurmese ? 'တာဝန်များ' : 'Tasks', icon: CheckSquare },
    { href: '/marketing', label: isBurmese ? 'မားကတ်တင်း' : 'Marketing', icon: Megaphone },
    { href: '/leads', label: isBurmese ? 'စုံစမ်းမှုများ' : 'Leads', icon: Users, guard: 'lead:read' },
    { href: '/cases', label: isBurmese ? 'ကျောင်းသားဖိုင်' : 'Cases', icon: GraduationCap, guard: 'case:read' },
    { href: '/finance', label: isBurmese ? 'ဘဏ္ဍာနှင့် လခ' : 'Finance & Payroll', icon: Wallet, guard: 'finance:view' },
    { href: '/guidelines', label: isBurmese ? 'လမ်းညွှန်' : 'Guide', icon: FileText },
    { href: '/knowledge', label: isBurmese ? 'ဗဟုသုတ' : 'Knowledge', icon: BookOpen },
    { href: '/integrations', label: isBurmese ? 'ချိတ်ဆက်မှု' : 'Integrations', icon: PlugZap },
    { href: '/settings', label: isBurmese ? 'ဆက်တင်' : 'Settings', icon: Settings },
  ];

  // Group users into 3 Profile Tiers
  const founderUsers = allUsers.filter((u) => u.role?.name === 'Founder' || u.email === 'ceothnaing@gmail.com' || u.email === 'thn@goeuro.de');
  const superAdminUsers = allUsers.filter((u) => u.role?.name === 'Super Admin' || u.email === 'admin@goeuro.de');
  const consultantUsers = allUsers.filter(
    (u) =>
      u.role?.name === 'Consultant & Management' ||
      (!founderUsers.some((f) => f.id === u.id) && !superAdminUsers.some((s) => s.id === u.id) && u.email !== 'viewer@partner.de')
  );

  return (
    <div className="sticky top-0 z-50">
      {/* Top Banner: Black / Charcoal Persona Bar with Purple Accents */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-300 text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 w-full overflow-x-auto">
        <div className="flex items-center space-x-2 shrink-0">
          <Link href="/" target="_blank" className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-800/60 transition shrink-0" title="Open Public Website">
            <span>🌐 View Public Site</span>
          </Link>
          <Link href="/guidelines" className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800/60 transition shrink-0" title="Operations Guideline v1.2">
            <span>📖 Guide v1.2</span>
          </Link>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <div className="relative inline-block shrink-0">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 font-medium text-white hover:text-purple-300 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/80 transition text-xs cursor-pointer shrink-0"
            >
              <BrandMascot variant="avatar" size="sm" />
              <span className="font-semibold">{currentUser?.name || 'Loading...'}</span>
              <span className="text-[11px] text-zinc-400 font-normal">({currentUser?.role?.name})</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-80 bg-white border border-zinc-200 rounded-2xl shadow-notion-modal z-50 py-2 text-zinc-900 divide-y divide-zinc-100">
                <div className="px-4 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t.userSwitcher.switchPrompt} (3 Profiles)
                </div>

                {/* Tier 1: Founder */}
                <div className="py-1">
                  <div className="px-4 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1">
                    <span>👑 Founder</span>
                  </div>
                  {founderUsers.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50/60 transition ${
                          isSelected ? 'bg-amber-50 text-amber-950 font-bold' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-zinc-900">{u.name}</div>
                          <div className="text-[10px] text-amber-800">{u.title || 'Founder'}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Founder
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tier 2: Super Admin */}
                <div className="py-1">
                  <div className="px-4 py-1 text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center space-x-1">
                    <span>⚡ Super Admin</span>
                  </div>
                  {superAdminUsers.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-purple-50 transition ${
                          isSelected ? 'bg-purple-50 text-purple-950 font-bold' : ''
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-zinc-900">{u.name}</div>
                          <div className="text-[10px] text-purple-700">{u.title || 'Super Admin'}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Super Admin
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tier 3: Consultant & Management */}
                <div className="py-1">
                  <div className="px-4 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center space-x-1">
                    <span>🎓 Consultant & Management</span>
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {consultantUsers.map((u) => {
                      const isSelected = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50/50 transition ${
                            isSelected ? 'bg-blue-50 text-blue-950 font-bold' : ''
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-zinc-900">{u.name}</div>
                            <div className="text-[10px] text-zinc-500">{u.title || 'Consultant'}</div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Consultant
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-1.5 bg-zinc-50/70 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out of Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2.5 ml-auto">
          {/* Live Sync Engine Widget */}
          <button
            onClick={() => triggerSync(true)}
            className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition"
            title={
              isSyncing
                ? 'Synchronizing workspace...'
                : `Real-time sync active (Last: ${
                    lastSyncedAt
                      ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : 'Live'
                  }). Click to force sync.`
            }
          >
            <RefreshCw className={`w-3 h-3 text-purple-400 ${isSyncing ? 'animate-spin text-purple-300' : ''}`} />
            <span className="hidden sm:inline font-medium text-[11px]">
              {isSyncing ? 'Syncing...' : 'Live Sync'}
            </span>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 transition"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'en' ? 'မြန်မာစာ' : 'English'}</span>
          </button>

          {/* In-House Video Consultation Link */}
          <Link
            href="/meeting/counselor-room?role=counselor"
            target="_blank"
            className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white border border-purple-800/80 transition"
            title="Launch Free In-House Video Consultation Room"
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Consult Room</span>
          </Link>

          {/* Public Portal Link */}
          <Link
            href="/inquiry"
            target="_blank"
            className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold transition shadow-xs"
          >
            <span>{t.nav.publicPortal}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-200 border border-zinc-700/80 transition"
            title="Log Out of Workspace"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar: Crisp White with Notion Hairline Border */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-zinc-200 text-zinc-800 shadow-xs w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 w-full">
            {/* Official Brand Logo (Strict shrink-0 prevents any overlap) */}
            <div className="flex items-center space-x-2 shrink-0 mr-3">
              <Link href="/dashboard" className="flex items-center space-x-2 shrink-0">
                <BrandLogo variant="light" width={130} showBadge={false} />
                <span className="hidden 2xl:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/80 shrink-0">
                  Workspace
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links (Notion Tab Style) */}
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isGuarded = item.guard && !can(item.guard);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-2 xl:px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/90 shadow-xs scale-[1.01]'
                        : isGuarded
                        ? 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 opacity-60'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70 hover:scale-[1.01]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                    {getBadge(item.href) && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${getBadge(item.href)!.cls}`}>
                        {getBadge(item.href)!.count}
                      </span>
                    )}
                    {item.href === '/integrations' && (
                      <span className="flex h-1.5 w-1.5 relative ml-0.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    )}
                    {isGuarded && (
                      <span title="Restricted Access" className="shrink-0">
                        <ShieldAlert className="w-3 h-3 text-amber-500 ml-0.5" />
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Fast Command Palette Trigger */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open_command_palette'))}
                className="hidden 2xl:flex items-center space-x-1.5 ml-2 px-2.5 py-1 rounded-xl text-xs text-zinc-500 bg-zinc-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-zinc-200/80 transition shadow-2xs shrink-0"
                title="Quick Search & Navigation (Ctrl+K)"
              >
                <Search className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="font-medium text-[11px]">Search</span>
                <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-zinc-400 border border-zinc-200">⌘K</kbd>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white px-3 pt-2 pb-4 space-y-1 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isGuarded = item.guard && !can(item.guard);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : isGuarded
                      ? 'text-zinc-400'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {getBadge(item.href) && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${getBadge(item.href)!.cls}`}>
                      {getBadge(item.href)!.count}
                    </span>
                  )}
                  {isGuarded && <ShieldAlert className="w-3.5 h-3.5 text-amber-500 ml-auto" />}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}
