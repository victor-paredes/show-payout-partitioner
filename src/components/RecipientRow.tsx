
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
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
  selectedCount?: number; 
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
  selectedCount = 0,
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

  // Create a custom type selector that doesn't interfere with row selection
  const TypeSelector = () => (
    <div 
      className="relative" 
      onClick={(e) => {
        // Prevent row selection when clicking on this component
        e.stopPropagation();
      }}
    >
      <Select 
        value={currentType} 
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Type" />
          {isSelected && selectedCount > 1 && (
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCount}
            </span>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="shares">Shares</SelectItem>
          <SelectItem value="$">$</SelectItem>
          <SelectItem value="%">%</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // The main row component with onClick handling
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
        onClick={(e) => e.stopPropagation()} // Prevent row selection when dragging
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
            onClick={(e) => e.stopPropagation()} // Prevent row selection when editing name
            style={{ width: `${nameWidth}px` }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <TypeSelector />
      </div>

      <div 
        className="flex items-center" 
        onClick={(e) => e.stopPropagation()} // Prevent row selection when editing value
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
          e.stopPropagation(); // Prevent row selection when removing
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
