import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, GripVertical } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
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
  const [nameWidth, setNameWidth] = useState(150); // Default width
  const nameRef = useRef<HTMLSpanElement>(null);
  
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
  
  useEffect(() => {
    if (nameRef.current) {
      const newWidth = Math.max(150, nameRef.current.scrollWidth + 20);
      setNameWidth(newWidth);
    }
  }, [recipient.name]);

  const inputHoverClass = "hover:outline hover:outline-2 hover:outline-black";

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
      onClick={onToggleSelect}
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
        className="flex-1"
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <div className="relative inline-block">
          <span 
            ref={nameRef} 
            className="invisible absolute whitespace-nowrap"
          >
            {recipient.name || "Enter Name"}
          </span>
          <Input
            value={recipient.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className={`border-none p-0 h-auto text-base font-medium focus-visible:ring-0 ${inputHoverClass}`}
            placeholder="Enter Name"
            onClick={(e) => e.stopPropagation()}
            style={{ width: `${nameWidth}px` }}
          />
        </div>
      </div>

      <div 
        className="flex items-center space-x-2" 
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <Switch
          id={`fixed-switch-${recipient.id}`}
          checked={recipient.isFixedAmount}
          onCheckedChange={(checked) => onUpdate({ isFixedAmount: checked })}
        />
        <Label htmlFor={`fixed-switch-${recipient.id}`} className="text-sm text-gray-500 whitespace-nowrap">
          {recipient.isFixedAmount ? "Fixed $" : "Shares"}
        </Label>
      </div>

      <div 
        className="flex items-center" 
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        {recipient.isFixedAmount && <span className="mr-1">$</span>}
        <Input
          type="number"
          min="0"
          step={recipient.isFixedAmount ? "10" : "0.1"}
          value={recipient.value || ""}
          onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
          className={`w-24 text-right ${inputHoverClass}`}
          placeholder={recipient.isFixedAmount ? "Amount" : "Shares"}
        />
      </div>

      <div className="w-28 text-right">
        <span className="font-medium">
          {formatCurrency(recipient.payout)}
        </span>
      </div>

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
