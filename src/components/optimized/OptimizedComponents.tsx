import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Memoized Card component for heavy lists
export const MemoizedCard = memo(Card);
export const MemoizedCardHeader = memo(CardHeader);
export const MemoizedCardTitle = memo(CardTitle);
export const MemoizedCardDescription = memo(CardDescription);
export const MemoizedCardContent = memo(CardContent);

// Memoized Button component
export const MemoizedButton = memo(Button);

// Memoized Badge component
export const MemoizedBadge = memo(Badge);

// Memoized list item component
interface OptimizedListItemProps {
  id: string;
  title: string;
  description?: string;
  status?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const OptimizedListItem = memo<OptimizedListItemProps>(({ 
  id, 
  title, 
  description, 
  status, 
  onClick, 
  className = "",
  children 
}) => {
  return (
    <MemoizedCard 
      key={id}
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <MemoizedCardHeader>
        <div className="flex items-center justify-between">
          <MemoizedCardTitle className="text-lg">{title}</MemoizedCardTitle>
          {status && <MemoizedBadge variant="outline">{status}</MemoizedBadge>}
        </div>
        {description && (
          <MemoizedCardDescription>{description}</MemoizedCardDescription>
        )}
      </MemoizedCardHeader>
      {children && <MemoizedCardContent>{children}</MemoizedCardContent>}
    </MemoizedCard>
  );
});

OptimizedListItem.displayName = 'OptimizedListItem';

// Memoized table component for large datasets
interface OptimizedTableProps {
  data: any[];
  columns: Array<{
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  onRowClick?: (row: any) => void;
  className?: string;
}

export const OptimizedTable = memo<OptimizedTableProps>(({ 
  data, 
  columns, 
  onRowClick, 
  className = "" 
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

OptimizedTable.displayName = 'OptimizedTable';