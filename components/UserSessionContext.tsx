'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  title?: string | null;
  status: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    permissions: string; // JSON array
  };
  teams: {
    team: {
      id: string;
      name: string;
    };
  }[];
}

interface UserSessionContextType {
  currentUser: UserSession | null;
  allUsers: UserSession[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (userId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  can: (permission: string) => boolean;
}

const UserSessionContext = createContext<UserSessionContextType>({
  currentUser: null,
  allUsers: [],
  loading: true,
  login: async () => ({ success: false }),
  loginDemo: async () => ({ success: false }),
  logout: async () => {},
  switchUser: async () => {},
  refreshUsers: async () => {},
  can: () => false,
});

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [allUsers, setAllUsers] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessionAndUsers = async () => {
    try {
      // 1. Fetch current session
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
        if (meData.user?.id) {
          localStorage.setItem('goeuro_active_user_id', meData.user.id);
          document.cookie = `goeuro_user_id=${meData.user.id}; path=/`;
        }
      } else {
        setCurrentUser(null);
      }

      // 2. Fetch all users for selection/assignments
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const users = await usersRes.json();
        setAllUsers(Array.isArray(users) ? users : []);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndUsers();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setCurrentUser(data.user);
      localStorage.setItem('goeuro_active_user_id', data.user.id);
      document.cookie = `goeuro_user_id=${data.user.id}; path=/`;
      window.dispatchEvent(new CustomEvent('goeuro_user_switched', { detail: data.user }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login network error' };
    }
  };

  const loginDemo = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true, userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Demo login failed' };
      }

      setCurrentUser(data.user);
      localStorage.setItem('goeuro_active_user_id', data.user.id);
      document.cookie = `goeuro_user_id=${data.user.id}; path=/`;
      window.dispatchEvent(new CustomEvent('goeuro_user_switched', { detail: data.user }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Demo login error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('goeuro_active_user_id');
      document.cookie = 'goeuro_user_id=; path=/; max-age=0';
      document.cookie = 'goeuro_session=; path=/; max-age=0';
      router.push('/login');
    }
  };

  const switchUser = async (userId: string) => {
    await loginDemo(userId);
  };

  const can = (permission: string) => {
    if (!currentUser || !currentUser.role) return false;
    return hasPermission(currentUser.role.permissions, permission);
  };

  return (
    <UserSessionContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        login,
        loginDemo,
        logout,
        switchUser,
        refreshUsers: fetchSessionAndUsers,
        can,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserSessionContext);
}
