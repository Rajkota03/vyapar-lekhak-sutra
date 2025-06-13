import React, { useRef, useState, useEffect } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  // Calculate max swipe distance based on available actions
  const maxSwipeDistance = showConvert ? 160 : 80; // 80px per action
  const triggerDistance = maxSwipeDistance / 3; // Lower threshold for easier trigger

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDisabled) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isDisabled) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipeDistance));
    } else if (diff < 0 && swipeOffset > 0) {
      // Allow right swipe to close
      setSwipeOffset(Math.max(0, swipeOffset + diff));
    }
  };

  const handleTouchEnd = () => {
    if (isDisabled) return;
    setIsDragging(false);
    
    if (swipeOffset > triggerDistance) {
      // Keep swiped state - user can tap actions
      setSwipeOffset(maxSwipeDistance);
    } else {
      // Snap back
      setSwipeOffset(0);
    }
  };

  const handleActionClick = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
    setSwipeOffset(0); // Close swipe after action
  };

  // Close swipe when disabled
  useEffect(() => {
    if (isDisabled) {
      setSwipeOffset(0);
    }
  }, [isDisabled]);

  // Close swipe when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(event.target as Node) && swipeOffset > 0) {
        setSwipeOffset(0);
      }
    };

    if (swipeOffset > 0) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [swipeOffset]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Swipeable content */}
      <div
        ref={rowRef}
        className={cn(
          "transition-transform duration-200 ease-out relative z-10 bg-white w-full",
          className
        )}
        style={{ 
          transform: `translateX(-${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      
      {/* Action buttons - positioned absolutely behind the content */}
      {swipeOffset > 0 && (
        <div 
          className="absolute inset-y-0 right-0 flex items-stretch z-0"
          style={{ width: `${maxSwipeDistance}px` }}
        >
          {/* Convert button (if enabled) */}
          {showConvert && onConvert && (
            <div 
              className="h-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors flex-1"
              onClick={(e) => handleActionClick(onConvert, e)}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
          )}
          
          {/* Delete button */}
          {onDelete && (
            <div 
              className="h-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors flex-1"
              onClick={(e) => handleActionClick(onDelete, e)}
            >
              <Trash2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeableRow;
