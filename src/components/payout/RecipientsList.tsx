
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import RecipientRow from "../RecipientRow";
import { Recipient } from "@/hooks/useRecipients";
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
  clearRecipients
}: RecipientsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clearAllSelections = () => {
    setSelectedRecipients(new Set());
  };

  // Create the title with the correct singular/plural form
  const recipientsTitle = `${recipients.length} ${recipients.length === 1 ? 'Recipient' : 'Recipients'}`;
  
  // Get the count of selected recipients
  const selectedCount = selectedRecipients.size;

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
            {recipients.length > 1 && (
              <Button 
                onClick={clearRecipients} 
                variant="outline" 
                size="sm" 
                className="flex items-center mr-2"
              >
                <Trash2 className="mr-1 h-4 w-4" /> Clear
              </Button>
            )}
            <Select value={recipientCount} onValueChange={setRecipientCount}>
              <SelectTrigger className="w-16">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addRecipients} variant="outline" size="sm" className="flex items-center">
              <Plus className="mr-1 h-4 w-4" /> Add Recipient{parseInt(recipientCount) > 1 ? 's' : ''}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={recipients.map(r => r.id)} 
              strategy={verticalListSortingStrategy}
            >
              {recipients.map((recipient) => (
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
                  selectedCount={selectedRecipients.has(recipient.id) ? selectedCount : 0}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipientsList;
