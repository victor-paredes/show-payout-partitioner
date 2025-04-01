
import React, { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface RecipientNameProps {
  name: string;
  onChange: (name: string) => void;
  isHighlighted: boolean;
}

const RecipientName: React.FC<RecipientNameProps> = ({ 
  name, 
  onChange, 
  isHighlighted 
}) => {
  const [nameWidth, setNameWidth] = useState(150); // Default width
  const nameRef = useRef<HTMLSpanElement>(null);
  const inputHoverClass = "hover:outline hover:outline-2 hover:outline-black";

  // Update name width based on content
  useEffect(() => {
    if (nameRef.current) {
      // Get the content width plus some padding
      const newWidth = Math.max(150, nameRef.current.scrollWidth + 20);
      setNameWidth(newWidth);
    }
  }, [name]);

  return (
    <div className="flex-1">
      <div className="relative inline-block">
        <span 
          ref={nameRef} 
          className="invisible absolute whitespace-nowrap"
        >
          {name || "Enter Name"}
        </span>
        <Input
          value={name}
          onChange={(e) => onChange(e.target.value)}
          className={`border-none p-0 h-auto text-base font-medium focus-visible:ring-0 ${inputHoverClass} ${
            isHighlighted ? 'bg-gray-50' : ''
          }`}
          placeholder="Enter Name"
          onClick={(e) => e.stopPropagation()} // Prevent selection toggle when editing
          style={{ width: `${nameWidth}px` }}
        />
      </div>
    </div>
  );
};

export default RecipientName;
