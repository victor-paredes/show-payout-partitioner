
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import RecipientRow from "../RecipientRow";
import { Recipient, Group } from "@/hooks/useRecipients";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const getTooltipContent = () => {
    if (!dragSourceId || !activeDroppableId) return null;
    
    // Add to Group: Show when dragging from ungrouped to this group
    if (dragSourceId === 'ungrouped' && activeDroppableId === group.id) {
      return (
        <TooltipContent side="top" className="bg-green-50 border-green-200 text-green-600">
          <span className="text-sm font-medium">+ Add to Group</span>
        </TooltipContent>
      );
    } 
    // Moving between groups: Show when dragging from a different group to this group
    else if (dragSourceId !== group.id && activeDroppableId === group.id && dragSourceId !== 'ungrouped') {
      return (
        <TooltipContent side="top" className="bg-blue-50 border-blue-200 text-blue-600">
          <span className="text-sm font-medium">+ Move to Group</span>
        </TooltipContent>
      );
    }
    
    return null;
  };

  // Calculate an appropriate min-height based on the number of recipients
  const calculateMinHeight = () => {
    // Base height for each recipient row + padding
    const baseRowHeight = 72; // Height of one row in pixels
    const minRows = 1; // Minimum number of rows to display
    
    // Set min-height to accommodate at least minRows or the current number of recipients
    const minHeight = Math.max(recipients.length, minRows) * baseRowHeight;
    return `${minHeight}px`;
  };

  const tooltipContent = getTooltipContent();
  const showTooltip = !!tooltipContent;

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
      
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <div 
              ref={setNodeRef}
              className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
              style={{ 
                borderColor: group.color + '40', // Add 40 for transparency
                background: activeDroppableId === group.id ? group.color + '10' : 'transparent',
                minHeight: calculateMinHeight(),
                transition: "min-height 0.15s ease-in-out, background-color 0.15s ease-in-out"
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
          </TooltipTrigger>
          {tooltipContent}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GroupSection;
