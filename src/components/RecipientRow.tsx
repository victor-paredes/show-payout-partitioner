
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Import smaller components
import DragHandle from "./recipient/DragHandle";
import RecipientName from "./recipient/RecipientName";
import RecipientSwitch from "./recipient/RecipientSwitch";
import RecipientValue from "./recipient/RecipientValue";
import PayoutDisplay from "./recipient/PayoutDisplay";
import DeleteButton from "./recipient/DeleteButton";

interface Recipient {
  id: string;
  name: string;
  isFixedAmount: boolean;
  value: number;
  payout: number;
}

interface RecipientRowProps {
  recipient: Recipient;
  onUpdate: (updates: Partial<Recipient>) => void;
  onRemove: () => void;
  valuePerShare: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  isHighlighted: boolean;
  onHover: (isHovered: boolean) => void;
}

const RecipientRow: React.FC<RecipientRowProps> = ({
  recipient,
  onUpdate,
  onRemove,
  valuePerShare,
  isSelected,
  onToggleSelect,
  isHighlighted,
  onHover
}) => {
  const [isInputHover, setIsInputHover] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: recipient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{
        ...style,
        borderWidth: isHighlighted ? '2px' : '1px',
        borderColor: isHighlighted ? 'black' : isSelected ? '#90cdf4' : '#e2e8f0', 
        backgroundColor: isHighlighted ? 'rgb(249 250 251)' : isSelected ? 'rgb(239 246 255)' : 'white',
        boxSizing: 'border-box'
      }}
      className={`flex items-center rounded-md shadow-sm p-4 gap-4 cursor-pointer transition-all ${
        !isInputHover ? "border" : ""
      }`}
      onClick={onToggleSelect}
      onMouseEnter={() => {
        setIsInputHover(false);
        onHover(true);
      }}
      onMouseLeave={() => {
        setIsInputHover(false);
        onHover(false);
      }}
    >
      {/* Drag Handle */}
      <DragHandle attributes={attributes} listeners={listeners} />
      
      {/* Name Input */}
      <div onMouseEnter={() => setIsInputHover(true)} onMouseLeave={() => setIsInputHover(false)}>
        <RecipientName 
          name={recipient.name} 
          onChange={(name) => onUpdate({ name })} 
          isHighlighted={isHighlighted} 
        />
      </div>

      {/* Fixed/Shares Switch */}
      <div onMouseEnter={() => setIsInputHover(true)} onMouseLeave={() => setIsInputHover(false)}>
        <RecipientSwitch 
          id={recipient.id} 
          isFixedAmount={recipient.isFixedAmount} 
          onChange={(isFixedAmount) => onUpdate({ isFixedAmount })} 
        />
      </div>

      {/* Value Input */}
      <div onMouseEnter={() => setIsInputHover(true)} onMouseLeave={() => setIsInputHover(false)}>
        <RecipientValue 
          isFixedAmount={recipient.isFixedAmount} 
          value={recipient.value} 
          onChange={(value) => onUpdate({ value })} 
          isHighlighted={isHighlighted}
        />
      </div>

      {/* Payout Display */}
      <PayoutDisplay payout={recipient.payout} />

      {/* Delete Button */}
      <div onMouseEnter={() => setIsInputHover(true)} onMouseLeave={() => setIsInputHover(false)}>
        <DeleteButton onRemove={onRemove} />
      </div>
    </div>
  );
};

export default RecipientRow;
