import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drumstick, PiggyBank, Bird, Wheat, ShieldCheck, Camera, LineChart, Users } from "lucide-react";
import heroImg from "@/assets/farm-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Suiss Ferme Limited — Gestion intégrée de la ferme" },
      { name: "description", content: "Système de gestion pour ferme camerounaise : poulets de chair, porcs, canards et provenderie." },
      { property: "og:title", content: "Suiss Ferme Limited" },
      { property: "og:description", content: "Plateforme de gestion intégrée — employés, production, ventes, dépenses, vidéosurveillance." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              SF
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Suiss Ferme</div>
              <div className="text-xs text-muted-foreground">Limited — Cameroun</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary">Fonctionnalités</a>
            <a href="#modules" className="hover:text-primary">Modules</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Se connecter</Link></Button>
            <Button asChild><Link to="/auth" search={{ mode: "signup" } as never}>Commencer</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Ferme camerounaise au lever du soleil" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground border border-accent/40">
              🇨🇲 Pensé pour les fermes du Cameroun
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
              La gestion de votre ferme, <span className="text-primary">enfin simple</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Pilotez vos élevages de poulets, porcs, canards et votre provenderie depuis une seule plateforme. Suivi des bandes, ventes en FCFA, médicaments, employés et vidéosurveillance — tout est intégré.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/auth">Accéder à mon espace</Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#modules">Découvrir les modules</a></Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Sécurisé par rôle", text: "Seul l'administrateur peut créer, modifier ou supprimer. Les employés consultent et mettent à jour leur fiche." },
            { icon: LineChart, title: "Tableau de bord temps réel", text: "Chiffre d'affaires, mortalité, stocks de provende et marges agrégés automatiquement." },
            { icon: Camera, title: "Vidéosurveillance intégrée", text: "Connectez vos caméras IP (HLS/RTSP) directement depuis la plateforme." },
          ].map((f) => (
            <Card key={f.title} className="p-6">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="modules" className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold">Tous les modules pour une ferme complète</h2>
          <p className="mt-2 text-muted-foreground">Conçu pour les fermes camerounaises : devise FCFA, fuseau Africa/Douala, mobile money.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, name: "Employés", text: "Fiches avec photo, département, contact." },
              { icon: Drumstick, name: "Poulets de chair", text: "Bandes, mortalité, poids moyen, FCR." },
              { icon: PiggyBank, name: "Élevage porcin", text: "Lots, croissance, alimentation." },
              { icon: Bird, name: "Canards", text: "Effectifs et production." },
              { icon: Wheat, name: "Provenderie", text: "Formules, ingrédients, stocks." },
              { icon: LineChart, name: "Ventes & Clients", text: "Factures, mobile money, suivi." },
              { icon: ShieldCheck, name: "Médicaments", text: "Stock, vaccins, péremption." },
              { icon: Camera, name: "Surveillance", text: "Flux vidéo HLS multi-caméras." },
            ].map((m) => (
              <Card key={m.name} className="p-5">
                <m.icon className="h-6 w-6 text-accent-foreground" />
                <div className="mt-2 font-semibold">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.text}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Suiss Ferme Limited — Douala, Cameroun</div>
          <div>Contact : +237 6 52 02 34 90 · contact@suissferme.cm</div>
        </div>
      </footer>
    </div>
  );
}
