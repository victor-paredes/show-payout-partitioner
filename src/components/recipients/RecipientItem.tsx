
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { Recipient } from "@/hooks/useRecipientsManager";
import { getRecipientColor } from "@/lib/colorUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColorPickerModal from "../ColorPickerModal";

export type RecipientType = "shares" | "$" | "%";

interface RecipientItemProps {
  recipient: Recipient;
  onUpdate: (updates: Partial<Recipient>) => void;
  onRemove: () => void;
  valuePerShare: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  isHighlighted?: boolean;
  onDragStart: (id: string) => void;
  isDragging: boolean;
  columnWiseTabbing?: boolean;
  rowIndex?: number;
  totalRows?: number;
  tabIndexOffset?: number; // Add offset for proper sequencing
}

const RecipientItem: React.FC<RecipientItemProps> = ({
  recipient,
  onUpdate,
  onRemove,
  valuePerShare,
  isSelected,
  onToggleSelect,
  isHighlighted,
  onDragStart,
  isDragging,
  columnWiseTabbing = false,
  rowIndex = 0,
  totalRows = 1,
  tabIndexOffset = 0
}) => {
  const [nameWidth, setNameWidth] = useState(150);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (nameRef.current) {
      const newWidth = Math.max(150, nameRef.current.scrollWidth + 20);
      setNameWidth(newWidth);
    }
  }, [recipient.name]);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', recipient.id);
    onDragStart(recipient.id);
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
  
  // Calculate tab indexes based on tabbing direction and offset
  let nameTabIndex: number;
  let typeTabIndex: number;
  let valueTabIndex: number;

  if (columnWiseTabbing && totalRows > 0) {
    // Column-wise (vertical) tabbing
    // First all names (1 to totalRows), then all values (totalRows+1 to 2*totalRows), then all types (2*totalRows+1 to 3*totalRows)
    nameTabIndex = tabIndexOffset + 1 + rowIndex;
    valueTabIndex = tabIndexOffset + 1 + totalRows + rowIndex;
    typeTabIndex = tabIndexOffset + 1 + (2 * totalRows) + rowIndex;
  } else {
    // Row-wise (horizontal) tabbing
    // Name, value, type for each recipient before moving to the next
    nameTabIndex = tabIndexOffset + 1 + (rowIndex * 3);
    valueTabIndex = tabIndexOffset + 2 + (rowIndex * 3);
    typeTabIndex = tabIndexOffset + 3 + (rowIndex * 3);
  }
  
  // Use custom color if available, otherwise use the generated color
  const recipientColor = recipient.color || getRecipientColor(recipient.id);
  
  return (
    <>
      <div 
        className={`flex items-center justify-between bg-white rounded-md shadow-sm p-4 gap-4 cursor-pointer transition-colors border ${
          isSelected 
            ? "bg-blue-50 border-blue-300 hover:bg-blue-50 hover:border-blue-500" 
            : "border-gray-200 hover:border-gray-400"
        } ${
          isHighlighted ? "border-gray-700" : ""
        } ${
          isDragging ? "opacity-50" : ""
        }`}
        onClick={handleRowClick}
        draggable={true}
        onDragStart={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab text-gray-400 hover:text-gray-600 p-0 h-auto"
            tabIndex={nameTabIndex - 1}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="p-0 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              setColorPickerOpen(true);
            }}
            tabIndex={nameTabIndex - 0.5}
          >
            <div 
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: recipientColor }}
            />
          </Button>
          
          <div className="relative">
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
              className="text-base font-medium"
              placeholder="Enter Name"
              onClick={(e) => {
                const target = e.target as HTMLInputElement;
                target.select();
                e.stopPropagation();
              }}
              style={{ width: `${nameWidth}px` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            tabIndex={valueTabIndex}
            type="number"
            min="0"
            step={currentType === "$" ? "10" : currentType === "%" ? "1" : "0.1"}
            value={recipient.value || ""}
            onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
            className="w-24 text-right"
            placeholder={
              currentType === "shares" ? "Shares" : 
              currentType === "$" ? "Amount" : 
              "Percent"
            }
            onClick={(e) => {
              const target = e.target as HTMLInputElement;
              target.select();
              e.stopPropagation();
            }}
          />
          
          <Select 
            value={currentType} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger tabIndex={typeTabIndex} className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shares">Shares</SelectItem>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-400 hover:text-red-500"
            tabIndex={valueTabIndex + 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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

export default RecipientItem;
