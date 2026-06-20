import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/sales")({
  component: () => (
    <CrudModule
      title="Ventes"
      description="Toutes les ventes de la ferme."
      table="sales"
      orderBy={{ column: "date_vente" }}
      fields={[
        { key: "date_vente", label: "Date & heure", type: "datetime", required: true },
        { key: "produit", label: "Produit", type: "text", required: true },
        { key: "quantite", label: "Quantité", type: "number", required: true },
        { key: "unite", label: "Unité", type: "text" },
        { key: "prix_unitaire", label: "Prix unitaire (FCFA)", type: "money", required: true },
        { key: "montant_total", label: "Montant total (FCFA)", type: "money", required: true },
        { key: "mode_paiement", label: "Mode de paiement", type: "select", options: [
          { value: "espece", label: "Espèces" }, { value: "mobile_money", label: "Mobile Money" }, { value: "virement", label: "Virement" },
        ]},
        { key: "statut", label: "Statut", type: "select", options: [
          { value: "paye", label: "Payé" }, { value: "partiel", label: "Partiel" }, { value: "impaye", label: "Impayé" },
        ]},
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});