import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";

interface TotalPayoutInputProps {
  totalPayout: number;
  onChange: (value: number) => void;
}

const TotalPayoutInput = ({ totalPayout, onChange }: TotalPayoutInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    if (totalPayout === 0) {
      setDisplayValue("");
    } else {
      const formattedValue = formatCurrency(totalPayout).replace('$', '').trim();
      setDisplayValue(formattedValue);
    }
  }, [totalPayout]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numericValue = rawValue ? parseFloat(rawValue) : 0;
    onChange(numericValue);
  };

  return (
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
            type="text"
            placeholder="Enter total amount"
            value={displayValue}
            onChange={handleInputChange}
            className="text-xl font-medium"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalPayoutInput;
