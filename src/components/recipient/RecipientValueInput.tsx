
import React from "react";
import { Input } from "@/components/ui/input";
import { RecipientType } from "@/components/RecipientRow";

interface RecipientValueInputProps {
  value: number;
  type: RecipientType;
  onValueChange: (value: number) => void;
  onMouseDown: () => void;
  onMouseMove: () => void;
}

const RecipientValueInput: React.FC<RecipientValueInputProps> = ({
  value,
  type,
  onValueChange,
  onMouseDown,
  onMouseMove,
}) => {
  const placeholder = 
    type === "shares" ? "Shares" : 
    type === "$" ? "Amount" : 
    "Percent";

  const step = type === "$" ? "10" : type === "%" ? "1" : "0.1";

  return (
    <Input
      type="number"
      min="0"
      step={step}
      value={value || ""}
      onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
      className="w-24 text-right hover:outline hover:outline-2 hover:outline-black"
      placeholder={placeholder}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
    />
  );
};

export default RecipientValueInput;
