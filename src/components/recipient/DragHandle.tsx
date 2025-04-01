
import React from "react";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";

interface DragHandleProps {
  attributes: any;
  listeners: any;
}

const DragHandle: React.FC<DragHandleProps> = ({ attributes, listeners }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-grab text-gray-400 hover:text-gray-600"
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()} // Prevent selection toggle when dragging
    >
      <GripVertical className="h-4 w-4" />
    </Button>
  );
};

export default DragHandle;
