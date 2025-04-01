
import PayoutCalculator from "@/components/PayoutCalculator";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-2">Show Payout Partitioner</h1>
        <p className="text-center text-gray-600 mb-8">Calculate and distribute event payouts among multiple recipients</p>
        <PayoutCalculator />
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
