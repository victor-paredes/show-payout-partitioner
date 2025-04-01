import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecipientRow from "./RecipientRow";
import PayoutSummary from "./PayoutSummary";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [recipientCount, setRecipientCount] = useState<string>("1");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addRecipients = () => {
    const currentRecipientCount = recipients.length;
    const count = parseInt(recipientCount);
    
    const newRecipients = Array.from({ length: count }, (_, index) => {
      const newId = (Math.max(0, ...recipients.map(r => parseInt(r.id))) + index + 1).toString();
      const defaultName = `Recipient ${currentRecipientCount + index + 1}`;
      
      return { 
        id: newId, 
        name: defaultName, 
        isFixedAmount: false, 
        value: 1, 
        payout: 0
      };
    });
    
    setRecipients([
      ...recipients,
      ...newRecipients,
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
    
    // Remove from selections if selected
    if (selectedRecipients.has(id)) {
      const newSelectedRecipients = new Set(selectedRecipients);
      newSelectedRecipients.delete(id);
      setSelectedRecipients(newSelectedRecipients);
    }
    
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const toggleSelectRecipient = (id: string) => {
    const newSelectedRecipients = new Set(selectedRecipients);
    if (newSelectedRecipients.has(id)) {
      newSelectedRecipients.delete(id);
    } else {
      newSelectedRecipients.add(id);
    }
    setSelectedRecipients(newSelectedRecipients);
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    // If the recipient is selected, apply the same update to all selected recipients
    if (selectedRecipients.has(id) && selectedRecipients.size > 1) {
      const updatedRecipients = recipients.map(recipient => {
        if (selectedRecipients.has(recipient.id)) {
          return { ...recipient, ...updates };
        }
        return recipient;
      });
      setRecipients(updatedRecipients);
    } else {
      // Otherwise, just update this one recipient
      setRecipients(
        recipients.map(recipient => 
          recipient.id === id ? { ...recipient, ...updates } : recipient
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setRecipients((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
            <div className="flex items-center space-x-2">
              <Select value={recipientCount} onValueChange={setRecipientCount}>
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addRecipients} variant="outline" size="sm" className="flex items-center">
                <Plus className="mr-1 h-4 w-4" /> Add Recipient{parseInt(recipientCount) > 1 ? 's' : ''}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={recipients.map(r => r.id)} 
                strategy={verticalListSortingStrategy}
              >
                {recipients.map((recipient) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    onUpdate={(updates) => updateRecipient(recipient.id, updates)}
                    onRemove={() => removeRecipient(recipient.id)}
                    valuePerShare={valuePerShare}
                    isSelected={selectedRecipients.has(recipient.id)}
                    onToggleSelect={() => toggleSelectRecipient(recipient.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
