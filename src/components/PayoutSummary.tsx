import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Recipient } from "@/hooks/useRecipients";

interface PayoutSummaryProps {
  recipients: Recipient[];
  totalPayout: number;
  remainingAmount: number;
  totalShares: number;
  valuePerShare: number;
}

const PayoutSummary: React.FC<PayoutSummaryProps> = ({ 
  recipients, 
  totalPayout, 
  remainingAmount, 
  totalShares, 
  valuePerShare 
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  const renderPayoutDetails = () => {
    return recipients.map((recipient, index) => {
      const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
      
      return (
        <div 
          key={recipient.id} 
          className={`grid grid-cols-4 gap-4 py-2 ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          <div className="font-medium">{recipient.name}</div>
          <div className="text-gray-600">
            {type === "shares" 
              ? `(${recipient.value} ${recipient.value === 1 ? "share" : "shares"})` 
              : type === "$" 
              ? "($)" 
              : `(${recipient.value}%)`
            }
          </div>
          <div className="font-medium">
            {formatCurrency(recipient.payout)}
          </div>
          <div className="font-medium">
            {formatCurrency(recipient.payout)}
          </div>
        </div>
      );
    });
  };

  return (
    <Card ref={summaryRef} className="w-full">
      <CardHeader>
        <CardTitle>Payout Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-4 gap-4 py-2 font-bold">
          <div>Recipient</div>
          <div>Distribution</div>
          <div>Expected Payout</div>
          <div>Actual Payout</div>
        </div>
        {renderPayoutDetails()}
        <div className="grid grid-cols-4 gap-4 py-2 font-bold border-t">
          <div>Totals:</div>
          <div></div>
          <div>{formatCurrency(totalPayout)}</div>
          <div>{formatCurrency(totalPayout)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutSummary;
