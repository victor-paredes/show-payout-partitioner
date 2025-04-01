
import React, { useRef } from "react";
import { 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarMenu, 
  MenubarTrigger 
} from "@/components/ui/menubar";
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
import { Button } from "@/components/ui/button";
import { FileDown, FileUp } from "lucide-react";
import { exportToPdf, exportToCsv, importFromCsv } from "@/lib/exportUtils";
import { Recipient } from "@/hooks/useRecipients";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RecipientType } from "@/components/RecipientRow";

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
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [pendingImportData, setPendingImportData] = React.useState<Recipient[] | null>(null);

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

        const importedData = await importFromCsv(csvContent);
        
        // Process the imported data to ensure it matches the Recipient interface
        const processedData: Recipient[] = importedData.map(item => {
          // Determine the type and isFixedAmount properties
          const type = item.type as RecipientType || "shares";
          const isFixedAmount = type === "$";
          
          return {
            id: item.id,
            name: item.name,
            value: item.value,
            payout: item.payout,
            type: type,
            isFixedAmount: isFixedAmount
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
        setIsImportDialogOpen(true);
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
    // Reset the file input so the same file can be selected again
    e.target.value = '';
  };

  const handleImport = (replace: boolean) => {
    if (pendingImportData) {
      onImport(pendingImportData, replace);
      setIsImportDialogOpen(false);
      setPendingImportData(null);
      toast({
        title: "Import successful",
        description: `${pendingImportData.length} recipients ${replace ? "replaced existing data" : "added to your data"}`,
      });
    }
  };

  return (
    <>
      <Menubar className="mb-6 px-3 border-none bg-transparent justify-end">
        <MenubarMenu>
          <MenubarTrigger className="font-medium flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </MenubarTrigger>
          <MenubarContent align="end">
            <MenubarItem onClick={handleExportPdf}>
              PDF
            </MenubarItem>
            <MenubarItem onClick={handleExportCsv}>
              CSV
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="font-medium flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Import
          </MenubarTrigger>
          <MenubarContent align="end">
            <MenubarItem onClick={handleImportClick}>
              CSV
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Hidden file input for import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        style={{ display: 'none' }} 
      />

      {/* Import options dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Options</DialogTitle>
            <DialogDescription>
              How would you like to import {pendingImportData?.length || 0} recipients?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => handleImport(false)}
              >
                Add to existing
              </Button>
              <Button 
                variant="default" 
                onClick={() => handleImport(true)}
              >
                Replace all
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayoutHeaderMenu;
