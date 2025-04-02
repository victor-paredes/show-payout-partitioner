
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, ArrowRight, ArrowDown, Users, Menu } from "lucide-react";
import { Group, Recipient } from "@/hooks/useRecipientsManager";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GroupContainer from './GroupContainer';
import UngroupedContainer from './UngroupedContainer';
import { useIsMobile } from "@/hooks/use-mobile";

interface RecipientsListProps {
  recipients: Recipient[];
  groups: Group[];
  recipientCount: string;
  setRecipientCount: (count: string) => void;
  selectedRecipients: Set<string>;
  valuePerShare: number;
  hoveredRecipientId?: string;
  draggedRecipientId: string | null;
  addRecipients: (groupId?: string) => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  toggleSelectRecipient: (id: string) => void;
  setSelectedRecipients: (selected: Set<string>) => void;
  clearRecipients?: () => void;
  addGroup: () => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  moveRecipientToGroup: (recipientId: string, targetGroupId: string | null) => void;
  handleDragStart: (recipientId: string) => void;
  handleDragEnd: () => void;
  groupedRecipients: {
    ungroupedRecipients: Recipient[];
    recipientsByGroup: { group: Group; recipients: Recipient[] }[];
  };
}

const RecipientsList: React.FC<RecipientsListProps> = ({
  recipients,
  groups,
  recipientCount,
  setRecipientCount,
  selectedRecipients,
  valuePerShare,
  hoveredRecipientId,
  draggedRecipientId,
  addRecipients,
  updateRecipient,
  removeRecipient,
  toggleSelectRecipient,
  setSelectedRecipients,
  clearRecipients,
  addGroup,
  removeGroup,
  updateGroup,
  moveRecipientToGroup,
  handleDragStart,
  handleDragEnd,
  groupedRecipients
}) => {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [columnWiseTabbing, setColumnWiseTabbing] = useState(false);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const onRecipientDragStart = (recipientId: string, sourceId: string) => {
    handleDragStart(recipientId);
    setDragSourceId(sourceId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedRecipientId) return;
    
    const container = e.currentTarget;
    const groupId = container.getAttribute('data-group-id');
    
    if (groupId === 'ungrouped') {
      moveRecipientToGroup(draggedRecipientId, null);
    } else if (groupId) {
      moveRecipientToGroup(draggedRecipientId, groupId);
    }
    
    handleDragEnd();
    setDragSourceId(null);
  };

  const clearAllSelections = () => {
    setSelectedRecipients(new Set());
  };

  const handleClearClick = () => {
    setConfirmClearOpen(true);
  };

  const handleConfirmClear = () => {
    if (clearRecipients) {
      clearRecipients();
    }
    setConfirmClearOpen(false);
  };

  const toggleTabbingDirection = () => {
    setColumnWiseTabbing(prevState => !prevState);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (
        mobileMenuOpen && 
        menuRef.current && 
        !menuRef.current.contains(target) && 
        menuButtonRef.current && 
        !menuButtonRef.current.contains(target)
      ) {
        closeMobileMenu();
      }
      
      if (!target.closest('.recipients-list') && selectedRecipients.size > 0) {
        setSelectedRecipients(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedRecipients, setSelectedRecipients, mobileMenuOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedRecipients.size > 0) {
        setSelectedRecipients(new Set());
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedRecipients, setSelectedRecipients]);

  useEffect(() => {
    const handleDragEndEvent = () => {
      handleDragEnd();
      setDragSourceId(null);
    };

    document.addEventListener('dragend', handleDragEndEvent);
    return () => {
      document.removeEventListener('dragend', handleDragEndEvent);
    };
  }, [handleDragEnd]);

  const actualRecipientCount = recipients.length;
  const recipientsTitle = `${actualRecipientCount} ${actualRecipientCount === 1 ? 'Recipient' : 'Recipients'}`;

  return (
    <Card className="recipients-list">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{recipientsTitle}</span>
            {selectedRecipients.size > 1 && (
              <div className="text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded-md flex items-center gap-1">
                <span>Editing Multiple</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 hover:bg-blue-200" 
                  onClick={clearAllSelections}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {isMobile ? (
            <div className="flex items-center">
              <Button
                ref={menuButtonRef}
                onClick={toggleMobileMenu}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Menu className="h-4 w-4 mr-1" /> Menu
              </Button>
              
              {mobileMenuOpen && (
                <div 
                  ref={menuRef}
                  className="absolute right-4 mt-28 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3 space-y-2 w-56"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-2">
                    <span className="font-medium text-sm">Menu</span>
                    <Button 
                      onClick={closeMobileMenu} 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {recipients.length > 0 && (
                    <Button
                      onClick={() => {
                        toggleTabbingDirection();
                        closeMobileMenu();
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center w-full justify-between"
                    >
                      <span>Tab Direction</span>
                      {columnWiseTabbing ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  {recipients.length > 0 && (
                    <Button 
                      onClick={() => {
                        handleClearClick();
                        closeMobileMenu();
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center w-full justify-between"
                    >
                      <span>Clear All</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => {
                      addGroup();
                      closeMobileMenu();
                    }} 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center w-full justify-between"
                  >
                    <span>Add Group</span>
                    <Users className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Add:</span>
                    <div className="flex items-center gap-2">
                      <Select value={recipientCount} onValueChange={setRecipientCount}>
                        <SelectTrigger className="w-16">
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={() => {
                          addRecipients();
                          closeMobileMenu();
                        }} 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                      >
                        <Plus className="mr-1 h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {recipients.length > 0 && (
                <Button
                  onClick={toggleTabbingDirection}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  title={columnWiseTabbing ? "Switch to row-wise tabbing" : "Switch to column-wise tabbing"}
                >
                  <span className="mr-1">Tab</span>
                  {columnWiseTabbing ? <ArrowDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              )}
              {recipients.length > 0 && (
                <Button 
                  onClick={handleClearClick} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Clear
                </Button>
              )}
              
              <Button 
                onClick={addGroup} 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                title="Add Group"
              >
                <Users className="mr-1 h-4 w-4" /> Add Group
              </Button>
              
              <Select value={recipientCount} onValueChange={setRecipientCount}>
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => addRecipients()} 
                variant="outline" 
                size="sm" 
                className="flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Recipient{parseInt(recipientCount) > 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recipients.length === 0 && groups.length === 0 ? (
            <div className="text-center py-6 text-gray-500 italic">
              No recipients added. Click "Add Recipient" to get started.
            </div>
          ) : (
            <>
              {groupedRecipients.recipientsByGroup.map(({ group, recipients }) => (
                <GroupContainer
                  key={group.id}
                  group={group}
                  recipients={recipients}
                  selectedRecipients={selectedRecipients}
                  valuePerShare={valuePerShare}
                  hoveredRecipientId={hoveredRecipientId}
                  onRemoveGroup={removeGroup}
                  onAddRecipients={addRecipients}
                  onUpdateRecipient={updateRecipient}
                  onRemoveRecipient={removeRecipient}
                  onToggleSelectRecipient={toggleSelectRecipient}
                  onDragStart={onRecipientDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  draggedRecipientId={draggedRecipientId}
                  onUpdateGroup={updateGroup}
                  columnWiseTabbing={columnWiseTabbing}
                />
              ))}
              
              <UngroupedContainer
                recipients={groupedRecipients.ungroupedRecipients}
                selectedRecipients={selectedRecipients}
                valuePerShare={valuePerShare}
                hoveredRecipientId={hoveredRecipientId}
                onUpdateRecipient={updateRecipient}
                onRemoveRecipient={removeRecipient}
                onToggleSelectRecipient={toggleSelectRecipient}
                onDragStart={onRecipientDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggedRecipientId={draggedRecipientId}
                columnWiseTabbing={columnWiseTabbing}
              />
            </>
          )}
        </div>
      </CardContent>
      
      <ConfirmationModal
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear Recipients"
        description="Are you sure you want to clear all recipients? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Go Back"
        onConfirm={handleConfirmClear}
        variant="destructive"
      />
    </Card>
  );
};

export default RecipientsList;
