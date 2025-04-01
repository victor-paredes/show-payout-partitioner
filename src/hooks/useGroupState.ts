
import { useState } from "react";
import { Group } from "@/types/recipient";
import { COLORS } from "@/lib/colorUtils";

export function useGroupState() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [lastUsedGroupId, setLastUsedGroupId] = useState<number>(0);

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

  const clearGroups = () => {
    setGroups([]);
    setLastUsedGroupId(0);
  };

  return {
    groups,
    setGroups,
    addGroup,
    removeGroup,
    updateGroup,
    toggleGroupExpanded,
    clearGroups,
    setLastUsedGroupId
  };
}
