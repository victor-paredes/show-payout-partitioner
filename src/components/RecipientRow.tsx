import React, { useState, useRef, useEffect } from "react";
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
  isInGroup?: boolean;
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
  totalRows = 1,
  isInGroup = false
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

  const handleNameInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.select();
    e.stopPropagation();
  };

  const handleValueInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.select();
    e.stopPropagation();
  };

  const recipientColor = recipient.color || getRecipientColor(recipient.id);

  let nameTabIndex: number;
  let typeTabIndex: number;
  let valueTabIndex: number;

  if (columnWiseTabbing && totalRows && totalRows > 0) {
    nameTabIndex = 1 + rowIndex;
    typeTabIndex = 1 + totalRows + rowIndex;
    valueTabIndex = 1 + (2 * totalRows) + rowIndex;
  } else {
    nameTabIndex = 1 + (rowIndex * 3);
    typeTabIndex = 2 + (rowIndex * 3);
    valueTabIndex = 3 + (rowIndex * 3);
  }

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style}
        className={`flex items-center justify-between bg-white rounded-md shadow-sm p-4 gap-4 cursor-pointer transition-colors border hover:border-black ${
          isSelected ? "bg-blue-50" : ""
        } ${
          isSelected 
            ? "hover:border-blue-500 hover:bg-blue-100" 
            : ""
        } ${
          isHighlighted ? "border-black" : "border"
        } ${
          isInGroup ? "border-l-0 border-r-0 border-b-0 first:rounded-t-none last:rounded-b-none" : ""
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
              onClick={handleNameInputClick}
              style={{ width: `${nameWidth}px` }}
            />
          </div>
        </div>

        <div 
          className="flex items-center space-x-2" 
          onClick={(e) => e.stopPropagation()}
        >
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

        <div 
          className="flex items-center" 
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
            onClick={handleValueInputClick}
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
