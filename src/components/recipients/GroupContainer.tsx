
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Recipient, Group } from "@/hooks/useRecipientsManager";
import RecipientItem from "./RecipientItem";
import { Input } from "@/components/ui/input";

interface GroupContainerProps {
  group: Group;
  recipients: Recipient[];
  selectedRecipients: Set<string>;
  valuePerShare: number;
  hoveredRecipientId?: string;
  draggedRecipientId: string | null;
  onRemoveGroup: (id: string) => void;
  onAddRecipients: (groupId: string) => void;
  onUpdateRecipient: (id: string, updates: Partial<Recipient>) => void;
  onRemoveRecipient: (id: string) => void;
  onToggleSelectRecipient: (id: string) => void;
  onDragStart: (recipientId: string, sourceId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onUpdateGroup: (id: string, updates: Partial<Group>) => void;
  columnWiseTabbing?: boolean;
  tabIndexOffset?: number; // Add offset for proper sequencing
  totalRecipients?: number; // Total recipients for column-wise tabbing
}

const GroupContainer: React.FC<GroupContainerProps> = ({
  group,
  recipients,
  selectedRecipients,
  valuePerShare,
  hoveredRecipientId,
  draggedRecipientId,
  onRemoveGroup,
  onAddRecipients,
  onUpdateRecipient,
  onRemoveRecipient,
  onToggleSelectRecipient,
  onDragStart,
  onDragOver,
  onDrop,
  onUpdateGroup,
  columnWiseTabbing = false,
  tabIndexOffset = 0,
  totalRecipients = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };
  
  const handleGroupNameBlur = () => {
    onUpdateGroup(group.id, { name: groupName });
    setIsEditingName(false);
  };
  
  const handleGroupNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGroupNameBlur();
    }
  };
  
  const isActiveDropTarget = 
    draggedRecipientId !== null && 
    draggedRecipientId !== group.id && 
    !recipients.some(r => r.id === draggedRecipientId);
  
  const dropTargetStyle = isActiveDropTarget 
    ? { background: `${group.color}15`, borderColor: `${group.color}50` }
    : {};
  
  // Calculate the base index for group header controls
  // For column-wise tabbing, group headers come first sequentially
  const groupToggleIndex = tabIndexOffset + 1;
  const groupNameIndex = tabIndexOffset + 2;
  const groupRemoveIndex = tabIndexOffset + 3;
  
  // For column-wise tabbing, recipient names start after all group headers
  // For row-wise tabbing, they start right after this group's header
  const recipientsStartIndex = columnWiseTabbing ? (tabIndexOffset + 4) : (tabIndexOffset + 4);
  
  // Calculate the "Add Recipients" button tab index based on tabbing mode
  let addRecipientsTabIndex: number;
  
  if (columnWiseTabbing && recipients.length > 0) {
    // In column-wise mode, the "Add Recipients" button should be after all form elements
    // across all groups and ungrouped sections
    addRecipientsTabIndex = recipientsStartIndex + (totalRecipients * 3);
  } else {
    // In row-wise mode, the "Add Recipients" button should be after all recipients in this group
    addRecipientsTabIndex = recipientsStartIndex + (recipients.length * 3);
  }
  
  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5 p-0 mr-1"
            onClick={toggleExpanded}
            tabIndex={groupToggleIndex}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
          
          {isEditingName ? (
            <Input
              value={groupName}
              onChange={handleGroupNameChange}
              onBlur={handleGroupNameBlur}
              onKeyDown={handleGroupNameKeyDown}
              className="h-6 px-1 py-0 text-sm font-medium w-40"
              autoFocus
              tabIndex={groupNameIndex}
            />
          ) : (
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setIsEditingName(true)}
              tabIndex={groupNameIndex}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsEditingName(true);
                }
              }}
            >
              <div 
                className="h-2 w-2 rounded-full mr-2"
                style={{ backgroundColor: group.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{group.name}</span>
              <span className="text-xs ml-2 text-gray-500">
                ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:text-red-500"
          onClick={() => onRemoveGroup(group.id)}
          tabIndex={groupRemoveIndex}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      
      {isExpanded && (
        <div 
          className="space-y-2 p-2 rounded-md border-2 border-dashed"
          style={{ 
            borderColor: group.color + '40',
            ...dropTargetStyle,
            minHeight: recipients.length > 0 ? 'auto' : '72px',
            transition: "all 0.15s ease-in-out"
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          data-group-id={group.id}
        >
          {recipients.length > 0 ? (
            recipients.map((recipient, index) => (
              <RecipientItem
                key={recipient.id}
                recipient={recipient}
                onUpdate={(updates) => onUpdateRecipient(recipient.id, updates)}
                onRemove={() => onRemoveRecipient(recipient.id)}
                valuePerShare={valuePerShare}
                isSelected={selectedRecipients.has(recipient.id)}
                onToggleSelect={() => onToggleSelectRecipient(recipient.id)}
                isHighlighted={hoveredRecipientId === recipient.id}
                onDragStart={(id) => onDragStart(id, group.id)}
                isDragging={draggedRecipientId === recipient.id}
                columnWiseTabbing={columnWiseTabbing}
                rowIndex={index}
                totalRows={columnWiseTabbing ? totalRecipients : recipients.length}
                tabIndexOffset={recipientsStartIndex}
                sectionIndex={index}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-[72px] rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm">
              Drop a recipient here
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs h-6 justify-start"
            onClick={() => onAddRecipients(group.id)}
            tabIndex={addRecipientsTabIndex}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Recipients
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupContainer;
