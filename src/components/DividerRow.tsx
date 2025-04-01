
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Divider {
  id: string;
  type: 'divider';
  text: string;
}

interface DividerRowProps {
  divider: Divider;
  onRemove: () => void;
}

const DividerRow: React.FC<DividerRowProps> = ({ divider, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: divider.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white rounded-md shadow-sm p-4 gap-4 my-1"
    >
      <Button
        variant="ghost"
        size="icon"
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>

      <div className="flex-grow">
        <span className="text-sm text-gray-600 font-medium">{divider.text}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DividerRow;
