import { useState, useCallback } from "react";
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

export interface Group {
  id: string;
  name: string;
  color: string;
  expanded: boolean;
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [lastUsedId, setLastUsedId] = useState<number>(0);
  const [lastUsedGroupId, setLastUsedGroupId] = useState<number>(0);

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

  const addRecipients = useCallback((groupId?: string) => {
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
        type: "shares" as RecipientType,
        groupId
      };
    });
    
    safeSetRecipients([
      ...recipients,
      ...newRecipients,
    ]);
    
    setLastUsedId(nextId + safeCount - 1);
    setRecipientCount("1");
  }, [recipients, recipientCount, lastUsedId, toast]);

  const addGroup = () => {
    const nextGroupId = (lastUsedGroupId + 1).toString();
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const newGroup = {
      id: nextGroupId,
      name: `Group ${groups.length + 1}`,
      color: randomColor,
      expanded: true
    };
    
    setGroups([...groups, newGroup]);
    setLastUsedGroupId(lastUsedGroupId + 1);
    
    return newGroup;
  };

  const removeGroup = (groupId: string) => {
    if (!groupId) return;
    
    setGroups(groups.filter(group => group.id !== groupId));
    
    safeSetRecipients(
      recipients.map(recipient => 
        recipient.groupId === groupId 
          ? { ...recipient, groupId: undefined } 
          : recipient
      )
    );
  };
  
  const updateGroup = (groupId: string, updates: Partial<Group>) => {
    if (!groupId) return;
    
    setGroups(
      groups.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  const toggleGroupExpanded = (groupId: string) => {
    if (!groupId) return;
    
    setGroups(
      groups.map(group => 
        group.id === groupId ? { ...group, expanded: !group.expanded } : group
      )
    );
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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) {
      console.log('Drag end: No over or active target');
      return;
    }
    
    const activeId = String(active.id);
    const overId = String(over.id);
    
    console.log('Drag end event:', { 
      activeId, 
      overId,
      isActiveIdString: typeof activeId === 'string',
      isOverIdString: typeof overId === 'string'
    });
    
    if (activeId !== overId) {
      const isTargetGroup = groups.some(g => g.id === overId);
      
      if (isTargetGroup) {
        console.log(`Moving recipient ${activeId} to group ${overId}`);
        
        safeSetRecipients(
          recipients.map(recipient => 
            recipient.id === activeId
              ? { ...recipient, groupId: overId } 
              : recipient
          )
        );
      } 
      else if (overId === 'ungrouped') {
        console.log(`Moving recipient ${activeId} to ungrouped`);
        
        safeSetRecipients(
          recipients.map(recipient => 
            recipient.id === activeId
              ? { ...recipient, groupId: undefined } 
              : recipient
          )
        );
      }
      else {
        const overRecipient = recipients.find(r => r.id === overId);
        if (overRecipient) {
          const activeRecipient = recipients.find(r => r.id === activeId);
          
          if (activeRecipient && overRecipient) {
            if (activeRecipient.groupId === overRecipient.groupId) {
              console.log(`Reordering recipient ${activeId} within same group`);
              setRecipients((items) => {
                const oldIndex = items.findIndex(item => item.id === activeId);
                const newIndex = items.findIndex(item => item.id === overId);
                
                if (oldIndex === -1 || newIndex === -1) return items;
                return arrayMove(items, oldIndex, newIndex);
              });
            } else {
              console.log(`Moving recipient ${activeId} to ${overRecipient.groupId || 'ungrouped'}`);
              safeSetRecipients(
                recipients.map(recipient => 
                  recipient.id === activeId
                    ? { ...recipient, groupId: overRecipient.groupId } 
                    : recipient
                )
              );
            }
          }
        }
      }
    }
  }, [recipients, groups]);

  const clearRecipients = () => {
    setRecipients([]);
    setGroups([]);
    setSelectedRecipients(new Set());
    setRecipientCount("1");
    setLastUsedId(0);
    setLastUsedGroupId(0);
  };

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
    setRecipients: safeSetRecipients,
    groups,
    setGroups,
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
    addGroup,
    removeGroup,
    updateGroup,
    toggleGroupExpanded,
    getGroupedRecipients,
    getGroupTotals
  };
}
