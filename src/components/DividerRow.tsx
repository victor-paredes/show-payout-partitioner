
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Edit } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Separator } from "@/components/ui/separator";

interface DividerRowProps {
  id: string;
  text: string;
  onEdit: () => void;
  onRemove: () => void;
  isHighlighted?: boolean;
}

const DividerRow: React.FC<DividerRowProps> = ({
  id,
  text,
  onEdit,
  onRemove,
  isHighlighted,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

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
      className={`flex items-center justify-between bg-white rounded-md shadow-sm p-4 my-2 border ${
        isHighlighted ? "border-black" : "border-gray-200"
      }`}
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
      
      <div className="flex-1 flex items-center px-4">
        <Separator className="mr-3 flex-grow" />
        <span className="text-sm font-medium text-gray-500 px-2 whitespace-nowrap">
          {text}
        </span>
        <Separator className="ml-3 flex-grow" />
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="text-gray-400 hover:text-blue-500"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DividerRow;
