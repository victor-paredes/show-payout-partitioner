
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical, Palette } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getRecipientColor } from "@/lib/colorUtils";
import ColorPickerModal from "../ColorPickerModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Recipient, RecipientType } from "@/hooks/useRecipientsManager";

interface RecipientItemProps {
  recipient: Recipient;
  onUpdate: (updates: Partial<Recipient>) => void;
  onRemove: () => void;
  isSelected: boolean;
  onSelect: () => void;
  isHighlighted?: boolean;
  valuePerShare: number;
  onDragStart: () => void;
  isDragging: boolean;
}

const RecipientItem: React.FC<RecipientItemProps> = ({
  recipient,
  onUpdate,
  onRemove,
  isSelected,
  onSelect,
  isHighlighted,
  valuePerShare,
  onDragStart,
  isDragging
}) => {
  const [nameWidth, setNameWidth] = useState(150);
  const nameRef = useRef<HTMLSpanElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    if (nameRef.current) {
      const newWidth = Math.max(150, nameRef.current.scrollWidth + 20);
      setNameWidth(newWidth);
    }
  }, [recipient.name]);

  const handleTypeChange = (value: string) => {
    onUpdate({ type: value as RecipientType });
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.tagName === 'INPUT' || 
      target.tagName === 'BUTTON' ||
      target.closest('button') !== null ||
      target.closest('[role="button"]') !== null ||
      target.closest('[role="combobox"]') !== null;
    
    if (!isInteractiveElement) {
      onSelect();
    }
  };

  // Use custom color if available, otherwise use the generated color
  const recipientColor = recipient.color || getRecipientColor(recipient.id);

  return (
    <>
      <div 
        draggable
        onDragStart={onDragStart}
        className={`flex items-center justify-between bg-white rounded-md shadow-sm p-4 gap-4 cursor-pointer transition-colors border ${
          isSelected 
            ? "bg-blue-50 border-blue-300 hover:bg-blue-50 hover:border-blue-500" 
            : "border-gray-200 hover:border-black"
        } ${
          isHighlighted ? "border-black" : ""
        } ${
          isDragging ? "opacity-50" : ""
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="p-0 h-auto ml-2"
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
          
          <div className="relative inline-block ml-2">
            <span 
              ref={nameRef} 
              className="invisible absolute whitespace-nowrap"
            >
              {recipient.name || "Enter Name"}
            </span>
            <Input
              value={recipient.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full text-base font-medium"
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

        <div 
          className="flex items-center space-x-2" 
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            type="number"
            min="0"
            step={recipient.type === "$" ? "10" : recipient.type === "%" ? "1" : "0.1"}
            value={recipient.value || ""}
            onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
            className="w-24 text-right"
            placeholder={
              recipient.type === "shares" ? "Shares" : 
              recipient.type === "$" ? "Amount" : 
              "Percent"
            }
            onClick={(e) => {
              const target = e.target as HTMLInputElement;
              target.select();
              e.stopPropagation();
            }}
          />
          
          <Select 
            value={recipient.type} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shares">Shares</SelectItem>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
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

export default RecipientItem;
