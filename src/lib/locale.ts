export const departments = [
  { value: "direction", label: "Direction" },
  { value: "production_poulet", label: "Production — Poulets de chair" },
  { value: "production_porc", label: "Production — Porcs" },
  { value: "production_canard", label: "Production — Canards" },
  { value: "provenderie", label: "Provenderie" },
  { value: "reception", label: "Réception" },
  { value: "ventes", label: "Ventes" },
  { value: "achats", label: "Achats" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "maintenance", label: "Maintenance" },
] as const;

export type DepartmentValue = (typeof departments)[number]["value"];

export const departmentLabel = (v?: string | null) =>
  departments.find((d) => d.value === v)?.label ?? "—";

const fcfa = new Intl.NumberFormat("fr-CM", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

export const formatFCFA = (n: number | string | null | undefined) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  if (!Number.isFinite(v)) return "—";
  return fcfa.format(v as number);
};

export const formatDateTime = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-CM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Douala",
  }).format(date);
};

export const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-CM", {
    dateStyle: "medium",
    timeZone: "Africa/Douala",
  }).format(date);
};