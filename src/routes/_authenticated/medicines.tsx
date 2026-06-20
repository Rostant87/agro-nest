import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/medicines")({
  component: () => (
    <CrudModule
      title="Médicaments & Vaccins"
      description="Stock vétérinaire — antibiotiques, vaccins, vitamines."
      table="medicines"
      orderBy={{ column: "created_at" }}
      fields={[
        { key: "nom", label: "Nom du produit", type: "text", required: true },
        { key: "type_produit", label: "Type", type: "select", options: [
          { value: "antibiotique", label: "Antibiotique" }, { value: "vaccin", label: "Vaccin" },
          { value: "vitamine", label: "Vitamine" }, { value: "antiparasitaire", label: "Antiparasitaire" },
        ]},
        { key: "espece_cible", label: "Espèce cible", type: "select", options: [
          { value: "poulet", label: "Poulets" }, { value: "porc", label: "Porcs" }, { value: "canard", label: "Canards" }, { value: "tous", label: "Tous" },
        ]},
        { key: "stock", label: "Stock", type: "number" },
        { key: "unite", label: "Unité", type: "text", placeholder: "flacon, dose, ml" },
        { key: "posologie", label: "Posologie", type: "text" },
        { key: "date_peremption", label: "Date de péremption", type: "date" },
        { key: "date_administration", label: "Dernière administration", type: "datetime" },
        { key: "fournisseur", label: "Fournisseur", type: "text" },
        { key: "prix_unitaire", label: "Prix unitaire (FCFA)", type: "money" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});