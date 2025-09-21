// src/utils/generateReport.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * ===== Helpers =====
 */
function prettyName(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function parseSeconds(val: any): number | null {
  if (val == null) return null;
  if (typeof val === "number") return val;
  const s = String(val).trim();
  const m = s.match(/([\d.]+)\s*s/i);
  if (m) return parseFloat(m[1]);
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

function suggestForPerf(key: string, value: any) {
  const k = key.toLowerCase();
  const v = parseSeconds(value);
  if (k.includes("performance") && typeof value === "number") {
    if (value >= 90) return "Excellent performance.";
    if (value >= 50) return "Improve image compression, caching, script loading.";
    return "Low score: optimize images, reduce JS, enable CDN.";
  }
  if (k.includes("fcp")) {
    if (v && v > 4) return "Slow FCP: optimize CSS, fonts, defer non-critical JS.";
    return "Good FCP.";
  }
  if (k.includes("lcp")) {
    if (v && v > 4) return "Critical LCP: compress hero images, lazy-load others.";
    return "Good LCP.";
  }
  return "";
}

function suggestForSEO(issue: string) {
  const s = issue.toLowerCase();
  if (s.includes("meta")) return "Add proper meta description (50–160 chars).";
  if (s.includes("title")) return "Ensure unique title with keywords.";
  if (s.includes("404")) return "Fix broken links.";
  if (s.includes("sitemap")) return "Add sitemap.xml and submit to Search Console.";
  return "Follow SEO best practices.";
}

/**
 * ===== PDF Generator =====
 */
export function generatePDFReport(report: any) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /** ========= COVER PAGE ========= */
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text("WebAudit Pro", pageWidth / 2, pageHeight / 3, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(18);
  doc.setTextColor(200, 220, 255);
  doc.text("Website Audit Report", pageWidth / 2, pageHeight / 3 + 40, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(220, 220, 220);
  const urlText = report?.url || report?.security?.url || "Unknown URL";
  doc.text(`Site: ${urlText}`, pageWidth / 2, pageHeight / 2, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight / 2 + 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("Powered by WebAudit Pro", pageWidth / 2, pageHeight - 40, { align: "center" });

  doc.addPage();

  /** ========= MAIN REPORT ========= */
  const margin = 40;
  let cursorY = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("Detailed Website Report", margin, cursorY);
  cursorY += 30;

  /** 1) Security */
  if (report.security) {
    doc.setFontSize(14);
    doc.text("🔒 Security", margin, cursorY);
    cursorY += 16;

    const secRows: any[] = [
      ["HTTPS", report.security.https ? "Yes" : "No", report.security.https ? "✅ Good" : "❌ Enable HTTPS (TLS cert)."],
      ["Reachable", report.security.reachable ? "Yes" : "No", report.security.reachable ? "✅ OK" : "❌ Fix DNS/hosting issues."],
      ["Mixed Content", report.security.mixedContent ? "Yes" : "No", report.security.mixedContent ? "❌ Replace HTTP resources." : "✅ Clean"],
    ];

    (report.security.missingHeaders || []).forEach((h: string) => {
      const expl = report.security.missingHeadersExplanation?.[h] || "";
      secRows.push([`Header: ${h}`, "Missing", expl || "Add this header in server config."]);
    });

    autoTable(doc, {
      startY: cursorY,
      head: [["Check", "Status", "Recommendation"]],
      body: secRows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [80, 0, 120], textColor: 255 },
      theme: "grid",
    });
    cursorY = (doc as any).lastAutoTable.finalY + 30;
  }

  /** 2) Performance */
  if (report.performance) {
    doc.setFontSize(14);
    doc.text("⚡ Performance", margin, cursorY);
    cursorY += 16;

    const perf = report.performance;
    const perfRows: any[] = [];

    if (typeof perf.performanceScore === "number") {
      const score = perf.performanceScore;
      perfRows.push([
        "Performance Score",
        String(score),
        score >= 90 ? "✅ Excellent" : score >= 50 ? "⚠ Needs optimization" : "❌ Poor",
      ]);
    }

    Object.entries(perf.audits || {}).forEach(([k, v]) => {
      if (/explanation/i.test(k)) return;
      perfRows.push([prettyName(k), String(v ?? "—"), suggestForPerf(k, v)]);
    });

    autoTable(doc, {
      startY: cursorY,
      head: [["Metric", "Value", "Recommendation"]],
      body: perfRows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [0, 100, 200], textColor: 255 },
      theme: "grid",
      columnStyles: { 2: { cellWidth: 220 } },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 30;
  }

  /** 3) SEO */
  if (report.seo) {
    doc.setFontSize(14);
    doc.text("🌐 SEO", margin, cursorY);
    cursorY += 16;

    const seoRows: any[] = [];
    if (Array.isArray(report.seo.issues)) {
      report.seo.issues.forEach((i: string) => seoRows.push([i, "❌ Issue", suggestForSEO(i)]));
    } else if (typeof report.seo.seoScore === "number") {
      seoRows.push(["SEO Score", String(report.seo.seoScore), report.seo.seoScore >= 90 ? "✅ Great" : "⚠ Improve"]);
    }

    autoTable(doc, {
      startY: cursorY,
      head: [["Check", "Status", "Recommendation"]],
      body: seoRows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [0, 150, 0], textColor: 255 },
      theme: "grid",
      columnStyles: { 2: { cellWidth: 220 } },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 30;
  }

  /** 4) Accessibility */
  if (report.accessibility) {
    doc.setFontSize(14);
    doc.text("♿ Accessibility", margin, cursorY);
    cursorY += 16;

    const accRows = report.accessibility.map((a: any) => [
      a.id || "Unknown",
      a.impact || "—",
      a.description || "",
      a.helpUrl || "",
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [["Rule", "Impact", "Description", "Fix Suggestion"]],
      body: accRows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [200, 150, 0], textColor: 0 },
      theme: "grid",
      columnStyles: { 2: { cellWidth: 180 }, 3: { cellWidth: 160 } },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 30;
  }

  /** 📌 Summary */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("📌 Top Action Items", margin, cursorY);
  cursorY += 20;

  const summary: string[] = [];
  if (report.security?.https === false) summary.push("Enable HTTPS with TLS certificate.");
  if (report.security?.missingHeaders?.length) summary.push(`Add headers: ${report.security.missingHeaders.join(", ")}`);
  if (report.performance?.performanceScore < 50) summary.push("Improve Core Web Vitals: optimize images, reduce JS, use CDN.");
  if (report.accessibility?.length) summary.push("Fix accessibility issues starting with critical ones.");
  if (!summary.length) summary.push("✅ No critical issues found.");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  summary.forEach((s, i) => doc.text(`• ${s}`, margin + 10, cursorY + i * 16));

  /** Save */
  const safeHost = (urlText || "report").replace(/[:/\\?&=#\s]/g, "-").slice(0, 40);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  doc.save(`webaudit_${safeHost}_${ts}.pdf`);
}
