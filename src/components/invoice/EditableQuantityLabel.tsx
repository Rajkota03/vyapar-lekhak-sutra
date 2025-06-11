
import React, { useState, useRef, useEffect } from "react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { CaptionText } from "@/components/ui/primitives/Typography";

interface EditableQuantityLabelProps {
  companyId?: string;
}

const EditableQuantityLabel: React.FC<EditableQuantityLabelProps> = ({ companyId }) => {
  const { quantityLabel, updateSettings, isUpdating } = useCompanySettings(companyId);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(quantityLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(quantityLabel);
  }, [quantityLabel]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== quantityLabel) {
      updateSettings({ quantity_column_label: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(quantityLabel);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="w-full text-center bg-transparent border-none outline-none text-xs font-medium uppercase tracking-wide focus:bg-blue-50 focus:rounded px-1"
        maxLength={10}
        disabled={isUpdating}
      />
    );
  }

  return (
    <div 
      className="font-medium uppercase tracking-wide cursor-pointer hover:bg-blue-50 rounded px-1 py-1 transition-colors text-xs text-blue-600 border border-dashed border-blue-300 hover:border-blue-400"
      onClick={handleClick}
    >
      {quantityLabel}
    </div>
  );
};

export default EditableQuantityLabel;
