
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DividerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (text: string) => void;
}

const DividerModal: React.FC<DividerModalProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [text, setText] = useState("");

  const handleConfirm = () => {
    if (text.trim()) {
      onConfirm(text);
      setText("");
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && text.trim()) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Divider</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter divider text"
            className="w-full"
            autoFocus
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <DialogFooter className="flex justify-center sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setText("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!text.trim()}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DividerModal;
