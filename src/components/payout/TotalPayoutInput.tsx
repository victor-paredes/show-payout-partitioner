
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
  const [displayValue, setDisplayValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // Format the display value when totalPayout changes
  useEffect(() => {
    if (totalPayout === 0) {
      setDisplayValue("");
    } else {
      const formattedValue = formatCurrency(totalPayout).replace('$', '').trim();
      setDisplayValue(formattedValue);
    }
  }, [totalPayout]);

  // Restore cursor position after formatting
  useEffect(() => {
    if (cursorPositionRef.current !== null && inputRef.current) {
      const newCursorPosition = Math.min(
        cursorPositionRef.current,
        displayValue.length
      );
      inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      cursorPositionRef.current = null;
    }
  }, [displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Save current cursor position before value changes
    if (inputRef.current) {
      cursorPositionRef.current = inputRef.current.selectionStart;
    }

    const input = e.target.value;
    // Remove commas and non-numeric characters (except for decimal point)
    const rawValue = input.replace(/[^0-9.]/g, '');
    
    // Handle numeric processing
    const numericValue = rawValue ? parseFloat(rawValue) : 0;
    
    // Count commas before cursor to adjust position
    if (cursorPositionRef.current !== null) {
      const beforeCursor = input.substring(0, cursorPositionRef.current);
      const commasBeforeCursor = (beforeCursor.match(/,/g) || []).length;
      cursorPositionRef.current -= commasBeforeCursor;
    }
    
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
            className="text-xl font-medium"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalPayoutInput;
