
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmGroupDissolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  groupName: string;
}

const ConfirmGroupDissolutionModal: React.FC<ConfirmGroupDissolutionModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  groupName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dissolve Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to dissolve the "{groupName}" group? This will ungroup all recipients, but won't delete them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
          >
            Dissolve Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmGroupDissolutionModal;
