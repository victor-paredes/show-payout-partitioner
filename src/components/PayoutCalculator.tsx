
import { useEffect, useRef } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import RecipientsList from "./payout/RecipientsList";
import PayoutSummary from "./PayoutSummary";
import { useRecipients } from "@/hooks/useRecipients";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";

const PayoutCalculator = () => {
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

  return (
    <div className="space-y-6" ref={calculatorRef}>
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
        handleDragEnd={handleDragEnd}
        valuePerShare={valuePerShare}
      />

      <PayoutSummary
        totalPayout={totalPayout}
        recipients={recipients}
        remainingAmount={remainingAmount}
      />
    </div>
  );
};

export default PayoutCalculator;
