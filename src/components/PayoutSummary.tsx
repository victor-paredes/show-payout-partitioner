import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Recipient } from "@/hooks/useRecipients";
import { Divider } from "@/components/DividerRow";
import { getRecipientColor } from "@/lib/colorUtils";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from "recharts";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type PayoutItem = Recipient | Divider;

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  items?: PayoutItem[];
  remainingAmount: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
}

const SURPLUS_COLOR = "#ecfdf5";
const OVERDRAW_COLOR = "#EF4444";

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  items = [],
  remainingAmount,
  hoveredRecipientId,
  onRecipientHover
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isCalculationStable, setIsCalculationStable] = useState<boolean>(false);
  
  useEffect(() => {
    setIsCalculationStable(false);
    const timer = setTimeout(() => {
      setIsCalculationStable(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [recipients.length, totalPayout]);
  
  const totalFixedAmount = totalPayout - remainingAmount;
  
  const calculatedTotal = recipients.reduce((total, r) => total + r.payout, 0);
  
  const difference = calculatedTotal - totalPayout;
  const hasSurplus = difference < -0.01 || recipients.length === 0;
  const hasOverdraw = difference > 0.01;
  
  const surplus = hasSurplus ? (recipients.length === 0 ? totalPayout : Math.abs(difference)) : 0;
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

  const getRecipientDisplayColor = (recipient: Recipient) => {
    return recipient.color || getRecipientColor(recipient.id);
  };

  const chartData = recipients.map(recipient => ({
    id: recipient.id,
    name: recipient.name || "Unnamed",
    value: recipient.payout,
    color: recipient.color || getRecipientColor(recipient.id)
  }));

  const positiveChartData = chartData.filter(item => item.value > 0);

  if (hasSurplus) {
    positiveChartData.push({
      id: "surplus",
      name: "Remaining",
      value: difference,
      color: SURPLUS_COLOR
    });
  } else if (hasOverdraw) {
    positiveChartData.push({
      id: "overdraw",
      name: "Overdrawn",
      value: Math.abs(difference),
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

  if (totalPayout <= 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Payout Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 italic">
            Enter a total payout amount to see the distribution
          </p>
        </CardContent>
      </Card>
    );
  }

  const emptyPieData = [{ name: "empty", value: 1 }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-blue-900">
              {formatCurrency(totalPayout)}
            </h2>
            <p className="text-sm text-gray-600">Total Payout</p>
          </div>

          {chartData.length > 0 && (
            <div className="flex justify-center py-1">
              <div className="w-full" style={{ height: 200 }}>
                {hasOverdraw && isCalculationStable ? (
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
                      data={positiveChartData}
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
                      {positiveChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          fillOpacity={hoveredChartIndex !== -1 && hoveredChartIndex !== index ? 0.4 : 1} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </div>
            </div>
          )}
          
          {hasSurplus && isCalculationStable && (
            <div className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded-md flex items-center gap-1 mb-2">
              <span>Surplus</span>
              <span className="text-xs text-green-500 ml-2">
                ({((surplus / totalPayout) * 100).toFixed(1)}%)
              </span>
              <span className="ml-auto">{formatCurrency(surplus)}</span>
            </div>
          )}
          
          {hasOverdraw && isCalculationStable && (
            <div className="text-xs bg-red-100 text-red-700 py-1 px-2 rounded-md flex items-center gap-1 mb-2">
              <span>Overdraw</span>
              <span className="text-xs text-red-500 ml-2">
                ({((overdraw / totalPayout) * 100).toFixed(1)}%)
              </span>
              <span className="ml-auto">{formatCurrency(overdraw)}</span>
            </div>
          )}
          
          {recipients.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Individual Payouts</h3>
              <div className="max-h-80 overflow-y-auto pr-2">
                {items.map((item) => {
                  if ('type' in item && item.type === 'divider') {
                    const divider = item as Divider;
                    return (
                      <div 
                        key={divider.id}
                        className="text-sm text-gray-600 font-medium py-2 px-1 border-t"
                      >
                        {divider.text}
                      </div>
                    );
                  } else {
                    const recipient = item as Recipient;
                    const color = recipient.color || getRecipientColor(recipient.id);
                    
                    return (
                      <div 
                        key={recipient.id}
                        className={cn(
                          "flex justify-between py-1 px-1 rounded hover:bg-gray-50 transition-colors",
                          hoveredRecipientId === recipient.id ? "bg-gray-100" : ""
                        )}
                        onMouseEnter={() => onRecipientHover && onRecipientHover(recipient.id)}
                        onMouseLeave={() => onRecipientHover && onRecipientHover(null)}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="font-medium">{recipient.name || "Unnamed"}</span>
                        </div>
                        <span>{formatCurrency(recipient.payout)}</span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

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
