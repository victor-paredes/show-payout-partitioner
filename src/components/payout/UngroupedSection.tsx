
import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import RecipientRow from "../RecipientRow";
import { Recipient } from "@/hooks/useRecipients";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UngroupedSectionProps {
  recipients: Recipient[];
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

const UngroupedSection: React.FC<UngroupedSectionProps> = ({
  recipients,
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
    id: 'ungrouped'
  });

  const getTooltipContent = () => {
    if (!dragSourceId || !activeDroppableId) return null;
    
    // Only show the "Remove from Group" indicator when:
    // 1. The drag source is a group (not ungrouped)
    // 2. The drop target is ungrouped
    // 3. We are hovering over the ungrouped area (activeDroppableId === 'ungrouped')
    if (dragSourceId !== 'ungrouped' && activeDroppableId === 'ungrouped') {
      return (
        <TooltipContent side="top" className="bg-amber-50 border-amber-200 text-amber-600">
          <span className="text-sm font-medium">- Remove from Group</span>
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
      <h3 className="text-sm font-medium mb-2 text-gray-600">Ungrouped</h3>
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <div 
              ref={setNodeRef}
              className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
              style={{ 
                background: activeDroppableId === 'ungrouped' ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
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
            </div>
          </TooltipTrigger>
          {tooltipContent}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default UngroupedSection;
