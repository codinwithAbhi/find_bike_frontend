import { MDBBtn } from "mdb-react-ui-kit";
import React from "react";


const Pagination = ({ totalItems, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / 5);
  
    if (totalPages === 1) return null; // No pagination if only one page
  
    return (
      <div className="pagination-container">
        <MDBBtn
          color="primary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </MDBBtn>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <MDBBtn
          color="primary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </MDBBtn>
      </div>
    );
  };
  
  export default Pagination