# Quick Copy Script for Payout Visualizer Package

This file contains a structured representation of all files needed for the Payout Visualizer package.

## File Contents (Copy each section to respective files)

### src/PayoutVisualizerPackage.tsx
```tsx
import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PayoutCalculator from "@/components/PayoutCalculator";

interface PayoutVisualizerProps {
  className?: string;
}

export const PayoutVisualizer: React.FC<PayoutVisualizerProps> = ({ className }) => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white ${className || ''}`}>
          <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-2">
                  Payout Visualizer
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Calculate and distribute payouts among multiple recipients
                </p>
              </div>
            </div>
            <PayoutCalculator />
          </div>
          <Toaster />
          <Sonner />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default PayoutVisualizer;
```

### src/index.ts
```ts
// Main Component
export { default as PayoutVisualizer } from './PayoutVisualizerPackage';
export { default as PayoutCalculator } from './components/PayoutCalculator';

// Core Hooks
export { useRecipientsManager } from './hooks/useRecipientsManager';
export { usePayoutCalculation } from './hooks/usePayoutCalculation';

// Types
export type { Recipient, Group, RecipientType } from './hooks/useRecipientsManager';

// Individual Components
export { default as TotalPayoutInput } from './components/payout/TotalPayoutInput';
export { default as PayoutSummary } from './components/PayoutSummary';
export { default as RecipientsList } from './components/recipients/RecipientsList';
export { default as GroupContainer } from './components/recipients/GroupContainer';
export { default as UngroupedContainer } from './components/recipients/UngroupedContainer';
export { default as RecipientItem } from './components/recipients/RecipientItem';
export { default as PayoutHeaderMenu } from './components/payout/PayoutHeaderMenu';
export { default as ColorPickerModal } from './components/ColorPickerModal';
export { default as ConfirmationModal } from './components/ConfirmationModal';

// Utilities
export * from './lib/colorUtils';
export * from './lib/exportUtils';
export * from './lib/format';
export { cn } from './lib/utils';

// UI Components
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
export { Toaster } from './components/ui/toaster';
export { useToast } from './hooks/use-toast';
```

## Copy All Existing Files

You'll need to copy all the existing files from this project:

1. **Copy src/components/** - All component files including subfolders
2. **Copy src/hooks/** - All hook files
3. **Copy src/lib/** - All utility files  
4. **Copy src/index.css** - Design system CSS
5. **Add the new files above** - PayoutVisualizerPackage.tsx and index.ts

## Required Dependencies

Ensure these are in your target project's package.json:
```json
{
  "@tanstack/react-query": "^5.56.2",
  "react-colorful": "^5.6.1",
  "jspdf": "^2.5.2",
  "lucide-react": "^0.462.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.2"
}
```

## Usage After Copy

```tsx
// In your target project
import { PayoutVisualizer } from './src'; // or wherever you copied the files

function App() {
  return <PayoutVisualizer />;
}
```

---

**Manual Process Required**: Copy each file manually from this project to your target project following the structure above.