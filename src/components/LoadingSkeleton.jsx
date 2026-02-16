import React from 'react';
import { CTableRow, CTableDataCell } from '@coreui/react';

const LoadingSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <CTableDataCell key={colIndex}>
              <div 
                className="skeleton-loader" 
                style={{ 
                  height: '20px',
                  width: colIndex === 0 ? '80%' : '60%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  animation: 'skeleton-loading 1.5s infinite ease-in-out'
                }}
              />
            </CTableDataCell>
          ))}
        </CTableRow>
      ))}
      <style>{`
        @keyframes skeleton-loading {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default LoadingSkeleton;