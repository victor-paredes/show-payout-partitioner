
import { RecipientType } from "@/components/RecipientRow";

export interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
  type?: RecipientType;
  color?: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  expanded: boolean;
}
