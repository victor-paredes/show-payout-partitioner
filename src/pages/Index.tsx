
import PayoutCalculator from "@/components/PayoutCalculator";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Payout Visualizer</h1>
            <p className="text-gray-600">Calculate and distribute payouts among multiple recipients</p>
          </div>
        </div>
        <PayoutCalculator />
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
