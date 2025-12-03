"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { createSupabaseBrowserClient } from "@/supabase/clients/browser";
import { setAccessToken } from "@/services/api";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import {
  getCompanyForUser,
  getUserAuthContext,
  listCompanyMembers,
  type CompanyRecord,
  type CompanyMemberRecord,
  type UserOrganization,
} from "@/features/companies";

// ============================================================================
// Split Context Types - Each context only contains related data
// This prevents unnecessary re-renders when unrelated state changes
// ============================================================================

// Session context - user auth state (changes rarely after login)
type SessionContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

// Company context - current company data (changes on org switch)
type CompanyContextValue = {
  company: CompanyRecord | null;
  member: CompanyMemberRecord | null;
  refreshCompany: () => Promise<void>;
};

// Members context - team members list (changes when members are added/removed)
type MembersContextValue = {
  companyMembers: CompanyMemberRecord[];
  refreshMembers: () => Promise<void>;
};

// Organizations context - list of orgs user belongs to (changes rarely)
type OrganizationsContextValue = {
  organizations: UserOrganization[];
  switchOrganization: (companyId: string) => Promise<void>;
};

// Legacy combined type for backwards compatibility
export type AuthState = {
  user: User | null;
  session: Session | null;
  company: CompanyRecord | null;
  member: CompanyMemberRecord | null;
  companyMembers: CompanyMemberRecord[];
  organizations: UserOrganization[];
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  refreshCompany: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  switchOrganization: (companyId: string) => Promise<void>;
};

// ============================================================================
// Create separate contexts for each concern
// ============================================================================
const SessionContext = createContext<SessionContextValue | null>(null);
const CompanyContext = createContext<CompanyContextValue | null>(null);
const MembersContext = createContext<MembersContextValue | null>(null);
const OrganizationsContext = createContext<OrganizationsContextValue | null>(null);

// Legacy context for backwards compatibility
const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

  // Split state into separate concerns
  const [sessionState, setSessionState] = useState<{
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  }>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const [companyState, setCompanyState] = useState<{
    company: CompanyRecord | null;
    member: CompanyMemberRecord | null;
  }>({
    company: null,
    member: null,
  });

  const [membersState, setMembersState] = useState<{
    companyMembers: CompanyMemberRecord[];
  }>({
    companyMembers: [],
  });

  const [organizationsState, setOrganizationsState] = useState<{
    organizations: UserOrganization[];
  }>({
    organizations: [],
  });

  // Helper function to load auth data for a user
  const loadAuthDataForUser = useCallback(async (user: User, session: Session | null) => {
    try {
      const authContext = await getUserAuthContext(user.id);

      // Update each state slice separately
      setSessionState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
      });
      setCompanyState({
        company: authContext.company,
        member: authContext.member,
      });
      setMembersState({
        companyMembers: authContext.companyMembers,
      });
      setOrganizationsState({
        organizations: authContext.organizations,
      });
    } catch (error) {
      console.error("[AuthContext] Failed to load auth data", error);
      setSessionState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
      setCompanyState({ company: null, member: null });
      setMembersState({ companyMembers: [] });
      setOrganizationsState({ organizations: [] });
    }
  }, []);

  // Reset all state to unauthenticated
  const resetToUnauthenticated = useCallback(() => {
    setSessionState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });
    setCompanyState({ company: null, member: null });
    setMembersState({ companyMembers: [] });
    setOrganizationsState({ organizations: [] });
  }, []);

  // Initialize auth
  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const supabase = createSupabaseBrowserClient();

      try {
        const [{ data: { user }, error: userError }, { data: { session } }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getSession(),
        ]);

        if (!isMounted) return;

        if (userError || !user) {
          resetToUnauthenticated();
        } else {
          await loadAuthDataForUser(user, session);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (isMounted) {
          resetToUnauthenticated();
        }
      }

      // Set up listener for future auth changes
      const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        if (event === "SIGNED_OUT") {
          resetToUnauthenticated();
          navigate("/login");
        } else if (event === "SIGNED_IN" && newSession?.user) {
          loadAuthDataForUser(newSession.user, newSession);
        } else if (event === "TOKEN_REFRESHED" && newSession) {
          // Only update session state - other contexts don't need to re-render
          setSessionState((prev) => ({ ...prev, session: newSession }));
        }
      });
      subscription = data.subscription;
    };

    init();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate, loadAuthDataForUser, resetToUnauthenticated]);

  // Sync cached access token for API calls
  useEffect(() => {
    setAccessToken(sessionState.session?.access_token ?? null);
  }, [sessionState.session]);

  // Memoized action handlers
  const refreshCompany = useCallback(async () => {
    if (!sessionState.user) return;

    const companyContext = await getCompanyForUser(sessionState.user.id);
    setCompanyState({
      company: companyContext?.company ?? null,
      member: companyContext?.member ?? null,
    });
  }, [sessionState.user]);

  const refreshMembers = useCallback(async () => {
    if (!companyState.company) return;

    const members = await listCompanyMembers(companyState.company.id).catch(() => []);
    setMembersState({ companyMembers: members });
  }, [companyState.company]);

  const switchOrganization = useCallback(async (_companyId: string) => {
    if (!sessionState.user) return;
    window.location.reload();
  }, [sessionState.user]);

  // Memoized context values to prevent unnecessary re-renders
  const sessionContextValue = useMemo<SessionContextValue>(() => ({
    user: sessionState.user,
    session: sessionState.session,
    isLoading: sessionState.isLoading,
    isAuthenticated: sessionState.isAuthenticated,
  }), [sessionState]);

  const companyContextValue = useMemo<CompanyContextValue>(() => ({
    company: companyState.company,
    member: companyState.member,
    refreshCompany,
  }), [companyState, refreshCompany]);

  const membersContextValue = useMemo<MembersContextValue>(() => ({
    companyMembers: membersState.companyMembers,
    refreshMembers,
  }), [membersState, refreshMembers]);

  const organizationsContextValue = useMemo<OrganizationsContextValue>(() => ({
    organizations: organizationsState.organizations,
    switchOrganization,
  }), [organizationsState, switchOrganization]);

  // Legacy combined value for backwards compatibility
  const legacyValue = useMemo<AuthContextValue>(() => ({
    ...sessionState,
    ...companyState,
    ...membersState,
    ...organizationsState,
    refreshCompany,
    refreshMembers,
    switchOrganization,
  }), [sessionState, companyState, membersState, organizationsState, refreshCompany, refreshMembers, switchOrganization]);

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <CompanyContext.Provider value={companyContextValue}>
        <MembersContext.Provider value={membersContextValue}>
          <OrganizationsContext.Provider value={organizationsContextValue}>
            <AuthContext.Provider value={legacyValue}>
              {children}
            </AuthContext.Provider>
          </OrganizationsContext.Provider>
        </MembersContext.Provider>
      </CompanyContext.Provider>
    </SessionContext.Provider>
  );
}

