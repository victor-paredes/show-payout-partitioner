
import { useEffect, useState } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import PayoutSummary from "./PayoutSummary";
import PayoutHeaderMenu from "./payout/PayoutHeaderMenu";
import { useRecipientsManager, Recipient, Group } from "@/hooks/useRecipientsManager";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";
import { useToast } from "@/hooks/use-toast";
import RecipientsList from "./recipients/RecipientsList";

const PayoutCalculator = () => {
  const { toast } = useToast();
  
  const {
    recipients,
    setRecipients,
    groups,
    setGroups,
    selectedRecipients,
    setSelectedRecipients,
    recipientCount,
    setRecipientCount,
    addRecipients,
    updateRecipient,
    removeRecipient,
    toggleSelectRecipient,
    addGroup,
    removeGroup,
    updateGroup,
    moveRecipientToGroup,
    clearRecipients,
    getGroupedRecipients,
    getGroupTotals,
    draggedRecipientId,
    handleDragStart,
    handleDragEnd
  } = useRecipientsManager();

  const {
    totalPayout,
    setTotalPayout,
    remainingAmount,
    totalShares,
    valuePerShare
  } = usePayoutCalculation(recipients);
  
  const groupedRecipients = getGroupedRecipients();
  const groupTotals = getGroupTotals();

  // Initialize with a default total payout
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

  // Track hovered recipient for highlighting in the summary
  const [hoveredRecipientId, setHoveredRecipientId] = useState<string | null>(null);

  // Update recipient payouts when relevant values change
  useEffect(() => {
    if (totalPayout <= 0) {
      setRecipients(recipients.map(r => ({ ...r, payout: 0 })));
      return;
    }

    const updatedRecipients = recipients.map(recipient => {
      if (recipient.type === "$") {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value,
        };
      } else if (recipient.type === "%") {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : (recipient.value / 100) * totalPayout,
        };
      } else {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value * valuePerShare,
        };
      }
    });

    setRecipients(updatedRecipients);
  }, [totalPayout, valuePerShare, recipients.map(r => `${r.id}-${r.type}-${r.value}`).join(',')]);

  // Handle recipient hover for highlighting
  const handleRecipientHover = (id: string | null) => {
    setHoveredRecipientId(id);
  };

  // Handle importing recipients
  const handleImport = (newRecipients: Recipient[], replace: boolean, newGroups?: Group[]) => {
    if (replace) {
      setRecipients(newRecipients);
      
      if (newGroups && newGroups.length > 0) {
        setGroups(newGroups);
      } else {
        setGroups([]);
      }
      
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

  return (
    <div className="space-y-2">
      <PayoutHeaderMenu 
        totalPayout={totalPayout} 
        recipients={recipients}
        groups={groups}
        onImport={handleImport}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <TotalPayoutInput 
            totalPayout={totalPayout} 
            onChange={setTotalPayout} 
          />

          <RecipientsList
            recipients={recipients}
            groups={groups}
            recipientCount={recipientCount}
            setRecipientCount={setRecipientCount}
            selectedRecipients={selectedRecipients}
            valuePerShare={valuePerShare}
            hoveredRecipientId={hoveredRecipientId}
            draggedRecipientId={draggedRecipientId}
            addRecipients={addRecipients}
            updateRecipient={updateRecipient}
            removeRecipient={removeRecipient}
            toggleSelectRecipient={toggleSelectRecipient}
            setSelectedRecipients={setSelectedRecipients}
            clearRecipients={clearRecipients}
            addGroup={addGroup}
            removeGroup={removeGroup}
            updateGroup={updateGroup}
            moveRecipientToGroup={moveRecipientToGroup}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            groupedRecipients={groupedRecipients}
          />
        </div>

        <div className="md:sticky md:top-4 h-fit">
          <PayoutSummary
            totalPayout={totalPayout}
            recipients={recipients}
            remainingAmount={remainingAmount}
            hoveredRecipientId={hoveredRecipientId || undefined}
            onRecipientHover={handleRecipientHover}
            groupTotals={groupTotals}
          />
        </div>
      </div>
    </div>
  );
};

export default PayoutCalculator;
