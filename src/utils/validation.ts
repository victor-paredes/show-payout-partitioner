
import { Recipient } from "@/types/recipient";
import { COLORS } from "@/lib/colorUtils";

export const validateRecipient = (recipient: any): boolean => {
  if (!recipient) return false;
  if (typeof recipient.id !== 'string' || !recipient.id) return false;
  if (typeof recipient.name !== 'string') return false;
  if (typeof recipient.value !== 'number') return false;
  
  if (recipient.type && !['shares', '$', '%'].includes(recipient.type)) return false;
  
  if (recipient.color && typeof recipient.color === 'string') {
    const validColor = /^#[0-9A-F]{6}$/i.test(recipient.color) || COLORS.includes(recipient.color);
    if (!validColor) return false;
  }
  
  return true;
};
