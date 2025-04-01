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
import { FileDown, X } from "lucide-react";
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

// Enhanced saturated color palette with 50 unique colors
const COLORS = [
  // Bold Primary Colors
  "#FF0000", // Red
  "#00FF00", // Lime
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  
  // Vivid Secondary Colors
  "#FF8000", // Orange
  "#8000FF", // Violet
  "#0080FF", // Azure
  "#FF0080", // Rose
  "#00FF80", // Spring Green
  "#80FF00", // Chartreuse
  
  // Saturated Tertiary Colors
  "#FF4000", // Vermilion
  "#FF0040", // Crimson
  "#4000FF", // Indigo
  "#00FF40", // Harlequin
  "#40FF00", // Bright Green
  "#0040FF", // Ultramarine
  "#8000C0", // Purple
  "#C00080", // Ruby
  "#C08000", // Amber
  "#00C080", // Jade
  "#80C000", // Olive
  "#0080C0", // Cerulean
  
  // Additional Bright Colors
  "#FF6000", // Dark Orange
  "#FF0060", // Folly
  "#6000FF", // Electric Indigo
  "#00FF60", // Malachite
  "#60FF00", // Bright Yellow-Green
  "#0060FF", // Bright Blue
  
  // More Vibrant Colors
  "#FF3000", // Ferrari Red
  "#FF0030", // Raspberry
  "#3000FF", // Ultramarine Blue
  "#00FF30", // Neon Green
  "#30FF00", // Acid Green
  "#0030FF", // Cobalt Blue
  
  // Extra Colors to Reach 50
  "#FF1000", // Bright Red
  "#FF0010", // Crimson Glory
  "#1000FF", // Electric Purple
  "#00FF10", // Bright Green
  "#10FF00", // Spring Bud
  "#0010FF", // Medium Blue
  "#FA5252", // Flamingo
  "#20C997", // Jungle Green
  "#7950F2", // Medium Purple
  "#FCC419", // Sunglow
  "#FF922B", // Dark Orange
  "#4C6EF5", // Cornflower Blue
  "#BE4BDB", // Medium Orchid
  "#15AABF"  // Cerulean
];

// Light grey for surplus
const SURPLUS_COLOR = "#E5E7EB";
// Red for overdraw
const OVERDRAW_COLOR = "#EF4444";

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
  const difference = calculatedTotal - totalPayout;
  const hasSurplus = difference < -0.01; // Only show surplus if it's greater than 1 cent
  const hasOverdraw = difference > 0.01; // Only show overdraw if it's greater than 1 cent
  
  const surplus = hasSurplus ? Math.abs(difference) : 0;
  const overdraw = hasOverdraw ? difference : 0;
  
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

  // Assign consistent colors based on recipient ID instead of chart data index
  const getRecipientColor = (recipientId: string) => {
    // Hash the recipient ID to get a consistent color index
    const hashCode = Array.from(recipientId).reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    return COLORS[hashCode % COLORS.length];
  };

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
        color: getRecipientColor(recipient.id)
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
      id: "surplus",
      color: SURPLUS_COLOR
    });
  }
  
  // Add overdraw to chart data if it exists
  if (hasOverdraw) {
    const overdrawPercentage = totalPayout > 0 
      ? ((overdraw / totalPayout) * 100).toFixed(1) 
      : "0";
      
    chartData.push({
      name: "Overdraw",
      value: overdraw,
      percentage: overdrawPercentage,
      id: "overdraw",
      color: OVERDRAW_COLOR
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
            Enter a total payout amount to see the distribution
          </p>
        </CardContent>
      </Card>
    );
  }

  // Create empty pie data for overdraw visualization
  const emptyPieData = [{ name: "empty", value: 1 }];

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
                {hasOverdraw ? (
                  <div className="relative" style={{ height: 200 }}>
                    <PieChart 
                      width={400} 
                      height={200}
                      style={{ margin: '0 auto', width: 'auto' }}
                    >
                      <Pie
                        data={emptyPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#FFFFFF"
                        stroke={OVERDRAW_COLOR}
                        strokeWidth={3}
                        isAnimationActive={false}
                        dataKey="value"
                      >
                        <Cell fill="#FFFFFF" />
                      </Pie>
                    </PieChart>
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ pointerEvents: 'none' }}
                    >
                      <X size={60} color={OVERDRAW_COLOR} strokeWidth={3} />
                    </div>
                  </div>
                ) : (
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
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={hoveredChartIndex === index ? "#000000" : entry.color} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </div>
            </div>
          )}
          
          {/* Moved tags above the divider */}
          <div className="space-y-2">
            {hasSurplus && (
              <div className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded-md flex items-center gap-1 mb-2">
                <span>Surplus</span>
                <span className="text-xs text-green-500 ml-2">
                  ({((surplus / totalPayout) * 100).toFixed(1)}%)
                </span>
                <span className="ml-auto">{formatCurrency(surplus)}</span>
              </div>
            )}
            
            {hasOverdraw && (
              <div className="text-xs bg-red-100 text-red-700 py-1 px-2 rounded-md flex items-center gap-1 mb-2">
                <span>Overdraw</span>
                <span className="text-xs text-red-500 ml-2">
                  ({((overdraw / totalPayout) * 100).toFixed(1)}%)
                </span>
                <span className="ml-auto">{formatCurrency(overdraw)}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">Individual Payouts</h3>
            <div className="space-y-1">
              {recipients.map((recipient) => {
                const percentage = totalPayout > 0 
                  ? ((recipient.payout / totalPayout) * 100).toFixed(1) 
                  : "0";
                
                const recipientColor = getRecipientColor(recipient.id);
                const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
                
                let valueDisplay = "";
                if (type === "$") {
                  valueDisplay = "($)";
                } else if (type === "%") {
                  // Remove the parentheses for percentage type, will show the blue percentage below
                  valueDisplay = "";
                } else {
                  valueDisplay = `(${recipient.value} ${recipient.value === 1 ? 'share' : 'shares'})`;
                }
                
                return (
                  <div 
                    key={recipient.id} 
                    className={`flex justify-between p-1 rounded ${
                      hoveredRecipientId === recipient.id 
                        ? 'bg-gray-100' 
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
                      {valueDisplay && (
                        <span className="text-xs text-gray-500 ml-2">
                          {valueDisplay}
                        </span>
                      )}
                      <span className={`text-xs text-blue-500 ${type === '%' ? 'ml-2' : 'ml-1'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(recipient.payout)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!hasSurplus && !hasOverdraw && Math.abs(difference) > 0.01 && (
            <div className="text-xs text-amber-600 italic mt-4">
              Note: There is a small rounding difference of {formatCurrency(Math.abs(difference))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutSummary;
