import React from "react";
import { MDBBtn, MDBIcon } from "mdb-react-ui-kit";

const Pagination = ({ totalItems, currentPage, onPageChange }) => {
  const pageSize = 5;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Create page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3; // Show max 3 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // If total pages are 3 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include current page
      pageNumbers.push(currentPage);
      
      // Add page before current if it exists
      if (currentPage > 1) {
        pageNumbers.unshift(currentPage - 1);
      }
      
      // Add page after current if it exists
      if (currentPage < totalPages) {
        pageNumbers.push(currentPage + 1);
      }
      
      // If we still have space, add more pages
      if (pageNumbers.length < maxVisiblePages) {
        if (pageNumbers[0] > 1) {
          pageNumbers.unshift(pageNumbers[0] - 1);
        } else if (pageNumbers[pageNumbers.length - 1] < totalPages) {
          pageNumbers.push(pageNumbers[pageNumbers.length - 1] + 1);
        }
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      {/* First page button */}
      <MDBBtn
        floating
        color="light"
        size="sm"
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        <MDBIcon fas icon="angle-double-left" />
      </MDBBtn>
      
      {/* Previous button */}
      <MDBBtn
        floating
        color="light"
        size="sm" 
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <MDBIcon fas icon="angle-left" />
      </MDBBtn>
      
      {/* Page numbers */}
      {getPageNumbers().map(page => (
        <MDBBtn
          key={page}
          floating
          color={currentPage === page ? "primary" : "light"}
          size="sm"
          className="pagination-btn"
          onClick={() => onPageChange(page)}
        >
          {page}
        </MDBBtn>
      ))}
      
      {/* Next button */}
      <MDBBtn
        floating
        color="light"
        size="sm"
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <MDBIcon fas icon="angle-right" />
      </MDBBtn>
      
      {/* Last page button */}
      <MDBBtn
        floating
        color="light"
        size="sm"
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        <MDBIcon fas icon="angle-double-right" />
      </MDBBtn>
      
      {/* Page info text */}
      <div className="page-info ml-2">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;