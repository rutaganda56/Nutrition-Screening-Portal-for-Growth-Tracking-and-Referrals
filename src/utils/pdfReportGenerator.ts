import { jsPDF } from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface PdfReportData {
  // KPI cards
  totalScreenings: number;
  atRiskPatients: number;
  activeReferrals: number;
  completedReferrals: number;
  totalServiceRequests: number;
  successRatePercent: number;

  // Chart / table datasets (same shape as page state)
  screeningTrends: { month: string; screenings: number; malnourished: number; severe: number }[];
  ageDistribution: { name: string; value: number }[];
  severityData: { name: string; value: number; color: string }[];
  facilityPerformance: { facility: string; screenings: number; rate: number }[];
  serviceRequestData: { facility: string; pending: number; resolved: number; total: number }[];

  // Entity summary counts
  entityCounts: {
    patients: number;
    screenings: number;
    serviceRequests: number;
    facilities: number;
  };

  // Metadata
  dateRange: string; // filter key: 'all' | '30days' | '90days' | '6months'
  userName: string;
  userRole: string;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const BRAND_GREEN: [number, number, number] = [16, 185, 129];    // #10b981
const BRAND_DARK: [number, number, number] = [17, 24, 39];       // #111827
const GRAY_600: [number, number, number] = [75, 85, 99];
const GRAY_400: [number, number, number] = [156, 163, 175];
const WHITE: [number, number, number] = [255, 255, 255];
const ZEBRA: [number, number, number] = [249, 250, 251];         // #f9fafb
const TABLE_HEADER_BG: [number, number, number] = [243, 244, 246];

const PAGE_MARGIN = 20;
const PAGE_WIDTH_A4 = 210;
const CONTENT_WIDTH = PAGE_WIDTH_A4 - PAGE_MARGIN * 2;

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function generateReportId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `NT-RPT-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function formatTimestamp(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZoneName: 'short', hour12: true,
  };
  return now.toLocaleString('en-US', options);
}

function computeDateRangeLabel(dateRange: string): string {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (dateRange === 'all') return `All Records (as of ${fmt(now)})`;

  const start = new Date(now);
  if (dateRange === '30days') start.setDate(start.getDate() - 30);
  else if (dateRange === '90days') start.setDate(start.getDate() - 90);
  else if (dateRange === '6months') start.setMonth(start.getMonth() - 6);

  return `${fmt(start)} – ${fmt(now)}`;
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function humanRole(role: string): string {
  const map: Record<string, string> = {
    administrator: 'Administrator',
    doctor: 'Doctor',
    communityhealthworker: 'Community Health Worker',
  };
  return map[role] || role;
}

// ────────────────────────────────────────────────────────────
// Footer — called on every page via didDrawPage
// ────────────────────────────────────────────────────────────

function drawFooter(doc: jsPDF, reportId: string) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    const y = pageHeight - 10;

    // Divider line

    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_400);

    // Left — confidentiality
    doc.text('NutriTrack — Internal Use Only', PAGE_MARGIN, y);

    // Center — page numbers
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH_A4 / 2, y, { align: 'center' });

    // Right — report ID
    doc.text(reportId, PAGE_WIDTH_A4 - PAGE_MARGIN, y, { align: 'right' });
  }
}

// ────────────────────────────────────────────────────────────
// Table helper
// ────────────────────────────────────────────────────────────

let tableCounter = 0;

function addTable(
  doc: jsPDF,
  startY: number,
  caption: string,
  head: string[][],
  body: (string | number)[][],
  options?: {
    totalsRow?: (string | number)[];
    footnotes?: string[];
    columnAlignments?: ('left' | 'right' | 'center')[];
  },
): number {
  tableCounter++;
  const tableCaption = `Table ${tableCounter}: ${caption}`;

  // Caption above table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text(tableCaption, PAGE_MARGIN, startY);
  startY += 5;

  // Build body with optional totals
  const fullBody = [...body.map(row => row.map(String))];
  if (options?.totalsRow) {
    fullBody.push(options.totalsRow.map(String));
  }

  // Column styles for alignment
  const columnStyles: Record<number, { halign: 'left' | 'right' | 'center' }> = {};
  if (options?.columnAlignments) {
    options.columnAlignments.forEach((align, i) => {
      columnStyles[i] = { halign: align };
    });
  }

  const tableConfig: UserOptions = {
    startY,
    head,
    body: fullBody,
    theme: 'grid',
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    headStyles: {
      fillColor: TABLE_HEADER_BG,
      textColor: BRAND_DARK,
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
    bodyStyles: {
      fontSize: 8,
      textColor: BRAND_DARK,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: ZEBRA,
    },
    columnStyles,
    didParseCell: (data: any) => {
      // Style totals row
      if (options?.totalsRow && data.section === 'body' && data.row.index === fullBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [229, 231, 235]; // gray-200
      }
    },
    // Prevent rows from splitting across pages
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
  };

  autoTable(doc, tableConfig);

  let finalY = (doc as any).lastAutoTable.finalY + 3;

  // Footnotes
  if (options?.footnotes && options.footnotes.length > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...GRAY_600);
    options.footnotes.forEach((note, i) => {
      // Check if we need a new page
      if (finalY > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        finalY = PAGE_MARGIN + 5;
      }
      doc.text(`${i + 1}. ${note}`, PAGE_MARGIN + 2, finalY);
      finalY += 3.5;
    });
  }

  return finalY + 6;
}

// ────────────────────────────────────────────────────────────
// Main export function
// ────────────────────────────────────────────────────────────

export async function generateProfessionalPdfReport(data: PdfReportData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;

  const pageHeight = doc.internal.pageSize.getHeight();

  // ────────────── 1. COVER / HEADER BLOCK ──────────────
  // Organization name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('NutriTrack', PAGE_MARGIN, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);

  // Horizontal rule

  // Report title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Reports & Analytics', PAGE_MARGIN, 42);
  doc.setFontSize(14);
  doc.setTextColor(...GRAY_600);
  doc.text('Performance Report', PAGE_MARGIN, 50);

  // Subtitle — date range
  const dateLabel = computeDateRangeLabel(data.dateRange);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text(`Period: ${dateLabel}`, PAGE_MARGIN, 58);

  // Report ID
  doc.setFontSize(9);
  doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });

  // ────────────── 2. METADATA BLOCK ──────────────
  doc.setDrawColor(...GRAY_400);
  doc.setLineWidth(0.2);
  doc.line(PAGE_MARGIN, 63, PAGE_WIDTH_A4 - PAGE_MARGIN, 63);

  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_600);
  doc.setFont('helvetica', 'normal');

  const metaY = 69;
  const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text('NutriTrack System (Automated)', col2X + 22, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Internal Use Only', col2X + 22, metaY + 5);

  doc.setDrawColor(...GRAY_400);
  doc.line(PAGE_MARGIN, metaY + 10, PAGE_WIDTH_A4 - PAGE_MARGIN, metaY + 10);

  // ────────────── 3. EXECUTIVE SUMMARY ──────────────
  let y = metaY + 18;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Executive Summary', PAGE_MARGIN, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);

  const totalPatientsForSeverity = data.severityData.reduce((sum, d) => sum + d.value, 0);
  const atRiskPct = totalPatientsForSeverity > 0
    ? ((data.atRiskPatients / totalPatientsForSeverity) * 100).toFixed(1)
    : '0.0';

  const summaryLines = [
    `This report summarizes the analytics data displayed on the NutriTrack Reports & Analytics dashboard for the period: ${dateLabel}.`,
    '',
    `A total of ${fmtNum(data.totalScreenings)} nutrition screenings have been recorded across ${fmtNum(data.entityCounts.facilities)} health facilities. ` +
    `Of the patients screened, ${fmtNum(data.atRiskPatients)} (${atRiskPct}%) are classified as at-risk (MAM or SAM), requiring follow-up.`,
    '',
    `There are currently ${fmtNum(data.activeReferrals)} active service requests pending doctor assessment. ` +
    `The overall referral resolution success rate stands at ${data.successRatePercent}% ` +
    `(${fmtNum(data.completedReferrals)} completed out of ${fmtNum(data.totalServiceRequests)} total requests).`,
  ];

  const splitSummary = doc.splitTextToSize(summaryLines.join('\n'), CONTENT_WIDTH);
  doc.text(splitSummary, PAGE_MARGIN, y);
  y += splitSummary.length * 3.8 + 6;

  // ────────────── 4. DATA TABLES ──────────────

  // --- Table 1: Key Performance Indicators ---
  y = addTable(doc, y, 'Key Performance Indicators', [
    ['Metric', 'Current Value', 'Unit'],
  ], [
    ['Total Screenings', fmtNum(data.totalScreenings), 'count'],
    ['At-Risk Patients (MAM/SAM)', fmtNum(data.atRiskPatients), 'count'],
    ['Active Referrals (Pending)', fmtNum(data.activeReferrals), 'count'],
    ['Completed Referrals', fmtNum(data.completedReferrals), 'count'],
    ['Total Service Requests', fmtNum(data.totalServiceRequests), 'count'],
    ['Referral Success Rate', fmtPct(data.successRatePercent), '%'],
  ], {
    columnAlignments: ['left', 'right', 'center'],
    footnotes: ['At-Risk includes both Moderate Acute Malnutrition (MAM) and Severe Acute Malnutrition (SAM) classifications.'],
  });

  // --- Table 2: Monthly Screening Trends ---
  if (data.screeningTrends.length > 0) {
    // Check for page space
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    const trendsTotal = data.screeningTrends.reduce((acc, r) => ({
      screenings: acc.screenings + r.screenings,
      malnourished: acc.malnourished + r.malnourished,
      severe: acc.severe + r.severe,
    }), { screenings: 0, malnourished: 0, severe: 0 });

    y = addTable(doc, y, 'Monthly Screening Trends', [
      ['Month', 'Total Screenings (count)', 'Malnourished (count)', 'Severe Cases (count)'],
    ], data.screeningTrends.map(r => [
      r.month, fmtNum(r.screenings), fmtNum(r.malnourished), fmtNum(r.severe),
    ]), {
      totalsRow: ['Total', fmtNum(trendsTotal.screenings), fmtNum(trendsTotal.malnourished), fmtNum(trendsTotal.severe)],
      columnAlignments: ['left', 'right', 'right', 'right'],
      footnotes: ['Malnourished includes both MAM and SAM classifications. Severe Cases are SAM only.'],
    });
  }

  // --- Table 3: Patient Age Distribution ---
  if (data.ageDistribution.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    const ageTotal = data.ageDistribution.reduce((sum, d) => sum + d.value, 0);

    y = addTable(doc, y, 'Patient Age Distribution', [
      ['Age Group', 'Patient Count (count)', 'Percentage (%)'],
    ], data.ageDistribution.map(r => [
      r.name,
      fmtNum(r.value),
      ageTotal > 0 ? fmtPct((r.value / ageTotal) * 100) : 'Data unavailable',
    ]), {
      totalsRow: ['Total', fmtNum(ageTotal), '100.0%'],
      columnAlignments: ['left', 'right', 'right'],
    });
  }

  // --- Table 4: Malnutrition Severity Breakdown ---
  if (data.severityData.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    y = addTable(doc, y, 'Malnutrition Severity Breakdown', [
      ['Classification', 'Patient Count (count)', 'Percentage (%)'],
    ], data.severityData.map(r => [
      r.name,
      fmtNum(r.value),
      totalPatientsForSeverity > 0 ? fmtPct((r.value / totalPatientsForSeverity) * 100) : 'Data unavailable',
    ]), {
      totalsRow: ['Total', fmtNum(totalPatientsForSeverity), '100.0%'],
      columnAlignments: ['left', 'right', 'right'],
      footnotes: [
        'Normal: No signs of malnutrition based on MUAC, weight-for-height, and clinical assessment.',
        'MAM (Moderate Acute Malnutrition): Requires supplementary feeding and monitoring.',
        'SAM (Severe Acute Malnutrition): Requires immediate medical intervention and therapeutic feeding.',
      ],
    });
  }

  // --- Table 5: Facility Performance ---
  if (data.facilityPerformance.length > 0) {
    if (y > pageHeight - 50) { doc.addPage(); y = PAGE_MARGIN + 5; }

    const fpTotal = data.facilityPerformance.reduce((acc, r) => ({
      screenings: acc.screenings + r.screenings,
    }), { screenings: 0 });

    y = addTable(doc, y, 'Facility Performance', [
      ['Facility Name', 'Screenings (count)', 'Healthy Rate (%)'],
    ], data.facilityPerformance.map(r => [
      r.facility || 'Data unavailable',
      fmtNum(r.screenings),
      fmtPct(r.rate),
    ]), {
      totalsRow: ['Total', fmtNum(fpTotal.screenings), '—'],
      columnAlignments: ['left', 'right', 'right'],
      footnotes: ['Healthy Rate represents the percentage of Normal classification screenings at each facility.'],
    });
  }

  // --- Table 6: Service Requests by Facility ---
  if (data.serviceRequestData.length > 0) {
    if (y > pageHeight - 50) { doc.addPage(); y = PAGE_MARGIN + 5; }

    const srTotal = data.serviceRequestData.reduce((acc, r) => ({
      pending: acc.pending + r.pending,
      resolved: acc.resolved + r.resolved,
      total: acc.total + r.total,
    }), { pending: 0, resolved: 0, total: 0 });

    const overallRate = srTotal.total > 0 ? (srTotal.resolved / srTotal.total) * 100 : 0;

    y = addTable(doc, y, 'Service Requests by Facility', [
      ['Facility Name', 'Pending (count)', 'Resolved (count)', 'Total (count)', 'Resolution Rate (%)'],
    ], data.serviceRequestData.map(r => [
      r.facility || 'Data unavailable',
      fmtNum(r.pending),
      fmtNum(r.resolved),
      fmtNum(r.total),
      r.total > 0 ? fmtPct((r.resolved / r.total) * 100) : 'Data unavailable',
    ]), {
      totalsRow: ['Total', fmtNum(srTotal.pending), fmtNum(srTotal.resolved), fmtNum(srTotal.total), fmtPct(overallRate)],
      columnAlignments: ['left', 'right', 'right', 'right', 'right'],
      footnotes: ['Service requests are submitted by Community Health Workers for doctor review and assessment.'],
    });
  }

  // --- Table 7: System Entity Summary ---
  if (y > pageHeight - 50) { doc.addPage(); y = PAGE_MARGIN + 5; }

  const entityTotal = data.entityCounts.patients + data.entityCounts.screenings +
    data.entityCounts.serviceRequests + data.entityCounts.facilities;

  y = addTable(doc, y, 'System Entity Summary', [
    ['Entity Type', 'Record Count (count)'],
  ], [
    ['Patients', fmtNum(data.entityCounts.patients)],
    ['Screenings', fmtNum(data.entityCounts.screenings)],
    ['Service Requests', fmtNum(data.entityCounts.serviceRequests)],
    ['Health Facilities', fmtNum(data.entityCounts.facilities)],
  ], {
    totalsRow: ['Total Records', fmtNum(entityTotal)],
    columnAlignments: ['left', 'right'],
  });

  // ────────────── 5. SUPPORTING DETAIL ──────────────
  if (y > pageHeight - 40) { doc.addPage(); y = PAGE_MARGIN + 5; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Supporting Notes', PAGE_MARGIN, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY_600);
  doc.text('Chart Visualizations', PAGE_MARGIN, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const chartNote = doc.splitTextToSize(
    'Interactive charts (area charts, bar charts, and pie charts) for screening trends, patient distribution, facility performance, and referral volumes are available on the NutriTrack web dashboard. Please log in to the Reports & Analytics page for the live interactive experience.',
    CONTENT_WIDTH,
  );
  doc.text(chartNote, PAGE_MARGIN, y);
  y += chartNote.length * 3.5 + 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Data Scope', PAGE_MARGIN, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const scopeNote = doc.splitTextToSize(
    `This report contains exclusively the data presented on the Reports & Analytics dashboard for the selected period (${dateLabel}). Data from other system modules (User Management, Facility Directory, Clinical Summaries) is not included in this report.`,
    CONTENT_WIDTH,
  );
  doc.text(scopeNote, PAGE_MARGIN, y);
  y += scopeNote.length * 3.5 + 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Data Quality', PAGE_MARGIN, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const qualityNote = doc.splitTextToSize(
    'Any fields where data was not available are explicitly marked as "Data unavailable" rather than being omitted. All numeric values use thousands separators and consistent decimal formatting throughout.',
    CONTENT_WIDTH,
  );
  doc.text(qualityNote, PAGE_MARGIN, y);

  // ────────────── 6. FOOTER (every page) ──────────────
  drawFooter(doc, reportId);

  // ────────────── SAVE ──────────────
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_Analytics_Report_${dateStr}.pdf`);
}

