
import { useState, useEffect } from "react";
import { Recipient } from "./useRecipients";

export function usePayoutCalculation(recipients: Recipient[]) {
  const [totalPayout, setTotalPayout] = useState<number>(100); // Set default to $100
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [valuePerShare, setValuePerShare] = useState<number>(0);
  
  // Calculate distributions and payouts
  useEffect(() => {
    if (totalPayout <= 0) {
      setRemainingAmount(0);
      setValuePerShare(0);
      return;
    }

    // If there are no recipients, all amount is surplus
    if (recipients.length === 0) {
      setRemainingAmount(totalPayout);
      setTotalShares(0);
      setValuePerShare(0);
      return;
    }

    // Calculate fixed amounts total
    const fixedRecipients = recipients.filter(r => r.type === "$");
    
    const fixedAmounts = fixedRecipients.reduce(
      (sum, r) => sum + (isNaN(r.value) ? 0 : r.value), 
      0
    );

    // Calculate percentage amounts
    const percentageRecipients = recipients.filter(r => r.type === "%");
    
    const totalPercentage = percentageRecipients.reduce(
      (sum, r) => sum + (isNaN(r.value) ? 0 : r.value), 
      0
    );
    
    // Ensure percentage doesn't exceed 100%
    const safePercentage = Math.min(totalPercentage, 100);
    const percentageAmount = (safePercentage / 100) * totalPayout;
    
    // Calculate total reserved amount (fixed + percentage)
    const reservedAmount = fixedAmounts + percentageAmount;
    
    // Calculate shares
    const sharesRecipients = recipients.filter(r => r.type === "shares");
    
    const shares = sharesRecipients.reduce(
      (sum, r) => sum + (isNaN(r.value) ? 0 : r.value), 
      0
    );

    // Calculate remaining amount for shares
    const remaining = Math.max(0, totalPayout - reservedAmount);
    const perShare = shares > 0 ? remaining / shares : 0;

    setRemainingAmount(remaining);
    setTotalShares(shares);
    setValuePerShare(perShare);
  }, [totalPayout, recipients]);

  return {
    totalPayout,
    setTotalPayout,
    remainingAmount,
    totalShares,
    valuePerShare
  };
}
