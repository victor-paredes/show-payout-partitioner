
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, SeparatorHorizontal } from "lucide-react";
import RecipientRow from "../RecipientRow";
import { Recipient } from "@/hooks/useRecipients";
import ConfirmationModal from "@/components/ConfirmationModal";
import DividerModal from "@/components/DividerModal";
import DividerRow from "@/components/DividerRow";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  // Divider-related props
  dividerModalOpen: boolean;
  setDividerModalOpen: (open: boolean) => void;
  prepareDividerModal: (position: "before" | "after", recipientId: string) => void;
  addOrUpdateDivider: (text: string) => void;
  editDivider: (dividerId: string) => void;
  currentDividerId: string | null;
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
  // Divider-related props
  dividerModalOpen,
  setDividerModalOpen,
  prepareDividerModal,
  addOrUpdateDivider,
  editDivider,
  currentDividerId
}: RecipientsListProps) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [columnWiseTabbing, setColumnWiseTabbing] = useState(false);
  
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

  // Get only the non-divider recipients for the title count
  const recipientCount = recipients.filter(r => !r.isDivider).length;
  const recipientsTitle = `${recipientCount} ${recipientCount === 1 ? 'Recipient' : 'Recipients'}`;

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SeparatorHorizontal className="h-4 w-4 mr-2" />
                  Divider
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {recipients.filter(r => !r.isDivider).map((recipient) => (
                  <React.Fragment key={recipient.id}>
                    <DropdownMenuItem onClick={() => prepareDividerModal("before", recipient.id)}>
                      Add divider before {recipient.name || "Unnamed"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => prepareDividerModal("after", recipient.id)}>
                      Add divider after {recipient.name || "Unnamed"}
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {recipients.filter(r => !r.isDivider).length > 1 && (
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
                recipient.isDivider ? (
                  <DividerRow
                    key={recipient.id}
                    id={recipient.id}
                    text={recipient.dividerText || ""}
                    onEdit={() => editDivider(recipient.id)}
                    onRemove={() => removeRecipient(recipient.id)}
                    isHighlighted={hoveredRecipientId === recipient.id}
                  />
                ) : (
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
                )
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
      
      <DividerModal
        open={dividerModalOpen}
        onOpenChange={setDividerModalOpen}
        onConfirm={addOrUpdateDivider}
        defaultText={
          currentDividerId 
            ? recipients.find(r => r.id === currentDividerId)?.dividerText || "" 
            : ""
        }
      />
    </Card>
  );
};

export default RecipientsList;
