/**
 * FarmerAuthContext — manages the Farmer Portal authentication state separately from
 * the Consumer App session. Uses Supabase Auth (email/password + Google OAuth) and
 * validates farmer role + verification_status via the backend /auth/me endpoint.
 *
 * This context is intentionally scoped to the Farmer Portal subtree only.
 * The Consumer App continues to use its own Supabase onAuthStateChange listener in App.tsx.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';
import { api, setAuthToken } from '../services/api';
import { UserProfile } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type FarmerAuthStatus =
  | 'loading'           // Initial session check in progress
  | 'unauthenticated'   // No Supabase session
  | 'pending'           // Supabase session exists, verifying with backend
  | 'authenticated'     // Verified farmer with role === 'farmer' and verification_status === 'verified'
  | 'pending_verification' // Farmer account exists but not yet approved
  | 'rejected'          // Farmer account was rejected
  | 'wrong_role';       // Supabase account exists but is consumer/admin, not farmer

export interface FarmerAuthContextValue {
  status: FarmerAuthStatus;
  supabaseUser: User | null;
  farmerProfile: UserProfile | null;
  error: string | null;
  /** Trigger a manual re-check (e.g. after admin approves account) */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const FarmerAuthContext = createContext<FarmerAuthContextValue>({
  status: 'loading',
  supabaseUser: null,
  farmerProfile: null,
  error: null,
  refresh: async () => {},
  signOut: async () => {},
});

export const useFarmerAuth = () => useContext(FarmerAuthContext);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const FarmerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<FarmerAuthStatus>('loading');
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * verifyFarmerSession — given a Supabase session, syncs with the backend,
   * sets the auth token, and validates the farmer role + verification status.
   */
  const verifyFarmerSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setStatus('unauthenticated');
      setSupabaseUser(null);
      setFarmerProfile(null);
      setAuthToken(null);
      return;
    }

    setStatus('pending');
    setSupabaseUser(session.user);
    setError(null);

    try {
      const authUser = session.user;
      const displayName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        (authUser.email ? authUser.email.split('@')[0] : 'Farmer');
      const avatarUrl =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null;

      // Sync with backend — this creates or finds the profile and issues a backend token
      const synced = await api.syncSupabaseFarmer({
        supabase_id: authUser.id,
        email: authUser.email || null,
        display_name: displayName,
        avatar_url: avatarUrl,
      });

      const profile = synced.profile;
      setFarmerProfile(profile);

      // Enforce role check on frontend (backend also enforces)
      if (profile.role !== 'farmer') {
        setStatus('wrong_role');
        setAuthToken(null);
        return;
      }

      // Check verification status (In demo mode, auto-verify farmer accounts so they enter the dashboard immediately)
      const isDemoEnv = import.meta.env.DEV || import.meta.env.MODE === 'development' || import.meta.env.VITE_DEMO_MODE !== 'false';
      if (profile.verification_status === 'verified' || (isDemoEnv && profile.verification_status !== 'rejected')) {
        setStatus('authenticated');
      } else if (profile.verification_status === 'rejected') {
        setStatus('rejected');
        setAuthToken(null);
      } else {
        // 'pending', 'not_submitted', 'needs_information' → pending_verification
        setStatus('pending_verification');
        setAuthToken(null);
      }
    } catch (err: any) {
      console.error('Farmer session verification failed:', err);
      setError(err?.message || 'Could not verify farmer account. Please try again.');
      setStatus('unauthenticated');
      setAuthToken(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await verifyFarmerSession(session);
  }, [verifyFarmerSession]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error:', e);
    }
    try {
      await api.logout();
    } catch (e) {
      console.error('Backend logout error:', e);
    }
    setAuthToken(null);
    setStatus('unauthenticated');
    setSupabaseUser(null);
    setFarmerProfile(null);
  }, []);

  // Initial session check + ongoing auth state changes
  useEffect(() => {
    let mounted = true;

    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) verifyFarmerSession(session);
    });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) await verifyFarmerSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [verifyFarmerSession]);

  return (
    <FarmerAuthContext.Provider
      value={{ status, supabaseUser, farmerProfile, error, refresh, signOut }}
    >
      {children}
    </FarmerAuthContext.Provider>
  );
};
