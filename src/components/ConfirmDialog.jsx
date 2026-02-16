import React from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilWarning } from '@coreui/icons';

const ConfirmDialog = ({
  visible,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  confirmColor = "danger",
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  const getIcon = () => {
    return cilWarning;
  };

  const getIconColor = () => {
    const colors = {
      danger: 'text-danger',
      warning: 'text-warning',
      info: 'text-info',
    };
    return colors[type] || 'text-danger';
  };

  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle className="d-flex align-items-center">
          <CIcon icon={getIcon()} className={`me-2 ${getIconColor()}`} />
          {title}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p className="mb-0">{message}</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          {cancelText}
        </CButton>
        <CButton color={confirmColor} onClick={onConfirm}>
          {confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ConfirmDialog;