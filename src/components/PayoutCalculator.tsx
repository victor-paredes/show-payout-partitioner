
import { useEffect, useRef, useState } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import RecipientsList from "./payout/RecipientsList";
import PayoutSummary from "./PayoutSummary";
import PayoutHeaderMenu from "./payout/PayoutHeaderMenu";
import { useRecipients, Recipient } from "@/hooks/useRecipients";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";
import { useToast } from "@/hooks/use-toast";
import GroupNameModal from "./payout/GroupNameModal";

const PayoutCalculator = () => {
  const { toast } = useToast();
  const [groupNameModalOpen, setGroupNameModalOpen] = useState(false);
  
  const {
    recipients,
    setRecipients,
    recipientGroups,
    selectedRecipients,
    setSelectedRecipients,
    recipientCount,
    setRecipientCount,
    addRecipients,
    removeRecipient,
    toggleSelectRecipient,
    updateRecipient,
    handleDragEnd,
    clearRecipients,
    setLastUsedId,
    createGroup,
    ungroupRecipients
  } = useRecipients();

  const {
    totalPayout,
    setTotalPayout,
    remainingAmount,
    totalShares,
    valuePerShare
  } = usePayoutCalculation(recipients);

  useEffect(() => {
    const importedTotalPayout = parseFloat(
      localStorage.getItem('importedTotalPayout') || '0'
    );
    
    if (importedTotalPayout > 0) {
      setTotalPayout(importedTotalPayout);
      localStorage.removeItem('importedTotalPayout');
    } else if (totalPayout === 0) {
      setTotalPayout(100);
    }
  }, []);

  const [hoveredRecipientId, setHoveredRecipientId] = useState<string | null>(null);

  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target as Node) && selectedRecipients.size > 0) {
        setSelectedRecipients(new Set());
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedRecipients.size > 0) {
        setSelectedRecipients(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedRecipients, setSelectedRecipients]);

  // We can remove the duplicate calculation logic since usePayoutCalculation handles it

  const handleRecipientHover = (id: string | null) => {
    setHoveredRecipientId(id);
  };

  const handleImport = (newRecipients: Recipient[], replace: boolean) => {
    if (replace) {
      console.log("Importing recipients with colors:", 
        newRecipients.map(r => ({ id: r.id, name: r.name, color: r.color }))
      );
      
      setRecipients(newRecipients);
      
      const missingColors = newRecipients.filter(r => r.color === undefined || r.color === '').length;
      const totalWithColors = newRecipients.length - missingColors;
      
      console.log(`Import colors summary: ${totalWithColors} of ${newRecipients.length} recipients have custom colors`);
      
      let highestId = 0;
      newRecipients.forEach(recipient => {
        const idNum = parseInt(recipient.id);
        if (!isNaN(idNum) && idNum > highestId) {
          highestId = idNum;
        }
      });
      
      setLastUsedId(highestId + 1);
      
      const importedTotalPayout = parseFloat(
        localStorage.getItem('importedTotalPayout') || '0'
      );
      
      if (importedTotalPayout > 0) {
        setTotalPayout(importedTotalPayout);
        localStorage.removeItem('importedTotalPayout');
      }
    } else {
      setRecipients([...recipients, ...newRecipients]);
    }
  };

  // Update PayoutSummary to show grouped rows
  const getPayoutSummaryRecipients = () => {
    return recipients;
  };

  const handleOpenGroupNameModal = () => {
    if (selectedRecipients.size < 2) {
      toast({
        title: "Group Creation Failed",
        description: "Select at least two recipients to create a group",
        variant: "destructive",
      });
      return;
    }
    setGroupNameModalOpen(true);
  };

  const handleCreateGroup = (groupName: string) => {
    createGroup(groupName);
  };

  return (
    <div className="space-y-2">
      <PayoutHeaderMenu 
        totalPayout={totalPayout} 
        recipients={recipients}
        onImport={handleImport}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={calculatorRef}>
        <div className="md:col-span-2 space-y-6">
          <TotalPayoutInput 
            totalPayout={totalPayout} 
            onChange={setTotalPayout} 
          />

          <RecipientsList
            recipients={recipients}
            recipientGroups={recipientGroups}
            recipientCount={recipientCount}
            setRecipientCount={setRecipientCount}
            addRecipients={addRecipients}
            updateRecipient={updateRecipient}
            removeRecipient={removeRecipient}
            selectedRecipients={selectedRecipients}
            toggleSelectRecipient={toggleSelectRecipient}
            setSelectedRecipients={setSelectedRecipients}
            handleDragEnd={handleDragEnd}
            valuePerShare={valuePerShare}
            hoveredRecipientId={hoveredRecipientId || undefined}
            onRecipientHover={handleRecipientHover}
            clearRecipients={clearRecipients}
            createGroup={createGroup}
            ungroupRecipients={ungroupRecipients}
            onOpenGroupNameModal={handleOpenGroupNameModal}
          />
        </div>

        <div className="md:sticky md:top-4 h-fit">
          <PayoutSummary
            totalPayout={totalPayout}
            recipients={getPayoutSummaryRecipients()}
            remainingAmount={remainingAmount}
            hoveredRecipientId={hoveredRecipientId || undefined}
            onRecipientHover={handleRecipientHover}
          />
        </div>
      </div>

      <GroupNameModal
        open={groupNameModalOpen}
        onOpenChange={setGroupNameModalOpen}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default PayoutCalculator;
