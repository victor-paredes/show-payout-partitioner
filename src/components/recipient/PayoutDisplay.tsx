
import React from "react";
import { formatCurrency } from "@/lib/format";

interface PayoutDisplayProps {
  payout: number;
}

const PayoutDisplay: React.FC<PayoutDisplayProps> = ({ payout }) => {
  return (
    <div className="w-28 text-right">
      <span>{formatCurrency(payout)}</span>
    </div>
  );
};

export default PayoutDisplay;
