
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
  const { setNodeRef, isOver } = useDroppable({
    id: group.id
  });

  const getTooltipType = () => {
    if (!dragSourceId || activeDroppableId !== group.id) return null;
    
    if (dragSourceId === 'ungrouped') {
      return 'add';
    } 
    else if (dragSourceId !== group.id) {
      return 'move';
    }
    
    return null;
  };

  const tooltipType = getTooltipType();
  const shouldShowTooltip = tooltipType !== null;

  const calculateMinHeight = () => {
    const baseRowHeight = 72;
    const minRows = 1;
    const minHeight = Math.max(recipients.length, minRows) * baseRowHeight;
    return `${minHeight}px`;
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
      
      <TooltipProvider>
        <Tooltip open={shouldShowTooltip}>
          <TooltipTrigger asChild>
            <div 
              ref={setNodeRef}
              className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
              style={{ 
                borderColor: group.color + '40',
                background: activeDroppableId === group.id ? group.color + '10' : 'transparent',
                minHeight: calculateMinHeight(),
                transition: "min-height 0.15s ease-in-out, background-color 0.15s ease-in-out"
              }}
              data-droppable-id={group.id} // Add a data attribute for easier debugging
            >
              <SortableContext 
                items={recipients.map(r => r.id)} 
                strategy={verticalListSortingStrategy}
              >
                {recipients.length > 0 ? (
                  recipients.map((recipient, rowIndex) => (
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
                  ))
                ) : (
                  // Use a div that doesn't interfere with the droppable area
                  <div className="flex items-center justify-center h-[72px] rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm opacity-80 pointer-events-none">
                    Drop a recipient here
                  </div>
                )}
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
          {shouldShowTooltip && (
            <TooltipContent 
              side="top" 
              className={
                tooltipType === 'add' 
                  ? "bg-green-50 border-green-200 text-green-600" 
                  : "bg-blue-50 border-blue-200 text-blue-600"
              }
              sideOffset={5}
              avoidCollisions={false}
              sticky="always"
              hideWhenDetached={false}
            >
              <span className="text-sm font-medium">
                {tooltipType === 'add' ? '+ Add to Group' : '+ Move to Group'}
              </span>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GroupSection;
