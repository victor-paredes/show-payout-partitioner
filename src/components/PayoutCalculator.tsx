
import { useEffect, useRef, useState } from "react";
import TotalPayoutInput from "./payout/TotalPayoutInput";
import RecipientsList from "./payout/RecipientsList";
import PayoutSummary from "./PayoutSummary";
import PayoutHeaderMenu from "./payout/PayoutHeaderMenu";
import { useRecipients, Recipient } from "@/hooks/useRecipients";
import { usePayoutCalculation } from "@/hooks/usePayoutCalculation";
import { RecipientType } from "@/components/RecipientRow";

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isSelecting: boolean;
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
  
  // Selection area state
  const [selectionArea, setSelectionArea] = useState<SelectionArea>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isSelecting: false
  });

  const calculatorRef = useRef<HTMLDivElement>(null);
  const recipientsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target as Node) && selectedRecipients.size > 0) {
        setSelectedRecipients(new Set());
      }
    };

    // Add Escape key handler
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

  // Handle selection area mouse events
  const handleSelectionMouseDown = (e: React.MouseEvent) => {
    // Only start selection if clicking on the recipients list background, not on a recipient
    if (
      recipientsListRef.current && 
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains('recipients-list-area')
    ) {
      const { left, top } = recipientsListRef.current.getBoundingClientRect();
      const startX = e.clientX - left;
      const startY = e.clientY - top;
      
      setSelectionArea({
        startX,
        startY,
        endX: startX,
        endY: startY,
        isSelecting: true
      });
      
      // Clear existing selections when starting a new drag (unless Shift is held)
      if (!e.shiftKey) {
        setSelectedRecipients(new Set());
      }
    }
  };

  const handleSelectionMouseMove = (e: React.MouseEvent) => {
    if (selectionArea.isSelecting && recipientsListRef.current) {
      const { left, top } = recipientsListRef.current.getBoundingClientRect();
      
      setSelectionArea({
        ...selectionArea,
        endX: e.clientX - left,
        endY: e.clientY - top
      });
      
      // Get all recipient elements
      const recipientElements = recipientsListRef.current.querySelectorAll('[data-recipient-id]');
      
      // Calculate the selection rectangle
      const selRect = {
        left: Math.min(selectionArea.startX, selectionArea.endX),
        top: Math.min(selectionArea.startY, selectionArea.endY),
        right: Math.max(selectionArea.startX, selectionArea.endX),
        bottom: Math.max(selectionArea.startY, selectionArea.endY)
      };
      
      // Check each recipient to see if it intersects with the selection
      const newSelectedRecipients = new Set(e.shiftKey ? Array.from(selectedRecipients) : []);
      
      recipientElements.forEach((element) => {
        const recipientId = element.getAttribute('data-recipient-id');
        if (!recipientId) return;
        
        const rect = element.getBoundingClientRect();
        const recipientRect = {
          left: rect.left - left,
          top: rect.top - top,
          right: rect.right - left,
          bottom: rect.bottom - top
        };
        
        // Check if the rectangles intersect
        if (
          recipientRect.left < selRect.right &&
          recipientRect.right > selRect.left &&
          recipientRect.top < selRect.bottom &&
          recipientRect.bottom > selRect.top
        ) {
          newSelectedRecipients.add(recipientId);
        }
      });
      
      setSelectedRecipients(newSelectedRecipients);
    }
  };

  const handleSelectionMouseUp = () => {
    setSelectionArea({
      ...selectionArea,
      isSelecting: false
    });
  };

  const handleRecipientHover = (id: string | null) => {
    setHoveredRecipientId(id);
  };

  const handleImport = (newRecipients: Recipient[], replace: boolean) => {
    if (replace) {
      setRecipients(newRecipients);
      
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
            selectionArea={selectionArea}
            recipientsListRef={recipientsListRef}
            onSelectionMouseDown={handleSelectionMouseDown}
            onSelectionMouseMove={handleSelectionMouseMove}
            onSelectionMouseUp={handleSelectionMouseUp}
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
    </div>
  );
};

export default PayoutCalculator;
