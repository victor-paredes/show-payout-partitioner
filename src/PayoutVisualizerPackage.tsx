import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PayoutCalculator from "@/components/PayoutCalculator";

interface PayoutVisualizerProps {
  className?: string;
}

/**
 * PayoutVisualizer - A complete payout calculation and visualization component
 * 
 * Features:
 * - Calculate and distribute payouts among multiple recipients
 * - Support for fixed amounts ($), percentages (%), and shares
 * - Group management for organizing recipients
 * - Drag & drop functionality for moving recipients between groups
 * - Export functionality (CSV, PDF)
 * - Responsive design with mobile support
 * - Keyboard navigation with horizontal/vertical tabbing modes
 * 
 * @param className - Optional CSS class for styling the container
 */
export const PayoutVisualizer: React.FC<PayoutVisualizerProps> = ({ className }) => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
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