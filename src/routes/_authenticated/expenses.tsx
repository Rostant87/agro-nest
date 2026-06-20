import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: () => (
    <CrudModule
      title="Dépenses"
      description="Toutes les charges et dépenses de la ferme."
      table="expenses"
      orderBy={{ column: "date_depense" }}
      fields={[
        { key: "date_depense", label: "Date & heure", type: "datetime", required: true },
        { key: "categorie", label: "Catégorie", type: "select", required: true, options: [
          { value: "salaire", label: "Salaire" }, { value: "eau", label: "Eau" }, { value: "electricite", label: "Électricité" },
          { value: "transport", label: "Transport" }, { value: "carburant", label: "Carburant" }, { value: "entretien", label: "Entretien" },
          { value: "autre", label: "Autre" },
        ]},
        { key: "description", label: "Description", type: "text", required: true },
        { key: "montant", label: "Montant (FCFA)", type: "money", required: true },
        { key: "beneficiaire", label: "Bénéficiaire", type: "text" },
        { key: "mode_paiement", label: "Mode de paiement", type: "select", options: [
          { value: "espece", label: "Espèces" }, { value: "mobile_money", label: "Mobile Money" }, { value: "virement", label: "Virement" },
        ]},
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});