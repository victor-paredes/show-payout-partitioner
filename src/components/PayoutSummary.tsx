import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell } from "recharts";
import { ChartPie, X, ChevronRight, ChevronDown } from "lucide-react";
import { RecipientType } from "@/components/RecipientRow";
import { getRecipientColor, SURPLUS_COLOR, OVERDRAW_COLOR } from "@/lib/colorUtils";
import { Group } from "@/hooks/useRecipients";
import { Separator } from "@/components/ui/separator";
import RecipientSummaryItem from "./payout/RecipientSummaryItem";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
  color?: string;
  groupId?: string;
}

interface GroupTotal {
  group: Group;
  dollarTotal: number;
  percentTotal: number;
  sharesTotal: number;
  totalPayout: number;
  dollarCount: number;
  percentCount: number;
  sharesCount: number;
  recipientCount: number;
}

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  remainingAmount: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
  groupTotals: GroupTotal[];
}

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  remainingAmount,
  hoveredRecipientId,
  onRecipientHover,
  groupTotals
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isCalculationStable, setIsCalculationStable] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
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

  const toggleGroupExpanded = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const getRecipientDisplayColor = (recipient: Recipient) => {
    return recipient.color || getRecipientColor(recipient.id);
  };

  const chartData = recipients
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
          <CardTitle className="flex items-center">
            <ChartPie className="mr-2 h-5 w-5 text-blue-600" />
            Payout Summary
          </CardTitle>
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

  const groupsById = groupTotals.reduce((acc, { group }) => {
    acc[group.id] = group;
    return acc;
  }, {} as Record<string, Group>);

  const recipientsByGroup: Record<string, Recipient[]> = {};
  
  groupTotals.forEach(({ group }) => {
    recipientsByGroup[group.id] = [];
  });
  
  recipientsByGroup['ungrouped'] = [];
  
  recipients.forEach(recipient => {
    if (recipient.groupId && recipientsByGroup[recipient.groupId]) {
      recipientsByGroup[recipient.groupId].push(recipient);
    } else {
      recipientsByGroup['ungrouped'].push(recipient);
    }
  });
  
  const groupedRecipientsForDisplay = Object.entries(recipientsByGroup)
    .filter(([groupId]) => groupId !== 'ungrouped')
    .map(([groupId, recipients]) => ({
      groupId,
      recipients,
      groupName: groupsById[groupId]?.name || "Unknown Group"
    }));

  // Get only groups with recipients
  const nonEmptyGroups = groupedRecipientsForDisplay.filter(group => group.recipients.length > 0);
  
  const hasNonEmptyGroups = nonEmptyGroups.length > 0;
  const hasUngroupedRecipients = recipientsByGroup['ungrouped'].length > 0;
  const shouldShowDivider = hasNonEmptyGroups && hasUngroupedRecipients;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <ChartPie className="mr-2 h-5 w-5 text-blue-600" />
          Payout Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" ref={summaryRef} id="payout-summary">
          <div className="flex justify-center mb-4">
            <div className="border border-gray-200 rounded-md px-6 py-4 inline-block text-center">
              <h2 className="text-3xl font-bold text-blue-900">
                {formatCurrency(totalPayout)}
              </h2>
              <p className="text-sm text-gray-600">Total Payout</p>
            </div>
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
          
          {recipients.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Payouts</h3>
              
              {nonEmptyGroups.map(({ groupId, recipients, groupName }) => {
                const groupInfo = groupTotals.find(g => g.group.id === groupId);
                const totalValue = groupInfo ? groupInfo.totalPayout : 0;
                const percentageOfTotal = totalPayout > 0 
                  ? ((totalValue / totalPayout) * 100).toFixed(1) 
                  : "0";
                
                return (
                  <div 
                    key={groupId} 
                    className="border border-gray-200 rounded-md mb-3 overflow-hidden"
                  >
                    <div className="flex justify-between items-center bg-gray-50 p-2 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600">{groupName}</h4>
                      <div className="text-sm text-gray-500">
                        <span className="text-blue-500 mr-2">{percentageOfTotal}%</span>
                        <span>{formatCurrency(totalValue)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 p-2">
                      {recipients.map((recipient) => {
                        const percentage = totalPayout > 0 
                          ? ((recipient.payout / totalPayout) * 100).toFixed(1) 
                          : "0";
                        
                        const recipientColor = recipient.color || getRecipientColor(recipient.id);
                        const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
                        
                        return (
                          <RecipientSummaryItem
                            key={recipient.id}
                            id={recipient.id}
                            name={recipient.name}
                            payout={recipient.payout}
                            value={recipient.value}
                            type={type}
                            color={recipientColor}
                            percentage={percentage}
                            totalPayout={totalPayout}
                            isHighlighted={hoveredRecipientId === recipient.id}
                            onMouseEnter={() => onRecipientHover?.(recipient.id)}
                            onMouseLeave={() => onRecipientHover?.(null)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {shouldShowDivider && (
                <Separator className="my-3 bg-gray-200" />
              )}
              
              {hasUngroupedRecipients && (
                <div className="space-y-1">
                  {recipientsByGroup['ungrouped'].map((recipient) => {
                    const percentage = totalPayout > 0 
                      ? ((recipient.payout / totalPayout) * 100).toFixed(1) 
                      : "0";
                    
                    const recipientColor = recipient.color || getRecipientColor(recipient.id);
                    const type = recipient.type || (recipient.isFixedAmount ? "$" : "shares");
                    
                    return (
                      <RecipientSummaryItem
                        key={recipient.id}
                        id={recipient.id}
                        name={recipient.name}
                        payout={recipient.payout}
                        value={recipient.value}
                        type={type}
                        color={recipientColor}
                        percentage={percentage}
                        totalPayout={totalPayout}
                        isHighlighted={hoveredRecipientId === recipient.id}
                        onMouseEnter={() => onRecipientHover?.(recipient.id)}
                        onMouseLeave={() => onRecipientHover?.(null)}
                      />
                    );
                  })}
                </div>
              )}
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
