
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Recipient, Group } from "@/hooks/useRecipientsManager";
import RecipientItem from "../recipients/RecipientItem";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface GroupSectionProps {
  group: Group;
  recipients: Recipient[];
  addRecipients: (groupId?: string) => void;
  removeGroup: (id: string) => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  selectedRecipients: Set<string>;
  toggleSelectRecipient: (id: string) => void;
  valuePerShare: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
  columnWiseTabbing: boolean;
  activeDroppableId: string | null;
  dragSourceId: string | null;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  recipients,
  addRecipients,
  removeGroup,
  updateRecipient,
  removeRecipient,
  selectedRecipients,
  toggleSelectRecipient,
  valuePerShare,
  hoveredRecipientId,
  onRecipientHover,
  columnWiseTabbing,
  activeDroppableId,
  dragSourceId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: group.id,
    data: {
      type: "droppable",
      accepts: ["recipient"],
    }
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const isHighlighted = activeDroppableId === group.id && dragSourceId !== group.id;

  // Calculate group total amount
  const groupTotal = recipients.reduce((sum, r) => sum + r.payout, 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`border rounded-lg mb-4 space-y-2 transition-colors ${
        isHighlighted ? "bg-gray-100 ring-2 ring-blue-500 ring-inset" : "bg-white"
      }`}
    >
      <div className="p-3 flex items-center justify-between bg-gray-50 rounded-t-lg border-b">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-sm mr-2"
            style={{ backgroundColor: group.color }}
          />
          <h3 className="font-medium">{group.name}</h3>
          <div className="text-xs text-gray-500 ml-2">
            {recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'}
          </div>
          {groupTotal > 0 && (
            <div className="text-xs text-blue-500 ml-2">
              {formatCurrency(groupTotal)}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => addRecipients(group.id)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            onClick={() => removeGroup(group.id)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {recipients.length === 0 ? (
          <div className="text-center py-6 text-gray-500 italic">
            Drop recipients here or click "Add"
          </div>
        ) : (
          recipients.map((recipient, index) => (
            <RecipientItem
              key={recipient.id}
              recipient={recipient}
              onUpdate={(updates) => updateRecipient(recipient.id, updates)}
              onRemove={() => removeRecipient(recipient.id)}
              isSelected={selectedRecipients.has(recipient.id)}
              onSelect={() => toggleSelectRecipient(recipient.id)}
              isHighlighted={hoveredRecipientId === recipient.id}
              valuePerShare={valuePerShare}
              onDragStart={() => {}}
              isDragging={false}
              onHover={onRecipientHover}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GroupSection;
