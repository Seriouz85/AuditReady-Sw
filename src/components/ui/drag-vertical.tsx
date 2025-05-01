import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragVerticalProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const DragVertical = React.forwardRef<HTMLDivElement, DragVerticalProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        <GripVertical className={className} />
      </div>
    );
  }
);

DragVertical.displayName = 'DragVertical'; 