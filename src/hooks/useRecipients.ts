
import { useRecipientState } from "./useRecipientState";
import { useGroupState } from "./useGroupState";
import { useDragAndDrop } from "./useDragAndDrop";
import { useGroupCalculations } from "./useGroupCalculations";
import { Recipient, Group } from "@/types/recipient";

export type { Recipient, Group };

export function useRecipients() {
  const {
    recipients,
    setRecipients,
    selectedRecipients,
    setSelectedRecipients,
    recipientCount,
    setRecipientCount,
    removeRecipient,
    toggleSelectRecipient,
    updateRecipient,
    clearRecipients: clearRecipientsState,
    setLastUsedId
  } = useRecipientState();

  const {
    groups,
    setGroups,
    addGroup,
    removeGroup,
    updateGroup,
    toggleGroupExpanded,
    clearGroups,
    setLastUsedGroupId
  } = useGroupState();

  const { handleDragEnd } = useDragAndDrop(recipients, setRecipients);
  const { getGroupedRecipients, getGroupTotals } = useGroupCalculations(recipients, groups);

  // Combines the recipient creation with the current recipients count
  const addRecipients = (groupId?: string) => {
    const count = parseInt(recipientCount);
    const currentRecipientCount = recipients.length;
    
    const addedCount = useRecipientState().addRecipients(
      count, 
      groupId, 
      currentRecipientCount
    );
    
    setRecipientCount("1");
  };

  // Combined clear function for both recipients and groups
  const clearRecipients = () => {
    clearRecipientsState();
    clearGroups();
  };

  // Handle removing a group (also updates recipients to ungroup them)
  const handleRemoveGroup = (groupId: string) => {
    if (!groupId) return;
    
    removeGroup(groupId);
    
    setRecipients(
      recipients.map(recipient => 
        recipient.groupId === groupId 
          ? { ...recipient, groupId: undefined } 
          : recipient
      )
    );
  };

  return {
    recipients,
    setRecipients,
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
    removeGroup: handleRemoveGroup,
    updateGroup,
    toggleGroupExpanded,
    getGroupedRecipients,
    getGroupTotals
  };
}
