
import React from "react";
import { formatCurrency } from "@/lib/format";
import { RecipientType } from "@/components/RecipientRow";

interface RecipientPayoutProps {
  payout: number;
  type: RecipientType;
}

const RecipientPayout: React.FC<RecipientPayoutProps> = ({ payout, type }) => {
  const formattedPayout = 
    type === "$" ? formatCurrency(payout) : 
    type === "%" ? `${payout.toFixed(2)}%` : 
    formatCurrency(payout);

  return (
    <div className="w-28 text-right">
      <span className="font-medium">{formattedPayout}</span>
    </div>
  );
};

export default RecipientPayout;
