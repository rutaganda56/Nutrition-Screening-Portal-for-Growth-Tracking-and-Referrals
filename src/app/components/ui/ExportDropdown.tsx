import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV, downloadExcel, exportComponentAsPDF } from '@/utils/exportUtils';

interface ExportDropdownProps {
  data?: Record<string, any>[];
  filename?: string;
  pdfElementId?: string;
  onCustomPdfExport?: () => Promise<void>;
  onCustomCsvExport?: () => Promise<void>;
  onCustomExcelExport?: () => Promise<void>;
  buttonClassName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  label?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  filename = 'Export',
  pdfElementId,
  onCustomPdfExport,
  onCustomCsvExport,
  onCustomExcelExport,
  buttonClassName,
  variant = 'default',
  label = 'Export'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      if (onCustomCsvExport) {
        await onCustomCsvExport();
      } else if (data && data.length > 0) {
        downloadCSV(data, filename);
        toast.success(`${filename} exported to CSV successfully`);
      } else {
        toast.error('No data available for CSV export');
      }
    } catch (err: any) {
      toast.error(`CSV Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      if (onCustomExcelExport) {
        await onCustomExcelExport();
      } else if (data && data.length > 0) {
        await downloadExcel(data, filename);
        toast.success(`${filename} exported to Excel successfully`);
      } else {
        toast.error('No data available for Excel export');
      }
    } catch (err: any) {
      toast.error(`Excel Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      if (onCustomPdfExport) {
        await onCustomPdfExport();
      } else if (pdfElementId) {
        toast.info('Generating PDF document, please wait...');
        await exportComponentAsPDF(pdfElementId, filename);
        toast.success(`${filename} exported to PDF successfully`);
      } else {
        toast.error('PDF Export not configured for this view');
      }
    } catch (err: any) {
      toast.error(`PDF Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`bg-green-600 hover:bg-green-700 text-white border-0 ${buttonClassName || ''}`} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {isExporting ? 'Exporting...' : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCsv} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer">
          <File className="h-4 w-4 mr-2 text-red-600" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
