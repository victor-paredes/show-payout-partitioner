// Main Component
export { default as PayoutVisualizer } from './PayoutVisualizerPackage';
export { default as PayoutCalculator } from './components/PayoutCalculator';

// Core Hooks
export { useRecipientsManager } from './hooks/useRecipientsManager';
export { usePayoutCalculation } from './hooks/usePayoutCalculation';

// Types
export type { Recipient, Group, RecipientType } from './hooks/useRecipientsManager';

// Individual Components (if you want to use them separately)
export { default as TotalPayoutInput } from './components/payout/TotalPayoutInput';
export { default as PayoutSummary } from './components/PayoutSummary';
export { default as RecipientsList } from './components/recipients/RecipientsList';
export { default as GroupContainer } from './components/recipients/GroupContainer';
export { default as UngroupedContainer } from './components/recipients/UngroupedContainer';
export { default as RecipientItem } from './components/recipients/RecipientItem';
export { default as PayoutHeaderMenu } from './components/payout/PayoutHeaderMenu';
export { default as ColorPickerModal } from './components/ColorPickerModal';
export { default as ConfirmationModal } from './components/ConfirmationModal';

// Utility Functions
export * from './lib/colorUtils';
export * from './lib/exportUtils';
export * from './lib/format';
export { cn } from './lib/utils';

// UI Components (re-export commonly used ones)
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
export { Toaster } from './components/ui/toaster';
export { useToast } from './hooks/use-toast';