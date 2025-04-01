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
  groupId?: string;
  groupName?: string;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(1);

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
    setLastUsedId(1);
  };

  const createGroup = (groupName: string) => {
    if (selectedRecipients.size < 2) return;
    
    const groupId = `group-${Date.now()}`;
    
    const selectedIds = Array.from(selectedRecipients);
    
    const newGroup: Group = {
      id: groupId,
      name: groupName,
      memberIds: selectedIds
    };
    
    const updatedRecipients = recipients.map(recipient => {
      if (selectedIds.includes(recipient.id)) {
        return {
          ...recipient,
          groupId,
          groupName
        };
      }
      return recipient;
    });
    
    setGroups([...groups, newGroup]);
    setRecipients(updatedRecipients);
    setSelectedRecipients(new Set());
    
    toast({
      title: "Group Created",
      description: `Created group "${groupName}" with ${selectedIds.length} recipients`,
    });
  };

  const removeFromGroup = (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    if (!recipient || !recipient.groupId) return;
    
    const groupId = recipient.groupId;
    
    const updatedRecipients = recipients.map(r => {
      if (r.id === recipientId) {
        const { groupId, groupName, ...recipientWithoutGroup } = r;
        return recipientWithoutGroup;
      }
      return r;
    });
    
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          memberIds: group.memberIds.filter(id => id !== recipientId)
        };
      }
      return group;
    });
    
    const filteredGroups = updatedGroups.filter(group => group.memberIds.length > 1);
    
    setRecipients(updatedRecipients);
    setGroups(filteredGroups);
    setSelectedRecipients(new Set());
    
    toast({
      title: "Removed from Group",
      description: "Recipient removed from group"
    });
  };

  const dissolveGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const updatedRecipients = recipients.map(recipient => {
      if (recipient.groupId === groupId) {
        const { groupId, groupName, ...recipientWithoutGroup } = recipient;
        return recipientWithoutGroup;
      }
      return recipient;
    });
    
    const updatedGroups = groups.filter(g => g.id !== groupId);
    
    setRecipients(updatedRecipients);
    setGroups(updatedGroups);
    setSelectedRecipients(new Set());
    
    toast({
      title: "Group Dissolved",
      description: `Group "${group.name}" has been dissolved`
    });
  };

  const getSelectedRecipientsGroups = (): { groupId: string, groupName: string }[] => {
    if (selectedRecipients.size === 0) return [];
    
    const groups: { groupId: string, groupName: string }[] = [];
    
    selectedRecipients.forEach(id => {
      const recipient = recipients.find(r => r.id === id);
      if (recipient && recipient.groupId && recipient.groupName) {
        if (!groups.some(g => g.groupId === recipient.groupId)) {
          groups.push({
            groupId: recipient.groupId,
            groupName: recipient.groupName
          });
        }
      }
    });
    
    return groups;
  };

  const isAnySelectedRecipientGrouped = (): boolean => {
    if (selectedRecipients.size === 0) return false;
    
    return Array.from(selectedRecipients).some(id => {
      const recipient = recipients.find(r => r.id === id);
      return recipient && recipient.groupId !== undefined;
    });
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
    removeFromGroup,
    dissolveGroup,
    getSelectedRecipientsGroups,
    isAnySelectedRecipientGrouped
  };
}
