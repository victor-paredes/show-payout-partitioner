
import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell } from "recharts";
import { X } from "lucide-react";
import { RecipientType } from "@/components/RecipientRow";
import { getRecipientColor } from "@/lib/colorUtils";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
  color?: string;
}

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  remainingAmount: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
}

// Updated surplus color to match the light green in the surplus tag background
const SURPLUS_COLOR = "#ecfdf5"; // Light green matching bg-green-100
const OVERDRAW_COLOR = "#EF4444";

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
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
        color: getRecipientDisplayColor(recipient)
      };
    });
    
  if (hasSurplus && isCalculationStable) {
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
  
  if (hasOverdraw && isCalculationStable) {
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
      <CardHeader className="pb-2">
        <CardTitle>Payout Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" ref={summaryRef} id="payout-summary">
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
          
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">Individual Payouts</h3>
            {recipients.length > 0 ? (
              <div className="space-y-1">
                {recipients.map((recipient) => {
                  const percentage = totalPayout > 0 
                    ? ((recipient.payout / totalPayout) * 100).toFixed(1) 
                    : "0";
                  
                  const recipientColor = getRecipientDisplayColor(recipient);
                  const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
                  
                  let valueDisplay = "";
                  if (type === "$") {
                    valueDisplay = "($)";
                  } else if (type === "%") {
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
                          className={`w-3 h-3 rounded-sm mr-2 ${
                            hoveredRecipientId === recipient.id 
                              ? 'ring-1 ring-black' 
                              : ''
                          }`}
                          style={{ backgroundColor: recipientColor }}
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
            ) : (
              <div className="text-center py-3 text-gray-500 italic">
                No recipients added yet. All funds remain as surplus.
              </div>
            )}
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
