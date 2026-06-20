import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { departmentLabel } from "@/lib/locale";

export const Route = createFileRoute("/_authenticated/users")({ component: UsersPage });

interface ProfileRow {
  id: string; full_name: string; email: string | null; department: string | null;
}
interface RoleRow { user_id: string; role: string }

function UsersPage() {
  const { isSuperAdmin, isAdmin } = useCurrentUser();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);

  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, department").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles((p ?? []) as ProfileRow[]);
    setRoles((r ?? []) as RoleRow[]);
  };
  useEffect(() => { load(); }, []);

  const rolesOf = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);

  const grant = async (uid: string, role: "admin" | "employee") => {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) return toast.error(error.message);
    toast.success("Rôle ajouté"); load();
  };
  const revoke = async (uid: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role as "admin" | "employee" | "super_admin");
    if (error) return toast.error(error.message);
    toast.success("Rôle retiré"); load();
  };

  if (!isAdmin) return <div>Accès réservé aux administrateurs.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs & Rôles</h1>
        <p className="text-sm text-muted-foreground">
          {isSuperAdmin
            ? "Vous êtes super administrateur : vous pouvez accorder ou retirer les rôles."
            : "Vous êtes administrateur. Seul le super administrateur peut modifier les rôles."}
        </p>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Rôles</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const rs = rolesOf(p.id);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>{p.email ?? "—"}</TableCell>
                  <TableCell>{departmentLabel(p.department)}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {rs.length === 0 ? <span className="text-muted-foreground text-xs">aucun</span> : rs.map((r) => (
                      <Badge key={r} variant={r === "super_admin" ? "default" : r === "admin" ? "secondary" : "outline"}>
                        {r}
                        {isSuperAdmin && r !== "super_admin" && (
                          <button onClick={() => revoke(p.id, r)} className="ml-1 text-xs">×</button>
                        )}
                      </Badge>
                    ))}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right space-x-1">
                      {!rs.includes("admin") && <Button size="sm" variant="outline" onClick={() => grant(p.id, "admin")}>Promouvoir admin</Button>}
                      {!rs.includes("employee") && <Button size="sm" variant="ghost" onClick={() => grant(p.id, "employee")}>+ employé</Button>}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}