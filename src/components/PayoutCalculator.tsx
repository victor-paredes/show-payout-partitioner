
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecipientRow from "./RecipientRow";
import PayoutSummary from "./PayoutSummary";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  isGroup: boolean;
  groupMembers?: string[];
  groupMemberShares?: number[];
}

const PayoutCalculator = () => {
  const { toast } = useToast();
  const [totalPayout, setTotalPayout] = useState<number>(0);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", name: "Recipient 1", isFixedAmount: false, value: 1, payout: 0, isGroup: false },
  ]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [valuePerShare, setValuePerShare] = useState<number>(0);

  const addRecipient = () => {
    const currentRecipientCount = recipients.length;
    const newId = (Math.max(0, ...recipients.map(r => parseInt(r.id))) + 1).toString();
    
    // Generate a more descriptive default name
    const defaultName = `Recipient ${currentRecipientCount + 1}`;
    
    setRecipients([
      ...recipients,
      { 
        id: newId, 
        name: defaultName, 
        isFixedAmount: false, 
        value: 1, 
        payout: 0,
        isGroup: false
      },
    ]);
  };

  const addGroupRecipient = () => {
    const currentRecipientCount = recipients.length;
    const newId = (Math.max(0, ...recipients.map(r => parseInt(r.id))) + 1).toString();
    
    // Generate a more descriptive default name
    const defaultName = `Group ${currentRecipientCount + 1}`;
    
    setRecipients([
      ...recipients,
      { 
        id: newId, 
        name: defaultName, 
        isFixedAmount: false, 
        value: 0, 
        payout: 0,
        isGroup: true,
        groupMembers: ["Member 1"],
        groupMemberShares: [1]
      },
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

  const updateGroupMember = (recipientId: string, index: number, memberName: string) => {
    setRecipients(
      recipients.map(recipient => {
        if (recipient.id === recipientId && recipient.isGroup && recipient.groupMembers) {
          const updatedMembers = [...recipient.groupMembers];
          updatedMembers[index] = memberName;
          return { ...recipient, groupMembers: updatedMembers };
        }
        return recipient;
      })
    );
  };

  const updateGroupMemberShare = (recipientId: string, index: number, share: number) => {
    setRecipients(
      recipients.map(recipient => {
        if (recipient.id === recipientId && recipient.isGroup && recipient.groupMemberShares) {
          const updatedShares = [...(recipient.groupMemberShares || [])];
          updatedShares[index] = share;
          
          // Calculate group total shares
          const totalGroupShares = updatedShares.reduce((sum, share) => sum + share, 0);
          
          return { 
            ...recipient, 
            groupMemberShares: updatedShares,
            value: totalGroupShares // Update the group's total value to be the sum of member shares
          };
        }
        return recipient;
      })
    );
  };

  const addGroupMember = (recipientId: string) => {
    setRecipients(
      recipients.map(recipient => {
        if (recipient.id === recipientId && recipient.isGroup && recipient.groupMembers) {
          const memberCount = recipient.groupMembers.length;
          const updatedMembers = [...recipient.groupMembers, `Member ${memberCount + 1}`];
          const updatedShares = [...(recipient.groupMemberShares || []), 1];
          
          // Recalculate total group shares
          const totalGroupShares = updatedShares.reduce((sum, share) => sum + share, 0);
          
          return { 
            ...recipient, 
            groupMembers: updatedMembers,
            groupMemberShares: updatedShares,
            value: totalGroupShares
          };
        }
        return recipient;
      })
    );
  };

  const removeGroupMember = (recipientId: string, index: number) => {
    setRecipients(
      recipients.map(recipient => {
        if (recipient.id === recipientId && recipient.isGroup && recipient.groupMembers) {
          // Don't allow removing the last member
          if (recipient.groupMembers.length <= 1) {
            toast({
              title: "Cannot remove",
              description: "A group must have at least one member",
              variant: "destructive",
            });
            return recipient;
          }
          
          const updatedMembers = [...recipient.groupMembers];
          updatedMembers.splice(index, 1);
          
          const updatedShares = [...(recipient.groupMemberShares || [])];
          updatedShares.splice(index, 1);
          
          // Recalculate total group shares
          const totalGroupShares = updatedShares.reduce((sum, share) => sum + share, 0);
          
          return { 
            ...recipient, 
            groupMembers: updatedMembers,
            groupMemberShares: updatedShares,
            value: totalGroupShares
          };
        }
        return recipient;
      })
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
            <div className="flex space-x-2">
              <Button onClick={addGroupRecipient} variant="outline" size="sm" className="flex items-center">
                <Users className="mr-1 h-4 w-4" /> Add Group
              </Button>
              <Button onClick={addRecipient} variant="outline" size="sm" className="flex items-center">
                <Plus className="mr-1 h-4 w-4" /> Add Recipient
              </Button>
            </div>
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
                onAddGroupMember={() => addGroupMember(recipient.id)}
                onRemoveGroupMember={(index) => removeGroupMember(recipient.id, index)}
                onUpdateGroupMember={(index, name) => updateGroupMember(recipient.id, index, name)}
                onUpdateGroupMemberShare={(index, share) => updateGroupMemberShare(recipient.id, index, share)}
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
