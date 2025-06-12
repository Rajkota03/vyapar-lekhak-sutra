
import React, { useState } from "react";
import { X, Edit2, Plus } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading3 } from "@/components/ui/primitives/Typography";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CustomSectionData {
  id: string;
  name: string;
  content: string;
}

interface CustomSectionProps {
  section: CustomSectionData;
  onUpdate: (id: string, updates: Partial<CustomSectionData>) => void;
  onDelete: (id: string) => void;
}

const CustomSection: React.FC<CustomSectionProps> = ({
  section,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [editContent, setEditContent] = useState(section.content);

  const handleSave = () => {
    onUpdate(section.id, {
      name: editName.trim() || "Untitled Section",
      content: editContent
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(section.name);
    setEditContent(section.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ModernCard variant="outlined" padding="md">
        <div className="space-y-3">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Section name"
            className="font-medium"
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Add section content..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex gap-2 justify-end">
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              Save
            </PremiumButton>
          </div>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="outlined" padding="md">
      <div className="flex items-start justify-between mb-3">
        <Heading3 className="text-base">{section.name}</Heading3>
        <div className="flex gap-1">
          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0 text-muted-foreground"
          >
            <Edit2 className="h-3 w-3" />
          </PremiumButton>
          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(section.id)}
            className="h-6 w-6 p-0 text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </PremiumButton>
        </div>
      </div>
      {section.content && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {section.content}
        </div>
      )}
    </ModernCard>
  );
};

export default CustomSection;
