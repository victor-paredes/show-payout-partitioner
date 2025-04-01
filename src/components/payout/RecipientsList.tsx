
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, UserMinus, Users, UserX } from "lucide-react";
import RecipientRow from "../RecipientRow";
import { Recipient } from "@/hooks/useRecipients";
import ConfirmationModal from "@/components/ConfirmationModal";
import GroupNameModal from "@/components/GroupNameModal";
import ConfirmGroupDissolutionModal from "@/components/ConfirmGroupDissolutionModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {
  Select,
  SelectContent,
  SelectContentNonPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipientsListProps {
  recipients: Recipient[];
  recipientCount: string;
  setRecipientCount: (count: string) => void;
  addRecipients: () => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  selectedRecipients: Set<string>;
  toggleSelectRecipient: (id: string) => void;
  setSelectedRecipients: (selections: Set<string>) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
  clearRecipients?: () => void;
  createGroup?: (groupName: string) => void;
  removeFromGroup?: (recipientId: string) => void;
  dissolveGroup?: (groupId: string) => void;
  getSelectedRecipientsGroups?: () => { groupId: string, groupName: string }[];
  isAnySelectedRecipientGrouped?: () => boolean;
}

const RecipientsList = ({
  recipients,
  recipientCount,
  setRecipientCount,
  addRecipients,
  updateRecipient,
  removeRecipient,
  selectedRecipients,
  toggleSelectRecipient,
  setSelectedRecipients,
  handleDragEnd,
  valuePerShare,
  hoveredRecipientId,
  onRecipientHover,
  clearRecipients,
  createGroup,
  removeFromGroup,
  dissolveGroup,
  getSelectedRecipientsGroups,
  isAnySelectedRecipientGrouped
}: RecipientsListProps) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [columnWiseTabbing, setColumnWiseTabbing] = useState(false);
  const [groupNameModalOpen, setGroupNameModalOpen] = useState(false);
  const [confirmDissolutionOpen, setConfirmDissolutionOpen] = useState(false);
  const [groupToDissolve, setGroupToDissolve] = useState<{ id: string, name: string } | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clearAllSelections = () => {
    setSelectedRecipients(new Set());
  };

  const handleClearClick = () => {
    setConfirmClearOpen(true);
  };

  const handleConfirmClear = () => {
    if (clearRecipients) {
      clearRecipients();
    }
    setConfirmClearOpen(false);
  };

  const toggleTabbingDirection = () => {
    setColumnWiseTabbing(!columnWiseTabbing);
  };

  const handleCreateGroup = () => {
    if (selectedRecipients.size >= 2) {
      setGroupNameModalOpen(true);
    }
  };

  const handleGroupNameConfirm = (groupName: string) => {
    if (createGroup) {
      createGroup(groupName);
      setGroupNameModalOpen(false);
    }
  };

  const handleRemoveFromGroup = () => {
    if (selectedRecipients.size === 1 && removeFromGroup) {
      const recipientId = Array.from(selectedRecipients)[0];
      removeFromGroup(recipientId);
    }
  };

  const handleDissolveGroupClick = () => {
    if (!getSelectedRecipientsGroups) return;
    
    const groups = getSelectedRecipientsGroups();
    if (groups.length > 0) {
      setGroupToDissolve({
        id: groups[0].groupId,
        name: groups[0].groupName
      });
      setConfirmDissolutionOpen(true);
    }
  };

  const handleConfirmDissolveGroup = () => {
    if (dissolveGroup && groupToDissolve) {
      dissolveGroup(groupToDissolve.id);
      setConfirmDissolutionOpen(false);
      setGroupToDissolve(null);
    }
  };

  // Show the group button only when 2+ recipients are selected
  const showGroupButton = selectedRecipients.size >= 2;
  
  // Show ungroup button when a single grouped recipient is selected
  const showUngroupButton = 
    selectedRecipients.size === 1 && 
    recipients.some(r => 
      selectedRecipients.has(r.id) && r.groupId !== undefined
    );
  
  // Show dissolve group button when any selected recipient is grouped
  const showDissolveButton = 
    isAnySelectedRecipientGrouped && 
    isAnySelectedRecipientGrouped();

  // Create the title with the correct singular/plural form
  const recipientsTitle = `${recipients.length} ${recipients.length === 1 ? 'Recipient' : 'Recipients'}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{recipientsTitle}</span>
            {selectedRecipients.size > 1 && (
              <div className="text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded-md flex items-center gap-1">
                <span>Editing Multiple</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 hover:bg-blue-200" 
                  onClick={clearAllSelections}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {showDissolveButton && (
              <Button
                onClick={handleDissolveGroupClick}
                variant="outline"
                size="sm"
                className="flex items-center"
                title="Dissolve group"
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}
            {showUngroupButton && (
              <Button
                onClick={handleRemoveFromGroup}
                variant="outline"
                size="sm"
                className="flex items-center"
                title="Remove from group"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
            {showGroupButton && (
              <Button
                onClick={handleCreateGroup}
                variant="outline"
                size="sm"
                className="flex items-center"
                title="Create group from selected"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={toggleTabbingDirection}
              variant="outline"
              size="sm"
              className="flex items-center"
              title={columnWiseTabbing ? "Switch to row-wise tabbing" : "Switch to column-wise tabbing"}
            >
              {columnWiseTabbing ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
            {recipients.length > 1 && (
              <Button 
                onClick={handleClearClick} 
                variant="outline" 
                size="sm" 
                className="flex items-center"
              >
                <Trash2 className="mr-1 h-4 w-4" /> Clear
              </Button>
            )}
            <Select value={recipientCount} onValueChange={setRecipientCount}>
              <SelectTrigger className="w-16">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContentNonPortal>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContentNonPortal>
            </Select>
            <Button onClick={addRecipients} variant="outline" size="sm" className="flex items-center">
              <Plus className="mr-1 h-4 w-4" /> Add Recipient{parseInt(recipientCount) > 1 ? 's' : ''}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
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
          </DndContext>
        </div>
      </CardContent>
      
      <ConfirmationModal
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear Recipients"
        description="Are you sure you want to clear all recipients? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Go Back"
        onConfirm={handleConfirmClear}
        variant="destructive"
      />
      
      <GroupNameModal
        open={groupNameModalOpen}
        onOpenChange={setGroupNameModalOpen}
        onConfirm={handleGroupNameConfirm}
      />
      
      {groupToDissolve && (
        <ConfirmGroupDissolutionModal
          open={confirmDissolutionOpen}
          onOpenChange={setConfirmDissolutionOpen}
          onConfirm={handleConfirmDissolveGroup}
          groupName={groupToDissolve.name}
        />
      )}
    </Card>
  );
};

export default RecipientsList;
