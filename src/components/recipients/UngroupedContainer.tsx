
import React, { useState } from 'react';
import { Recipient } from "@/hooks/useRecipientsManager"; // Update import
import RecipientItem from "./RecipientItem";

interface UngroupedContainerProps {
  recipients: Recipient[];
  selectedRecipients: Set<string>;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onUpdateRecipient: (id: string, updates: Partial<Recipient>) => void;
  onRemoveRecipient: (id: string) => void;
  onToggleSelectRecipient: (id: string) => void;
  onDragStart: (recipientId: string, sourceId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  draggedRecipientId: string | null;
  onHover?: (id: string | null) => void;
}

const UngroupedContainer: React.FC<UngroupedContainerProps> = ({
  recipients,
  selectedRecipients,
  valuePerShare,
  hoveredRecipientId,
  onUpdateRecipient,
  onRemoveRecipient,
  onToggleSelectRecipient,
  onDragStart,
  onDragOver,
  onDrop,
  draggedRecipientId,
  onHover
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e);
  };

  return (
    <div 
      className="space-y-2 p-2 rounded-md border-2 border-dashed transition-all"
      style={{ 
        borderColor: isDragOver ? '#3b82f6' : '#e5e7eb',
        background: isDragOver ? '#eff6ff' : 'transparent',
        minHeight: recipients.length === 0 ? '100px' : 'auto',
        transition: "all 0.15s ease-in-out"
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-group-id="ungrouped"
    >
      {recipients.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-sm text-gray-400 text-center py-6">
            Drop recipients here
          </div>
        </div>
      ) : (
        recipients.map((recipient) => (
          <RecipientItem
            key={recipient.id}
            recipient={recipient}
            onUpdate={(updates) => onUpdateRecipient(recipient.id, updates)}
            onRemove={() => onRemoveRecipient(recipient.id)}
            isSelected={selectedRecipients.has(recipient.id)}
            onSelect={() => onToggleSelectRecipient(recipient.id)}
            isHighlighted={hoveredRecipientId === recipient.id}
            valuePerShare={valuePerShare}
            onDragStart={(id) => onDragStart(id, "ungrouped")}
            isDragging={draggedRecipientId === recipient.id}
            onHover={onHover ? (id) => onHover(id) : undefined}
          />
        ))
      )}
    </div>
  );
};

export default UngroupedContainer;
