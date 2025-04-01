
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Minus, Users } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  isGroup: boolean;
  groupMembers?: string[];
}

interface RecipientRowProps {
  recipient: Recipient;
  onUpdate: (updates: Partial<Recipient>) => void;
  onRemove: () => void;
  valuePerShare: number;
  onAddGroupMember?: () => void;
  onRemoveGroupMember?: (index: number) => void;
  onUpdateGroupMember?: (index: number, name: string) => void;
}

const RecipientRow: React.FC<RecipientRowProps> = ({
  recipient,
  onUpdate,
  onRemove,
  valuePerShare,
  onAddGroupMember,
  onRemoveGroupMember,
  onUpdateGroupMember,
}) => {
  return (
    <div className="flex flex-col bg-white rounded-md shadow-sm border p-4 space-y-2">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex-grow min-w-[150px]">
          <div className="flex items-center">
            {recipient.isGroup && (
              <Users className="mr-2 h-4 w-4 text-blue-600" />
            )}
            <Input
              value={recipient.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="border-none p-0 h-auto text-base font-medium focus-visible:ring-0"
              placeholder={recipient.isGroup ? "Group name" : "Recipient name"}
            />
          </div>
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

      {recipient.isGroup && recipient.groupMembers && (
        <div className="pl-6 border-l-2 border-blue-100 mt-2 space-y-2">
          <div className="text-sm font-medium text-gray-500 mb-1">Group Members:</div>
          {recipient.groupMembers.map((member, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={member}
                onChange={(e) => onUpdateGroupMember && onUpdateGroupMember(index, e.target.value)}
                className="flex-grow text-sm"
                placeholder="Member name"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveGroupMember && onRemoveGroupMember(index)}
                className="text-gray-400 hover:text-red-500 h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button 
            onClick={onAddGroupMember} 
            variant="outline" 
            size="sm" 
            className="mt-2 text-xs flex items-center"
          >
            <Plus className="mr-1 h-3 w-3" /> Add Member
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipientRow;
