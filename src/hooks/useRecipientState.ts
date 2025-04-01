
import { useState } from "react";
import { Recipient } from "@/types/recipient";
import { validateRecipient } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

export function useRecipientState() {
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

  const addRecipients = (count: number, groupId?: string, currentRecipientCount: number = 0) => {
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
        type: "shares" as const,
        groupId
      };
    });
    
    safeSetRecipients([
      ...recipients,
      ...newRecipients,
    ]);
    
    setLastUsedId(nextId + safeCount - 1);
    return safeCount;
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
    clearRecipients,
    setLastUsedId
  };
}
