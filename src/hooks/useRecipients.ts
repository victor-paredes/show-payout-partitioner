
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { RecipientType } from "@/components/RecipientRow";
import { COLORS } from "@/lib/colorUtils";

export interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
  color?: string;
}

export function useRecipients() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { 
      id: "1", 
      name: "Recipient 1", 
      isFixedAmount: false, 
      value: 1, 
      payout: 0, 
      type: "shares" 
    },
  ]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(1);

  const addRecipients = () => {
    const currentRecipientCount = recipients.length;
    const count = parseInt(recipientCount);
    
    // Calculate the next available ID by analyzing existing IDs
    let nextId = lastUsedId + 1;
    
    // Find any numeric IDs in the current recipients list
    recipients.forEach(recipient => {
      const idNum = parseInt(recipient.id);
      if (!isNaN(idNum) && idNum >= nextId) {
        nextId = idNum + 1;
      }
    });
    
    const newRecipients = Array.from({ length: count }, (_, index) => {
      // Generate a truly unique ID by using timestamp + random number
      const newId = (nextId + index).toString();
      const defaultName = `Recipient ${currentRecipientCount + index + 1}`;
      
      return { 
        id: newId, 
        name: defaultName, 
        isFixedAmount: false, 
        value: 1, 
        payout: 0,
        type: "shares" as RecipientType
      };
    });
    
    setRecipients([
      ...recipients,
      ...newRecipients,
    ]);
    
    // Update the last used ID
    setLastUsedId(nextId + count - 1);
    setRecipientCount("1");
  };

  const removeRecipient = (id: string) => {
    if (recipients.length === 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one recipient",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedRecipients.has(id)) {
      const newSelectedRecipients = new Set(selectedRecipients);
      newSelectedRecipients.delete(id);
      setSelectedRecipients(newSelectedRecipients);
    }
    
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const toggleSelectRecipient = (id: string) => {
    const newSelectedRecipients = new Set(selectedRecipients);
    if (newSelectedRecipients.has(id)) {
      newSelectedRecipients.delete(id);
    } else {
      newSelectedRecipients.add(id);
    }
    setSelectedRecipients(newSelectedRecipients);
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    if (selectedRecipients.has(id) && selectedRecipients.size > 1) {
      const updatedRecipients = recipients.map(recipient => {
        if (selectedRecipients.has(recipient.id)) {
          return { ...recipient, ...updates };
        }
        return recipient;
      });
      setRecipients(updatedRecipients);
    } else {
      setRecipients(
        recipients.map(recipient => 
          recipient.id === id ? { ...recipient, ...updates } : recipient
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setRecipients((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const clearRecipients = () => {
    if (recipients.length === 1) {
      return;
    }
    
    // Reset the first recipient to default values
    const firstRecipient = {
      ...recipients[0],
      name: "Recipient 1",
      isFixedAmount: false,
      value: 1,
      payout: 0,
      type: "shares" as RecipientType
    };
    
    setRecipients([firstRecipient]);
    setSelectedRecipients(new Set());
    setRecipientCount("1");
    setLastUsedId(1); // Reset the last used ID counter
  };

  return {
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
    setLastUsedId, // Expose this to allow updating after import
  };
}