// ────────────────────────────────────────────────────────────
// User Management Export
// ────────────────────────────────────────────────────────────

export interface UserManagementPdfData {
  stats: {
    total: number;
    active: number;
    admins: number;
    inactive: number;
  };
  roleDistribution: {
    doctor: number;
    chw: number;
    admin: number;
  };
  users: {
    fullName: string;
    email: string;
    role: string;
    facilityName: string | null;
    status: string;
  }[];
  userName: string;
  userRole: string;
}

export async function generateUserManagementPdfReport(data: UserManagementPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;

  const pageHeight = doc.internal.pageSize.getHeight();

  // ────────────── 1. COVER / HEADER BLOCK ──────────────
  // Organization name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('NutriTrack', PAGE_MARGIN, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);

  // Horizontal rule

  // Report title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('User Management', PAGE_MARGIN, 42);
  doc.setFontSize(14);
  doc.setTextColor(...GRAY_600);
  doc.text('System Users Report', PAGE_MARGIN, 50);

  // Subtitle — date
  const now = new Date();
  const dateLabel = `As of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text(`Period: ${dateLabel}`, PAGE_MARGIN, 58);

  // Report ID
  doc.setFontSize(9);
  doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });

  // ────────────── 2. METADATA BLOCK ──────────────
  doc.setDrawColor(...GRAY_400);
  doc.setLineWidth(0.2);
  doc.line(PAGE_MARGIN, 63, PAGE_WIDTH_A4 - PAGE_MARGIN, 63);

  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_600);
  doc.setFont('helvetica', 'normal');

  const metaY = 69;
  const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text('NutriTrack System (Automated)', col2X + 22, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Internal Use Only', col2X + 22, metaY + 5);

  doc.setDrawColor(...GRAY_400);
  doc.line(PAGE_MARGIN, metaY + 10, PAGE_WIDTH_A4 - PAGE_MARGIN, metaY + 10);

  // ────────────── 3. EXECUTIVE SUMMARY ──────────────
  let y = metaY + 18;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Executive Summary', PAGE_MARGIN, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);

  const summaryLines = [
    `This report provides an overview of the NutriTrack system users and role distributions ${dateLabel.toLowerCase()}.`,
    '',
    `There are currently ${fmtNum(data.stats.total)} registered users in the system. ` +
    `Of these, ${fmtNum(data.stats.active)} are active, and ${fmtNum(data.stats.inactive)} are inactive. ` +
    `The system includes ${fmtNum(data.stats.admins)} users with Administrator access privileges.`
  ];

  const splitSummary = doc.splitTextToSize(summaryLines.join('\n'), CONTENT_WIDTH);
  doc.text(splitSummary, PAGE_MARGIN, y);
  y += splitSummary.length * 3.8 + 6;

  // ────────────── 4. DATA TABLES ──────────────

  y = addTable(doc, y, 'System User Statistics', [
    ['Metric', 'Current Value', 'Unit'],
  ], [
    ['Total Users', fmtNum(data.stats.total), 'users'],
    ['Active Users', fmtNum(data.stats.active), 'users'],
    ['Inactive Users', fmtNum(data.stats.inactive), 'users'],
    ['Administrators', fmtNum(data.stats.admins), 'users'],
  ], {
    columnAlignments: ['left', 'right', 'center'],
  });

  const totalRoles = data.roleDistribution.doctor + data.roleDistribution.chw + data.roleDistribution.admin;
  y = addTable(doc, y, 'User Role Distribution', [
    ['Role', 'Count (users)', 'Percentage (%)'],
  ], [
    ['Doctor', fmtNum(data.roleDistribution.doctor), totalRoles > 0 ? fmtPct((data.roleDistribution.doctor / totalRoles) * 100) : '0%'],
    ['Community Health Worker', fmtNum(data.roleDistribution.chw), totalRoles > 0 ? fmtPct((data.roleDistribution.chw / totalRoles) * 100) : '0%'],
    ['Administrator', fmtNum(data.roleDistribution.admin), totalRoles > 0 ? fmtPct((data.roleDistribution.admin / totalRoles) * 100) : '0%'],
  ], {
    totalsRow: ['Total', fmtNum(totalRoles), '100.0%'],
    columnAlignments: ['left', 'right', 'right'],
  });

  if (data.users.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    y = addTable(doc, y, 'System Users List', [
      ['Name', 'Email', 'Role', 'Facility', 'Status'],
    ], data.users.map(u => [
      u.fullName,
      u.email,
      u.role,
      u.facilityName || '—',
      u.status
    ]), {
      columnAlignments: ['left', 'left', 'left', 'left', 'left'],
    });
  }

  // ────────────── 5. SUPPORTING DETAIL ──────────────
  if (y > pageHeight - 40) { doc.addPage(); y = PAGE_MARGIN + 5; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Supporting Notes', PAGE_MARGIN, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY_600);
  doc.text('Data Scope', PAGE_MARGIN, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const scopeNote = doc.splitTextToSize(
    `This report contains exclusively the user data presented on the User Management dashboard ${dateLabel.toLowerCase()}.`,
    CONTENT_WIDTH,
  );
  doc.text(scopeNote, PAGE_MARGIN, y);

  // ────────────── 6. FOOTER (every page) ──────────────
  drawFooter(doc, reportId);

  // ────────────── SAVE ──────────────
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_SystemUsers_Report_${dateStr}.pdf`);
}

