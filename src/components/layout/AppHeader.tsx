import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { Heading2 } from "@/components/ui/primitives/Typography";
interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  backPath?: string;
  rightAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
}
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  backPath = "/",
  rightAction
}) => {
  const navigate = useNavigate();
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-[6px] mx-[-9px]">
        <div className="flex items-center gap-3">
          {showBack && <PremiumButton variant="ghost" size="sm" onClick={() => navigate(backPath)} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </PremiumButton>}
          <Heading2 className="text-lg">{title}</Heading2>
        </div>
        
        {rightAction && <PremiumButton variant="ghost" size="sm" onClick={rightAction.onClick} loading={rightAction.loading} disabled={rightAction.disabled} className="text-primary hover:text-primary/90">
            {rightAction.label}
          </PremiumButton>}
      </div>
    </header>;
};