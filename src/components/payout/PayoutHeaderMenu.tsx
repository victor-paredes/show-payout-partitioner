
import React, { useRef } from "react";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp } from "lucide-react";
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
  const [isImportWarningOpen, setIsImportWarningOpen] = React.useState(false);
  const [pendingImportData, setPendingImportData] = React.useState<Recipient[] | null>(null);
  const [pendingTotalPayout, setPendingTotalPayout] = React.useState<number | null>(null);
  const [colorSummary, setColorSummary] = React.useState<{ total: number, withColors: number }>({ total: 0, withColors: 0 });

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

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) throw new Error("Failed to read file");

        const { importedData, importedTotalPayout } = await importFromCsv(csvContent);
        
        // Check how many recipients have custom colors
        const withColors = importedData.filter(r => r.color !== undefined).length;
        
        console.log(`CSV Import preview: ${withColors} of ${importedData.length} recipients have custom colors`);
        setColorSummary({ total: importedData.length, withColors });
        
        // Process the data, ensuring color property is preserved
        const processedData: Recipient[] = importedData.map(item => {
          const type = item.type as RecipientType || "shares";
          const isFixedAmount = type === "$";
          
          // Create recipient with explicit color property to prevent loss during conversion
          return {
            id: item.id,
            name: item.name,
            value: item.value,
            payout: item.payout,
            type: type,
            isFixedAmount: isFixedAmount,
            ...(item.color ? { color: item.color } : {})
          };
        });
        
        if (processedData.length === 0) {
          toast({
            title: "Import failed",
            description: "No valid data found in the CSV file",
            variant: "destructive",
          });
          return;
        }

        setPendingImportData(processedData);
        setPendingTotalPayout(importedTotalPayout || null);
        setIsImportWarningOpen(true);
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Failed to import CSV file",
          variant: "destructive",
        });
      }
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
      
      // Show toast with color summary if colors were imported
      if (colorSummary.withColors > 0) {
        toast({
          title: "Import successful",
          description: `Imported ${pendingImportData.length} recipients with ${colorSummary.withColors} custom colors`,
        });
      } else {
        toast({
          title: "Import successful",
          description: `Imported ${pendingImportData.length} recipients`,
        });
      }
      
      setPendingImportData(null);
      setPendingTotalPayout(null);
      setColorSummary({ total: 0, withColors: 0 });
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-6">
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm" className="font-medium flex items-center gap-2">
              <FileDown className="h-4 w-4" />
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
            <Button variant="outline" size="sm" className="font-medium flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Import
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-32 p-0" align="end">
            <div className="flex flex-col">
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start rounded-none" 
                onClick={handleImportClick}
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
            <AlertDialogTitle>Warning: Import will overwrite data</AlertDialogTitle>
            <AlertDialogDescription>
              All current recipients and their data will be replaced with the imported data. 
              This action cannot be undone.
              {colorSummary.withColors > 0 && (
                <p className="mt-2 text-green-600">
                  {colorSummary.withColors} of {colorSummary.total} recipients have custom colors that will be imported.
                </p>
              )}
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
