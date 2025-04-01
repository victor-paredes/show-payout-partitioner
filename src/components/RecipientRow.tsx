
import React, { useState, useRef, useEffect, CSSProperties } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, ChevronDown, Square, Palette } from "lucide-react";
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
import { getRecipientColor } from "@/lib/colorUtils";
import ColorPickerModal from "./ColorPickerModal";

export type RecipientType = "shares" | "$" | "%";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
  color?: string;
  groupId?: string;
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
  columnWiseTabbing?: boolean;
  rowIndex?: number;
  totalRows?: number;
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
  columnWiseTabbing = false,
  rowIndex = 0,
  totalRows = 1
}) => {
  const [isInputHover, setIsInputHover] = useState(false);
  const [nameWidth, setNameWidth] = useState(150);
  const nameRef = useRef<HTMLSpanElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: recipient.id,
    data: {
      recipient: recipient
    } 
  });

  // Create a consistent height style
  const rowHeight = 72; // Match this height with the calculation in Group/UngroupedSection

  // Fix the TypeScript error by specifying the position as a proper Position type
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0, // Higher z-index when dragging
    height: `${rowHeight}px`, // Fixed height for consistency
  };
  
  // Add position property only when dragging
  if (isDragging) {
    style.position = 'relative'; // This is now typed correctly
  }
  
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

  const handleTypeChange = (value: string) => {
    const type = value as RecipientType;
    
    onUpdate({ 
      isFixedAmount: type === "$",
      type: type
    });
  };

  const currentType: RecipientType = recipient.type || 
    (recipient.isFixedAmount ? "$" : "shares");
    
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't check isDraggingInput anymore - this prevents double-click issues
    // Just check if the click happened on an interactive element
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.tagName === 'INPUT' || 
      target.tagName === 'BUTTON' ||
      target.closest('button') !== null ||
      target.closest('[role="button"]') !== null ||
      target.closest('[role="combobox"]') !== null;
    
    if (!isInteractiveElement) {
      onToggleSelect();
    }
  };

  // Use custom color if available, otherwise use the generated color
  const recipientColor = recipient.color || getRecipientColor(recipient.id);

  // Calculate tab indexes based on tabbing direction
  let nameTabIndex: number;
  let typeTabIndex: number;
  let valueTabIndex: number;

  if (columnWiseTabbing && totalRows && totalRows > 0) {
    // For column-wise tabbing, we go down columns: all names first, then all types, then all values
    nameTabIndex = 1 + rowIndex;
    typeTabIndex = 1 + totalRows + rowIndex;
    valueTabIndex = 1 + (2 * totalRows) + rowIndex;
  } else {
    // For row-wise tabbing (default), we go across each row before moving to the next
    nameTabIndex = 1 + (rowIndex * 3);
    typeTabIndex = 2 + (rowIndex * 3);
    valueTabIndex = 3 + (rowIndex * 3);
  }

  const selectedClass = isSelected ? "bg-blue-50 border-blue-300" : "";

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style}
        className={`flex items-center justify-between bg-white rounded-md shadow-sm p-4 gap-4 cursor-pointer transition-colors border ${
          isSelected 
            ? "bg-blue-50 border-blue-300 hover:bg-blue-50 hover:border-blue-500" 
            : "border-gray-200 hover:border-black"
        } ${
          isHighlighted ? "border-black" : ""
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
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="p-0 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              setColorPickerOpen(true);
            }}
          >
            <div 
              className={`w-4 h-4 rounded-sm transition-all ${
                isHighlighted ? "ring-1 ring-black" : ""
              }`} 
              style={{ backgroundColor: recipientColor }}
            />
          </Button>
          <div className="relative inline-block">
            <span 
              ref={nameRef} 
              className="invisible absolute whitespace-nowrap"
            >
              {recipient.name || "Enter Name"}
            </span>
            <Input
              tabIndex={nameTabIndex}
              value={recipient.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className={`w-full text-base font-medium`}
              placeholder="Enter Name"
              onClick={(e) => {
                // Select all text in the input when clicked
                const target = e.target as HTMLInputElement;
                target.select();
                e.stopPropagation(); // Prevent row selection
              }}
              style={{ width: `${nameWidth}px` }}
            />
          </div>
        </div>

        <div 
          className="flex items-center space-x-2" 
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            tabIndex={valueTabIndex}
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
            onClick={(e) => {
              // Select all text in the input when clicked
              const target = e.target as HTMLInputElement;
              target.select();
              e.stopPropagation(); // Prevent row selection
            }}
          />
          
          <Select 
            value={currentType} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger tabIndex={typeTabIndex} className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContentNonPortal>
              <SelectItem value="shares">Shares</SelectItem>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContentNonPortal>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ColorPickerModal
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
        currentColor={recipientColor}
        onColorSelect={(color) => onUpdate({ color })}
      />
    </>
  );
};

export default RecipientRow;
