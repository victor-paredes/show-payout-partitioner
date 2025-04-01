
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getRecipientColor } from "@/lib/colorUtils";
import RecipientColorSwatch from "./recipient/RecipientColorSwatch";
import RecipientName from "./recipient/RecipientName";
import RecipientTypeSelector from "./recipient/RecipientTypeSelector";
import RecipientValueInput from "./recipient/RecipientValueInput";
import RecipientPayout from "./recipient/RecipientPayout";

export type RecipientType = "shares" | "$" | "%";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
}

interface RecipientRowProps {
  recipient: Recipient;
  onUpdate: (updates: Partial<Recipient>) => void;
  onRemove: () => void;
  valuePerShare: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  isHighlighted?: boolean;
  onRecipientHover?: (id: string | null) => void;
}

const RecipientRow: React.FC<RecipientRowProps> = ({
  recipient,
  onUpdate,
  onRemove,
  valuePerShare,
  isSelected,
  onToggleSelect,
  isHighlighted,
  onRecipientHover,
}) => {
  const [isInputHover, setIsInputHover] = useState(false);
  const [isDraggingInput, setIsDraggingInput] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: recipient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };
  
  const handleMouseEnter = () => {
    setIsInputHover(false);
    if (onRecipientHover) {
      onRecipientHover(recipient.id);
    }
  };

  const handleMouseLeave = () => {
    if (onRecipientHover) {
      onRecipientHover(null);
    }
  };

  const handleTypeChange = (type: RecipientType) => {
    onUpdate({ 
      isFixedAmount: type === "$",
      type: type
    });
  };

  const currentType: RecipientType = recipient.type || 
    (recipient.isFixedAmount ? "$" : "shares");
    
  const handleRowClick = (e: React.MouseEvent) => {
    if (!isDraggingInput) {
      onToggleSelect();
    }
    
    setIsDraggingInput(false);
  };

  const recipientColor = getRecipientColor(recipient.id);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center bg-white rounded-md shadow-sm p-4 gap-4 cursor-pointer transition-colors border hover:border-black ${
        isSelected ? "bg-blue-50" : ""
      } ${
        isSelected 
          ? "hover:border-blue-500 hover:bg-blue-100" 
          : ""
      } ${
        isHighlighted ? "border-black" : "border"
      }`}
      onClick={handleRowClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="ghost"
        size="icon"
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      
      <div 
        className="flex items-center space-x-2"
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <RecipientColorSwatch
          color={recipientColor}
          isHighlighted={isHighlighted}
        />
        <RecipientName
          name={recipient.name}
          onUpdate={(name) => onUpdate({ name })}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={() => setIsDraggingInput(false)}
          onMouseMove={() => setIsDraggingInput(true)}
        />
      </div>

      <div 
        className="flex items-center space-x-2" 
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <RecipientTypeSelector
          type={currentType}
          onTypeChange={handleTypeChange}
        />
      </div>

      <div 
        className="flex items-center" 
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <RecipientValueInput
          value={recipient.value}
          type={currentType}
          onValueChange={(value) => onUpdate({ value })}
          onMouseDown={() => setIsDraggingInput(false)}
          onMouseMove={() => setIsDraggingInput(true)}
        />
      </div>

      <RecipientPayout
        payout={recipient.payout}
        type={currentType}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-gray-400 hover:text-red-500"
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default RecipientRow;
