
import PayoutCalculator from "@/components/PayoutCalculator";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-2">Payout Visualizer</h1>
            <p className="text-sm md:text-base text-gray-600">Calculate and distribute payouts among multiple recipients</p>
          </div>
        </div>
        <PayoutCalculator />
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
