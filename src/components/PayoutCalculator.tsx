
import { useEffect, useRef, useState } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import RecipientsList from "./payout/RecipientsList";
import PayoutSummary from "./PayoutSummary";
import PayoutHeaderMenu from "./payout/PayoutHeaderMenu";
import { useRecipients, Recipient } from "@/hooks/useRecipients";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";

const PayoutCalculator = () => {
  const {
    items,
    setItems,
    recipients,
    selectedRecipients,
    setSelectedRecipients,
    recipientCount,
    setRecipientCount,
    addRecipients,
    removeItem,
    addDivider,
    toggleSelectRecipient,
    updateRecipient,
    handleDragEnd,
    clearRecipients,
    setLastUsedId
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

  useEffect(() => {
    if (totalPayout <= 0) {
      setItems(items.map(item => {
        if ('type' in item && item.type === 'divider') {
          return item;
        }
        return { ...item, payout: 0 };
      }));
      return;
    }

    const updatedItems = items.map(item => {
      // Skip dividers
      if ('type' in item && item.type === 'divider') {
        return item;
      }
      
      const recipient = item as Recipient;
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

    setItems(updatedItems);
  }, [totalPayout, items.map(r => r.id).join(','), 
     items.filter(r => !('type' in r)).map(r => (r as Recipient).name).join(','),
     items.filter(r => !('type' in r)).map(r => (r as Recipient).isFixedAmount).join(','), 
     items.filter(r => !('type' in r)).map(r => (r as Recipient).value).join(','),
     valuePerShare]);

  const handleRecipientHover = (id: string | null) => {
    setHoveredRecipientId(id);
  };

  const handleImport = (newRecipients: Recipient[], replace: boolean) => {
    if (replace) {
      setItems(newRecipients);
      
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
      setItems([...items, ...newRecipients]);
    }
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
            items={items}
            recipientCount={recipientCount}
            setRecipientCount={setRecipientCount}
            addRecipients={addRecipients}
            updateRecipient={updateRecipient}
            removeItem={removeItem}
            addDivider={addDivider}
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
            items={items}
            remainingAmount={remainingAmount}
            hoveredRecipientId={hoveredRecipientId || undefined}
            onRecipientHover={handleRecipientHover}
          />
        </div>
      </div>
    </div>
  );
};

export default PayoutCalculator;
