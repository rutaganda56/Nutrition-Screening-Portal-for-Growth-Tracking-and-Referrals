import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
// @ts-ignore
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
/**
 * Utility functions for exporting data to various formats
 */

/**
 * Convert array of objects to CSV format
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create CSV data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: Record<string, any>[], filename: string): void {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Download data as Excel file (.xlsx)
 */
export async function downloadExcel(data: Record<string, any>[], filename: string): Promise<void> {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export Data');
  
  // Extract headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  
  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => item[header] ?? '');
    worksheet.addRow(row);
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : Math.min(maxLength + 2, 30);
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Print the current page
 */
export function printPage(): void {
  window.print();
}

/**
 * Export a React component or DOM element as a PDF document.
 * This is useful for exporting structured clinical summaries, charts, etc.
 * 
 * @param elementId The ID of the DOM element to export
 * @param filename The desired filename (without extension)
 */
export async function exportComponentAsPDF(elementId: string, filename: string): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    // Add a class temporarily if we need to hide things like action buttons
    element.classList.add('pdf-export-mode');

    // Create image using html-to-image (supports modern CSS better than html2canvas)
    const imgData = await htmlToImage.toJpeg(element, {
      quality: 1.0,
      backgroundColor: '#ffffff',
      pixelRatio: 2 // Higher scale for better text quality
    });

    element.classList.remove('pdf-export-mode');
    
    // Calculate PDF dimensions (A4 size: 210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = element.offsetWidth * 2;
    const imgHeight = element.offsetHeight * 2;
    
    // Scale image to fit PDF width
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const finalImgWidth = imgWidth * ratio;
    const finalImgHeight = imgHeight * ratio;
    
    // If the content is taller than A4, we need multiple pages
    // For a clinical summary, it's often a scrolling page. Let's handle simple 1-page scaling or multi-page.
    // For simplicity and perfect formatting, we scale it to fit width, and calculate how many pages are needed.
    
    let heightLeft = imgHeight * (pdfWidth / imgWidth); // height in mm
    let position = 0;
    
    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, heightLeft);
    heightLeft -= pdfHeight;
    
    // Add subsequent pages if needed
    while (heightLeft > 0) {
      position = heightLeft - (imgHeight * (pdfWidth / imgWidth)); // Shift image up
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight * (pdfWidth / imgWidth));
      heightLeft -= pdfHeight;
    }

    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF Error: ${error.message || 'Unknown error'}`);
  }
}
