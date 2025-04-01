
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown } from "lucide-react";
import RecipientRow from "../RecipientRow";
import DividerRow, { Divider } from "../DividerRow";
import { Recipient, PayoutItem } from "@/hooks/useRecipients";
import ConfirmationModal from "@/components/ConfirmationModal";
import DividerModal from "@/components/DividerModal";
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
  items: PayoutItem[];
  recipientCount: string;
  setRecipientCount: (count: string) => void;
  addRecipients: () => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeItem: (id: string) => void;
  addDivider: (text: string, afterRecipientId: string) => void;
  selectedRecipients: Set<string>;
  toggleSelectRecipient: (id: string) => void;
  setSelectedRecipients: (selections: Set<string>) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
  clearRecipients?: () => void;
}

const RecipientsList = ({
  items,
  recipientCount,
  setRecipientCount,
  addRecipients,
  updateRecipient,
  removeItem,
  addDivider,
  selectedRecipients,
  toggleSelectRecipient,
  setSelectedRecipients,
  handleDragEnd,
  valuePerShare,
  hoveredRecipientId,
  onRecipientHover,
  clearRecipients
}: RecipientsListProps) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [columnWiseTabbing, setColumnWiseTabbing] = useState(false);
  const [dividerModalOpen, setDividerModalOpen] = useState(false);
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(null);
  
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

  const handleAddDividerClick = (recipientId: string) => {
    setActiveRecipientId(recipientId);
    setDividerModalOpen(true);
  };

  const handleAddDivider = (text: string) => {
    if (activeRecipientId) {
      addDivider(text, activeRecipientId);
      setActiveRecipientId(null);
    }
  };

  // Filter just recipients (not dividers) for counting
  const recipients = items.filter((item): item is Recipient => 
    !('type' in item && item.type === 'divider')
  );
  
  // Create the title with the correct singular/plural form
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
            <Button
              onClick={toggleTabbingDirection}
              variant="outline"
              size="sm"
              className="flex items-center"
              title={columnWiseTabbing ? "Switch to row-wise tabbing" : "Switch to column-wise tabbing"}
            >
              {columnWiseTabbing ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
            {items.length > 0 && (
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
          {items.length === 0 ? (
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
                items={items.map(item => item.id)} 
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => {
                  // Check if item is a divider
                  if ('type' in item && item.type === 'divider') {
                    const divider = item as Divider;
                    return (
                      <DividerRow
                        key={divider.id}
                        divider={divider}
                        onRemove={() => removeItem(divider.id)}
                      />
                    );
                  } else {
                    // Item is a recipient
                    const recipient = item as Recipient;
                    const recipientIndex = recipients.findIndex(r => r.id === recipient.id);
                    return (
                      <RecipientRow
                        key={recipient.id}
                        recipient={recipient}
                        onUpdate={(updates) => updateRecipient(recipient.id, updates)}
                        onRemove={() => removeItem(recipient.id)}
                        valuePerShare={valuePerShare}
                        isSelected={selectedRecipients.has(recipient.id)}
                        onToggleSelect={() => toggleSelectRecipient(recipient.id)}
                        isHighlighted={hoveredRecipientId === recipient.id}
                        onRecipientHover={onRecipientHover}
                        columnWiseTabbing={columnWiseTabbing}
                        rowIndex={recipientIndex}
                        totalRows={recipients.length}
                        onAddDivider={handleAddDividerClick}
                      />
                    );
                  }
                })}
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

      <DividerModal
        open={dividerModalOpen}
        onOpenChange={setDividerModalOpen}
        onConfirm={handleAddDivider}
      />
    </Card>
  );
};

export default RecipientsList;
