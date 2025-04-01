
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GroupNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (groupName: string) => void;
  title?: string;
  description?: string;
}

const GroupNameModal: React.FC<GroupNameModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Create Group",
  description = "Enter a name for the group of selected recipients."
}) => {
  const [groupName, setGroupName] = useState("New Group");

  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(groupName.trim());
      setGroupName("New Group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-name" className="text-right">
              Group Name
            </Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupNameModal;
