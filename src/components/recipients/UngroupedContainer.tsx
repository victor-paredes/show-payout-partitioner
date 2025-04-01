
import React, { useState } from "react";
import RecipientItem from "./RecipientItem";
import { Recipient } from "@/hooks/useRecipientsManager";

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
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e);
  };

  // Calculate minimum height for the container
  const calculateMinHeight = () => {
    const baseRowHeight = 72; // Height of one row in pixels
    const minRows = 1; // Minimum number of rows to display
    const minHeight = Math.max(recipients.length, minRows) * baseRowHeight;
    return `${minHeight}px`;
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2 text-gray-600">Ungrouped</h3>
      <div 
        className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
        style={{ 
          background: isDragOver ? "rgba(0, 0, 0, 0.05)" : "transparent",
          minHeight: calculateMinHeight(),
          transition: "all 0.15s ease-in-out"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-group-id="ungrouped"
      >
        {recipients.length > 0 ? (
          recipients.map((recipient) => (
            <RecipientItem
              key={recipient.id}
              recipient={recipient}
              onUpdate={(updates) => onUpdateRecipient(recipient.id, updates)}
              onRemove={() => onRemoveRecipient(recipient.id)}
              valuePerShare={valuePerShare}
              isSelected={selectedRecipients.has(recipient.id)}
              onSelect={() => onToggleSelectRecipient(recipient.id)}
              isHighlighted={hoveredRecipientId === recipient.id}
              onDragStart={() => onDragStart(recipient.id, "ungrouped")}
              isDragging={draggedRecipientId === recipient.id}
              onHover={onHover}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-[72px] rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm">
            Drop a recipient here
          </div>
        )}
      </div>
    </div>
  );
};

export default UngroupedContainer;
