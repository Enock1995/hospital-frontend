import React from 'react';
import { CInputGroup, CInputGroupText, CFormInput, CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilX } from '@coreui/icons';

const SearchBar = ({ 
  value, 
  onChange, 
  onClear, 
  placeholder = "Search...",
  className = "mb-3"
}) => {
  return (
    <CInputGroup className={className}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <CButton color="secondary" variant="outline" onClick={onClear}>
          <CIcon icon={cilX} />
        </CButton>
      )}
    </CInputGroup>
  );
};

export default SearchBar;