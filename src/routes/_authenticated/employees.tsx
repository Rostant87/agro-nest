import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { exportToPDF } from "@/lib/pdf-export";
import { departmentLabel } from "@/lib/locale";

export const Route = createFileRoute("/_authenticated/employees")({ component: EmployeesPage });

interface EmpRow {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  photo_url: string | null;
}

function EmployeesPage() {
  const { isAdmin } = useCurrentUser();
  const [rows, setRows] = useState<EmpRow[]>([]);
  const [search, setSearch] = useState("");
  const [photoCache, setPhotoCache] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, username, email, phone, department, photo_url").order("full_name");
      const list = (data ?? []) as EmpRow[];
      setRows(list);
      const cache: Record<string, string> = {};
      await Promise.all(list.filter((r) => r.photo_url).map(async (r) => {
        const { data: s } = await supabase.storage.from("employee-photos").createSignedUrl(r.photo_url!, 3600);
        if (s?.signedUrl) cache[r.id] = s.signedUrl;
      }));
      setPhotoCache(cache);
    })();
  }, []);

  const filtered = rows.filter((r) =>
    !search || [r.full_name, r.email, r.phone, departmentLabel(r.department)].some((v) => String(v ?? "").toLowerCase().includes(search.toLowerCase())));

  const handleExport = () => {
    exportToPDF({
      title: "Liste des employés",
      columns: [
        { header: "Nom complet", dataKey: "full_name" },
        { header: "Email", dataKey: "email" },
        { header: "Téléphone", dataKey: "phone" },
        { header: "Département", dataKey: "department" },
      ],
      rows: filtered.map((r) => ({
        full_name: r.full_name,
        email: r.email ?? "—",
        phone: r.phone ?? "—",
        department: departmentLabel(r.department),
      })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employés</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Gestion des employés. Pour ajouter un nouveau compte, dirigez-vous vers Utilisateurs & Rôles." : "Consultez l'annuaire des employés."}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="pl-8 w-56" />
          </div>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> PDF</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Département</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun employé</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-muted grid place-items-center text-xs">
                    {photoCache[r.id] ? <img src={photoCache[r.id]} alt={r.full_name} className="h-full w-full object-cover" /> : (r.full_name?.[0] ?? "?")}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{r.full_name}</TableCell>
                <TableCell>{r.email ?? "—"}</TableCell>
                <TableCell>{r.phone ?? "—"}</TableCell>
                <TableCell>{departmentLabel(r.department)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}