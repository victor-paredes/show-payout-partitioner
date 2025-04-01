
import { Recipient, Group } from "@/types/recipient";

export function useGroupCalculations(recipients: Recipient[], groups: Group[]) {
  const getGroupedRecipients = () => {
    const ungroupedRecipients = recipients.filter(r => !r.groupId);
    
    const recipientsByGroup = groups.map(group => {
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      return {
        group,
        recipients: groupRecipients
      };
    });
    
    return {
      ungroupedRecipients,
      recipientsByGroup
    };
  };

  const getGroupTotals = () => {
    return groups.map(group => {
      const groupRecipients = recipients.filter(r => r.groupId === group.id);
      
      const dollarTotal = groupRecipients
        .filter(r => r.type === "$")
        .reduce((sum, r) => sum + r.payout, 0);
        
      const percentTotal = groupRecipients
        .filter(r => r.type === "%")
        .reduce((sum, r) => sum + r.payout, 0);
        
      const sharesTotal = groupRecipients
        .filter(r => r.type === "shares")
        .reduce((sum, r) => sum + r.payout, 0);
        
      const totalPayout = dollarTotal + percentTotal + sharesTotal;
      
      const dollarCount = groupRecipients.filter(r => r.type === "$").length;
      const percentCount = groupRecipients.filter(r => r.type === "%").length;
      const sharesCount = groupRecipients.filter(r => r.type === "shares").length;
      
      return {
        group,
        dollarTotal,
        percentTotal,
        sharesTotal,
        totalPayout,
        dollarCount,
        percentCount,
        sharesCount,
        recipientCount: groupRecipients.length
      };
    });
  };

  return {
    getGroupedRecipients,
    getGroupTotals
  };
}
