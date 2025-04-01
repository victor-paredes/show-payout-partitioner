
import React from "react";

interface RecipientColorSwatchProps {
  color: string;
  isHighlighted?: boolean;
}

const RecipientColorSwatch: React.FC<RecipientColorSwatchProps> = ({
  color,
  isHighlighted,
}) => {
  return (
    <div 
      className={`w-4 h-4 rounded-sm transition-all ${
        isHighlighted ? "border border-black" : ""
      }`} 
      style={{ backgroundColor: color }}
    />
  );
};

export default RecipientColorSwatch;
