
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { RecipientType } from "@/components/RecipientRow";
import { Divider } from "@/components/DividerRow";
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

export type PayoutItem = Recipient | Divider;

export function useRecipients() {
  const { toast } = useToast();
  const [items, setItems] = useState<PayoutItem[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(0);

  // Filter just recipients (not dividers)
  const recipients = items.filter((item): item is Recipient => 
    !('type' in item && item.type === 'divider')
  );

  const addRecipients = () => {
    const currentRecipientCount = recipients.length;
    const count = parseInt(recipientCount);
    
    // Calculate the next available ID
    let nextId = lastUsedId + 1;
    
    // Find any numeric IDs in the current recipients list
    items.forEach(item => {
      const idNum = parseInt(item.id);
      if (!isNaN(idNum) && idNum >= nextId) {
        nextId = idNum + 1;
      }
    });
    
    const newRecipients = Array.from({ length: count }, (_, index) => {
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
    
    setItems([
      ...items,
      ...newRecipients,
    ]);
    
    // Update the last used ID
    setLastUsedId(nextId + count - 1);
    setRecipientCount("1");
  };

  const removeItem = (id: string) => {
    if (selectedRecipients.has(id)) {
      const newSelectedRecipients = new Set(selectedRecipients);
      newSelectedRecipients.delete(id);
      setSelectedRecipients(newSelectedRecipients);
    }
    
    setItems(items.filter(item => item.id !== id));
  };

  const addDivider = (text: string, afterRecipientId: string) => {
    // Find the index of the recipient to add the divider after
    const recipientIndex = items.findIndex(item => item.id === afterRecipientId);
    
    if (recipientIndex === -1) return;
    
    // Generate a new ID for the divider
    const dividerId = `div-${Date.now()}`;
    
    // Create the new divider
    const newDivider: Divider = {
      id: dividerId,
      type: 'divider',
      text
    };
    
    // Insert the divider after the specified recipient
    const newItems = [...items];
    newItems.splice(recipientIndex + 1, 0, newDivider);
    
    setItems(newItems);
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
      const updatedItems = items.map(item => {
        if ('type' in item && item.type === 'divider') {
          return item;
        }
        
        if (selectedRecipients.has(item.id)) {
          return { ...item, ...updates };
        }
        return item;
      });
      setItems(updatedItems);
    } else {
      setItems(
        items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };

  const clearRecipients = () => {
    setItems([]);
    setSelectedRecipients(new Set());
    setRecipientCount("1");
    setLastUsedId(0);
  };

  return {
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
    setLastUsedId, // Expose this to allow updating after import
  };
}
