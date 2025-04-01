
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

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
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 bg-white rounded-md shadow-sm border">
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
  );
};

export default RecipientRow;
