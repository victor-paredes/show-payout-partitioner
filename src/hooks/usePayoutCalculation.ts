
import { useState, useEffect } from "react";
import { Recipient } from "./useRecipients";

export function usePayoutCalculation(recipients: Recipient[]) {
  const [totalPayout, setTotalPayout] = useState<number>(0);
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

    // Calculate fixed amounts total
    const fixedAmounts = recipients
      .filter(r => r.isFixedAmount)
      .reduce((sum, r) => sum + (isNaN(r.value) ? 0 : r.value), 0);

    // Calculate total shares
    const shares = recipients
      .filter(r => !r.isFixedAmount)
      .reduce((sum, r) => sum + (isNaN(r.value) ? 0 : r.value), 0);

    const remaining = Math.max(0, totalPayout - fixedAmounts);
    const perShare = shares > 0 ? remaining / shares : 0;

    setRemainingAmount(remaining);
    setTotalShares(shares);
    setValuePerShare(perShare);
  }, [totalPayout, recipients]);

  // Update recipient payouts based on calculations
  useEffect(() => {
    if (totalPayout <= 0) {
      return;
    }

    // Update payouts for each recipient
    const updatedRecipients = recipients.map(recipient => {
      if (recipient.isFixedAmount) {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value,
        };
      } else {
        return {
          ...recipient,
          payout: isNaN(recipient.value) ? 0 : recipient.value * valuePerShare,
        };
      }
    });

    return updatedRecipients;
  }, [totalPayout, recipients, valuePerShare]);

  return {
    totalPayout,
    setTotalPayout,
    remainingAmount,
    totalShares,
    valuePerShare
  };
}
