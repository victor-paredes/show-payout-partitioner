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
import { RecipientType } from "@/components/RecipientRow";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
}

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  remainingAmount: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
}

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

// Light grey for surplus
const SURPLUS_COLOR = "#E5E7EB";

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  remainingAmount,
  hoveredRecipientId,
  onRecipientHover,
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  
  const totalFixedAmount = totalPayout - remainingAmount;
  
  const calculatedTotal = recipients.reduce((total, r) => total + r.payout, 0);
  
  // Calculate surplus as the difference between total payout and what's been allocated
  const surplus = totalPayout - calculatedTotal;
  const hasSurplus = surplus > 0.01; // Only show surplus if it's greater than 1 cent
  
  const difference = Math.abs(totalPayout - calculatedTotal);
  
  const sortedRecipients = [...recipients].sort((a, b) => {
    const typeOrder = {
      "$": 0,
      "%": 1,
      "shares": 2
    };
    
    const aType = a.type || (a.isFixedAmount ? "$" : "shares");
    const bType = b.type || (b.isFixedAmount ? "$" : "shares");
    
    if (aType !== bType) {
      return typeOrder[aType] - typeOrder[bType];
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
    
  // Add surplus to chart data if it exists
  if (hasSurplus) {
    const surplusPercentage = totalPayout > 0 
      ? ((surplus / totalPayout) * 100).toFixed(1) 
      : "0";
      
    chartData.push({
      name: "Surplus",
      value: surplus,
      percentage: surplusPercentage,
      id: "surplus"
    });
  }

  const hoveredChartIndex = hoveredRecipientId
    ? chartData.findIndex(item => item.id === hoveredRecipientId)
    : -1;

  const handleChartHover = (index: number | null) => {
    if (onRecipientHover) {
      if (index !== null && index >= 0 && index < chartData.length) {
        onRecipientHover(chartData[index].id);
      } else {
        onRecipientHover(null);
      }
    }
  };

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
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-blue-900">
              {formatCurrency(totalPayout)}
            </h2>
            <p className="text-sm text-gray-600">Total Payout</p>
          </div>

          {chartData.length > 0 && (
            <div className="flex justify-center py-1">
              <div className="w-full" style={{ height: 200 }}>
                <PieChart 
                  width={400} 
                  height={200}
                  style={{ margin: '0 auto', width: 'auto' }}
                >
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
                    {chartData.map((entry, index) => {
                      // Use light grey color for surplus
                      const color = entry.id === "surplus" 
                        ? SURPLUS_COLOR 
                        : COLORS[index % COLORS.length];
                        
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={hoveredChartIndex === index ? "#000000" : color} 
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            {hasSurplus && (
              <div 
                className={`flex justify-between p-1 rounded mb-3 border border-gray-200 ${
                  hoveredRecipientId === "surplus" 
                    ? 'bg-blue-100' 
                    : ''
                }`}
                onMouseEnter={() => onRecipientHover?.("surplus")}
                onMouseLeave={() => onRecipientHover?.(null)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-2" 
                    style={{ 
                      backgroundColor: hoveredRecipientId === "surplus" 
                        ? "#000000" 
                        : SURPLUS_COLOR 
                    }}
                  />
                  <span>Surplus</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({((surplus / totalPayout) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="font-medium">{formatCurrency(surplus)}</div>
              </div>
            )}

            <h3 className="font-semibold mb-3">Individual Payouts</h3>
            <div className="space-y-2">
              {recipients.map((recipient) => {
                const recipientChartData = chartData.find(item => item.id === recipient.id);
                const percentage = recipientChartData ? recipientChartData.percentage : "0";
                const recipientColor = COLORS[chartData.findIndex(item => item.id === recipient.id) % COLORS.length] || COLORS[0];
                const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
                
                let valueDisplay = "";
                if (type === "$") {
                  valueDisplay = `($${formatCurrency(recipient.value).substring(1)})`;
                } else if (type === "%") {
                  valueDisplay = `(${recipient.value}%)`;
                } else {
                  valueDisplay = `(${recipient.value}x, ${percentage}%)`;
                }
                
                return (
                  <div 
                    key={recipient.id} 
                    className={`flex justify-between p-1 rounded ${
                      hoveredRecipientId === recipient.id 
                        ? 'bg-blue-100' 
                        : ''
                    }`}
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
                        {valueDisplay}
                      </span>
                    </div>
                    <div className="font-medium">
                      {recipient.type === "$" ? formatCurrency(recipient.payout) : 
                       recipient.type === "%" ? `${recipient.payout.toFixed(2)}%` : 
                       formatCurrency(recipient.payout)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!hasSurplus && difference > 0.01 && (
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
