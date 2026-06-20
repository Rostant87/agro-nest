import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { departments } from "@/lib/locale";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — Suiss Ferme" }] }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

const signUpSchema = z.object({
  full_name: z.string().min(2, "Nom requis").max(120),
  email: z.string().email("Email invalide"),
  phone: z.string().max(40).optional(),
  address: z.string().max(255).optional(),
  department: z.string().min(1, "Département requis"),
  password: z.string().min(6, "6 caractères minimum"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bienvenue !");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const parsed = signUpSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          department: parsed.data.department,
        },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Update profile with department since trigger only seeds basic fields
    const { data: ures } = await supabase.auth.getUser();
    if (ures.user) {
      await supabase
        .from("profiles")
        .update({ department: parsed.data.department as never })
        .eq("id", ures.user.id);
    }
    setLoading(false);
    toast.success("Compte créé ! Bienvenue.");
    navigate({ to: "/dashboard" });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) {
      setLoading(false);
      return toast.error("Connexion Google échouée");
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  const handleReset = async () => {
    const email = prompt("Saisissez votre email pour recevoir le lien de réinitialisation :");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Email envoyé si le compte existe.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative bg-sidebar text-sidebar-foreground p-12">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">SF</div>
          Suiss Ferme Limited
        </Link>
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold leading-tight">Gérez votre ferme avec confiance.</h2>
          <p className="mt-3 text-sidebar-foreground/80">Élevage, provenderie, ventes, employés, médicaments et vidéosurveillance — depuis un seul tableau de bord.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Se connecter</Button>
              </form>
              <button onClick={handleReset} className="text-sm text-muted-foreground hover:text-primary block w-full text-center">
                Mot de passe oublié ?
              </button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
                Continuer avec Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 mt-4">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input id="full_name" name="full_name" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" name="phone" placeholder="+237…" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" name="address" placeholder="Quartier, ville" />
                </div>
                <div>
                  <Label>Département</Label>
                  <Select name="department" required>
                    <SelectTrigger><SelectValue placeholder="Choisir un département" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password2">Mot de passe</Label>
                  <Input id="password2" name="password" type="password" required minLength={6} autoComplete="new-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Créer mon compte</Button>
              </form>
              <p className="text-xs text-muted-foreground text-center">
                Le premier compte créé devient automatiquement Super Administrateur.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
