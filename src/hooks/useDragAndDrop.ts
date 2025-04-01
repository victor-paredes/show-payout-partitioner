
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Recipient } from "@/types/recipient";

export function useDragAndDrop(
  recipients: Recipient[],
  setRecipients: (recipients: Recipient[]) => void
) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;
    
    console.log('Drag end event:', { active, over });
    
    if (active.id !== over.id) {
      const isTargetGroup = over.id.toString().startsWith('group-');
      const targetGroupId = isTargetGroup ? over.id.toString().replace('group-', '') : undefined;
      
      if (isTargetGroup) {
        console.log(`Moving recipient ${active.id} to group ${targetGroupId}`);
        setRecipients(
          recipients.map(recipient => 
            recipient.id === active.id 
              ? { ...recipient, groupId: targetGroupId } 
              : recipient
          )
        );
      } 
      else if (over.id === 'ungrouped') {
        console.log(`Moving recipient ${active.id} to ungrouped`);
        setRecipients(
          recipients.map(recipient => 
            recipient.id === active.id 
              ? { ...recipient, groupId: undefined } 
              : recipient
          )
        );
      }
      else if (typeof over.id === 'string' && typeof active.id === 'string') {
        const overRecipient = recipients.find(r => r.id === over.id);
        if (overRecipient) {
          const activeRecipient = recipients.find(r => r.id === active.id);
          
          if (activeRecipient && overRecipient) {
            if (activeRecipient.groupId === overRecipient.groupId) {
              console.log(`Reordering recipient ${active.id} within same group`);
              const oldIndex = recipients.findIndex(item => item.id === active.id);
              const newIndex = recipients.findIndex(item => item.id === over.id);
              
              if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedRecipients = arrayMove(recipients, oldIndex, newIndex);
                setRecipients(reorderedRecipients);
              }
            } else {
              console.log(`Moving recipient ${active.id} to ${overRecipient.groupId || 'ungrouped'}`);
              setRecipients(
                recipients.map(recipient => 
                  recipient.id === active.id 
                    ? { ...recipient, groupId: overRecipient.groupId } 
                    : recipient
                )
              );
            }
          }
        }
      }
    }
  };

  return { handleDragEnd };
}
