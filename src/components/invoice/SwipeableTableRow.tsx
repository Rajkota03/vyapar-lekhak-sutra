
import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'destructive' | 'default';
}

interface SwipeableTableRowProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  onRowClick?: () => void;
  className?: string;
}

export const SwipeableTableRow: React.FC<SwipeableTableRowProps> = ({
  children,
  actions,
  onRowClick,
  className = ''
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  
  const SWIPE_THRESHOLD = 80;
  const ACTION_WIDTH = 80;
  const MAX_SWIPE = actions.length * ACTION_WIDTH;

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left') {
        const offset = Math.min(Math.abs(eventData.deltaX), MAX_SWIPE);
        setSwipeOffset(offset);
      }
    },
    onSwipedLeft: (eventData) => {
      if (Math.abs(eventData.deltaX) > SWIPE_THRESHOLD) {
        setIsSwipeOpen(true);
        setSwipeOffset(MAX_SWIPE);
      } else {
        setIsSwipeOpen(false);
        setSwipeOffset(0);
      }
    },
    onSwipedRight: () => {
      setIsSwipeOpen(false);
      setSwipeOffset(0);
    },
    onTap: () => {
      if (isSwipeOpen) {
        setIsSwipeOpen(false);
        setSwipeOffset(0);
      } else if (onRowClick) {
        onRowClick();
      }
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 10
  });

  const handleActionClick = (action: SwipeAction, event: React.MouseEvent) => {
    event.stopPropagation();
    action.onClick();
    setIsSwipeOpen(false);
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden" ref={rowRef}>
      {/* Action buttons - positioned behind the row */}
      {swipeOffset > 0 && (
        <div 
          className="absolute right-0 top-0 bottom-0 flex items-center bg-gray-100"
          style={{ width: MAX_SWIPE }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
              size="sm"
              className="h-full rounded-none border-l border-gray-200 flex flex-col items-center justify-center gap-1 px-3"
              style={{ width: ACTION_WIDTH }}
              onClick={(e) => handleActionClick(action, e)}
            >
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      )}
      
      {/* Main row content */}
      <div
        {...handlers}
        className={`relative transition-transform duration-200 ease-out ${className}`}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          cursor: isSwipeOpen ? 'default' : 'pointer'
        }}
      >
        {children}
      </div>
    </div>
  );
};
