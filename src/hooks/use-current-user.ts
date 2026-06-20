import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Role = "super_admin" | "admin" | "employee";

export interface CurrentUser {
  user: User | null;
  loading: boolean;
  roles: Role[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRoles = async (uid: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      if (!active) return;
      setRoles((data ?? []).map((r) => r.role as Role));
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      if (data.user) loadRoles(data.user.id).finally(() => active && setLoading(false));
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (session?.user) loadRoles(session.user.id);
      else setRoles([]);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    roles,
    isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    isSuperAdmin: roles.includes("super_admin"),
  };
}