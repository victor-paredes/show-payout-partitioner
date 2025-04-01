
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
}

export interface RecipientGroup {
  id: string;
  name: string;
  recipientIds: string[];
}

export function useRecipients() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(0);
  const [lastUsedGroupId, setLastUsedGroupId] = useState<number>(0);

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
    // Check if recipient is in a group and update the group
    const recipient = recipients.find(r => r.id === id);
    if (recipient?.groupId) {
      // Find the group
      const group = recipientGroups.find(g => g.id === recipient.groupId);
      if (group) {
        if (group.recipientIds.length <= 2) {
          // If this is the last or second-to-last recipient in the group, ungroup all
          ungroupRecipients(group.id);
        } else {
          // Remove just this recipient from the group
          setRecipientGroups(
            recipientGroups.map(g => 
              g.id === group.id ? 
                { ...g, recipientIds: g.recipientIds.filter(rid => rid !== id) } : 
                g
            )
          );
        }
      }
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
    
    if (!over || active.id === over.id) return;

    // Get the active recipient
    const activeRecipient = recipients.find(r => r.id === active.id);
    if (!activeRecipient) return;

    // Find out if the active recipient is part of a group
    const activeGroup = activeRecipient.groupId 
      ? recipientGroups.find(g => g.id === activeRecipient.groupId)
      : null;

    if (activeGroup) {
      // We're dragging a group
      const groupRecipientIds = new Set(activeGroup.recipientIds);
      const nonGroupRecipients = recipients.filter(r => !groupRecipientIds.has(r.id));
      
      // Find the position of the over recipient
      const overRecipient = recipients.find(r => r.id === over.id);
      if (!overRecipient) return;

      // Determine if the over recipient is part of the same group
      const isSameGroup = overRecipient.groupId === activeRecipient.groupId;
      
      if (isSameGroup) {
        // No need to do anything if within the same group
        return;
      }

      // Get the group recipients in their current order
      const groupRecipients = recipients.filter(r => groupRecipientIds.has(r.id));
      
      // Find the position where to insert the group
      const overIndex = recipients.findIndex(r => r.id === over.id);
      
      // Create the new recipients array by inserting the group at the over position
      let newRecipients: Recipient[] = [];
      
      for (let i = 0; i < recipients.length; i++) {
        if (groupRecipientIds.has(recipients[i].id)) {
          // Skip group members - we'll add them in the right spot
          continue;
        }
        
        if (i === overIndex) {
          // Insert the group here
          newRecipients.push(...groupRecipients);
        }
        
        newRecipients.push(recipients[i]);
      }
      
      // If the over position is at the end
      if (overIndex === recipients.length - 1) {
        newRecipients.push(...groupRecipients);
      }
      
      setRecipients(newRecipients);
    } else {
      // Regular dragging of individual recipients
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
    setRecipientGroups([]);
    setLastUsedGroupId(0);
  };

  const createGroup = (groupName: string) => {
    if (selectedRecipients.size < 2) {
      toast({
        title: "Group Creation Failed",
        description: "Select at least two recipients to create a group",
        variant: "destructive",
      });
      return;
    }

    // Generate a new group ID
    const groupId = `group-${lastUsedGroupId + 1}`;
    
    // Create the group
    const newGroup: RecipientGroup = {
      id: groupId,
      name: groupName,
      recipientIds: Array.from(selectedRecipients)
    };
    
    // Update recipients to be part of this group
    const updatedRecipients = recipients.map(recipient => {
      if (selectedRecipients.has(recipient.id)) {
        return { ...recipient, groupId };
      }
      return recipient;
    });
    
    setRecipientGroups([...recipientGroups, newGroup]);
    setRecipients(updatedRecipients);
    setLastUsedGroupId(lastUsedGroupId + 1);
    
    // Clear selection after grouping
    setSelectedRecipients(new Set());

    toast({
      title: "Group Created",
      description: `Created group "${groupName}" with ${selectedRecipients.size} recipients`,
    });
  };

  const ungroupRecipients = (groupId: string) => {
    // Find the group
    const group = recipientGroups.find(g => g.id === groupId);
    if (!group) return;
    
    // Update recipients to remove group association
    const updatedRecipients = recipients.map(recipient => {
      if (recipient.groupId === groupId) {
        // Create a new object without the groupId property
        const { groupId, ...rest } = recipient;
        return rest;
      }
      return recipient;
    });
    
    // Remove the group
    setRecipientGroups(recipientGroups.filter(g => g.id !== groupId));
    setRecipients(updatedRecipients);
    
    toast({
      title: "Group Removed",
      description: `Removed group "${group.name}"`,
    });
  };

  // Get all groups with their recipients
  const getGroupsWithRecipients = () => {
    return recipientGroups.map(group => {
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      return {
        ...group,
        recipients: groupRecipients
      };
    });
  };

  return {
    recipients,
    setRecipients,
    recipientGroups,
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
    ungroupRecipients,
    getGroupsWithRecipients
  };
}
