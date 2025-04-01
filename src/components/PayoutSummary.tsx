
import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell } from "recharts";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportToPdf } from "@/lib/exportUtils";

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
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
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
  hoveredRecipientId,
  onRecipientHover,
}) => {
  // Use ref for the component we want to export as PDF
  const summaryRef = useRef<HTMLDivElement>(null);
  
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
    .map((recipient) => {
      const percentage = totalPayout > 0 
        ? ((recipient.payout / totalPayout) * 100).toFixed(1) 
        : "0";
        
      return {
        name: recipient.name || "Unnamed",
        value: recipient.payout,
        percentage: percentage,
        id: recipient.id,
      };
    });

  // Find the index of the hovered recipient in our chart data
  const hoveredChartIndex = hoveredRecipientId
    ? chartData.findIndex(item => item.id === hoveredRecipientId)
    : -1;

  // Handle hovering on a chart element
  const handleChartHover = (index: number | null) => {
    if (onRecipientHover) {
      if (index !== null && index >= 0 && index < chartData.length) {
        onRecipientHover(chartData[index].id);
      } else {
        onRecipientHover(null);
      }
    }
  };

  // Export the payout summary as PDF
  const handleExportPdf = () => {
    if (summaryRef.current) {
      exportToPdf(summaryRef.current, 'payout-summary');
    }
  };

  if (totalPayout <= 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Payout Summary</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <FileDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Payout Summary</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <FileDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportPdf}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" ref={summaryRef}>
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
                    onMouseEnter={(_, index) => handleChartHover(index)}
                    onMouseLeave={() => handleChartHover(null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={hoveredChartIndex === index ? "#000000" : COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">Individual Payouts</h3>
            <div className="space-y-2">
              {recipients.map((recipient, index) => {
                // Find the chart data for this recipient to get the percentage
                const recipientChartData = chartData.find(item => item.id === recipient.id);
                const percentage = recipientChartData ? recipientChartData.percentage : "0";
                const isHighlighted = hoveredRecipientId === recipient.id;
                const recipientColor = COLORS[chartData.findIndex(item => item.id === recipient.id) % COLORS.length];
                
                return (
                  <div 
                    key={recipient.id} 
                    className={`flex justify-between p-1 rounded ${isHighlighted ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => onRecipientHover?.(recipient.id)}
                    onMouseLeave={() => onRecipientHover?.(null)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-sm mr-2" 
                        style={{ 
                          backgroundColor: hoveredRecipientId === recipient.id 
                            ? "#000000" 
                            : recipientColor 
                        }}
                      />
                      <span>{recipient.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {recipient.isFixedAmount 
                          ? `(Fixed: ${formatCurrency(recipient.value)})` 
                          : `(${recipient.value}x, ${percentage}%)`}
                      </span>
                    </div>
                    <div className="font-medium">{formatCurrency(recipient.payout)}</div>
                  </div>
                );
              })}
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
