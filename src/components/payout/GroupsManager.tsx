
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Group } from "@/types/recipient";
import { useDroppable } from "@dnd-kit/core";

interface GroupsManagerProps {
  groups: Group[];
  onAddGroup: () => void;
  onRemoveGroup: (id: string) => void;
  onUpdateGroup: (id: string, updates: Partial<Group>) => void;
  onToggleExpanded: (id: string) => void;
  onAddRecipients: (groupId: string) => void;
}

const GroupsManager: React.FC<GroupsManagerProps> = ({
  groups,
  onAddGroup,
  onRemoveGroup,
  onUpdateGroup,
  onToggleExpanded,
  onAddRecipients
}) => {
  const { setNodeRef: setUngroupedRef } = useDroppable({
    id: 'ungrouped'
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Groups</h3>
        <Button 
          onClick={onAddGroup}
          variant="outline" 
          size="sm" 
          className="flex items-center text-xs"
        >
          <Plus className="mr-1 h-3 w-3" /> Add Group
        </Button>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-sm text-gray-500 italic px-2 py-1">
          No groups created yet
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <GroupItem 
              key={group.id}
              group={group}
              onRemove={() => onRemoveGroup(group.id)}
              onUpdate={(updates) => onUpdateGroup(group.id, updates)}
              onToggleExpanded={() => onToggleExpanded(group.id)} 
              onAddRecipients={() => onAddRecipients(group.id)}
            />
          ))}
        </div>
      )}
      
      <div 
        ref={setUngroupedRef}
        className="mt-4 p-2 border-2 border-dashed border-gray-300 rounded-md text-xs text-gray-500 text-center"
      >
        Drop here to ungroup
      </div>
    </div>
  );
};

interface GroupItemProps {
  group: Group;
  onRemove: () => void;
  onUpdate: (updates: Partial<Group>) => void;
  onToggleExpanded: () => void;
  onAddRecipients: () => void;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  onRemove,
  onUpdate,
  onToggleExpanded,
  onAddRecipients
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  
  const { setNodeRef } = useDroppable({
    id: `group-${group.id}`
  });
  
  const handleSave = () => {
    onUpdate({ name });
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(group.name);
      setIsEditing(false);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`border rounded-md overflow-hidden ${
        group.expanded ? 'border-gray-300' : 'border-gray-200'
      }`}
    >
      <div 
        className="p-2 flex items-center justify-between bg-gray-50 cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          {group.expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="h-6 text-xs py-0 px-1"
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium">{group.name}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit2 className="h-3 w-3 text-gray-500" />
          </Button>
          
          <Button
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {group.expanded && (
        <div className="p-2 text-xs bg-gray-50/50 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs h-6 justify-start"
            onClick={onAddRecipients}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Recipients
          </Button>
        </div>
      )}
    </div>
  );
};

export default GroupsManager;
