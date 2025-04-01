import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { COLORS } from "@/lib/colorUtils";

export type RecipientType = "shares" | "$" | "%";

export interface Recipient {
  id: string;
  name: string;
  value: number;
  payout: number;
  type: RecipientType;
  isFixedAmount: boolean; // Added this property to make types compatible
  color?: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  expanded: boolean;
  color: string; // Added the color property to match useRecipients.ts Group interface
}

export function useRecipientsManager() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(0);
  const [lastUsedGroupId, setLastUsedGroupId] = useState<number>(0);
  const [draggedRecipientId, setDraggedRecipientId] = useState<string | null>(null);

  // Validate recipients before setting
  const validateAndSetRecipients = (newRecipients: Recipient[]) => {
    const MAX_RECIPIENTS = 1000;
    
    if (newRecipients.length > MAX_RECIPIENTS) {
      setRecipients(newRecipients.slice(0, MAX_RECIPIENTS));
      toast({
        title: "Warning",
        description: `Too many recipients. Limited to ${MAX_RECIPIENTS}.`,
        variant: "destructive"
      });
    } else {
      setRecipients(newRecipients);
    }
  };

  // Add new recipients
  const addRecipients = useCallback((groupId?: string) => {
    const count = Math.min(parseInt(recipientCount), 100);
    
    if (count > 100) {
      toast({
        title: "Warning",
        description: "Maximum 100 recipients can be added at once.",
        variant: "destructive"
      });
    }
    
    let nextId = lastUsedId + 1;
    const currentCount = recipients.length;
    
    const newRecipients = Array.from({ length: count }, (_, index) => {
      const id = (nextId + index).toString();
      return {
        id,
        name: `Recipient ${currentCount + index + 1}`,
        value: 1,
        payout: 0,
        type: "shares" as RecipientType,
        isFixedAmount: false, // Initialize with false for share types
        groupId
      };
    });
    
    validateAndSetRecipients([...recipients, ...newRecipients]);
    setLastUsedId(nextId + count - 1);
    setRecipientCount("1");
  }, [recipients, recipientCount, lastUsedId, toast]);

  // Add a new group
  const addGroup = () => {
    const nextGroupId = (lastUsedGroupId + 1).toString();
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const newGroup = {
      id: nextGroupId,
      name: `Group ${groups.length + 1}`,
      expanded: true,
      color: randomColor // Add a random color to match the interface
    };
    
    setGroups([...groups, newGroup]);
    setLastUsedGroupId(lastUsedGroupId + 1);
    
    return newGroup;
  };

  // Update a recipient
  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    // Sanitize name if present
    if (updates.name) {
      updates.name = updates.name.replace(/<[^>]*>/g, '');
    }
    
    // Handle type changes by updating isFixedAmount too
    if (updates.type) {
      updates.isFixedAmount = updates.type === '$';
    }
    
    // Handle multi-selection update
    if (selectedRecipients.has(id) && selectedRecipients.size > 1) {
      validateAndSetRecipients(
        recipients.map(recipient => 
          selectedRecipients.has(recipient.id) 
            ? { ...recipient, ...updates } 
            : recipient
        )
      );
    } else {
      validateAndSetRecipients(
        recipients.map(recipient => 
          recipient.id === id 
            ? { ...recipient, ...updates } 
            : recipient
        )
      );
    }
  };

  // Remove a recipient
  const removeRecipient = (id: string) => {
    if (selectedRecipients.has(id)) {
      const newSelected = new Set(selectedRecipients);
      newSelected.delete(id);
      setSelectedRecipients(newSelected);
    }
    
    validateAndSetRecipients(recipients.filter(r => r.id !== id));
  };

  // Toggle recipient selection
  const toggleSelectRecipient = (id: string) => {
    const newSelected = new Set(selectedRecipients);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    
    setSelectedRecipients(newSelected);
  };

  // Update a group
  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups(
      groups.map(group => 
        group.id === id ? { ...group, ...updates } : group
      )
    );
  };

  // Remove a group
  const removeGroup = (id: string) => {
    setGroups(groups.filter(group => group.id !== id));
    
    // Ungroup all recipients in this group
    validateAndSetRecipients(
      recipients.map(recipient => 
        recipient.groupId === id 
          ? { ...recipient, groupId: undefined } 
          : recipient
      )
    );
  };

  // Toggle group expanded state
  const toggleGroupExpanded = (id: string) => {
    setGroups(
      groups.map(group => 
        group.id === id ? { ...group, expanded: !group.expanded } : group
      )
    );
  };

  // Move a recipient to a different group
  const moveRecipientToGroup = (recipientId: string, targetGroupId: string | null) => {
    validateAndSetRecipients(
      recipients.map(recipient => 
        recipient.id === recipientId
          ? { ...recipient, groupId: targetGroupId || undefined }
          : recipient
      )
    );
  };

  // Reorder recipients within a group
  const reorderRecipients = (sourceIndex: number, destinationIndex: number, groupId?: string) => {
    const groupRecipients = groupId 
      ? recipients.filter(r => r.groupId === groupId)
      : recipients.filter(r => !r.groupId);
    
    const otherRecipients = groupId
      ? recipients.filter(r => r.groupId !== groupId)
      : recipients.filter(r => r.groupId);
    
    // Don't do anything if indices are out of bounds
    if (sourceIndex < 0 || sourceIndex >= groupRecipients.length ||
        destinationIndex < 0 || destinationIndex >= groupRecipients.length) {
      return;
    }
    
    // Create a new array with the reordered items
    const reorderedRecipients = [...groupRecipients];
    const [removed] = reorderedRecipients.splice(sourceIndex, 1);
    reorderedRecipients.splice(destinationIndex, 0, removed);
    
    // Combine reordered recipients with others
    validateAndSetRecipients([...reorderedRecipients, ...otherRecipients]);
  };

  // Clear all recipients and groups
  const clearRecipients = () => {
    setRecipients([]);
    setGroups([]);
    setSelectedRecipients(new Set());
    setRecipientCount("1");
    setLastUsedId(0);
    setLastUsedGroupId(0);
  };

  // Group recipients by their groups
  const getGroupedRecipients = () => {
    const ungroupedRecipients = recipients.filter(r => !r.groupId);
    
    const recipientsByGroup = groups.map(group => {
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      return {
        group,
        recipients: groupRecipients
      };
    });
    
    return {
      ungroupedRecipients,
      recipientsByGroup
    };
  };

  // Prepare data for drag operations
  const handleDragStart = (recipientId: string) => {
    setDraggedRecipientId(recipientId);
  };

  const handleDragEnd = () => {
    setDraggedRecipientId(null);
  };

  // Calculate group totals
  const getGroupTotals = () => {
    return groups.map(group => {
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      
      const dollarTotal = groupRecipients
        .filter(r => r.type === "$")
        .reduce((sum, r) => sum + r.payout, 0);
        
      const percentTotal = groupRecipients
        .filter(r => r.type === "%")
        .reduce((sum, r) => sum + r.payout, 0);
        
      const sharesTotal = groupRecipients
        .filter(r => r.type === "shares")
        .reduce((sum, r) => sum + r.payout, 0);
        
      const totalPayout = dollarTotal + percentTotal + sharesTotal;
      
      const dollarCount = groupRecipients.filter(r => r.type === "$").length;
      const percentCount = groupRecipients.filter(r => r.type === "%").length;
      const sharesCount = groupRecipients.filter(r => r.type === "shares").length;
      
      return {
        group,
        dollarTotal,
        percentTotal,
        sharesTotal,
        totalPayout,
        dollarCount,
        percentCount,
        sharesCount,
        recipientCount: groupRecipients.length
      };
    });
  };

  return {
    recipients,
    setRecipients: validateAndSetRecipients,
    groups,
    setGroups,
    selectedRecipients,
    setSelectedRecipients,
    recipientCount,
    setRecipientCount,
    addRecipients,
    updateRecipient,
    removeRecipient,
    toggleSelectRecipient,
    addGroup,
    updateGroup,
    removeGroup,
    toggleGroupExpanded,
    moveRecipientToGroup,
    reorderRecipients,
    clearRecipients,
    getGroupedRecipients,
    getGroupTotals,
    draggedRecipientId,
    handleDragStart,
    handleDragEnd
  };
}
