
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onRemove: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onRemove }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="text-gray-400 hover:text-red-500"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteButton;
