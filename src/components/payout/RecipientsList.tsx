
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, Users } from "lucide-react";
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
  DragStartEvent,
  DragOverEvent,
  MeasuringStrategy,
  DragCancelEvent
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import {
  Select,
  SelectContentNonPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GroupSection from './GroupSection';
import UngroupedSection from './UngroupedSection';

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
  
  // Configure sensors with improved activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Lower distance to make dragging start more easily
        tolerance: 5, // Lower tolerance for better accuracy
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    // Always convert IDs to strings for consistency
    const activeId = String(event.active.id);
    setActiveDragId(activeId);
    
    // Determine the source group
    const draggedRecipient = recipients.find(r => r.id === activeId);
    const sourceGroupId = draggedRecipient?.groupId || 'ungrouped';
    setDragSourceId(sourceGroupId);
    
    console.log(`Drag started: Recipient ${activeId} from ${sourceGroupId}`);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      setActiveDroppableId(null);
      return;
    }
    
    const overId = String(event.over.id);
    
    // Check if this is a drop zone (group or ungrouped section)
    const isGroup = groups.some(g => g.id === overId);
    const isUngrouped = overId === 'ungrouped';
    const isRecipient = recipients.some(r => r.id === overId);
    
    if (isGroup || isUngrouped) {
      // This is a direct group/ungrouped droppable
      setActiveDroppableId(overId);
    } 
    else if (isRecipient) {
      // When over a recipient, find its group
      const overRecipient = recipients.find(r => r.id === overId);
      setActiveDroppableId(overRecipient?.groupId || 'ungrouped');
    }
    else {
      setActiveDroppableId(null);
    }
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setActiveDragId(null);
    setActiveDroppableId(null);
    setDragSourceId(null);
  };

  // Renamed to onDragEnd to avoid name conflict with the prop
  const onDragEnd = (event: DragEndEvent) => {
    console.log(`Drag ended: Recipient ${activeDragId} -> ${activeDroppableId}`);
    
    // Make sure we always pass strings to handleDragEnd
    if (event.active && event.active.id) {
      event.active.id = String(event.active.id);
    }
    
    if (event.over && event.over.id) {
      event.over.id = String(event.over.id);
    }
    
    setActiveDragId(null);
    setActiveDroppableId(null);
    setDragSourceId(null);
    
    // Call the props handler
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
          onDragCancel={handleDragCancel}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always
            }
          }}
        >
          <div className="space-y-2">
            {recipients.length === 0 && groups.length === 0 ? (
              <div className="text-center py-6 text-gray-500 italic">
                No recipients added. Click "Add Recipient" to get started.
              </div>
            ) : (
              <>
                {/* Always show groups, even when empty */}
                {groupedRecipients.recipientsByGroup.map(({ group, recipients }) => (
                  <GroupSection
                    key={group.id}
                    group={group}
                    recipients={recipients}
                    removeGroup={removeGroup}
                    addRecipients={addRecipients}
                    updateRecipient={updateRecipient}
                    removeRecipient={removeRecipient}
                    selectedRecipients={selectedRecipients}
                    toggleSelectRecipient={toggleSelectRecipient}
                    valuePerShare={valuePerShare}
                    hoveredRecipientId={hoveredRecipientId}
                    onRecipientHover={onRecipientHover}
                    columnWiseTabbing={columnWiseTabbing}
                    activeDroppableId={activeDroppableId}
                    dragSourceId={dragSourceId}
                  />
                ))}
                
                {/* Show the ungrouped section */}
                <UngroupedSection
                  recipients={groupedRecipients.ungroupedRecipients}
                  updateRecipient={updateRecipient}
                  removeRecipient={removeRecipient}
                  selectedRecipients={selectedRecipients}
                  toggleSelectRecipient={toggleSelectRecipient}
                  valuePerShare={valuePerShare}
                  hoveredRecipientId={hoveredRecipientId}
                  onRecipientHover={onRecipientHover}
                  columnWiseTabbing={columnWiseTabbing}
                  activeDroppableId={activeDroppableId}
                  dragSourceId={dragSourceId}
                />
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
