
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import RecipientRow from "../RecipientRow";
import { Recipient, Group } from "@/hooks/useRecipients";

interface GroupSectionProps {
  group: Group;
  recipients: Recipient[];
  removeGroup: (id: string) => void;
  addRecipients: (groupId: string) => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  selectedRecipients: Set<string>;
  toggleSelectRecipient: (id: string) => void;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
  columnWiseTabbing: boolean;
  activeDroppableId: string | null;
  dragSourceId: string | null;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  recipients,
  removeGroup,
  addRecipients,
  updateRecipient,
  removeRecipient,
  selectedRecipients,
  toggleSelectRecipient,
  valuePerShare,
  hoveredRecipientId,
  onRecipientHover,
  columnWiseTabbing,
  activeDroppableId,
  dragSourceId
}) => {
  const { setNodeRef } = useDroppable({
    id: group.id
  });

  const getDropIndicator = () => {
    if (!dragSourceId || !activeDroppableId) return null;
    
    if (dragSourceId === 'ungrouped' && activeDroppableId === group.id) {
      return (
        <div className="flex items-center justify-center py-2 text-green-600 bg-green-50 rounded-md border border-green-200 mt-2">
          <span className="text-sm font-medium">+ Add to Group</span>
        </div>
      );
    } else if (dragSourceId === group.id && activeDroppableId === 'ungrouped') {
      return (
        <div className="flex items-center justify-center py-2 text-amber-600 bg-amber-50 rounded-md border border-amber-200 mt-2">
          <span className="text-sm font-medium">- Remove from Group</span>
        </div>
      );
    } else if (dragSourceId !== group.id && activeDroppableId === group.id && dragSourceId !== 'ungrouped') {
      return (
        <div className="flex items-center justify-center py-2 text-blue-600 bg-blue-50 rounded-md border border-blue-200 mt-2">
          <span className="text-sm font-medium">+ Add to Group</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2 text-gray-600 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="h-2 w-2 rounded-full mr-2"
            style={{ backgroundColor: group.color }}
          ></div>
          {group.name}
          <span className="text-xs ml-2 text-gray-500">
            ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:text-red-500"
          onClick={() => removeGroup(group.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </h3>
      
      <div 
        ref={setNodeRef}
        className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
        style={{ 
          borderColor: group.color + '40', // Add 40 for transparency
          background: activeDroppableId === group.id ? group.color + '10' : 'transparent',
          minHeight: recipients.length === 0 ? '72px' : 'auto' // Ensure minimum height when empty
        }}
      >
        <SortableContext 
          items={recipients.map(r => r.id)} 
          strategy={verticalListSortingStrategy}
        >
          {recipients.map((recipient, rowIndex) => (
            <RecipientRow
              key={recipient.id}
              recipient={recipient}
              onUpdate={(updates) => updateRecipient(recipient.id, updates)}
              onRemove={() => removeRecipient(recipient.id)}
              valuePerShare={valuePerShare}
              isSelected={selectedRecipients.has(recipient.id)}
              onToggleSelect={() => toggleSelectRecipient(recipient.id)}
              isHighlighted={hoveredRecipientId === recipient.id}
              onRecipientHover={onRecipientHover}
              columnWiseTabbing={columnWiseTabbing}
              rowIndex={rowIndex}
              totalRows={recipients.length}
            />
          ))}
        </SortableContext>
        
        {getDropIndicator()}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs h-6 justify-start"
          onClick={() => addRecipients(group.id)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Recipients
        </Button>
      </div>
    </div>
  );
};

export default GroupSection;
