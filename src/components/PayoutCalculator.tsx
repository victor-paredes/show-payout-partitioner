import { useEffect, useRef, useState } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import RecipientsList from "./payout/RecipientsList";
import PayoutSummary from "./PayoutSummary";
import { useRecipients } from "@/hooks/useRecipients";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";
import { RecipientType } from "@/components/RecipientRow";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
}

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
    handleDragEnd,
    clearRecipients
  } = useRecipients();

  const {
    totalPayout,
    setTotalPayout,
    remainingAmount,
    totalShares,
    valuePerShare
  } = usePayoutCalculation(recipients);

  const [hoveredRecipientId, setHoveredRecipientId] = useState<string | null>(null);

  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (totalPayout === 0) {
      setTotalPayout(100);
    }
  }, []);

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

  useEffect(() => {
    if (totalPayout <= 0) {
      setRecipients(recipients.map(r => ({ ...r, payout: 0 })));
      return;
    }

    const updatedRecipients = recipients.map(recipient => {
      const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
      
      if (type === "$") {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value,
        };
      } else if (type === "%") {
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
          hoveredRecipientId={hoveredRecipientId || undefined}
          onRecipientHover={handleRecipientHover}
          clearRecipients={clearRecipients}
        />
      </div>

      <div className="md:sticky md:top-4 h-fit">
        <PayoutSummary
          totalPayout={totalPayout}
          recipients={recipients}
          remainingAmount={remainingAmount}
          hoveredRecipientId={hoveredRecipientId || undefined}
          onRecipientHover={handleRecipientHover}
        />
      </div>
    </div>
  );
};

export default PayoutCalculator;
