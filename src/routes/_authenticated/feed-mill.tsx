import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/feed-mill")({
  component: () => (
    <CrudModule
      title="Provenderie"
      description="Fabrication d'aliments — formules, ingrédients, stocks."
      table="feed_mill"
      orderBy={{ column: "date_fabrication" }}
      fields={[
        { key: "date_fabrication", label: "Date & heure", type: "datetime", required: true },
        { key: "formule", label: "Formule", type: "select", required: true, options: [
          { value: "demarrage", label: "Démarrage" }, { value: "croissance", label: "Croissance" },
          { value: "finition", label: "Finition" }, { value: "ponte", label: "Ponte" },
        ]},
        { key: "ingredient_principal", label: "Ingrédient principal", type: "text", placeholder: "maïs, soja, son" },
        { key: "quantite_produite_kg", label: "Quantité produite (kg)", type: "number" },
        { key: "cout_production", label: "Coût production (FCFA)", type: "money" },
        { key: "stock_restant_kg", label: "Stock restant (kg)", type: "number" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});