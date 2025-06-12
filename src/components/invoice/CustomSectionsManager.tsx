
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { Stack } from "@/components/ui/primitives/Spacing";
import CustomSection from "./CustomSection";

interface CustomSectionData {
  id: string;
  name: string;
  content: string;
}

interface CustomSectionsManagerProps {
  sections: CustomSectionData[];
  onSectionsChange: (sections: CustomSectionData[]) => void;
}

const CustomSectionsManager: React.FC<CustomSectionsManagerProps> = ({
  sections,
  onSectionsChange,
}) => {
  const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddSection = () => {
    const newSection: CustomSectionData = {
      id: generateId(),
      name: "New Section",
      content: ""
    };
    onSectionsChange([...sections, newSection]);
  };

  const handleUpdateSection = (id: string, updates: Partial<CustomSectionData>) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, ...updates } : section
    );
    onSectionsChange(updatedSections);
  };

  const handleDeleteSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id);
    onSectionsChange(updatedSections);
  };

  return (
    <Stack>
      {sections.map((section) => (
        <CustomSection
          key={section.id}
          section={section}
          onUpdate={handleUpdateSection}
          onDelete={handleDeleteSection}
        />
      ))}
      
      <PremiumButton
        variant="outline"
        onClick={handleAddSection}
        className="w-full border-dashed h-12"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Section
      </PremiumButton>
    </Stack>
  );
};

export default CustomSectionsManager;
