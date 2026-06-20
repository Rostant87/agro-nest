import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF(opts: {
  title: string;
  subtitle?: string;
  columns: { header: string; dataKey: string }[];
  rows: Record<string, unknown>[];
  filename?: string;
}) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.setTextColor(40, 80, 40);
  doc.text("Suiss Ferme Limited", 14, 16);
  doc.setFontSize(12);
  doc.setTextColor(60);
  doc.text(opts.title, 14, 24);
  if (opts.subtitle) {
    doc.setFontSize(9);
    doc.text(opts.subtitle, 14, 30);
  }
  doc.setFontSize(8);
  doc.text(
    `Exporté le ${new Intl.DateTimeFormat("fr-CM", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Douala",
    }).format(new Date())}`,
    14,
    opts.subtitle ? 35 : 30,
  );

  autoTable(doc, {
    startY: opts.subtitle ? 40 : 35,
    head: [opts.columns.map((c) => c.header)],
    body: opts.rows.map((r) =>
      opts.columns.map((c) => {
        const v = r[c.dataKey];
        if (v === null || v === undefined) return "—";
        return String(v);
      }),
    ),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [60, 110, 60], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 240, 230] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${opts.filename ?? opts.title.replace(/\s+/g, "_")}.pdf`);
}