// ────────────────────────────────────────────────────────────
// Admin Dashboard Export
// ────────────────────────────────────────────────────────────

export interface AdminDashboardPdfData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalFacilities: number;
    pendingRequests: number;
    totalRecords: number;
    criticalAlerts: number;
  };
  facilityStats: {
    facility: string;
    normal: number;
    moderate: number;
    severe: number;
    doctors: number;
    chws: number;
  }[];
  severityData: {
    name: string;
    value: number;
  }[];
  alerts: {
    alertType: string;
    patientName: string | null;
    message: string;
    createdAt: string;
  }[];
  userName: string;
  userRole: string;
}

export async function generateAdminDashboardPdfReport(data: AdminDashboardPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;

  const pageHeight = doc.internal.pageSize.getHeight();

  // ────────────── 1. COVER / HEADER BLOCK ──────────────

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('NutriTrack', PAGE_MARGIN, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);


  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('System Overview', PAGE_MARGIN, 42);
  doc.setFontSize(14);
  doc.setTextColor(...GRAY_600);
  doc.text('Admin Dashboard Report', PAGE_MARGIN, 50);

  const now = new Date();
  const dateLabel = `As of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text(`Period: ${dateLabel}`, PAGE_MARGIN, 58);

  doc.setFontSize(9);
  doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });

  // ────────────── 2. METADATA BLOCK ──────────────
  doc.setDrawColor(...GRAY_400);
  doc.setLineWidth(0.2);
  doc.line(PAGE_MARGIN, 63, PAGE_WIDTH_A4 - PAGE_MARGIN, 63);

  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_600);
  doc.setFont('helvetica', 'normal');

  const metaY = 69;
  const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text('NutriTrack System (Automated)', col2X + 22, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Internal Use Only', col2X + 22, metaY + 5);

  doc.setDrawColor(...GRAY_400);
  doc.line(PAGE_MARGIN, metaY + 10, PAGE_WIDTH_A4 - PAGE_MARGIN, metaY + 10);

  // ────────────── 3. EXECUTIVE SUMMARY ──────────────
  let y = metaY + 18;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Executive Summary', PAGE_MARGIN, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);

  const summaryLines = [
    `This report provides a high-level overview of the NutriTrack system status ${dateLabel.toLowerCase()}.`,
    '',
    `The system is currently tracking ${fmtNum(data.stats.totalRecords)} total records across ${fmtNum(data.stats.totalFacilities)} health facilities, ` +
    `supported by ${fmtNum(data.stats.totalUsers)} registered users (${fmtNum(data.stats.activeUsers)} active).`,
    '',
    `There are ${fmtNum(data.stats.pendingRequests)} pending service requests and ${fmtNum(data.stats.criticalAlerts)} critical system alerts requiring attention.`
  ];

  const splitSummary = doc.splitTextToSize(summaryLines.join('\n'), CONTENT_WIDTH);
  doc.text(splitSummary, PAGE_MARGIN, y);
  y += splitSummary.length * 3.8 + 6;

  // ────────────── 4. DATA TABLES ──────────────

  y = addTable(doc, y, 'System Summary Statistics', [
    ['Metric', 'Current Value', 'Unit'],
  ], [
    ['Total Users', fmtNum(data.stats.totalUsers), 'users'],
    ['Total Facilities', fmtNum(data.stats.totalFacilities), 'facilities'],
    ['Total Records', fmtNum(data.stats.totalRecords), 'records'],
    ['Pending Requests', fmtNum(data.stats.pendingRequests), 'requests'],
    ['Critical Alerts', fmtNum(data.stats.criticalAlerts), 'alerts'],
  ], {
    columnAlignments: ['left', 'right', 'center'],
  });

  const totalPatients = data.severityData.reduce((sum, d) => sum + d.value, 0);
  if (data.severityData.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    y = addTable(doc, y, 'Malnutrition Severity Breakdown', [
      ['Classification', 'Patient Count', 'Percentage (%)'],
    ], data.severityData.map(r => [
      r.name,
      fmtNum(r.value),
      totalPatients > 0 ? fmtPct((r.value / totalPatients) * 100) : '0%',
    ]), {
      totalsRow: ['Total', fmtNum(totalPatients), '100.0%'],
      columnAlignments: ['left', 'right', 'right'],
    });
  }

  if (data.facilityStats.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    const facTotal = data.facilityStats.reduce((acc, r) => ({
      normal: acc.normal + r.normal,
      moderate: acc.moderate + r.moderate,
      severe: acc.severe + r.severe,
      doctors: acc.doctors + r.doctors,
      chws: acc.chws + r.chws,
    }), { normal: 0, moderate: 0, severe: 0, doctors: 0, chws: 0 });

    y = addTable(doc, y, 'Health Facility Supervision Overview', [
      ['Facility Name', 'Doctors', 'CHWs', 'Screenings', 'SAM Cases'],
    ], data.facilityStats.map(r => [
      r.facility,
      fmtNum(r.doctors),
      fmtNum(r.chws),
      fmtNum(r.normal + r.moderate + r.severe),
      fmtNum(r.severe),
    ]), {
      totalsRow: [
        'Total',
        fmtNum(facTotal.doctors),
        fmtNum(facTotal.chws),
        fmtNum(facTotal.normal + facTotal.moderate + facTotal.severe),
        fmtNum(facTotal.severe),
      ],
      columnAlignments: ['left', 'center', 'center', 'center', 'center'],
    });
  }

  if (data.alerts.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }

    y = addTable(doc, y, 'Recent System Alerts', [
      ['Type', 'Patient / Target', 'Message', 'Date'],
    ], data.alerts.map(a => [
      a.alertType,
      a.patientName || 'System',
      a.message,
      new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    ]), {
      columnAlignments: ['left', 'left', 'left', 'left'],
    });
  }

  // ────────────── 5. SUPPORTING DETAIL ──────────────
  if (y > pageHeight - 40) { doc.addPage(); y = PAGE_MARGIN + 5; }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_DARK);
  doc.text('Supporting Notes', PAGE_MARGIN, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY_600);
  doc.text('Data Scope', PAGE_MARGIN, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const scopeNote = doc.splitTextToSize(
    `This report contains the system overview metrics presented on the Admin Dashboard ${dateLabel.toLowerCase()}.`,
    CONTENT_WIDTH,
  );
  doc.text(scopeNote, PAGE_MARGIN, y);

  // ────────────── 6. FOOTER (every page) ──────────────
  drawFooter(doc, reportId);

  // ────────────── SAVE ──────────────
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_AdminDashboard_Report_${dateStr}.pdf`);
}

