
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";

interface ColorPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  open,
  onOpenChange,
  currentColor,
  onColorSelect,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);

  const handleSubmit = () => {
    onColorSelect(selectedColor);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a color</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex gap-4 w-full items-center justify-between">
            <div className="w-[50%] flex flex-col items-center">
              <HexColorPicker 
                color={selectedColor} 
                onChange={setSelectedColor} 
                className="w-full"
              />
              
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="text-sm font-medium">Hex:</div>
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="px-2 py-1 border rounded w-28 text-sm font-mono"
                />
              </div>
            </div>
            
            <div 
              className="w-[40%] aspect-square rounded-md border" 
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-center sm:justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Apply Color</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColorPickerModal;
