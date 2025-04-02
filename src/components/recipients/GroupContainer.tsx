
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import RecipientItem from "./RecipientItem";
import { Group, Recipient } from "@/hooks/useRecipientsManager";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  onUpdateGroup?: (id: string, updates: Partial<Group>) => void;
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
  onUpdateGroup
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  
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

  const handleEditSave = () => {
    // Only update if there's a valid name and the onUpdateGroup prop is provided
    if (groupName.trim() && onUpdateGroup) {
      onUpdateGroup(group.id, { name: groupName.trim() });
    }
    
    // Return to original name if empty
    if (!groupName.trim()) {
      setGroupName(group.name);
    }
    
    setEditDialogOpen(false);
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
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit2 className="h-3 w-3 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:text-red-500"
            onClick={() => onRemoveGroup(group.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </h3>
      
      <div 
        className="space-y-2 p-2 rounded-md border-2 border-dashed transition-all"
        style={{ 
          borderColor: isDragOver ? "#94a3b8" : "#e2e8f0",
          background: isDragOver ? "#f8fafc" : 'transparent',
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Group Name</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupContainer;
