
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { Recipient, RecipientGroup } from "@/hooks/useRecipients";
import { getRecipientColor } from "@/lib/colorUtils";

interface PayoutSummaryProps {
  totalPayout: number;
  recipients: Recipient[];
  groups?: RecipientGroup[];
  remainingAmount: number;
  hoveredRecipientId?: string;
  onRecipientHover?: (id: string | null) => void;
}

interface ChartData {
  id: string;
  name: string;
  value: number;
  color: string;
  isGroup?: boolean;
  groupName?: string;
}

const PayoutSummary: React.FC<PayoutSummaryProps> = ({
  totalPayout,
  recipients,
  groups = [],
  remainingAmount,
  hoveredRecipientId,
  onRecipientHover,
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  // Create chart data by combining group data and individual recipient data
  const chartData: ChartData[] = [];
  
  // First, handle grouped recipients
  groups.forEach(group => {
    // Filter recipients in this group
    const groupRecipients = recipients.filter(r => r.groupId === group.id);
    
    if (groupRecipients.length > 0) {
      // Calculate total payout for this group
      const groupTotalPayout = groupRecipients.reduce((total, r) => total + r.payout, 0);
      
      // Only add if there's a payout
      if (groupTotalPayout > 0) {
        // Use first recipient's color as the group color or generate one
        const firstRecipient = groupRecipients[0];
        const groupColor = firstRecipient?.color || getRecipientColor(group.id);
        
        chartData.push({
          id: group.id,
          name: group.name || "Unnamed Group",
          value: groupTotalPayout,
          color: groupColor,
          isGroup: true,
          groupName: group.name
        });
        
        // Add individual recipients within the group
        groupRecipients.forEach(recipient => {
          if (recipient.payout > 0) {
            chartData.push({
              id: recipient.id,
              name: recipient.name || "Unnamed",
              value: recipient.payout,
              color: recipient.color || getRecipientColor(recipient.id),
              groupName: group.name
            });
          }
        });
      }
    }
  });
  
  // Then add ungrouped recipients
  recipients
    .filter(r => !r.groupId && r.payout > 0)
    .forEach(recipient => {
      chartData.push({
        id: recipient.id,
        name: recipient.name || "Unnamed",
        value: recipient.payout,
        color: recipient.color || getRecipientColor(recipient.id)
      });
    });
  
  // Add remaining amount if it's > 0
  if (remainingAmount > 0) {
    chartData.push({
      id: "remaining",
      name: "Unallocated",
      value: remainingAmount,
      color: "#e2e8f0" // light gray color
    });
  }

  // Sort by value (descending)
  chartData.sort((a, b) => b.value - a.value);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border text-sm">
          {data.groupName && !data.isGroup && (
            <p className="text-xs text-gray-500 mb-1">Group: {data.groupName}</p>
          )}
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(data.value)}</p>
          <p>{formatPercentage(data.value / totalPayout)}</p>
        </div>
      );
    }
    return null;
  };

  // Handle mouse events on the chart
  const handleMouseEnter = (data: any) => {
    if (onRecipientHover && data.id !== "remaining" && !data.isGroup) {
      onRecipientHover(data.id);
    }
  };

  const handleMouseLeave = () => {
    if (onRecipientHover) {
      onRecipientHover(null);
    }
  };

  // Format the list of recipients
  const recipientsList = chartData
    .filter(item => item.id !== "remaining" && !item.isGroup)
    .map(recipient => {
      const isHovered = hoveredRecipientId === recipient.id;
      
      return (
        <div 
          key={recipient.id}
          className={`flex justify-between items-center p-2 rounded-md transition-colors ${
            isHovered ? "bg-blue-50" : ""
          } ${recipient.groupName ? "ml-4" : ""}`}
          onMouseEnter={() => onRecipientHover && onRecipientHover(recipient.id)}
          onMouseLeave={() => onRecipientHover && onRecipientHover(null)}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: recipient.color }}
            />
            <span className="font-medium truncate max-w-[120px]" title={recipient.name}>
              {recipient.name}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span>{formatCurrency(recipient.value)}</span>
            <span className="text-xs text-gray-500">
              {formatPercentage(recipient.value / totalPayout)}
            </span>
          </div>
        </div>
      );
    });

  // Format the groups for the list
  const groupsList = groups
    .filter(group => {
      // Check if the group has any recipients with payout
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      const groupTotal = groupRecipients.reduce((sum, r) => sum + r.payout, 0);
      return groupTotal > 0;
    })
    .map(group => {
      // Get all recipients in this group
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      
      // Calculate total payout for the group
      const groupTotal = groupRecipients.reduce((sum, r) => sum + r.payout, 0);
      
      // Only show groups with positive payout
      if (groupTotal <= 0) return null;
      
      // Get chart data item for this group
      const groupData = chartData.find(item => item.id === group.id && item.isGroup);
      if (!groupData) return null;
      
      return (
        <div key={group.id} className="mb-2">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-t-md">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: groupData.color }}
              />
              <span className="font-medium text-sm text-gray-600">
                {group.name}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span>{formatCurrency(groupTotal)}</span>
              <span className="text-xs text-gray-500">
                {formatPercentage(groupTotal / totalPayout)}
              </span>
            </div>
          </div>
          
          {/* Recipients in this group */}
          <div className="border border-gray-100 rounded-b-md mb-2">
            {groupRecipients
              .filter(r => r.payout > 0)
              .map(recipient => {
                const isHovered = hoveredRecipientId === recipient.id;
                
                return (
                  <div 
                    key={recipient.id}
                    className={`flex justify-between items-center p-2 transition-colors ${
                      isHovered ? "bg-blue-50" : ""
                    }`}
                    onMouseEnter={() => onRecipientHover && onRecipientHover(recipient.id)}
                    onMouseLeave={() => onRecipientHover && onRecipientHover(null)}
                  >
                    <div className="flex items-center gap-2 ml-4">
                      <div 
                        className="w-2 h-2 rounded-sm" 
                        style={{ backgroundColor: recipient.color || getRecipientColor(recipient.id) }}
                      />
                      <span className="truncate max-w-[100px]" title={recipient.name}>
                        {recipient.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span>{formatCurrency(recipient.payout)}</span>
                      <span className="text-xs text-gray-500">
                        {formatPercentage(recipient.payout / totalPayout)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      );
    });

  // Display ungrouped recipients after groups
  const ungroupedRecipients = recipientsList.filter(
    (_, index) => !chartData[index].groupName
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Payout Summary</CardTitle>
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
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="value"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        strokeWidth={hoveredRecipientId === entry.id ? 2 : 1}
                        stroke={hoveredRecipientId === entry.id ? "#000" : "#fff"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Allocation</h3>
            
            {/* Display groups first */}
            {groupsList}
            
            {/* Then display ungrouped recipients */}
            {ungroupedRecipients}

            {/* Display remaining amount */}
            {remainingAmount > 0 && (
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-gray-200" />
                  <span className="font-medium">Unallocated</span>
                </div>
                <div className="flex flex-col items-end">
                  <span>{formatCurrency(remainingAmount)}</span>
                  <span className="text-xs text-gray-500">
                    {formatPercentage(remainingAmount / totalPayout)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutSummary;
