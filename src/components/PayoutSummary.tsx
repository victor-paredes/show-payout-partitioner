import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell, Sector } from "recharts";
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
  groupId?: string;
  groupName?: string;
}

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  remainingAmount: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
  groups?: Array<{ id: string, name: string, memberIds: string[] }>;
}

const SURPLUS_COLOR = "#E5E7EB";
const OVERDRAW_COLOR = "#EF4444";
const GROUP_ARC_COLOR = "#9b87f5"; // Primary purple for the connecting arc

type ChartDataItem = {
  name: string;
  value: number;
  percentage: string;
  id: string;
  color: string;
  groupId?: string;
  groupName?: string;
  startAngle?: number;
  endAngle?: number;
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  midAngle?: number;
};

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  remainingAmount,
  hoveredRecipientId,
  onRecipientHover,
  groups = []
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
  const hasSurplus = difference < -0.01;
  const hasOverdraw = difference > 0.01;
  
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
    
    if (a.groupId && b.groupId && a.groupId === b.groupId) {
      return b.payout - a.payout;
    } else if (a.groupId && !b.groupId) {
      return -1;
    } else if (!a.groupId && b.groupId) {
      return 1;
    } else if (a.groupId && b.groupId && a.groupId !== b.groupId) {
      return (a.groupName || "").localeCompare(b.groupName || "");
    }
    
    if (aType !== bType) {
      return typeOrder[aType] - typeOrder[bType];
    }
    
    return b.payout - a.payout;
  });

  const getRecipientDisplayColor = (recipient: Recipient) => {
    return recipient.color || getRecipientColor(recipient.id);
  };

  const chartData: ChartDataItem[] = sortedRecipients
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
        color: getRecipientDisplayColor(recipient),
        groupId: recipient.groupId,
        groupName: recipient.groupName
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
      color: SURPLUS_COLOR,
      groupId: undefined,
      groupName: undefined
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
      color: OVERDRAW_COLOR,
      groupId: undefined,
      groupName: undefined
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

  const recipientsByGroup: { [groupId: string]: Recipient[] } = {};
  const ungroupedRecipients: Recipient[] = [];

  recipients.forEach(recipient => {
    if (recipient.groupId) {
      if (!recipientsByGroup[recipient.groupId]) {
        recipientsByGroup[recipient.groupId] = [];
      }
      recipientsByGroup[recipient.groupId].push(recipient);
    } else {
      ungroupedRecipients.push(recipient);
    }
  });

  const groupTotals: Record<string, { 
    payout: number, 
    shares: number, 
    percentage: number,
    name: string 
  }> = {};

  Object.entries(recipientsByGroup).forEach(([groupId, members]) => {
    const totalPayout = members.reduce((sum, r) => sum + r.payout, 0);
    const totalShares = members.reduce((sum, r) => {
      if (r.type === "shares") {
        return sum + r.value;
      }
      return sum;
    }, 0);
    const percentage = totalPayout > 0 && totalPayout > 0 
      ? (totalPayout / totalPayout) * 100 
      : 0;

    groupTotals[groupId] = {
      payout: totalPayout,
      shares: totalShares,
      percentage,
      name: members[0]?.groupName || "Group"
    };
  });

  const renderConnectingArcs = () => {
    if (!isCalculationStable) return null;
    
    const dataByGroup: { [groupId: string]: ChartDataItem[] } = {};
    
    chartData.forEach((item) => {
      if (item.groupId && item.startAngle !== undefined && item.endAngle !== undefined) {
        if (!dataByGroup[item.groupId]) {
          dataByGroup[item.groupId] = [];
        }
        dataByGroup[item.groupId].push(item);
      }
    });
    
    const arcs: JSX.Element[] = [];
    
    Object.values(dataByGroup).forEach((groupItems, groupIndex) => {
      if (groupItems.length < 2) return;
      
      const sortedItems = [...groupItems].sort((a, b) => {
        return (a.startAngle || 0) - (b.startAngle || 0);
      });
      
      const radius = (sortedItems[0].outerRadius || 80) + 5;
      
      const firstItem = sortedItems[0];
      const lastItem = sortedItems[sortedItems.length - 1];
      
      let minStartAngle = firstItem.startAngle || 0;
      let maxEndAngle = lastItem.endAngle || 0;
      
      sortedItems.forEach(item => {
        if ((item.startAngle || 0) < minStartAngle) minStartAngle = item.startAngle || 0;
        if ((item.endAngle || 0) > maxEndAngle) maxEndAngle = item.endAngle || 0;
      });
      
      if (firstItem.cx && firstItem.cy) {
        arcs.push(
          <g key={`group-arc-${groupIndex}`}>
            <path
              d={`
                M ${firstItem.cx + radius * Math.cos(minStartAngle * Math.PI / 180)} 
                  ${firstItem.cy + radius * Math.sin(minStartAngle * Math.PI / 180)}
                A ${radius} ${radius} 0 
                  ${(maxEndAngle - minStartAngle > 180) ? 1 : 0} 1
                  ${firstItem.cx + radius * Math.cos(maxEndAngle * Math.PI / 180)} 
                  ${firstItem.cy + radius * Math.sin(maxEndAngle * Math.PI / 180)}
              `}
              fill="none"
              stroke={GROUP_ARC_COLOR}
              strokeWidth={2}
              opacity={hoveredRecipientId && sortedItems.some(item => item.id === hoveredRecipientId) ? 1 : 0.5}
            />
          </g>
        );
      }
    });
    
    return arcs;
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

  const handleAnimationStart = (data?: any) => {
    if (data && data.sectors) {
      data.sectors.forEach((sector: any, i: number) => {
        if (i < chartData.length) {
          chartData[i].startAngle = sector.startAngle;
          chartData[i].endAngle = sector.endAngle;
          chartData[i].cx = sector.cx;
          chartData[i].cy = sector.cy;
          chartData[i].innerRadius = sector.innerRadius;
          chartData[i].outerRadius = sector.outerRadius;
          chartData[i].midAngle = (sector.startAngle + sector.endAngle) / 2;
        }
      });
    }
  };

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
                      onAnimationStart={handleAnimationStart}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          fillOpacity={hoveredChartIndex !== -1 && hoveredChartIndex !== index ? 0.4 : 1} 
                          stroke={entry.groupId ? GROUP_ARC_COLOR : undefined}
                          strokeWidth={entry.groupId ? 1 : 0}
                        />
                      ))}
                    </Pie>
                    {renderConnectingArcs()}
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
            <div className="space-y-1">
              {Object.entries(recipientsByGroup).map(([groupId, groupMembers]) => {
                const groupTotal = groupTotals[groupId];
                const percentage = totalPayout > 0 
                  ? ((groupTotal.payout / totalPayout) * 100).toFixed(1) 
                  : "0";
                
                const isGroupHovered = hoveredRecipientId ? 
                  groupMembers.some(r => r.id === hoveredRecipientId) : 
                  false;
                
                return (
                  <div 
                    key={groupId}
                    className="mb-3 border border-gray-200 rounded-md overflow-hidden"
                  >
                    <div className="bg-gray-100 px-2 py-1 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{groupTotal.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {groupTotal.shares > 0 ? 
                            `(${groupTotal.shares} ${groupTotal.shares === 1 ? 'share' : 'shares'})` : 
                            ''}
                        </span>
                        <span className="text-xs text-blue-500 ml-2">
                          {percentage}%
                        </span>
                      </div>
                      <div className="font-medium text-sm">
                        {formatCurrency(groupTotal.payout)}
                      </div>
                    </div>
                    
                    <div className="pl-3">
                      {groupMembers.map((recipient) => {
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
                  </div>
                );
              })}
              
              {ungroupedRecipients.map((recipient) => {
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