// ────────────────────────────────────────────────────────────
// Doctor Pages Export
// ────────────────────────────────────────────────────────────

export interface DoctorReportsPdfData {
  stats: {
    totalPatients: number;
    totalScreened: number;
    samCases: number;
    mamCases: number;
    normalCases: number;
    referralSuccessRate: number;
  };
  dateRange: string;
  userName: string;
  userRole: string;
}

export async function generateDoctorReportsPdfReport(data: DoctorReportsPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;
  
  // Header
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
  doc.setFontSize(16); doc.setTextColor(...BRAND_DARK);
  doc.text('NutriTrack', PAGE_MARGIN, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600);
  doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);
  
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Reports & Analytics', PAGE_MARGIN, 42);
  doc.setFontSize(14); doc.setTextColor(...GRAY_600);
  doc.text('Clinical Analytics Report', PAGE_MARGIN, 50);
  
  const now = new Date();
  const dateLabel = computeDateRangeLabel(data.dateRange);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600);
  doc.text(`Period: ${dateLabel}`, PAGE_MARGIN, 58);
  doc.setFontSize(9); doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });
  
  // Metadata
  doc.setFontSize(7.5); doc.setTextColor(...GRAY_600); doc.setFont('helvetica', 'normal');
  const metaY = 69; const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;
  doc.setFont('helvetica', 'bold'); doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal'); doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);
  doc.setFont('helvetica', 'bold'); doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal'); doc.text('NutriTrack System (Automated)', col2X + 22, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text('Internal Use Only', col2X + 22, metaY + 5);
  
  // Exec Summary
  let y = metaY + 18;
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Executive Summary', PAGE_MARGIN, y); y += 7;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600);
  const summaryLines = [
    `This report provides a clinical analytics overview of your assigned patients ${dateLabel.toLowerCase()}.`,
    '',
    `You are currently managing ${fmtNum(data.stats.totalPatients)} patients with a total of ${fmtNum(data.stats.totalScreened)} screenings conducted. ` +
    `Among these screenings, ${fmtNum(data.stats.samCases)} Severe Acute Malnutrition (SAM) cases and ${fmtNum(data.stats.mamCases)} Moderate Acute Malnutrition (MAM) cases were identified. ` +
    `Your overall referral resolution success rate is ${data.stats.referralSuccessRate}%.`
  ];
  const splitSummary = doc.splitTextToSize(summaryLines.join('\n'), CONTENT_WIDTH);
  doc.text(splitSummary, PAGE_MARGIN, y); y += splitSummary.length * 3.8 + 6;
  
  // Tables
  y = addTable(doc, y, 'Clinical Performance Metrics', [
    ['Metric', 'Value', 'Unit'],
  ], [
    ['Total Registered Patients', fmtNum(data.stats.totalPatients), 'patients'],
    ['Total Growth Screenings', fmtNum(data.stats.totalScreened), 'screenings'],
    ['Normal Status Cases', fmtNum(data.stats.normalCases), 'cases'],
    ['MAM Detected', fmtNum(data.stats.mamCases), 'cases'],
    ['SAM Detected', fmtNum(data.stats.samCases), 'cases'],
    ['Referral Success Rate', `${data.stats.referralSuccessRate}%`, '%'],
  ], { columnAlignments: ['left', 'right', 'center'] });
  
  drawFooter(doc, reportId);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_ClinicalAnalytics_${dateStr}.pdf`);
}

export interface GrowthTrackingPdfData {
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
  };
  chartData: {
    date: string;
    weight: number;
    height: number;
    muac: number;
  }[];
  userName: string;
  userRole: string;
}

export async function generateGrowthTrackingPdfReport(data: GrowthTrackingPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;
  
  // Header
  doc.setFontSize(16); doc.setTextColor(...BRAND_DARK); doc.text('NutriTrack', PAGE_MARGIN, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600); doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);
  
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Growth Tracking History', PAGE_MARGIN, 42);
  doc.setFontSize(14); doc.setTextColor(...GRAY_600);
  doc.text(`Patient: ${data.patient.firstName} ${data.patient.lastName}`, PAGE_MARGIN, 50);
  
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text(`Patient ID: ${data.patient.patientId}`, PAGE_MARGIN, 58);
  doc.setFontSize(9); doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });
  
  // Metadata
  doc.setFontSize(7.5); doc.setTextColor(...GRAY_600); doc.setFont('helvetica', 'normal');
  const metaY = 69; const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;
  doc.setFont('helvetica', 'bold'); doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal'); doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);
  doc.setFont('helvetica', 'bold'); doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal'); doc.text('NutriTrack System (Automated)', col2X + 22, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text('Confidential Medical Record', col2X + 22, metaY + 5);
  
  let y = metaY + 18;
  
  if (data.chartData.length > 0) {
    y = addTable(doc, y, 'Historical Growth Screenings', [
      ['Date', 'Weight (kg)', 'Height (cm)', 'MUAC (cm)'],
    ], data.chartData.map(d => [
      d.date, d.weight, d.height, d.muac,
    ]), { columnAlignments: ['left', 'center', 'center', 'center'] });
  } else {
    doc.setFontSize(10); doc.text('No growth screening history available for this patient.', PAGE_MARGIN, y);
  }
  
  drawFooter(doc, reportId);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_GrowthHistory_${data.patient.firstName}_${dateStr}.pdf`);
}

