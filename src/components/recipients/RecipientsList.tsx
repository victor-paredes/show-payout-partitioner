
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Recipient, Group } from "@/hooks/useRecipientsManager";
import GroupContainer from "./GroupContainer";
import UngroupedContainer from "./UngroupedContainer";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Users, 
  ChevronDown 
} from "lucide-react";
import ConfirmationModal from '@/components/ConfirmationModal';

interface RecipientsListProps {
  recipients: Recipient[];
  groups: Group[];
  selectedRecipients: Set<string>;
  valuePerShare: number;
  recipientCount: string;
  setRecipientCount: (count: string) => void;
  hoveredRecipientId?: string;
  draggedRecipientId: string | null;
  addRecipients: (groupId?: string) => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  toggleSelectRecipient: (id: string) => void;
  setSelectedRecipients: (recipients: Set<string>) => void;
  clearRecipients?: () => void;
  addGroup: () => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  moveRecipientToGroup: (recipientId: string, targetGroupId: string | null) => void;
  handleDragStart: (recipientId: string, sourceId: string) => void;
  handleDragEnd: (e: any) => void;
  groupedRecipients: {
    ungroupedRecipients: Recipient[];
    recipientsByGroup: {
      group: Group;
      recipients: Recipient[];
    }[];
  };
  onRecipientHover?: (id: string | null) => void;
}

const RecipientsList: React.FC<RecipientsListProps> = ({
  recipients,
  groups,
  selectedRecipients,
  valuePerShare,
  recipientCount,
  setRecipientCount,
  hoveredRecipientId,
  draggedRecipientId,
  addRecipients,
  updateRecipient,
  removeRecipient,
  toggleSelectRecipient,
  setSelectedRecipients,
  clearRecipients,
  addGroup,
  removeGroup,
  updateGroup,
  moveRecipientToGroup,
  handleDragStart,
  handleDragEnd,
  groupedRecipients,
  onRecipientHover
}) => {
  const { toast } = useToast();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Extract group ID from the current target's data attribute
    const currentTarget = e.currentTarget as HTMLElement;
    const groupId = currentTarget.getAttribute('data-group-id');
    
    if (groupId) {
      setDragOverGroupId(groupId);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Reset drag over state
    setDragOverGroupId(null);
    
    // Extract group ID from the current target's data attribute
    const currentTarget = e.currentTarget as HTMLElement;
    const targetGroupId = currentTarget.getAttribute('data-group-id');
    
    if (draggedRecipientId && targetGroupId) {
      // Move the recipient to the target group (or ungrouped if target is "ungrouped")
      moveRecipientToGroup(
        draggedRecipientId, 
        targetGroupId === "ungrouped" ? null : targetGroupId
      );
    }
    
    // Reset drag source
    setDragSourceId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recipients</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={recipientCount}
              onChange={(e) => setRecipientCount(e.target.value)}
              className="w-20 h-8"
              min="1"
              max="100"
            />
            <Button 
              onClick={() => addRecipients()} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
          
          <Button 
            onClick={addGroup} 
            variant="outline" 
            size="sm"
            className="flex items-center"
          >
            <Users className="mr-1 h-4 w-4" />
            Add Group
          </Button>
          
          {recipients.length > 0 && (
            <Button 
              onClick={() => setConfirmClearOpen(true)} 
              variant="outline"
              size="sm"
              className="flex items-center text-red-500 hover:text-red-700"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      {/* Selected Items Counter */}
      {selectedRecipients.size > 0 && (
        <div className="bg-blue-50 p-2 rounded-md text-sm text-blue-600 flex items-center justify-between">
          <span>{selectedRecipients.size} recipient{selectedRecipients.size !== 1 ? 's' : ''} selected</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedRecipients(new Set())}
            className="text-blue-600 h-7 px-2 hover:bg-blue-100"
          >
            Clear Selection
          </Button>
        </div>
      )}
      
      {/* Groups */}
      {groupedRecipients.recipientsByGroup.map(({ group, recipients }) => (
        <GroupContainer
          key={group.id}
          group={group}
          recipients={recipients}
          selectedRecipients={selectedRecipients}
          valuePerShare={valuePerShare}
          hoveredRecipientId={hoveredRecipientId}
          onRemoveGroup={removeGroup}
          onAddRecipients={addRecipients}
          onUpdateRecipient={updateRecipient}
          onRemoveRecipient={removeRecipient}
          onToggleSelectRecipient={toggleSelectRecipient}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggedRecipientId={draggedRecipientId}
          onHover={onRecipientHover}
          onUpdateGroup={updateGroup}
        />
      ))}
      
      {/* Ungrouped Container */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-600">Ungrouped</h3>
        <UngroupedContainer
          recipients={groupedRecipients.ungroupedRecipients}
          selectedRecipients={selectedRecipients}
          valuePerShare={valuePerShare}
          hoveredRecipientId={hoveredRecipientId}
          onUpdateRecipient={updateRecipient}
          onRemoveRecipient={removeRecipient}
          onToggleSelectRecipient={toggleSelectRecipient}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggedRecipientId={draggedRecipientId}
          onHover={onRecipientHover}
        />
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear All Recipients"
        description="Are you sure you want to remove all recipients and groups? This action cannot be undone."
        confirmLabel="Yes, Clear All"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (clearRecipients) {
            clearRecipients();
          }
          setConfirmClearOpen(false);
        }}
        variant="destructive"
      />
    </div>
  );
};

export default RecipientsList;
