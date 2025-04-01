
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import RecipientItem from "./RecipientItem";
import { Group, Recipient } from "@/hooks/useRecipientsManager";

interface GroupContainerProps {
  group: Group;
  recipients: Recipient[];
  selectedRecipients: Set<string>;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onRemoveGroup: (id: string) => void;
  onAddRecipients: (groupId: string) => void;
  onUpdateRecipient: (id: string, updates: Partial<Recipient>) => void;
  onRemoveRecipient: (id: string) => void;
  onToggleSelectRecipient: (id: string) => void;
  onDragStart: (recipientId: string, sourceId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  draggedRecipientId: string | null;
  onHover?: (id: string | null) => void;
}

const GroupContainer: React.FC<GroupContainerProps> = ({
  group,
  recipients,
  selectedRecipients,
  valuePerShare,
  hoveredRecipientId,
  onRemoveGroup,
  onAddRecipients,
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
      <h3 className="text-sm font-medium mb-2 text-gray-600 flex items-center justify-between">
        <div className="flex items-center">
          {group.name}
          <span className="text-xs ml-2 text-gray-500">
            ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:text-red-500"
          onClick={() => onRemoveGroup(group.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </h3>
      
      <div 
        className="space-y-2 p-2 rounded-md border-2 border-dashed transition-all"
        style={{ 
          borderColor: isDragOver ? '#3b82f6' : '#e5e7eb',
          background: isDragOver ? '#eff6ff' : 'transparent',
          minHeight: calculateMinHeight(),
          transition: "all 0.15s ease-in-out"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-group-id={group.id}
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
              onDragStart={() => onDragStart(recipient.id, group.id)}
              isDragging={draggedRecipientId === recipient.id}
              onHover={onHover}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-[72px] rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm">
            Drop a recipient here
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs h-6 justify-start"
          onClick={() => onAddRecipients(group.id)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Recipients
        </Button>
      </div>
    </div>
  );
};

export default GroupContainer;
