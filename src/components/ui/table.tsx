'use client';

import { cn } from '@/lib/utils';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Table Container
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-secondary-200">{children}</table>
    </div>
  );
}

// Table Header
interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead className="bg-secondary-50">{children}</thead>;
}

// Table Body
interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-secondary-200 bg-white">{children}</tbody>;
}

// Table Row
interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        onClick && 'cursor-pointer hover:bg-secondary-50 transition-colors',
        className
      )}
    >
      {children}
    </tr>
  );
}

// Table Head Cell
interface TableHeadProps {
  children?: React.ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function TableHead({
  children,
  sortable = false,
  sortDirection,
  onSort,
  className,
  align = 'start',
}: TableHeadProps) {
  const alignClasses = {
    start: 'text-start',
    center: 'text-center',
    end: 'text-end',
  };

  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-sm font-semibold text-secondary-700',
        alignClasses[align],
        sortable && 'cursor-pointer select-none hover:bg-secondary-100 transition-colors',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="flex flex-col">
            <ChevronUpIcon
              className={cn(
                'h-3 w-3 -mb-1',
                sortDirection === 'asc' ? 'text-primary-600' : 'text-secondary-300'
              )}
            />
            <ChevronDownIcon
              className={cn(
                'h-3 w-3',
                sortDirection === 'desc' ? 'text-primary-600' : 'text-secondary-300'
              )}
            />
          </span>
        )}
      </div>
    </th>
  );
}

// Table Cell
interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function TableCell({ children, className, align = 'start' }: TableCellProps) {
  const alignClasses = {
    start: 'text-start',
    center: 'text-center',
    end: 'text-end',
  };

  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-secondary-700 whitespace-nowrap',
        alignClasses[align],
        className
      )}
    >
      {children}
    </td>
  );
}

// Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200">
      <div className="text-sm text-secondary-600">
        {totalItems && (
          <span>
            عرض {startItem} إلى {endItem} من {totalItems} نتيجة
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            currentPage === 1
              ? 'text-secondary-300 cursor-not-allowed'
              : 'text-secondary-600 hover:bg-secondary-100'
          )}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded-lg text-sm text-secondary-600 hover:bg-secondary-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-secondary-400">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm transition-colors',
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-secondary-600 hover:bg-secondary-100'
            )}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-secondary-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded-lg text-sm text-secondary-600 hover:bg-secondary-100"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            currentPage === totalPages
              ? 'text-secondary-300 cursor-not-allowed'
              : 'text-secondary-600 hover:bg-secondary-100'
          )}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
