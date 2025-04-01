
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RecipientSwitchProps {
  id: string;
  isFixedAmount: boolean;
  onChange: (isFixed: boolean) => void;
}

const RecipientSwitch: React.FC<RecipientSwitchProps> = ({ 
  id, 
  isFixedAmount, 
  onChange 
}) => {
  return (
    <div 
      className="flex items-center space-x-2" 
      onClick={(e) => e.stopPropagation()}
    >
      <Switch
        id={`fixed-switch-${id}`}
        checked={isFixedAmount}
        onCheckedChange={(checked) => onChange(checked)}
      />
      <Label htmlFor={`fixed-switch-${id}`} className="text-sm text-gray-500 whitespace-nowrap">
        {isFixedAmount ? "Fixed $" : "Shares"}
      </Label>
    </div>
  );
};

export default RecipientSwitch;
