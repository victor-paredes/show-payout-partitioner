
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, GripVertical, CheckCircle } from "lucide-react";
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
}

const RecipientRow: React.FC<RecipientRowProps> = ({
  recipient,
  onUpdate,
  onRemove,
  valuePerShare,
  isSelected,
  onToggleSelect,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
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

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex flex-col bg-white rounded-md shadow-sm border p-4 space-y-2 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-blue-300" : ""
      } ${isHovering && !isSelected ? "bg-gray-50" : ""}`}
      onClick={onToggleSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 relative">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()} // Prevent selection toggle when dragging
        >
          <GripVertical className="h-4 w-4" />
        </Button>

        {isHovering && !isSelected && (
          <div className="absolute right-12 top-2 md:top-1/2 md:-translate-y-1/2 text-gray-400">
            <CheckCircle className="h-5 w-5" />
          </div>
        )}

        <div className="flex-grow min-w-0 max-w-[250px]">
          <Input
            value={recipient.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="border-none p-0 h-auto text-base font-medium focus-visible:ring-0 w-full"
            placeholder="Enter Name"
            onClick={(e) => e.stopPropagation()} // Prevent selection toggle when editing
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Switch
              id={`fixed-switch-${recipient.id}`}
              checked={recipient.isFixedAmount}
              onCheckedChange={(checked) => onUpdate({ isFixedAmount: checked })}
            />
            <Label htmlFor={`fixed-switch-${recipient.id}`} className="text-sm text-gray-500">
              {recipient.isFixedAmount ? "Fixed $" : "Shares"}
            </Label>
          </div>

          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {recipient.isFixedAmount && <span className="mr-1">$</span>}
            <Input
              type="number"
              min="0"
              step={recipient.isFixedAmount ? "10" : "0.1"}
              value={recipient.value || ""}
              onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
              className="w-24 text-right"
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipientRow;
