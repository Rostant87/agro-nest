import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/clients")({
  component: () => (
    <CrudModule
      title="Clients"
      description="Fichier clients de la ferme."
      table="clients"
      orderBy={{ column: "created_at" }}
      fields={[
        { key: "nom", label: "Nom", type: "text", required: true },
        { key: "telephone", label: "Téléphone", type: "text", placeholder: "+237…" },
        { key: "email", label: "Email", type: "text" },
        { key: "ville", label: "Ville", type: "text" },
        { key: "adresse", label: "Adresse", type: "text" },
        { key: "type_client", label: "Type", type: "select", options: [
          { value: "particulier", label: "Particulier" }, { value: "grossiste", label: "Grossiste" }, { value: "restaurant", label: "Restaurant" },
        ]},
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  ),
});