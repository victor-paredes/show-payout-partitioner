
import React, { useState } from 'react';
import { Recipient, Group } from "@/hooks/useRecipientsManager"; // Update import
import RecipientItem from "./RecipientItem";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GroupContainerProps {
  group: Group;
  recipients: Recipient[];
  selectedRecipients: Set<string>;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onRemoveGroup: (id: string) => void;
  onAddRecipients: (groupId?: string) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
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
  
  const handleEditStart = () => {
    setIsEditing(true);
    setEditedName(group.name);
  };
  
  const handleEditSave = () => {
    // Parent component should handle the actual update
    setIsEditing(false);
    if (editedName.trim() !== group.name) {
      // This should update the group in the parent state
      // You'll need to implement this function
      // For now, we'll just log it
      console.log(`Group name changed from ${group.name} to ${editedName}`);
    }
  };
  
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedName(group.name);
  };
  
  const calculateMinHeight = () => {
    return recipients.length === 0 ? '100px' : 'auto';
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2 text-gray-600 flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input 
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-7 py-1 text-sm"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleEditSave}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleEditCancel}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            {group.name}
            <span className="text-xs ml-2 text-gray-500">
              ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={handleEditStart}
              >
                <Edit2 className="h-3 w-3 text-gray-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => onRemoveGroup(group.id)}
              >
                <Trash2 className="h-3 w-3 text-gray-500" />
              </Button>
            </>
          )}
        </div>
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
        {recipients.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-sm text-gray-400 text-center py-6">
              <p>Drop recipients here</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddRecipients(group.id)}
                className="mt-2"
              >
                Add Recipient
              </Button>
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
              onDragStart={(id) => onDragStart(id, group.id)}
              isDragging={draggedRecipientId === recipient.id}
              onHover={onHover}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GroupContainer;
