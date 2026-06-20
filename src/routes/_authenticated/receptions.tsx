import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/receptions")({
  component: () => (
    <CrudModule
      title="Réceptions"
      description="Entrées de poussins, porcelets, canetons et matières premières."
      table="receptions"
      orderBy={{ column: "date_reception" }}
      fields={[
        { key: "date_reception", label: "Date & heure", type: "datetime", required: true },
        { key: "type_animal", label: "Type", type: "select", required: true, options: [
          { value: "poussin", label: "Poussins" }, { value: "porcelet", label: "Porcelets" },
          { value: "caneton", label: "Canetons" }, { value: "matiere_premiere", label: "Matière première" },
        ]},
        { key: "description", label: "Description", type: "text" },
        { key: "quantite", label: "Quantité", type: "number", required: true },
        { key: "unite", label: "Unité", type: "text", placeholder: "kg, sac, tête" },
        { key: "fournisseur", label: "Fournisseur", type: "text" },
        { key: "prix_unitaire", label: "Prix unitaire (FCFA)", type: "money" },
        { key: "cout_total", label: "Coût total (FCFA)", type: "money" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});