
import React from "react";
import { RecipientType } from "@/components/RecipientRow";
import {
  Select,
  SelectContent,
  SelectContentNonPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipientTypeSelectorProps {
  type: RecipientType;
  onTypeChange: (type: RecipientType) => void;
}

const RecipientTypeSelector: React.FC<RecipientTypeSelectorProps> = ({
  type,
  onTypeChange,
}) => {
  return (
    <Select 
      value={type} 
      onValueChange={(value) => onTypeChange(value as RecipientType)}
    >
      <SelectTrigger className="w-28">
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContentNonPortal>
        <SelectItem value="shares">Shares</SelectItem>
        <SelectItem value="$">$</SelectItem>
        <SelectItem value="%">%</SelectItem>
      </SelectContentNonPortal>
    </Select>
  );
};

export default RecipientTypeSelector;
