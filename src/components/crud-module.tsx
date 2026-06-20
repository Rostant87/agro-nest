import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/pdf-export";
import { formatFCFA, formatDateTime } from "@/lib/locale";

export type FieldType = "text" | "textarea" | "number" | "money" | "datetime" | "date" | "select";

export interface CrudField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hideInTable?: boolean;
}

export interface CrudModuleProps {
  title: string;
  description?: string;
  table: string;
  fields: CrudField[];
  orderBy?: { column: string; ascending?: boolean };
  searchableKeys?: string[];
}

type Row = Record<string, unknown> & { id: string };

export function CrudModule({ title, description, table, fields, orderBy, searchableKeys }: CrudModuleProps) {
  const { isAdmin, user } = useCurrentUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    let q = supabase.from(table as never).select("*");
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false }) as never;
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    const keys = searchableKeys ?? fields.map((f) => f.key);
    return rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(s)));
  }, [rows, search, searchableKeys, fields]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = fd.get(f.key);
      if (v === null || v === "") {
        payload[f.key] = null;
      } else if (f.type === "number" || f.type === "money") {
        payload[f.key] = Number(v);
      } else {
        payload[f.key] = v;
      }
    }
    if (!editing) payload.created_by = user?.id;

    const { error } = editing
      ? await supabase.from(table as never).update(payload as never).eq("id", editing.id)
      : await supabase.from(table as never).insert(payload as never);

    if (error) return toast.error(error.message);
    toast.success(editing ? "Modifié" : "Ajouté");
    setOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet enregistrement ?")) return;
    const { error } = await supabase.from(table as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    load();
  };

  const handleExport = () => {
    const cols = fields.filter((f) => !f.hideInTable).map((f) => ({ header: f.label, dataKey: f.key }));
    const data = filtered.map((r) => {
      const out: Record<string, unknown> = {};
      for (const f of fields) {
        if (f.hideInTable) continue;
        out[f.key] = formatCell(r[f.key], f);
      }
      return out;
    });
    exportToPDF({ title, columns: cols, rows: data, filename: `${table}_${Date.now()}` });
  };

  const visibleFields = fields.filter((f) => !f.hideInTable);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="pl-8 w-56" />
          </div>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> PDF</Button>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvel enregistrement"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
                  {fields.map((f) => (
                    <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                      <Label htmlFor={f.key}>{f.label}{f.required && " *"}</Label>
                      <FieldInput field={f} defaultValue={editing?.[f.key]} />
                    </div>
                  ))}
                  <DialogFooter className="md:col-span-2">
                    <Button type="submit">{editing ? "Enregistrer" : "Créer"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleFields.map((f) => <TableHead key={f.key}>{f.label}</TableHead>)}
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={visibleFields.length + 1} className="text-center py-8 text-muted-foreground">Chargement…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={visibleFields.length + 1} className="text-center py-8 text-muted-foreground">Aucun enregistrement</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  {visibleFields.map((f) => <TableCell key={f.key}>{formatCell(r[f.key], f)}</TableCell>)}
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function FieldInput({ field, defaultValue }: { field: CrudField; defaultValue?: unknown }) {
  const val = defaultValue == null ? "" : String(defaultValue);
  if (field.type === "textarea") {
    return <Textarea id={field.key} name={field.key} defaultValue={val} placeholder={field.placeholder} />;
  }
  if (field.type === "select" && field.options) {
    return (
      <Select name={field.key} defaultValue={val || undefined}>
        <SelectTrigger><SelectValue placeholder={field.placeholder ?? "Choisir…"} /></SelectTrigger>
        <SelectContent>
          {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "datetime") {
    const dv = val ? new Date(val).toISOString().slice(0, 16) : "";
    return <Input id={field.key} name={field.key} type="datetime-local" defaultValue={dv} required={field.required} />;
  }
  if (field.type === "date") {
    const dv = val ? new Date(val).toISOString().slice(0, 10) : "";
    return <Input id={field.key} name={field.key} type="date" defaultValue={dv} required={field.required} />;
  }
  if (field.type === "number" || field.type === "money") {
    return <Input id={field.key} name={field.key} type="number" step="any" defaultValue={val} required={field.required} placeholder={field.placeholder} />;
  }
  return <Input id={field.key} name={field.key} defaultValue={val} required={field.required} placeholder={field.placeholder} />;
}

function formatCell(value: unknown, field: CrudField): string {
  if (value == null || value === "") return "—";
  if (field.type === "money") return formatFCFA(value as number);
  if (field.type === "datetime") return formatDateTime(value as string);
  if (field.type === "date") return formatDateTime(value as string);
  if (field.type === "select" && field.options) {
    return field.options.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}