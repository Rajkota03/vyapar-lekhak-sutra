import React, { useRef, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({ children, onDelete, className }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 80)); // Max swipe distance of 80px
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeOffset > 40) {
      // If swiped more than halfway, trigger delete
      onDelete();
    } else {
      // Otherwise, snap back
      setSwipeOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 80));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (swipeOffset > 40) {
      onDelete();
    } else {
      setSwipeOffset(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX]);

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <div 
        className={cn(
          "absolute inset-y-0 right-0 bg-red-500 flex items-center justify-center transition-all duration-200",
          swipeOffset > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: `${swipeOffset}px` }}
      >
        <Trash2 className="h-5 w-5 text-white" />
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