export interface PatientClinicalSummaryPdfData {
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string | null;
  };
  latestScreening: {
    weightKg: number;
    heightCm: number;
    muacCm: number;
    classification: string | null;
  } | null;
  clinicalDecision: {
    diagnosis: string;
    severity: string;
  };
  nutritionOrder: {
    supplementType: string;
    supplement: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  };
  userName: string;
  userRole: string;
}

export async function generatePatientClinicalSummaryPdfReport(data: PatientClinicalSummaryPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFontSize(16); doc.setTextColor(...BRAND_DARK); doc.text('NutriTrack', PAGE_MARGIN, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600); doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);
  
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Patient Clinical Summary', PAGE_MARGIN, 42);
  doc.setFontSize(14); doc.setTextColor(...GRAY_600);
  doc.text(`${data.patient.firstName} ${data.patient.lastName}`, PAGE_MARGIN, 50);
  
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text(`Patient ID: ${data.patient.patientId}`, PAGE_MARGIN, 58);
  doc.setFontSize(9); doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });
  
  // Metadata
  doc.setFontSize(7.5); doc.setTextColor(...GRAY_600); doc.setFont('helvetica', 'normal');
  const metaY = 69; const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;
  doc.setFont('helvetica', 'bold'); doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal'); doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);
  doc.setFont('helvetica', 'bold'); doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal'); doc.text('NutriTrack System (Automated)', col2X + 22, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text('Confidential Medical Record', col2X + 22, metaY + 5);
  
  let y = metaY + 18;

  // Patient Profile Table
  y = addTable(doc, y, 'Patient Profile', [
    ['DOB', 'Gender', 'Blood Group'],
  ], [
    [
      new Date(data.patient.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data.patient.gender,
      data.patient.bloodGroup || 'Unknown'
    ]
  ], { columnAlignments: ['center', 'center', 'center'] });

  if (data.latestScreening) {
    y = addTable(doc, y, 'Latest Vitals & Screening', [
      ['Weight', 'Height', 'MUAC', 'Classification'],
    ], [
      [
        `${data.latestScreening.weightKg} kg`,
        `${data.latestScreening.heightCm} cm`,
        `${data.latestScreening.muacCm} cm`,
        data.latestScreening.classification || 'NORMAL'
      ]
    ], { columnAlignments: ['center', 'center', 'center', 'center'] });
  }

  // Clinical Decision Text Block
  if (y > pageHeight - 40) { doc.addPage(); y = PAGE_MARGIN + 5; }
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Clinical Assessment & Diagnosis', PAGE_MARGIN, y); y += 7;
  
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY_600);
  doc.text('Severity Assessment:', PAGE_MARGIN, y);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...BRAND_DARK);
  doc.text(data.clinicalDecision.severity || 'Not specified', PAGE_MARGIN + 35, y); y += 6;

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY_600);
  doc.text('Clinical Diagnosis:', PAGE_MARGIN, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...BRAND_DARK);
  const diagText = doc.splitTextToSize(data.clinicalDecision.diagnosis || 'No clinical diagnosis recorded.', CONTENT_WIDTH);
  doc.text(diagText, PAGE_MARGIN, y); y += diagText.length * 4 + 6;

  // Nutrition Orders Text Block
  if (y > pageHeight - 60) { doc.addPage(); y = PAGE_MARGIN + 5; }
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Nutrition & Supplement Orders', PAGE_MARGIN, y); y += 7;

  doc.setFontSize(9);
  
  const orderFields = [
    { label: 'Supplement Type:', value: data.nutritionOrder.supplementType },
    { label: 'Specific Supplement:', value: data.nutritionOrder.supplement },
    { label: 'Dosage:', value: data.nutritionOrder.dosage },
    { label: 'Frequency:', value: data.nutritionOrder.frequency },
    { label: 'Duration:', value: data.nutritionOrder.duration },
  ];

  orderFields.forEach(f => {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY_600);
    doc.text(f.label, PAGE_MARGIN, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...BRAND_DARK);
    doc.text(f.value || 'Not specified', PAGE_MARGIN + 35, y);
    y += 6;
  });

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY_600);
  doc.text('Special Instructions:', PAGE_MARGIN, y); y += 5;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...BRAND_DARK);
  const instrText = doc.splitTextToSize(data.nutritionOrder.instructions || 'No special instructions recorded.', CONTENT_WIDTH);
  doc.text(instrText, PAGE_MARGIN, y); y += instrText.length * 4 + 6;
  
  drawFooter(doc, reportId);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_ClinicalSummary_${data.patient.firstName}_${dateStr}.pdf`);
}

export interface ServiceRequestQueuePdfData {
  requests: {
    patientName: string;
    patientId: string;
    priority: string;
    classification: string;
    status: string;
  }[];
  queueFilter: string;
  userName: string;
  userRole: string;
}

export async function generateServiceRequestQueuePdfReport(data: ServiceRequestQueuePdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;
  
  // Header
  doc.setFontSize(16); doc.setTextColor(...BRAND_DARK); doc.text('NutriTrack', PAGE_MARGIN, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600); doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);
  
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Service Request Queue', PAGE_MARGIN, 42);
  doc.setFontSize(14); doc.setTextColor(...GRAY_600);
  doc.text(`Assigned to: Dr. ${data.userName}`, PAGE_MARGIN, 50);
  
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text(`Queue Filter: ${data.queueFilter.toUpperCase()}`, PAGE_MARGIN, 58);
  doc.setFontSize(9); doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });
  
  // Metadata
  doc.setFontSize(7.5); doc.setTextColor(...GRAY_600); doc.setFont('helvetica', 'normal');
  const metaY = 69; const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;
  doc.setFont('helvetica', 'bold'); doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal'); doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);
  doc.setFont('helvetica', 'bold'); doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal'); doc.text('NutriTrack System (Automated)', col2X + 22, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text('Internal Use Only', col2X + 22, metaY + 5);
  
  let y = metaY + 18;
  
  if (data.requests.length > 0) {
    y = addTable(doc, y, 'Service Requests', [
      ['Patient Name', 'Patient ID', 'Priority', 'Classification', 'Status'],
    ], data.requests.map(r => [
      r.patientName, String(r.patientId), r.priority.toUpperCase(), r.classification, r.status
    ]), { columnAlignments: ['left', 'left', 'center', 'center', 'left'] });
  } else {
    doc.setFontSize(10); doc.text('No service requests found for this filter.', PAGE_MARGIN, y);
  }
  
  drawFooter(doc, reportId);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_ServiceQueue_${dateStr}.pdf`);
}

