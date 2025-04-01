
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Recipient } from "@/hooks/useRecipientsManager";
import RecipientItem from "../recipients/RecipientItem";

interface UngroupedSectionProps {
  recipients: Recipient[];
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

const UngroupedSection: React.FC<UngroupedSectionProps> = ({
  recipients,
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
    id: "ungrouped",
    data: {
      type: "droppable",
      accepts: ["recipient"],
    }
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const isHighlighted = activeDroppableId === "ungrouped" && dragSourceId !== "ungrouped";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 rounded-lg space-y-2 transition-colors ${
        isHighlighted ? "bg-gray-100 ring-2 ring-blue-500 ring-inset" : "bg-transparent"
      }`}
    >
      {recipients.length === 0 ? (
        <div className="text-center py-6 text-gray-500 italic">
          Drop recipients here or click "Add Recipient"
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
  );
};

export default UngroupedSection;
