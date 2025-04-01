
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/colorUtils";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("palette");

  // Additional colors beyond the standard palette
  const extendedColors = [
    // Neutrals
    "#8E9196", "#403E43", "#221F26", "#333333", "#555555", "#888888",
    // Purples
    "#9b87f5", "#7E69AB", "#6E59A5", "#8B5CF6", "#D6BCFA", "#E5DEFF",
    // Blues
    "#3B82F6", "#0EA5E9", "#1EAEDB", "#33C3F0", "#0FA0CE", "#D3E4FD",
    // Greens
    "#10B981", "#16A34A", "#15803D", "#065F46", "#166534", "#F2FCE2",
    // Reds/Pinks
    "#EF4444", "#ea384c", "#BE123C", "#9D174D", "#D946EF", "#FFDEE2",
    // Oranges/Yellows
    "#F97316", "#F59E0B", "#CA8A04", "#C2410C", "#A16207", "#FEC6A1", "#FEF7CD",
  ];

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
          <div className="mb-4">
            <div className="h-12 rounded-md border" style={{ backgroundColor: selectedColor }}></div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="palette">Color Palette</TabsTrigger>
              <TabsTrigger value="picker">Custom Color</TabsTrigger>
            </TabsList>
            
            <TabsContent value="palette" className="mt-4">
              <div className="grid grid-cols-8 gap-2">
                {COLORS.slice(0, 32).map((color, index) => (
                  <button
                    key={`color-${index}`}
                    className={`w-8 h-8 rounded-md transition-all ${
                      selectedColor === color 
                        ? 'ring-2 ring-black scale-110' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    type="button"
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Additional colors</h3>
                <div className="grid grid-cols-8 gap-2">
                  {extendedColors.map((color, index) => (
                    <button
                      key={`extended-${index}`}
                      className={`w-8 h-8 rounded-md transition-all ${
                        selectedColor === color 
                          ? 'ring-2 ring-black scale-110' 
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      type="button"
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="picker" className="mt-4">
              <div className="flex flex-col items-center">
                <HexColorPicker 
                  color={selectedColor} 
                  onChange={setSelectedColor} 
                  className="w-full max-w-[240px]"
                />
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-sm font-medium">Hex:</div>
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="px-2 py-1 border rounded w-28 text-sm font-mono"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
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
