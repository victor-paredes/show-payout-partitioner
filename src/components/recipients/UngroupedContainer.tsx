
import React from "react";
import { Recipient } from "@/hooks/useRecipientsManager";
import RecipientItem from "./RecipientItem";

interface UngroupedContainerProps {
  recipients: Recipient[];
  selectedRecipients: Set<string>;
  valuePerShare: number;
  hoveredRecipientId?: string;
  draggedRecipientId: string | null;
  onUpdateRecipient: (id: string, updates: Partial<Recipient>) => void;
  onRemoveRecipient: (id: string) => void;
  onToggleSelectRecipient: (id: string) => void;
  onDragStart: (recipientId: string, sourceId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  columnWiseTabbing?: boolean;
}

const UngroupedContainer: React.FC<UngroupedContainerProps> = ({
  recipients,
  selectedRecipients,
  valuePerShare,
  hoveredRecipientId,
  draggedRecipientId,
  onUpdateRecipient,
  onRemoveRecipient,
  onToggleSelectRecipient,
  onDragStart,
  onDragOver,
  onDrop,
  columnWiseTabbing = false
}) => {
  const isActiveDropTarget = 
    draggedRecipientId !== null && 
    !recipients.some(r => r.id === draggedRecipientId);
  
  if (recipients.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">
        Ungrouped
        <span className="text-xs ml-2 text-gray-500">
          ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
        </span>
      </h3>
      
      <div
        className={`space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all ${
          isActiveDropTarget ? 'bg-gray-50' : ''
        }`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        data-group-id="ungrouped"
      >
        {recipients.map((recipient, index) => (
          <RecipientItem
            key={recipient.id}
            recipient={recipient}
            onUpdate={(updates) => onUpdateRecipient(recipient.id, updates)}
            onRemove={() => onRemoveRecipient(recipient.id)}
            valuePerShare={valuePerShare}
            isSelected={selectedRecipients.has(recipient.id)}
            onToggleSelect={() => onToggleSelectRecipient(recipient.id)}
            isHighlighted={hoveredRecipientId === recipient.id}
            onDragStart={(id) => onDragStart(id, 'ungrouped')}
            isDragging={draggedRecipientId === recipient.id}
            columnWiseTabbing={columnWiseTabbing}
            rowIndex={index}
            totalRows={recipients.length}
          />
        ))}
      </div>
    </div>
  );
};

export default UngroupedContainer;
