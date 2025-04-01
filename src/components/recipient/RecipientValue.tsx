
import React from "react";
import { Input } from "@/components/ui/input";

interface RecipientValueProps {
  isFixedAmount: boolean;
  value: number;
  onChange: (value: number) => void;
  isHighlighted: boolean;
}

const RecipientValue: React.FC<RecipientValueProps> = ({ 
  isFixedAmount, 
  value, 
  onChange, 
  isHighlighted 
}) => {
  const inputHoverClass = "hover:outline hover:outline-2 hover:outline-black";

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      {isFixedAmount && <span className="mr-1">$</span>}
      <Input
        type="number"
        min="0"
        step={isFixedAmount ? "10" : "0.1"}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-24 text-right ${inputHoverClass} ${
          isHighlighted ? 'bg-gray-50' : ''
        }`}
        placeholder={isFixedAmount ? "Amount" : "Shares"}
      />
    </div>
  );
};

export default RecipientValue;
