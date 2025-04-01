
import React, { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface RecipientNameProps {
  name: string;
  onUpdate: (name: string) => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: () => void;
  onMouseMove: () => void;
}

const RecipientName: React.FC<RecipientNameProps> = ({
  name,
  onUpdate,
  onClick,
  onMouseDown,
  onMouseMove,
}) => {
  const [nameWidth, setNameWidth] = useState(150);
  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (nameRef.current) {
      const newWidth = Math.max(150, nameRef.current.scrollWidth + 20);
      setNameWidth(newWidth);
    }
  }, [name]);

  return (
    <div className="relative inline-block">
      <span 
        ref={nameRef} 
        className="invisible absolute whitespace-nowrap"
      >
        {name || "Enter Name"}
      </span>
      <Input
        value={name}
        onChange={(e) => onUpdate(e.target.value)}
        className="border-none p-0 h-auto text-base font-medium focus-visible:ring-0 hover:outline hover:outline-2 hover:outline-black"
        placeholder="Enter Name"
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        style={{ width: `${nameWidth}px` }}
      />
    </div>
  );
};

export default RecipientName;
