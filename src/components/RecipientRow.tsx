
import React from "react";
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
}

const RecipientRow: React.FC<RecipientRowProps> = ({
  recipient,
  onUpdate,
  onRemove,
  valuePerShare,
}) => {
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
      className="flex flex-col bg-white rounded-md shadow-sm border p-4 space-y-2"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>

        <div className="flex-grow min-w-[150px]">
          <Input
            value={recipient.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="border-none p-0 h-auto text-base font-medium focus-visible:ring-0"
            placeholder="Recipient name"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id={`fixed-switch-${recipient.id}`}
              checked={recipient.isFixedAmount}
              onCheckedChange={(checked) => onUpdate({ isFixedAmount: checked })}
            />
            <Label htmlFor={`fixed-switch-${recipient.id}`} className="text-sm text-gray-500">
              {recipient.isFixedAmount ? "Fixed $" : "Shares"}
            </Label>
          </div>

          <div className="flex items-center">
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
            onClick={onRemove}
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
