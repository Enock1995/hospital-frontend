import React from 'react';
import { CPagination, CPaginationItem } from '@coreui/react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "mt-3"
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      <div className="text-medium-emphasis small">
        Page {currentPage} of {totalPages}
      </div>
      <CPagination aria-label="Page navigation">
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          First
        </CPaginationItem>
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </CPaginationItem>
        
        {getPageNumbers().map((page) => (
          <CPaginationItem
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </CPaginationItem>
        ))}
        
        <CPaginationItem
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </CPaginationItem>
        <CPaginationItem
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </CPaginationItem>
      </CPagination>
    </div>
  );
};

export default Pagination;