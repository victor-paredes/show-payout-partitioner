
import { useEffect, useRef, useState } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import RecipientsList from "./payout/RecipientsList";
import PayoutSummary from "./PayoutSummary";
import { useRecipients } from "@/hooks/useRecipients";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";

const PayoutCalculator = () => {
  const [hoveredRecipientId, setHoveredRecipientId] = useState<string | null>(null);
  
  const {
    recipients,
    setRecipients,
    selectedRecipients,
    setSelectedRecipients,
    recipientCount,
    setRecipientCount,
    addRecipients,
    removeRecipient,
    toggleSelectRecipient,
    updateRecipient,
    handleDragEnd
  } = useRecipients();

  const {
    totalPayout,
    setTotalPayout,
    remainingAmount,
    totalShares,
    valuePerShare
  } = usePayoutCalculation(recipients);

  const calculatorRef = useRef<HTMLDivElement>(null);

  // Handle click outside to deselect all recipients
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target as Node) && selectedRecipients.size > 0) {
        setSelectedRecipients(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedRecipients, setSelectedRecipients]);

  // Update recipient payouts based on calculations
  useEffect(() => {
    if (totalPayout <= 0) {
      setRecipients(recipients.map(r => ({ ...r, payout: 0 })));
      return;
    }

    // Update payouts for each recipient
    const updatedRecipients = recipients.map(recipient => {
      if (recipient.isFixedAmount) {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value,
        };
      } else {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value * valuePerShare,
        };
      }
    });

    setRecipients(updatedRecipients);
  }, [totalPayout, recipients.map(r => r.id).join(','), 
     recipients.map(r => r.name).join(','),
     recipients.map(r => r.isFixedAmount).join(','), 
     recipients.map(r => r.value).join(','),
     valuePerShare]);

  const handleRecipientHover = (id: string | null) => {
    setHoveredRecipientId(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={calculatorRef}>
      {/* Left Column - Input Sections (2/3 width) */}
      <div className="md:col-span-2 space-y-6">
        <TotalPayoutInput 
          totalPayout={totalPayout} 
          onChange={setTotalPayout} 
        />

        <RecipientsList
          recipients={recipients}
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
          hoveredRecipientId={hoveredRecipientId}
          onRecipientHover={handleRecipientHover}
        />
      </div>

      {/* Right Column - Summary (1/3 width) */}
      <div className="md:sticky md:top-4 h-fit">
        <PayoutSummary
          totalPayout={totalPayout}
          recipients={recipients}
          remainingAmount={remainingAmount}
          hoveredRecipientId={hoveredRecipientId}
          onRecipientHover={handleRecipientHover}
        />
      </div>
    </div>
  );
};

export default PayoutCalculator;
