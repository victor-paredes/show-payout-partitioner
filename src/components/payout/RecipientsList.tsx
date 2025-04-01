import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, FolderPlus, Layers } from "lucide-react";
import RecipientRow from "../RecipientRow";
import { Recipient, Group } from "@/hooks/useRecipients";
import ConfirmationModal from "@/components/ConfirmationModal";
import GroupsManager from "./GroupsManager";
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
  groups: Group[];
  recipientCount: string;
  setRecipientCount: (count: string) => void;
  addRecipients: (groupId?: string) => void;
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
  addGroup: () => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  toggleGroupExpanded: (id: string) => void;
  groupedRecipients: {
    ungroupedRecipients: Recipient[];
    recipientsByGroup: {
      group: Group;
      recipients: Recipient[];
    }[];
  };
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
  addGroup,
  removeGroup,
  updateGroup,
  toggleGroupExpanded,
  groupedRecipients
}: RecipientsListProps) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [columnWiseTabbing, setColumnWiseTabbing] = useState(false);
  const [showGroups, setShowGroups] = useState(true);
  
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

  const actualRecipientCount = recipients.length;
  const recipientsTitle = `${actualRecipientCount} ${actualRecipientCount === 1 ? 'Recipient' : 'Recipients'}`;

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
            {recipients.length > 0 && (
              <Button
                onClick={() => setShowGroups(!showGroups)}
                variant="outline"
                size="sm"
                className="flex items-center"
                title={showGroups ? "Hide groups" : "Show groups"}
              >
                <Layers className="h-4 w-4" />
              </Button>
            )}
            {recipients.length > 0 && (
              <Button
                onClick={toggleTabbingDirection}
                variant="outline"
                size="sm"
                className="flex items-center"
                title={columnWiseTabbing ? "Switch to row-wise tabbing" : "Switch to column-wise tabbing"}
              >
                <span className="mr-1">Tab</span>
                {columnWiseTabbing ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
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
            
            <Button 
              onClick={() => addRecipients()} 
              variant="outline" 
              size="sm" 
              className="flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Recipient{parseInt(recipientCount) > 1 ? 's' : ''}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {showGroups && (
              <div className="md:col-span-1">
                <GroupsManager 
                  groups={groups}
                  onAddGroup={addGroup}
                  onRemoveGroup={removeGroup}
                  onUpdateGroup={updateGroup}
                  onToggleExpanded={toggleGroupExpanded}
                  onAddRecipients={(groupId) => addRecipients(groupId)}
                />
              </div>
            )}
            
            <div className={`${showGroups ? 'md:col-span-3' : 'md:col-span-4'} space-y-2`}>
              {recipients.length === 0 ? (
                <div className="text-center py-6 text-gray-500 italic">
                  No recipients added. Click "Add Recipient" to get started.
                </div>
              ) : (
                <>
                  {/* Ungrouped recipients */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2 text-gray-600">Ungrouped</h3>
                    <div className="space-y-2">
                      <SortableContext 
                        items={groupedRecipients.ungroupedRecipients.map(r => r.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        {groupedRecipients.ungroupedRecipients.map((recipient, rowIndex) => (
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
                            totalRows={groupedRecipients.ungroupedRecipients.length}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </div>
                  
                  {/* Grouped recipients */}
                  {groupedRecipients.recipientsByGroup.map(({ group, recipients }) => (
                    <div key={group.id} className="mb-6">
                      <h3 className="text-sm font-medium mb-2 text-gray-600 flex items-center">
                        {group.name}
                        <span className="text-xs ml-2 text-gray-500">
                          ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
                        </span>
                      </h3>
                      
                      <div className="space-y-2">
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
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </DndContext>
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
    </Card>
  );
};

export default RecipientsList;
