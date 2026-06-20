import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/purchases")({
  component: () => (
    <CrudModule
      title="Achats"
      description="Achats d'intrants et de matières premières."
      table="purchases"
      orderBy={{ column: "date_achat" }}
      fields={[
        { key: "date_achat", label: "Date & heure", type: "datetime", required: true },
        { key: "fournisseur", label: "Fournisseur", type: "text", required: true },
        { key: "article", label: "Article", type: "text", required: true },
        { key: "quantite", label: "Quantité", type: "number" },
        { key: "unite", label: "Unité", type: "text" },
        { key: "prix_unitaire", label: "Prix unitaire (FCFA)", type: "money" },
        { key: "montant_total", label: "Montant total (FCFA)", type: "money", required: true },
        { key: "mode_paiement", label: "Mode de paiement", type: "select", options: [
          { value: "espece", label: "Espèces" }, { value: "mobile_money", label: "Mobile Money" }, { value: "virement", label: "Virement" },
        ]},
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});