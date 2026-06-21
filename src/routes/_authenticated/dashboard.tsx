import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatFCFA } from "@/lib/locale";
import { Drumstick, Coins, ShoppingCart, Users, Pill, AlertTriangle, Send, Settings as SettingsIcon, Radio } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const [s, setS] = useState<Stats | null>(null);
  const [employerPhone, setEmployerPhone] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [phoneOpen, setPhoneOpen] = useState(false);

  const load = async () => {
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
  };

  useEffect(() => {
    load();
    (async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "employer_whatsapp").maybeSingle();
      if (data?.value) { setEmployerPhone(data.value); setPhoneDraft(data.value); }
    })();
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "purchases" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "productions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "medicines" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const savePhone = async () => {
    const cleaned = phoneDraft.replace(/[^\d+]/g, "");
    if (!/^\+\d{8,15}$/.test(cleaned)) {
      toast.error("Format invalide. Utilisez +237XXXXXXXXX");
      return;
    }
    const { error } = await supabase.from("app_settings").upsert({ key: "employer_whatsapp", value: cleaned, updated_by: user?.id, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    setEmployerPhone(cleaned);
    setPhoneOpen(false);
    toast.success("Numéro enregistré");
  };

  const sendWhatsApp = () => {
    if (!s) return;
    if (!employerPhone) { toast.error("Configurez d'abord le numéro WhatsApp de l'employeur"); setPhoneOpen(true); return; }
    const today = new Date().toLocaleDateString("fr-FR", { dateStyle: "long" });
    const message = `📊 *Rapport Suiss Ferme* — ${today}\n\n` +
      `👥 Employés : ${s.employees}\n` +
      `💰 Chiffre d'affaires : ${formatFCFA(s.salesTotal)}\n` +
      `🧾 Achats : ${formatFCFA(s.purchasesTotal)}\n` +
      `💸 Dépenses : ${formatFCFA(s.expensesTotal)}\n` +
      `📈 Marge brute : ${formatFCFA(s.salesTotal - s.expensesTotal - s.purchasesTotal)}\n` +
      `🐔 Mortalité cumulée : ${s.mortality}\n` +
      `💊 Médicaments en stock faible : ${s.medsLow}`;
    const phone = employerPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bienvenue {user?.email}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Rôles : {roles.join(", ") || "employé"}
            <span className="inline-flex items-center gap-1 text-xs text-primary"><Radio className="h-3 w-3 animate-pulse" /> Sync temps réel actif</span>
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={sendWhatsApp} className="gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white">
              <Send className="h-4 w-4" /> Envoyer rapport WhatsApp
            </Button>
            <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Configurer le numéro de l'employeur"><SettingsIcon className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Numéro WhatsApp de l'employeur</DialogTitle></DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="phone">Format international (avec +)</Label>
                  <Input id="phone" value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} placeholder="+237 6XX XX XX XX" />
                  <p className="text-xs text-muted-foreground">Ex: +237691234567. Ce numéro recevra les rapports envoyés depuis le bouton WhatsApp.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPhoneOpen(false)}>Annuler</Button>
                  <Button onClick={savePhone}>Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
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