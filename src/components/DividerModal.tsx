
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DividerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (text: string) => void;
  defaultText?: string;
}

const DividerModal: React.FC<DividerModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  defaultText = ""
}) => {
  const [text, setText] = useState(defaultText);

  const handleConfirm = () => {
    onConfirm(text);
    onOpenChange(false);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Text Divider</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="Enter divider text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <p className="text-sm text-muted-foreground mt-2">
            This text will appear as a divider between recipients.
          </p>
        </div>
        
        <DialogFooter className="flex justify-center sm:justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
          >
            Add Divider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DividerModal;
