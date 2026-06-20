import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/productions")({
  component: () => (
    <CrudModule
      title="Production"
      description="Suivi des bandes et des lots — poulets, porcs, canards."
      table="productions"
      orderBy={{ column: "date_production" }}
      fields={[
        { key: "date_production", label: "Date & heure", type: "datetime", required: true },
        { key: "type_elevage", label: "Type d'élevage", type: "select", required: true, options: [
          { value: "poulet", label: "Poulets de chair" }, { value: "porc", label: "Porcs" }, { value: "canard", label: "Canards" },
        ]},
        { key: "bande_lot", label: "Bande / Lot", type: "text" },
        { key: "effectif_debut", label: "Effectif initial", type: "number" },
        { key: "effectif_actuel", label: "Effectif actuel", type: "number" },
        { key: "mortalite", label: "Mortalité", type: "number" },
        { key: "poids_moyen_kg", label: "Poids moyen (kg)", type: "number" },
        { key: "aliment_consomme_kg", label: "Aliment consommé (kg)", type: "number" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});