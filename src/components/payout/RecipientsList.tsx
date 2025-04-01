
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, Users } from "lucide-react";
import RecipientRow from "../RecipientRow";
import { Recipient, RecipientGroup } from "@/hooks/useRecipients";
import ConfirmationModal from "@/components/ConfirmationModal";
import GroupModal from "./GroupModal";
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
  groups: RecipientGroup[];
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
  createGroup: (groupName: string) => void;
}

const RecipientsList = ({
  recipients,
  groups,
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
  createGroup
}: RecipientsListProps) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [columnWiseTabbing, setColumnWiseTabbing] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  
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
    if (selectedRecipients.size > 1) {
      setGroupModalOpen(true);
    }
  };

  const handleGroupConfirm = (groupName: string) => {
    createGroup(groupName);
  };

  const getGroupForRecipient = (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    if (recipient?.groupId) {
      return groups.find(g => g.id === recipient.groupId);
    }
    return undefined;
  };

  // Create the title with the correct singular/plural form
  const actualRecipientCount = recipients.length;
  const recipientsTitle = `${actualRecipientCount} ${actualRecipientCount === 1 ? 'Recipient' : 'Recipients'}`;

  // Group recipients by their groupId
  const recipientsByGroup: {[key: string]: Recipient[]} = {};
  
  // First, add all grouped recipients
  recipients.forEach(recipient => {
    if (recipient.groupId) {
      if (!recipientsByGroup[recipient.groupId]) {
        recipientsByGroup[recipient.groupId] = [];
      }
      recipientsByGroup[recipient.groupId].push(recipient);
    }
  });

  // Then, add ungrouped recipients
  const ungroupedRecipients = recipients.filter(r => !r.groupId);

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
            {selectedRecipients.size > 1 && (
              <Button
                onClick={handleCreateGroup}
                variant="outline"
                size="sm"
                className="flex items-center"
                title="Group selected recipients"
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
            {recipients.length > 0 && (
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
          {recipients.length === 0 ? (
            <div className="text-center py-6 text-gray-500 italic">
              No recipients added. Click "Add Recipient" to get started.
            </div>
          ) : (
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={recipients.map(r => r.id)} 
                strategy={verticalListSortingStrategy}
              >
                {/* Render groups first */}
                {Object.entries(recipientsByGroup).map(([groupId, groupRecipients]) => {
                  const group = groups.find(g => g.id === groupId);
                  if (!group) return null;
                  
                  return (
                    <div key={groupId} className="mb-4 border border-gray-200 rounded-md overflow-hidden">
                      <div className="px-3 py-1 bg-gray-50 text-xs text-gray-500">
                        {group.name}
                      </div>
                      <div>
                        {groupRecipients.map((recipient, rowIndex) => (
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
                            isInGroup={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Then render ungrouped recipients */}
                {ungroupedRecipients.map((recipient, rowIndex) => (
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
          )}
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

      <GroupModal
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        onConfirm={handleGroupConfirm}
      />
    </Card>
  );
};

export default RecipientsList;
