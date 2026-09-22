'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from './UserSessionContext';
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Megaphone,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  PlugZap,
  UserCheck,
  ArrowRight,
  Sparkles,
  Command,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  category: 'Navigation' | 'Personas' | 'Action';
  title: string;
  subtitle?: string;
  badge?: string;
  icon: any;
  href?: string;
  action?: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { allUsers, switchUser, currentUser, can } = useUserSession();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for custom open event
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open_command_palette', handleOpen);
    return () => window.removeEventListener('open_command_palette', handleOpen);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [open]);

  // Build items list
  const navigationItems: SearchResult[] = [
    {
      id: 'nav-dash',
      category: 'Navigation',
      title: 'Operations Dashboard',
      subtitle: 'Daily roadmap, KPIs & action feed',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'nav-leads',
      category: 'Navigation',
      title: 'Student Lead Pipeline (CRM)',
      subtitle: 'Track incoming inquiries, contact logs & conversion',
      badge: 'CRM',
      icon: Users,
      href: '/leads',
    },
    {
      id: 'nav-integrations',
      category: 'Navigation',
      title: 'Live Data & Ingestion Hub',
      subtitle: 'Google Forms, Meta Lead Ads, TikTok bio forms & webhooks',
      badge: 'Live',
      icon: PlugZap,
      href: '/integrations',
    },
    {
      id: 'nav-cases',
      category: 'Navigation',
      title: 'Student Admission Cases',
      subtitle: 'APS, Goethe, Blocked Account & Embassy Milestones',
      badge: 'Cases',
      icon: GraduationCap,
      href: '/cases',
    },
    {
      id: 'nav-tasks',
      category: 'Navigation',
      title: 'Accountable Tasks & Work',
      subtitle: 'Kanban board & priority checklist',
      icon: CheckSquare,
      href: '/tasks',
    },
    {
      id: 'nav-marketing',
      category: 'Navigation',
      title: 'Marketing & 8-Stage Content Ops',
      subtitle: 'Factual review (Nay) & Brand approval (THN)',
      icon: Megaphone,
      href: '/marketing',
    },
    {
      id: 'nav-knowledge',
      category: 'Navigation',
      title: 'Knowledge Wiki & German FAQs',
      subtitle: 'Consultation scripts, Ausbildung requirements & SOPs',
      icon: BookOpen,
      href: '/knowledge',
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Organization Settings & RBAC',
      subtitle: 'Manage staff, teams, pathways & permissions',
      icon: Settings,
      href: '/settings',
    },
  ];

  const personaItems: SearchResult[] = (allUsers || []).map((u) => ({
    id: `persona-${u.id}`,
    category: 'Personas',
    title: `Switch Persona: ${u.name}`,
    subtitle: `${u.title || u.role?.name} • ${u.email}`,
    badge: u.id === currentUser?.id ? 'Active' : undefined,
    icon: UserCheck,
    action: () => {
      switchUser(u.id);
      setOpen(false);
    },
  }));

  const allItems = [...navigationItems, ...personaItems];

  const filteredItems = allItems.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: SearchResult) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
      setOpen(false);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-fade-in-fast">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-notion-modal border border-zinc-200/90 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
          <Search className="w-5 h-5 text-purple-600 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder="Quick search students, cases, tasks, wiki or switch persona... (↑↓ to select)"
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-zinc-400 border border-zinc-200 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-zinc-50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No matching modules, students, or personas found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-purple-50/80 text-purple-950' : 'hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold truncate text-zinc-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-400 shrink-0 ml-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-600' : 'opacity-40'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-[9px] bg-white border border-zinc-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-white border border-zinc-200 rounded">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-[9px] bg-white border border-zinc-200 rounded">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center space-x-1 text-purple-700 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>GOEURO Fast Navigator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
