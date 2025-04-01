
import React, { useRef, useState } from "react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Save, FileUp, AlertTriangle } from "lucide-react"; // Updated import to include Save icon
import { exportToPdf, exportToCsv, importFromCsv } from "@/lib/exportUtils";
import { Recipient } from "@/hooks/useRecipients";
import { useToast } from "@/hooks/use-toast";
import { RecipientType } from "@/components/RecipientRow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PayoutHeaderMenuProps {
  totalPayout: number;
  recipients: Recipient[];
  onImport: (newRecipients: Recipient[], replace: boolean) => void;
}

const PayoutHeaderMenu: React.FC<PayoutHeaderMenuProps> = ({ 
  totalPayout, 
  recipients, 
  onImport 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportWarningOpen, setIsImportWarningOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Recipient[] | null>(null);
  const [pendingTotalPayout, setPendingTotalPayout] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportPdf = () => {
    const element = document.getElementById('payout-summary');
    if (element) {
      exportToPdf(element, 'payout-summary');
    } else {
      toast({
        title: "Export failed",
        description: "Could not find summary element to export",
        variant: "destructive",
      });
    }
  };

  const handleExportCsv = () => {
    exportToCsv(recipients, totalPayout, 'payout-summary');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Add file size validation
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "CSV file must be smaller than 2MB",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Add file type validation
    if (file.type && file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Only CSV files are supported",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) throw new Error("Failed to read file");

        const { importedData, importedTotalPayout } = await importFromCsv(csvContent);
        
        if (importedData.length === 0) {
          toast({
            title: "Import failed",
            description: "No valid data found in the CSV file",
            variant: "destructive",
          });
          setIsImporting(false);
          return;
        }

        // Transform the imported data to ensure it matches the Recipient interface
        const processedData: Recipient[] = importedData.map(item => {
          const type = item.type as RecipientType || "shares";
          
          return {
            id: item.id,
            name: item.name,
            value: item.value,
            payout: item.payout,
            isFixedAmount: type === "$",
            type: type,
            ...(item.color ? { color: item.color } : {})
          };
        });

        setPendingImportData(processedData);
        setPendingTotalPayout(importedTotalPayout || null);
        setIsImportWarningOpen(true);
        setIsImporting(false);
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Failed to import CSV file",
          variant: "destructive",
        });
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Failed to read the CSV file",
        variant: "destructive",
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = () => {
    if (pendingImportData) {
      if (pendingTotalPayout !== null) {
        localStorage.setItem('importedTotalPayout', pendingTotalPayout.toString());
      }
      
      onImport(pendingImportData, true);
      setIsImportWarningOpen(false);
      
      toast({
        title: "Import successful",
        description: `Imported ${pendingImportData.length} recipients`,
      });
      
      setPendingImportData(null);
      setPendingTotalPayout(null);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-6">
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm" className="font-medium flex items-center gap-2">
              <Save className="h-4 w-4" /> {/* Updated icon to Save */}
              Export
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-32 p-0" align="end">
            <div className="flex flex-col">
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start rounded-none" 
                onClick={handleExportPdf}
              >
                PDF
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start rounded-none" 
                onClick={handleExportCsv}
              >
                CSV
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
        
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="font-medium flex items-center gap-2"
              disabled={isImporting}
            >
              {isImporting ? (
                <span className="animate-pulse">Importing...</span>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-32 p-0" align="end">
            <div className="flex flex-col">
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start rounded-none" 
                onClick={handleImportClick}
                disabled={isImporting}
              >
                CSV
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        style={{ display: 'none' }} 
      />

      <AlertDialog open={isImportWarningOpen} onOpenChange={setIsImportWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Warning: Import will overwrite data
            </AlertDialogTitle>
            <AlertDialogDescription>
              All current recipients and their data will be replaced with the imported data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PayoutHeaderMenu;