// ============================================================================
// New granular hooks - Use these for better performance
// Each hook only subscribes to the specific context it needs
// ============================================================================

/**
 * Access session/auth state only. Use this when you only need user/session info.
 * Components using this won't re-render when company or members change.
 */
export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within an AuthProvider");
  }
  return context;
}

/**
 * Access current company and member info only.
 * Components using this won't re-render when session refreshes or members change.
 */
export function useCompanyContext(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext must be used within an AuthProvider");
  }
  return context;
}

/**
 * Access company members list only.
 * Components using this won't re-render when session or company changes.
 */
export function useMembersContext(): MembersContextValue {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error("useMembersContext must be used within an AuthProvider");
  }
  return context;
}

/**
 * Access organizations list only.
 * Components using this won't re-render when other auth state changes.
 */
export function useOrganizationsContext(): OrganizationsContextValue {
  const context = useContext(OrganizationsContext);
  if (!context) {
    throw new Error("useOrganizationsContext must be used within an AuthProvider");
  }
  return context;
}

// ============================================================================
// Legacy hooks - Maintained for backwards compatibility
// These still work but cause more re-renders than the granular hooks above
// ============================================================================

/**
 * @deprecated Use granular hooks instead for better performance:
 * - useSessionContext() for user/session/isLoading/isAuthenticated
 * - useCompanyContext() for company/member
 * - useMembersContext() for companyMembers
 * - useOrganizationsContext() for organizations
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// Convenience hooks - now use granular contexts internally
export function useCompany(): CompanyRecord {
  const { company } = useCompanyContext();

  if (!company) {
    throw new Error("useCompany must be used when a company is selected");
  }

  return company;
}

export function useCurrentMember(): CompanyMemberRecord | null {
  const { member } = useCompanyContext();
  return member;
}

export function useCompanyMembers(): CompanyMemberRecord[] {
  const { companyMembers } = useMembersContext();
  return companyMembers;
}

export function useIsAdmin(): boolean {
  const { member } = useCompanyContext();
  return !member || member.role === "admin";
}

export function useSession(): Session | null {
  const { session } = useSessionContext();
  return session;
}

export function useAccessToken(): string | null {
  const { session } = useSessionContext();
  return session?.access_token ?? null;
}
