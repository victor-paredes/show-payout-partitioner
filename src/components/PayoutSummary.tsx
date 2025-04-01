
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
}

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  remainingAmount: number;
}

// More distinct colors for better visual separation
const COLORS = [
  "#8B5CF6", // Vivid Purple
  "#D946EF", // Magenta Pink
  "#F97316", // Bright Orange
  "#0EA5E9", // Ocean Blue
  "#10B981", // Emerald Green
  "#EF4444", // Red
  "#FACC15", // Yellow
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#14B8A6", // Teal
];

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  remainingAmount,
}) => {
  const totalFixedAmount = totalPayout - remainingAmount;
  
  const calculatedTotal = recipients.reduce((total, r) => total + r.payout, 0);
  
  const difference = Math.abs(totalPayout - calculatedTotal);
  
  const sortedRecipients = [...recipients].sort((a, b) => {
    if (a.isFixedAmount !== b.isFixedAmount) {
      return a.isFixedAmount ? -1 : 1;
    }
    return b.payout - a.payout;
  });

  const chartData = sortedRecipients
    .filter(recipient => recipient.payout > 0)
    .map((recipient, index) => {
      const percentage = totalPayout > 0 
        ? ((recipient.payout / totalPayout) * 100).toFixed(1) 
        : "0";
        
      return {
        name: recipient.name || `Recipient ${index + 1}`,
        value: recipient.payout,
        percentage: percentage,
      };
    });

  // Custom renderer for the legend with percentages
  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="h-3 w-3 mr-2 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value} ({chartData[index].percentage}%)</span>
          </div>
        ))}
      </div>
    );
  };

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
          </div>

          {chartData.length > 0 && (
            <div className="flex justify-center py-4">
              <div style={{ width: '100%', height: 250 }}>
                <PieChart width={400} height={250} style={{ margin: '0 auto' }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend content={renderCustomizedLegend} />
                </PieChart>
              </div>
            </div>
          )}

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
                    </span>
                  </div>
                  <div className="font-medium">{formatCurrency(recipient.payout)}</div>
                </div>
              ))}
            </div>
          </div>

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
