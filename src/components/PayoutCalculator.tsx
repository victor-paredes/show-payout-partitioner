
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecipientRow from "./RecipientRow";
import PayoutSummary from "./PayoutSummary";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
}

const PayoutCalculator = () => {
  const { toast } = useToast();
  const [totalPayout, setTotalPayout] = useState<number>(0);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", name: "Recipient 1", isFixedAmount: false, value: 1, payout: 0 },
  ]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [valuePerShare, setValuePerShare] = useState<number>(0);

  const addRecipient = () => {
    const newId = (Math.max(0, ...recipients.map(r => parseInt(r.id))) + 1).toString();
    setRecipients([
      ...recipients,
      { id: newId, name: `Recipient ${newId}`, isFixedAmount: false, value: 1, payout: 0 },
    ]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length === 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one recipient",
        variant: "destructive",
      });
      return;
    }
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients(
      recipients.map(recipient => 
        recipient.id === id ? { ...recipient, ...updates } : recipient
      )
    );
  };

  // Calculate distributions and payouts
  useEffect(() => {
    if (totalPayout <= 0) {
      setRemainingAmount(0);
      setValuePerShare(0);
      setRecipients(recipients.map(r => ({ ...r, payout: 0 })));
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
          payout: isNaN(recipient.value) ? 0 : recipient.value * perShare,
        };
      }
    });

    setRecipients(updatedRecipients);
  }, [totalPayout, recipients.map(r => r.id).join(','), 
     recipients.map(r => r.name).join(','),
     recipients.map(r => r.isFixedAmount).join(','), 
     recipients.map(r => r.value).join(',')]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-blue-600" />
            Total Show Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className="text-xl font-medium mr-2">$</span>
            <Input
              type="number"
              min="0"
              placeholder="Enter total amount"
              value={totalPayout === 0 ? "" : totalPayout}
              onChange={(e) => setTotalPayout(parseFloat(e.target.value) || 0)}
              className="text-xl font-medium"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recipients</span>
            <Button onClick={addRecipient} variant="outline" size="sm" className="flex items-center">
              <Plus className="mr-1 h-4 w-4" /> Add Recipient
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipients.map((recipient) => (
              <RecipientRow
                key={recipient.id}
                recipient={recipient}
                onUpdate={(updates) => updateRecipient(recipient.id, updates)}
                onRemove={() => removeRecipient(recipient.id)}
                valuePerShare={valuePerShare}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <PayoutSummary
        totalPayout={totalPayout}
        recipients={recipients}
        remainingAmount={remainingAmount}
        totalShares={totalShares}
        valuePerShare={valuePerShare}
      />
    </div>
  );
};

export default PayoutCalculator;
