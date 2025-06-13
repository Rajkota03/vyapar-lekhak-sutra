
import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onConvert?: () => void;
  showConvert?: boolean;
  className?: string;
  isDisabled?: boolean;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({ 
  children, 
  onDelete, 
  onConvert,
  showConvert = false,
  className,
  isDisabled = false
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate max swipe distance based on available actions
  const maxSwipeDistance = showConvert ? 160 : 80; // 80px per action

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isDisabled) {
        setIsOpen(true);
        setSwipeOffset(maxSwipeDistance);
      }
    },
    onSwipedRight: () => {
      if (!isDisabled && isOpen) {
        setIsOpen(false);
        setSwipeOffset(0);
      }
    },
    onSwiping: (eventData) => {
      if (isDisabled) return;
      
      const { deltaX } = eventData;
      
      if (deltaX < 0) {
        // Swiping left - open actions
        const offset = Math.min(Math.abs(deltaX), maxSwipeDistance);
        setSwipeOffset(offset);
      } else if (deltaX > 0 && isOpen) {
        // Swiping right when open - close actions
        const offset = Math.max(0, maxSwipeDistance - deltaX);
        setSwipeOffset(offset);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 10,
  });

  const handleActionClick = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
    setIsOpen(false);
    setSwipeOffset(0);
  };

  // Close swipe when disabled
  useEffect(() => {
    if (isDisabled) {
      setIsOpen(false);
      setSwipeOffset(0);
    }
  }, [isDisabled]);

  // Close swipe when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('[data-swipeable-row]')) {
        setIsOpen(false);
        setSwipeOffset(0);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Action buttons positioned behind the table */}
      <div 
        className="fixed inset-y-0 right-0 flex items-stretch pointer-events-none z-0"
        style={{ 
          width: `${maxSwipeDistance}px`,
          display: swipeOffset > 0 ? 'flex' : 'none'
        }}
      >
        {/* Convert button (if enabled) */}
        {showConvert && onConvert && (
          <div 
            className="h-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors flex-1 pointer-events-auto"
            onClick={(e) => handleActionClick(onConvert, e)}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Delete button */}
        {onDelete && (
          <div 
            className="h-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors flex-1 pointer-events-auto"
            onClick={(e) => handleActionClick(onDelete, e)}
          >
            <Trash2 className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Table row content */}
      <div
        className={cn(
          "relative transition-transform duration-200 ease-out",
          className
        )}
        style={{ 
          transform: `translateX(-${swipeOffset}px)`,
        }}
        data-swipeable-row
        {...handlers}
      >
        {children}
      </div>
    </>
  );
};

export default SwipeableRow;
