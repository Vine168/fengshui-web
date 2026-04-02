import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = "items"
}) => {
  // Generate page numbers to display (max 5)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
      {/* Status Display */}
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-semibold text-foreground">{startItem}</span> to{' '}
        <span className="font-semibold text-foreground">{endItem}</span> of{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemName}
      </div>

      {/* Enhanced Pagination Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "h-9 px-3 gap-1 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all",
            currentPage === 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-9 w-9 p-0 transition-all font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={cn(
            "h-9 px-3 gap-1 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all",
            (currentPage === totalPages || totalPages === 0) && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};