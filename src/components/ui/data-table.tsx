'use client';

import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table';
import { EmptyState } from './empty-state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  emptyDescription = 'لم يتم العثور على نتائج',
  className,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey] ?? index);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCellValue = (row: T, key: string): any => {
    return row[key];
  };

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        icon="document"
      />
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              align={column.align}
              className={column.className}
            >
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={getRowKey(row, rowIndex)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(onRowClick && 'cursor-pointer')}
          >
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align}
                className={column.className}
              >
                {column.render
                  ? column.render(getCellValue(row, column.key), row, rowIndex)
                  : String(getCellValue(row, column.key) ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
