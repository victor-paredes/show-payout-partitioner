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

const validateRecipient = (recipient: any): boolean => {
  if (!recipient) return false;
  if (typeof recipient.id !== 'string' || !recipient.id) return false;
  if (typeof recipient.name !== 'string') return false;
  if (typeof recipient.value !== 'number') return false;
  
  if (recipient.type && !['shares', '$', '%'].includes(recipient.type)) return false;
  
  if (recipient.color && typeof recipient.color === 'string') {
    const validColor = /^#[0-9A-F]{6}$/i.test(recipient.color) || COLORS.includes(recipient.color);
    if (!validColor) return false;
  }
  
  return true;
};

export function useRecipients() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(0);

  const safeSetRecipients = (newRecipients: Recipient[]) => {
    const validRecipients = newRecipients.filter(recipient => {
      const isValid = validateRecipient(recipient);
      if (!isValid) {
        console.warn("Invalid recipient filtered out:", recipient);
      }
      return isValid;
    });
    
    const MAX_RECIPIENTS = 1000;
    if (validRecipients.length > MAX_RECIPIENTS) {
      console.warn(`Limiting recipients to ${MAX_RECIPIENTS} (from ${validRecipients.length})`);
      setRecipients(validRecipients.slice(0, MAX_RECIPIENTS));
      toast({
        title: "Warning",
        description: `Too many recipients. Limited to ${MAX_RECIPIENTS}.`,
        variant: "destructive"
      });
    } else {
      setRecipients(validRecipients);
    }
  };

  const addRecipients = () => {
    const currentRecipientCount = recipients.length;
    const count = parseInt(recipientCount);
    
    const maxAddAtOnce = 100;
    const safeCount = Math.min(count, maxAddAtOnce);
    
    if (safeCount !== count) {
      toast({
        title: "Warning",
        description: `Maximum ${maxAddAtOnce} recipients can be added at once.`,
        variant: "destructive"
      });
    }
    
    let nextId = lastUsedId + 1;
    
    recipients.forEach(recipient => {
      const idNum = parseInt(recipient.id);
      if (!isNaN(idNum) && idNum >= nextId) {
        nextId = idNum + 1;
      }
    });
    
    const newRecipients = Array.from({ length: safeCount }, (_, index) => {
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
    
    safeSetRecipients([
      ...recipients,
      ...newRecipients,
    ]);
    
    setLastUsedId(nextId + safeCount - 1);
    setRecipientCount("1");
  };

  const removeRecipient = (id: string) => {
    if (!id || typeof id !== 'string') return;
    
    if (selectedRecipients.has(id)) {
      const newSelectedRecipients = new Set(selectedRecipients);
      newSelectedRecipients.delete(id);
      setSelectedRecipients(newSelectedRecipients);
    }
    
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const toggleSelectRecipient = (id: string) => {
    if (!id || typeof id !== 'string') return;
    
    const newSelectedRecipients = new Set(selectedRecipients);
    if (newSelectedRecipients.has(id)) {
      newSelectedRecipients.delete(id);
    } else {
      newSelectedRecipients.add(id);
    }
    setSelectedRecipients(newSelectedRecipients);
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    if (!id || typeof id !== 'string') return;
    
    if (updates.name && typeof updates.name === 'string') {
      updates.name = updates.name.replace(/<[^>]*>/g, '');
    }
    
    if (selectedRecipients.has(id) && selectedRecipients.size > 1) {
      const updatedRecipients = recipients.map(recipient => {
        if (selectedRecipients.has(recipient.id)) {
          return { ...recipient, ...updates };
        }
        return recipient;
      });
      safeSetRecipients(updatedRecipients);
    } else {
      safeSetRecipients(
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
        
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const clearRecipients = () => {
    setRecipients([]);
    setSelectedRecipients(new Set());
    setRecipientCount("1");
    setLastUsedId(0);
  };

  return {
    recipients,
    setRecipients: safeSetRecipients,
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
  };
}
