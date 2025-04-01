
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (groupName: string) => void;
}

const GroupModal: React.FC<GroupModalProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [groupName, setGroupName] = useState<string>("");
  
  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(groupName.trim());
      setGroupName("");
      onOpenChange(false);
    }
  };
  
  const handleCancel = () => {
    setGroupName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Recipient Group</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Enter a name for this group of recipients.
          </p>
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          />
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!groupName.trim()}
          >
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupModal;
