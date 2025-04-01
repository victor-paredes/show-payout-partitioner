
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { formatCurrency } from "@/lib/format";

interface TotalPayoutInputProps {
  totalPayout: number;
  onChange: (value: number) => void;
}

const TotalPayoutInput = ({ totalPayout, onChange }: TotalPayoutInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [displayValue, setDisplayValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize the input value based on totalPayout
  useEffect(() => {
    if (totalPayout === 0) {
      setInputValue("");
      setDisplayValue("");
    } else {
      // Convert to string with 2 decimal places but without other formatting
      const formattedValue = totalPayout.toFixed(2);
      setInputValue(formattedValue);
      
      // Format for display with commas
      const displayWithCommas = formatCurrency(totalPayout).replace('$', '').trim();
      setDisplayValue(displayWithCommas);
    }
  }, [totalPayout]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-numeric characters
    const digitsOnly = input.replace(/\D/g, '');
    
    // Ensure we don't exceed a reasonable length
    if (digitsOnly.length > 12) {
      return;
    }
    
    // Convert to a decimal value (divide by 100 to make the last two digits cents)
    const numericValue = digitsOnly ? parseFloat(digitsOnly) / 100 : 0;
    
    // Update the internal value
    setInputValue(numericValue.toFixed(2));
    
    // Format for display with commas
    const displayWithCommas = formatCurrency(numericValue).replace('$', '').trim();
    setDisplayValue(displayWithCommas);
    
    // Update the parent component
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
            ref={inputRef}
            type="text"
            placeholder="Enter total amount"
            value={displayValue}
            onChange={handleInputChange}
            className="text-xl font-medium text-right"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalPayoutInput;
