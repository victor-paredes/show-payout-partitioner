
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectContentNonPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [nameWidth, setNameWidth] = useState(150); // Default width
  const nameRef = useRef<HTMLSpanElement>(null);
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

  // Handle type selection
  const handleTypeChange = (value: string) => {
    const type = value as RecipientType;
    
    onUpdate({ 
      isFixedAmount: type === "$",
      type: type
    });
  };

  // Determine current type for the select
  const currentType: RecipientType = recipient.type || 
    (recipient.isFixedAmount ? "$" : "shares");
    
  const handleRowClick = (e: React.MouseEvent) => {
    // Only toggle selection if not dragging from an input
    if (!isDraggingInput) {
      onToggleSelect();
    }
    
    // Reset drag state after click
    setIsDraggingInput(false);
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
            onMouseDown={() => setIsDraggingInput(false)}
            onMouseMove={() => setIsDraggingInput(true)}
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
        <Select 
          value={currentType} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContentNonPortal>
            <SelectItem value="shares">Shares</SelectItem>
            <SelectItem value="$">$</SelectItem>
            <SelectItem value="%">%</SelectItem>
          </SelectContentNonPortal>
        </Select>
      </div>

      <div 
        className="flex items-center" 
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsInputHover(true)}
        onMouseLeave={() => setIsInputHover(false)}
      >
        <Input
          type="number"
          min="0"
          step={currentType === "$" ? "10" : currentType === "%" ? "1" : "0.1"}
          value={recipient.value || ""}
          onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
          className={`w-24 text-right ${inputHoverClass}`}
          placeholder={
            currentType === "shares" ? "Shares" : 
            currentType === "$" ? "Amount" : 
            "Percent"
          }
          onMouseDown={() => setIsDraggingInput(false)}
          onMouseMove={() => setIsDraggingInput(true)}
        />
      </div>

      <div className="w-28 text-right">
        <span className="font-medium">
          {recipient.type === "$" ? formatCurrency(recipient.payout) : 
           recipient.type === "%" ? `${recipient.payout.toFixed(2)}%` : 
           formatCurrency(recipient.payout)}
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