// ────────────────────────────────────────────────────────────
// CHW Pages Export
// ────────────────────────────────────────────────────────────

export interface PatientHistoryPdfData {
  patients: {
    name: string;
    patientId: string;
    age: number | string;
    gender: string;
    status: string;
  }[];
  filter: string;
  userName: string;
  userRole: string;
}

export async function generatePatientHistoryPdfReport(data: PatientHistoryPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = generateReportId();
  tableCounter = 0;
  
  // Header
  doc.setFontSize(16); doc.setTextColor(...BRAND_DARK); doc.text('NutriTrack', PAGE_MARGIN, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY_600); doc.text('Nutrition Screening Portal for Growth Tracking & Referrals', PAGE_MARGIN, 23);
  
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_DARK);
  doc.text('Patient History', PAGE_MARGIN, 42);
  doc.setFontSize(14); doc.setTextColor(...GRAY_600);
  doc.text(`Community Health Worker: ${data.userName}`, PAGE_MARGIN, 50);
  
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text(`Filter Applied: ${data.filter.toUpperCase()}`, PAGE_MARGIN, 58);
  doc.setFontSize(9); doc.text(`Report ID: ${reportId}`, PAGE_WIDTH_A4 - PAGE_MARGIN, 58, { align: 'right' });
  
  // Metadata
  doc.setFontSize(7.5); doc.setTextColor(...GRAY_600); doc.setFont('helvetica', 'normal');
  const metaY = 69; const col2X = PAGE_MARGIN + CONTENT_WIDTH / 2 + 5;
  doc.setFont('helvetica', 'bold'); doc.text('Prepared for:', PAGE_MARGIN, metaY);
  doc.setFont('helvetica', 'normal'); doc.text(`${data.userName}, ${humanRole(data.userRole)}`, PAGE_MARGIN + 25, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Generated on:', PAGE_MARGIN, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text(formatTimestamp(), PAGE_MARGIN + 25, metaY + 5);
  doc.setFont('helvetica', 'bold'); doc.text('Prepared by:', col2X, metaY);
  doc.setFont('helvetica', 'normal'); doc.text('NutriTrack System (Automated)', col2X + 22, metaY);
  doc.setFont('helvetica', 'bold'); doc.text('Classification:', col2X, metaY + 5);
  doc.setFont('helvetica', 'normal'); doc.text('Internal Use Only', col2X + 22, metaY + 5);
  
  let y = metaY + 18;
  
  if (data.patients.length > 0) {
    y = addTable(doc, y, 'Patient Roster', [
      ['Patient Name', 'Patient ID', 'Age (yrs)', 'Gender', 'Current Status'],
    ], data.patients.map(p => [
      p.name, p.patientId, String(p.age), p.gender, p.status
    ]), { columnAlignments: ['left', 'left', 'center', 'center', 'center'] });
  } else {
    doc.setFontSize(10); doc.text('No patients found matching the current criteria.', PAGE_MARGIN, y);
  }
  
  drawFooter(doc, reportId);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NutriTrack_CHW_PatientHistory_${dateStr}.pdf`);
}

