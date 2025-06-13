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
  const triggerDistance = maxSwipeDistance / 2;

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDisabled) return;
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isDisabled) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipeDistance));
    }
  };

  const handleMouseUp = () => {
    if (isDisabled) return;
    setIsDragging(false);
    
    if (swipeOffset > triggerDistance) {
      setSwipeOffset(maxSwipeDistance);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleActionClick = (action: () => void) => {
    action();
    setSwipeOffset(0); // Close swipe after action
  };

  useEffect(() => {
    if (isDragging && !isDisabled) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, isDisabled]);

  // Close swipe when disabled
  useEffect(() => {
    if (isDisabled) {
      setSwipeOffset(0);
    }
  }, [isDisabled]);

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons background */}
      <div 
        className={cn(
          "absolute inset-y-0 right-0 flex items-center transition-all duration-200",
          swipeOffset > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: `${swipeOffset}px` }}
      >
        {/* Convert button (if enabled) */}
        {showConvert && onConvert && (
          <div 
            className="h-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
            style={{ width: '80px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick(onConvert);
            }}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Delete button */}
        {onDelete && (
          <div 
            className="h-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
            style={{ width: '80px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick(onDelete);
            }}
          >
            <Trash2 className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      
      {/* Swipeable content */}
      <div
        ref={rowRef}
        className={cn("transition-transform duration-200", className)}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableRow;
