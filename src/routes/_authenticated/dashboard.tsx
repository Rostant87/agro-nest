import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatFCFA } from "@/lib/locale";
import { Drumstick, Coins, ShoppingCart, Users, Pill, AlertTriangle } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface Stats {
  employees: number;
  salesTotal: number;
  expensesTotal: number;
  purchasesTotal: number;
  mortality: number;
  medsLow: number;
}

function Dashboard() {
  const { user, roles } = useCurrentUser();
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [emp, sales, expenses, purchases, prod, meds] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("sales").select("montant_total"),
        supabase.from("expenses").select("montant"),
        supabase.from("purchases").select("montant_total"),
        supabase.from("productions").select("mortalite"),
        supabase.from("medicines").select("id, stock").lt("stock", 10),
      ]);
      setS({
        employees: emp.count ?? 0,
        salesTotal: (sales.data ?? []).reduce((a, r) => a + Number(r.montant_total ?? 0), 0),
        expensesTotal: (expenses.data ?? []).reduce((a, r) => a + Number(r.montant ?? 0), 0),
        purchasesTotal: (purchases.data ?? []).reduce((a, r) => a + Number(r.montant_total ?? 0), 0),
        mortality: (prod.data ?? []).reduce((a, r) => a + Number(r.mortalite ?? 0), 0),
        medsLow: meds.data?.length ?? 0,
      });
    })();
  }, []);

  const cards = s ? [
    { label: "Employés", value: s.employees, icon: Users, color: "text-primary" },
    { label: "Chiffre d'affaires", value: formatFCFA(s.salesTotal), icon: ShoppingCart, color: "text-primary" },
    { label: "Dépenses cumulées", value: formatFCFA(s.expensesTotal), icon: Coins, color: "text-destructive" },
    { label: "Achats cumulés", value: formatFCFA(s.purchasesTotal), icon: ShoppingCart, color: "text-muted-foreground" },
    { label: "Marge brute", value: formatFCFA(s.salesTotal - s.expensesTotal - s.purchasesTotal), icon: Coins, color: "text-primary" },
    { label: "Mortalité totale", value: s.mortality, icon: Drumstick, color: "text-destructive" },
    { label: "Médicaments < 10", value: s.medsLow, icon: Pill, color: "text-accent-foreground" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenue {user?.email}</h1>
        <p className="text-sm text-muted-foreground">Rôles : {roles.join(", ") || "employé"}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</div>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
          </Card>
        ))}
      </div>
      {s && s.medsLow > 0 && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="text-sm">Attention : {s.medsLow} médicament(s) en stock faible. Vérifiez le module Médicaments.</div>
        </Card>
      )}
    </div>
  );
}