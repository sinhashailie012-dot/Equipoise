import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonTable } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Button } from './Button';

export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  sortColumn,
  sortDirection = 'asc', // 'asc' | 'desc'
  onSort,
  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'No records found.',
  className = '',
}) {
  if (isLoading) {
    return <SkeletonTable rows={pageSize > 8 ? 8 : pageSize} cols={columns.length} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  const total = totalItems !== undefined ? totalItems : data.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIdx = (page - 1) * pageSize;
  const currentData = totalItems !== undefined ? data : data.slice(startIdx, startIdx + pageSize);

  return (
    <div className={`bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] overflow-hidden shadow-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#1E2A26] border-collapse">
          <thead>
            <tr className="border-b border-[#DDD4C4] bg-[#F7F3EB]/60">
              {columns.map((col) => {
                const isSortable = col.sortable && onSort;
                const isSorted = sortColumn === col.id || sortColumn === col.accessor;
                return (
                  <th
                    key={col.id || col.accessor}
                    scope="col"
                    onClick={() => isSortable && onSort(col.id || col.accessor)}
                    className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase text-[#6B6A60] select-none ${
                      isSortable ? 'cursor-pointer hover:text-[#1E2A26]' : ''
                    } ${col.headerClassName || ''}`}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-[#8D8C82]">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#1E2A26]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#1E2A26]" />
                            )
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD4C4]/60">
            {currentData.map((row, idx) => {
              const rowKey = row[keyField] || idx;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F4EFE6]/70' : 'hover:bg-[#FBF8F2]'
                  }`}
                >
                  {columns.map((col) => {
                    const cellKey = col.id || col.accessor;
                    const value = col.accessor ? row[col.accessor] : undefined;
                    return (
                      <td
                        key={cellKey}
                        className={`px-4 py-3.5 whitespace-nowrap align-middle ${col.className || ''}`}
                      >
                        {col.cell ? col.cell(row, idx) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t border-[#DDD4C4] bg-[#F7F3EB]/40 flex items-center justify-between text-xs text-[#6B6A60]">
          <div>
            Showing <span className="font-medium text-[#1E2A26]">{startIdx + 1}</span> to{' '}
            <span className="font-medium text-[#1E2A26]">{Math.min(startIdx + pageSize, total)}</span> of{' '}
            <span className="font-medium text-[#1E2A26]">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-[#1E2A26]">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

