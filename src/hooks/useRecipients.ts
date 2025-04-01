import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { RecipientType } from "@/components/RecipientRow";

export interface RecipientGroup {
  id: string;
  name: string;
  recipientIds: string[];
}

export interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
  color?: string;
  groupId?: string;
}

export function useRecipients() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [groups, setGroups] = useState<RecipientGroup[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(0);

  const addRecipients = () => {
    const currentRecipientCount = recipients.length;
    const count = parseInt(recipientCount);
    
    let nextId = lastUsedId + 1;
    
    recipients.forEach(recipient => {
      const idNum = parseInt(recipient.id);
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
    
    setRecipients([
      ...recipients,
      ...newRecipients,
    ]);
    
    setLastUsedId(nextId + count - 1);
    setRecipientCount("1");
  };

  const removeRecipient = (id: string) => {
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
    setRecipients([]);
    setSelectedRecipients(new Set());
    setRecipientCount("1");
    setLastUsedId(0);
    setGroups([]);
  };

  const createGroup = (groupName: string) => {
    if (selectedRecipients.size < 2) {
      return;
    }

    const groupId = `group-${Date.now()}`;
    const selectedIds = Array.from(selectedRecipients);
    
    const newGroup: RecipientGroup = {
      id: groupId,
      name: groupName,
      recipientIds: selectedIds
    };
    
    setGroups([...groups, newGroup]);
    
    const updatedRecipients = recipients.map(recipient => {
      if (selectedIds.includes(recipient.id)) {
        return { ...recipient, groupId };
      }
      return recipient;
    });
    
    setRecipients(updatedRecipients);
    
    setSelectedRecipients(new Set());
    
    toast({
      title: "Group Created",
      description: `Created group "${groupName}" with ${selectedIds.length} recipients`
    });
  };

  const ungroupRecipient = (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    if (!recipient || !recipient.groupId) return;
    
    const group = groups.find(g => g.id === recipient.groupId);
    if (!group) return;
    
    const updatedRecipients = recipients.map(r => {
      if (r.id === recipientId) {
        const { groupId, ...rest } = r;
        return rest;
      }
      return r;
    });
    
    const updatedGroups = groups.map(g => {
      if (g.id === recipient.groupId) {
        return {
          ...g,
          recipientIds: g.recipientIds.filter(id => id !== recipientId)
        };
      }
      return g;
    });
    
    const filteredGroups = updatedGroups.filter(g => g.recipientIds.length > 0);
    
    setRecipients(updatedRecipients);
    setGroups(filteredGroups);
  };

  const disbandGroup = (groupId: string) => {
    const updatedRecipients = recipients.map(recipient => {
      if (recipient.groupId === groupId) {
        const { groupId, ...rest } = recipient;
        return rest;
      }
      return recipient;
    });
    
    const updatedGroups = groups.filter(g => g.id !== groupId);
    
    setRecipients(updatedRecipients);
    setGroups(updatedGroups);
  };

  return {
    recipients,
    setRecipients,
    groups,
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
    createGroup,
    ungroupRecipient,
    disbandGroup
  };
}
