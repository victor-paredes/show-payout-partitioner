
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, Users, FolderPlus, FolderMinus } from "lucide-react";
import RecipientRow from "../RecipientRow";
import { Recipient, Group } from "@/hooks/useRecipients";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent
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
import { useDroppable } from "@dnd-kit/core";

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
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { setNodeRef: setUngroupedRef } = useDroppable({
    id: 'ungrouped'
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    
    // Determine the source group
    const draggedRecipient = recipients.find(r => r.id === active.id);
    setDragSourceId(draggedRecipient?.groupId || 'ungrouped');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setActiveDroppableId(over.id as string);
    } else {
      setActiveDroppableId(null);
    }
  };

  // Renamed to onDragEnd to avoid name conflict with the prop
  const onDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDroppableId(null);
    setDragSourceId(null);
    handleDragEnd(event);
  };

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

  const getDropIndicator = (groupId: string) => {
    if (!activeDragId || !activeDroppableId) return null;
    
    if (dragSourceId === 'ungrouped' && activeDroppableId === groupId) {
      return (
        <div className="flex items-center justify-center py-2 text-green-600 bg-green-50 rounded-md border border-green-200 mt-2">
          <FolderPlus className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Add to Group</span>
        </div>
      );
    } else if (dragSourceId === groupId && activeDroppableId === 'ungrouped') {
      return (
        <div className="flex items-center justify-center py-2 text-amber-600 bg-amber-50 rounded-md border border-amber-200 mt-2">
          <FolderMinus className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Remove from Group</span>
        </div>
      );
    } else if (dragSourceId !== groupId && activeDroppableId === groupId && dragSourceId !== 'ungrouped') {
      return (
        <div className="flex items-center justify-center py-2 text-blue-600 bg-blue-50 rounded-md border border-blue-200 mt-2">
          <FolderPlus className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Move to this Group</span>
        </div>
      );
    }
    
    return null;
  };

  const actualRecipientCount = recipients.length;
  const recipientsTitle = `${actualRecipientCount} ${actualRecipientCount === 1 ? 'Recipient' : 'Recipients'}`;

  // Function to render a group section
  const renderGroup = ({ group, recipients }: { group: Group; recipients: Recipient[] }) => {
    const { setNodeRef } = useDroppable({
      id: group.id
    });
    
    return (
      <div key={group.id} className="mb-6">
        <h3 className="text-sm font-medium mb-2 text-gray-600 flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="h-2 w-2 rounded-full mr-2"
              style={{ backgroundColor: group.color }}
            ></div>
            {group.name}
            <span className="text-xs ml-2 text-gray-500">
              ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:text-red-500"
            onClick={() => removeGroup(group.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </h3>
        
        <div 
          ref={setNodeRef}
          className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
          style={{ 
            borderColor: group.color + '40', // Add 40 for transparency
            background: activeDroppableId === group.id ? group.color + '10' : 'transparent'
          }}
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
          
          {getDropIndicator(group.id)}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs h-6 justify-start"
            onClick={() => addRecipients(group.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Recipients
          </Button>
        </div>
      </div>
    );
  };

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
            
            <Button 
              onClick={addGroup} 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              title="Add Group"
            >
              <Users className="mr-1 h-4 w-4" /> Add Group
            </Button>
            
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="space-y-2">
            {recipients.length === 0 && groups.length === 0 ? (
              <div className="text-center py-6 text-gray-500 italic">
                No recipients added. Click "Add Recipient" to get started.
              </div>
            ) : (
              <>
                {/* Grouped recipients - displayed first */}
                {groupedRecipients.recipientsByGroup.map(({ group, recipients }) => 
                  renderGroup({ group, recipients })
                )}
                
                {/* Ungrouped recipients - displayed last */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2 text-gray-600">Ungrouped</h3>
                  <div 
                    ref={setUngroupedRef}
                    className="space-y-2 p-2 rounded-md border-2 border-dashed border-gray-200 transition-all hover:border-gray-300"
                    style={{ 
                      background: activeDroppableId === 'ungrouped' ? 'rgba(0, 0, 0, 0.03)' : 'transparent'
                    }}
                  >
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
                    
                    {dragSourceId && dragSourceId !== 'ungrouped' && activeDroppableId === 'ungrouped' && (
                      <div className="flex items-center justify-center py-2 text-amber-600 bg-amber-50 rounded-md border border-amber-200 mt-2">
                        <FolderMinus className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Remove from Group</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
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
