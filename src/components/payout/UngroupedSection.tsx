
import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import RecipientRow from "../RecipientRow";
import { Recipient } from "@/hooks/useRecipients";

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

  const getDropIndicator = () => {
    if (!dragSourceId || !activeDroppableId) return null;
    
    if (dragSourceId && dragSourceId !== 'ungrouped' && activeDroppableId === 'ungrouped') {
      return (
        <div className="flex items-center justify-center py-2 text-amber-600 bg-amber-50 rounded-md border border-amber-200 mt-2">
          <span className="text-sm font-medium">- Remove from Group</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2 text-gray-600">Ungrouped</h3>
      <div 
        ref={setNodeRef}
        className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
        style={{ 
          background: activeDroppableId === 'ungrouped' ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
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
      </div>
    </div>
  );
};

export default UngroupedSection;
