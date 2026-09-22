'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface SyncNotification {
  id: string;
  type: 'lead' | 'case' | 'task' | 'marketing' | 'system' | 'integration';
  title: string;
  description: string;
  channel?: string;
  timestamp: Date;
}

interface BadgeCounts {
  newLeads: number;
  pendingApprovals: number;
  openTasks: number;
  activeCases: number;
}

interface SyncContextType {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  badgeCounts: BadgeCounts;
  triggerSync: (showToast?: boolean) => Promise<void>;
  notifySync: (type: string, data?: any) => void;
  notifications: SyncNotification[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const SyncContext = createContext<SyncContextType>({
  isSyncing: false,
  lastSyncedAt: null,
  badgeCounts: { newLeads: 0, pendingApprovals: 0, openTasks: 0, activeCases: 0 },
  triggerSync: async () => {},
  notifySync: () => {},
  notifications: [],
  dismissNotification: () => {},
  clearAllNotifications: () => {},
});

export const useSync = () => useContext(SyncContext);

const BROADCAST_CHANNEL_NAME = 'goeuro_sync_hub';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    newLeads: 0,
    pendingApprovals: 0,
    openTasks: 0,
    activeCases: 0,
  });
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const prevStatsRef = useRef<any>(null);

  // Add a toast notification to tray with auto-dismiss
  const addNotification = useCallback((notif: Omit<SyncNotification, 'id' | 'timestamp'>) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newNotif: SyncNotification = {
      ...notif,
      id,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]); // Keep max 5

    // Auto-dismiss after 6s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Fetch stats and update badge counters silently or with trigger
  const fetchBadgeCounts = useCallback(async (isSilent = true) => {
    if (!isSilent) setIsSyncing(true);
    try {
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (res.ok) {
        const stats = await res.json();
        const prev = prevStatsRef.current;

        const newLeads = stats.newLeadsCount ?? (stats.leadsNeedingFollowUp?.filter((l: any) => l.stage === 'NEW').length || 0);
        const pendingApprovals = stats.pendingApprovalsCount ?? (stats.pendingApprovals?.length || 0);
        const openTasks = stats.openTasksCount ?? (stats.myTasks?.length || 0);
        const activeCases = stats.activeCasesCount ?? 0;

        setBadgeCounts({
          newLeads,
          pendingApprovals,
          openTasks,
          activeCases,
        });

        // Detect if counts increased from external sources (e.g. webhook, python scripts)
        if (prev) {
          if (stats.totalLeadsCount > prev.totalLeadsCount) {
            const diff = stats.totalLeadsCount - prev.totalLeadsCount;
            addNotification({
              type: 'lead',
              title: '⚡ New Student Inquiry Received',
              description: `${diff} new lead${diff > 1 ? 's' : ''} synchronized from connected channel into admissions pipeline.`,
            });
            window.dispatchEvent(new CustomEvent('goeuro_sync_event', { detail: { type: 'lead_created' } }));
          }

          if (stats.activeCasesCount > prev.activeCasesCount) {
            addNotification({
              type: 'case',
              title: '🎓 Student Case Converted',
              description: 'An inquiry was successfully enrolled into active Germany visa/admissions processing.',
            });
            window.dispatchEvent(new CustomEvent('goeuro_sync_event', { detail: { type: 'case_updated' } }));
          }

          if (stats.totalTasksCount > prev.totalTasksCount) {
            addNotification({
              type: 'task',
              title: '✓ Task List Updated',
              description: 'New team action items have been synchronized.',
            });
            window.dispatchEvent(new CustomEvent('goeuro_sync_event', { detail: { type: 'task_updated' } }));
          }
        }

        prevStatsRef.current = stats;
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.warn('Silent sync poll failed:', err);
    } finally {
      if (!isSilent) {
        setTimeout(() => setIsSyncing(false), 400);
      }
    }
  }, [addNotification]);

  // Trigger manual or programmatic sync
  const triggerSync = useCallback(async (showToast = false) => {
    setIsSyncing(true);
    await fetchBadgeCounts(false);
    window.dispatchEvent(new CustomEvent('goeuro_sync_event', { detail: { type: 'manual_sync' } }));
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'manual_sync', timestamp: Date.now() });
    }
    if (showToast) {
      addNotification({
        type: 'system',
        title: '✓ Workspace Synchronized',
        description: 'All module data, pipeline stages, and task rhythms are up to date.',
      });
    }
  }, [fetchBadgeCounts, addNotification]);

  // Broadcast and local notification dispatch
  const notifySync = useCallback((type: string, data?: any) => {
    // 1. Dispatch custom event in current window
    window.dispatchEvent(new CustomEvent('goeuro_sync_event', { detail: { type, data } }));

    // 2. Broadcast to other tabs
    if (channelRef.current) {
      channelRef.current.postMessage({ type, data, timestamp: Date.now() });
    }

    // 3. Optional contextual toast
    if (type === 'lead_created') {
      addNotification({
        type: 'lead',
        title: '🟢 New Lead Captured',
        description: data?.name ? `${data.name} submitted an inquiry via ${data.channel || 'web'}.` : 'New inquiry added to pipeline.',
        channel: data?.channel,
      });
    } else if (type === 'lead_advanced') {
      addNotification({
        type: 'lead',
        title: '📌 Lead Stage Advanced',
        description: data?.name ? `${data.name} advanced to ${data.stage || 'next stage'}.` : 'Lead stage updated.',
      });
    } else if (type === 'case_created') {
      addNotification({
        type: 'case',
        title: '🎓 Student Enrolled',
        description: data?.studentName ? `${data.studentName} is now an active admission case.` : 'New student case active.',
      });
    } else if (type === 'task_updated') {
      addNotification({
        type: 'task',
        title: '✓ Task Updated',
        description: data?.title ? `"${data.title}" updated to ${data.status}.` : 'Task status synchronized.',
      });
    } else if (type === 'content_updated') {
      addNotification({
        type: 'marketing',
        title: '📣 Marketing Ops Updated',
        description: data?.topic ? `"${data.topic}" updated in content pipeline.` : 'Content item updated.',
      });
    }

    // Refresh counts immediately
    fetchBadgeCounts(true);
  }, [addNotification, fetchBadgeCounts]);

  // Initialize BroadcastChannel and Heartbeat Timer
  useEffect(() => {
    // 1. Initial count fetch
    fetchBadgeCounts(true);

    // 2. Setup BroadcastChannel for cross-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, data } = event.data || {};
        // Dispatch in this tab
        window.dispatchEvent(new CustomEvent('goeuro_sync_event', { detail: { type, data } }));
        // Refresh counts silently
        fetchBadgeCounts(true);
      };
    }

    // 3. Heartbeat auto-sync every 5 seconds
    const intervalId = setInterval(() => {
      fetchBadgeCounts(true);
    }, 5000);

    // 4. Handle visibility change (tab refocus)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchBadgeCounts(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [fetchBadgeCounts]);

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        lastSyncedAt,
        badgeCounts,
        triggerSync,
        notifySync,
        notifications,
        dismissNotification,
        clearAllNotifications,
      }}
    >
      {children}

      {/* Notion-Style Floating Toast Notification Tray */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {notifications.map((notif) => {
          let dotColor = 'bg-purple-600';
          let borderAccent = 'border-purple-200';
          let badgeBg = 'bg-purple-50 text-purple-700';

          if (notif.type === 'lead') {
            dotColor = 'bg-emerald-500';
            borderAccent = 'border-emerald-200';
            badgeBg = 'bg-emerald-50 text-emerald-700';
          } else if (notif.type === 'task') {
            dotColor = 'bg-blue-500';
            borderAccent = 'border-blue-200';
            badgeBg = 'bg-blue-50 text-blue-700';
          } else if (notif.type === 'case') {
            dotColor = 'bg-purple-600';
            borderAccent = 'border-purple-200';
            badgeBg = 'bg-purple-50 text-purple-700';
          } else if (notif.type === 'marketing') {
            dotColor = 'bg-amber-500';
            borderAccent = 'border-amber-200';
            badgeBg = 'bg-amber-50 text-amber-700';
          }

          return (
            <div
              key={notif.id}
              className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-notion-modal border ${borderAccent} animate-slide-up flex items-start space-x-3 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="mt-1 shrink-0">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-900 truncate">{notif.title}</p>
                  <span className="text-[10px] text-zinc-400 ml-2">Just now</span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed break-words">{notif.description}</p>
                {notif.channel && (
                  <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${badgeBg}`}>
                    {notif.channel}
                  </span>
                )}
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition shrink-0"
                title="Dismiss"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </SyncContext.Provider>
  );
}
