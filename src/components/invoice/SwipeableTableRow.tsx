
import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
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
  
  const SWIPE_THRESHOLD = 60;
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
    <div className="relative w-full overflow-hidden" ref={rowRef}>
      {/* Main row content - fills container width and slides left to reveal actions */}
      <div
        {...handlers}
        className={`relative w-full bg-white transition-transform duration-200 ease-out ${className}`}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          cursor: isSwipeOpen ? 'default' : 'pointer'
        }}
      >
        {children}
      </div>
      
      {/* Action buttons - absolutely positioned overlay */}
      {swipeOffset > 0 && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center bg-gray-50 pointer-events-auto"
          style={{ 
            width: MAX_SWIPE,
            transform: `translateX(${MAX_SWIPE - swipeOffset}px)`,
            zIndex: 5
          }}
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
    </div>
  );
};
