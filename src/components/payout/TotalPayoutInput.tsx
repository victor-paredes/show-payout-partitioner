
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface TotalPayoutInputProps {
  totalPayout: number;
  onChange: (value: number) => void;
}

const TotalPayoutInput = ({ totalPayout, onChange }: TotalPayoutInputProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-blue-600" />
          Total Payout
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
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="text-xl font-medium"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalPayoutInput;
