
import React from "react";
import { formatCurrency } from "@/lib/format";
import { RecipientType } from "@/components/RecipientRow";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecipientSummaryItemProps {
  id: string;
  name: string;
  payout: number;
  value: number;
  type?: RecipientType;
  color: string;
  percentage: string;
  totalPayout: number;
  isHighlighted?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const RecipientSummaryItem: React.FC<RecipientSummaryItemProps> = ({
  id,
  name,
  payout,
  value,
  type,
  color,
  percentage,
  totalPayout,
  isHighlighted,
  onMouseEnter,
  onMouseLeave
}) => {
  const isMobile = useIsMobile();
  
  let valueDisplay = "";
  if (type === "$") {
    valueDisplay = "($)";
  } else if (type === "%") {
    valueDisplay = "";
  } else {
    valueDisplay = `(${value} ${value === 1 ? 'share' : 'shares'})`;
  }
  
  return (
    <div 
      className={`flex justify-between p-1 rounded ${
        isHighlighted ? 'bg-gray-100' : ''
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center overflow-hidden">
        <div 
          className={`min-w-3 w-3 h-3 rounded-sm mr-2 flex-shrink-0 ${
            isHighlighted ? 'ring-1 ring-black' : ''
          }`}
          style={{ backgroundColor: color }}
        />
        <span className={`truncate ${isMobile ? 'max-w-[120px]' : ''}`}>{name}</span>
        {valueDisplay && (
          <span className="text-xs text-gray-500 ml-2 hidden sm:inline flex-shrink-0">
            {valueDisplay}
          </span>
        )}
        <span className={`text-xs text-blue-500 ${type === '%' ? 'ml-2' : 'ml-1'} flex-shrink-0`}>
          {percentage}%
        </span>
      </div>
      <div className="font-medium ml-2 flex-shrink-0">
        {formatCurrency(payout)}
      </div>
    </div>
  );
};

export default RecipientSummaryItem;
