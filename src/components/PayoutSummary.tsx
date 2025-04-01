
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  remainingAmount: number;
  totalShares: number;
  valuePerShare: number;
}

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  remainingAmount,
  totalShares,
  valuePerShare,
}) => {
  // Calculate total of fixed amounts
  const totalFixedAmount = totalPayout - remainingAmount;
  
  // Calculate total payout (should match the input, but this verifies)
  const calculatedTotal = recipients.reduce((total, r) => total + r.payout, 0);
  
  // Check if there's any difference due to rounding errors
  const difference = Math.abs(totalPayout - calculatedTotal);
  
  // Sort recipients for display with fixed amounts first
  const sortedRecipients = [...recipients].sort((a, b) => {
    // Sort by type (fixed first)
    if (a.isFixedAmount !== b.isFixedAmount) {
      return a.isFixedAmount ? -1 : 1;
    }
    // Then by payout amount (highest first)
    return b.payout - a.payout;
  });

  // Calculate group totals
  const groupTotals = recipients
    .filter(r => r.isGroup)
    .map(group => ({
      id: group.id,
      name: group.name,
      payout: group.payout,
      memberCount: group.groupMembers?.length || 0
    }));

  if (totalPayout <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 italic">
            Enter a total show payout amount to see the distribution
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Total Payout:</div>
            <div className="text-right">{formatCurrency(totalPayout)}</div>
            
            <div className="font-medium">Fixed Amounts:</div>
            <div className="text-right">{formatCurrency(totalFixedAmount)}</div>
            
            <div className="font-medium">Amount for Shares:</div>
            <div className="text-right">{formatCurrency(remainingAmount)}</div>
            
            <div className="font-medium">Total Shares:</div>
            <div className="text-right">{totalShares.toFixed(2)}</div>
            
            <div className="font-medium">Value Per Share:</div>
            <div className="text-right">{formatCurrency(valuePerShare)}</div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">Individual Payouts</h3>
            <div className="space-y-2">
              {sortedRecipients.map((recipient) => (
                <div key={recipient.id} className="flex justify-between">
                  <div className="flex items-center">
                    <span>{recipient.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {recipient.isFixedAmount 
                        ? `(Fixed: ${formatCurrency(recipient.value)})` 
                        : `(${recipient.value} shares)`}
                      {recipient.isGroup && recipient.groupMembers && 
                        ` - ${recipient.groupMembers.length} members`}
                    </span>
                  </div>
                  <div className="font-medium">{formatCurrency(recipient.payout)}</div>
                </div>
              ))}
            </div>
          </div>

          {groupTotals.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Group Details</h3>
              <div className="space-y-4">
                {groupTotals.map((group) => {
                  const groupRecipient = recipients.find(r => r.id === group.id);
                  const memberCount = groupRecipient?.groupMembers?.length || 0;
                  
                  return (
                    <div key={group.id} className="bg-blue-50 p-3 rounded-md">
                      <div className="flex justify-between font-medium mb-2">
                        <span>{group.name}</span>
                        <span>{formatCurrency(group.payout)}</span>
                      </div>
                      
                      {groupRecipient?.groupMembers && (
                        <div className="text-sm space-y-1">
                          {groupRecipient.groupMembers.map((member, idx) => (
                            <div key={idx} className="flex justify-between text-gray-600">
                              <span>{member}</span>
                              <span>{formatCurrency(group.payout / memberCount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-medium text-blue-700 border-t border-blue-200 pt-1 mt-1">
                            <span>Per Member:</span>
                            <span>
                              {formatCurrency(memberCount > 0 ? group.payout / memberCount : 0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {difference > 0.01 && (
            <div className="text-xs text-amber-600 italic mt-4">
              Note: There is a small rounding difference of {formatCurrency(difference)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutSummary;
