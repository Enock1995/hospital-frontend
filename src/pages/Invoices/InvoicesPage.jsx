import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CBadge,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CButtonGroup,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilMoney, cilCheckCircle, cilSearch, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const subtotal = watch('subtotal', 0);
  const tax = watch('tax', 0);
  const discount = watch('discount', 0);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
    fetchAppointments();
  }, []);

  useEffect(() => {
    const calculatedTotal = (parseFloat(subtotal) || 0) + (parseFloat(tax) || 0) - (parseFloat(discount) || 0);
    setValue('total', calculatedTotal.toFixed(2));
  }, [subtotal, tax, discount, setValue]);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterStatus, allInvoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      const data = response.data.data || response.data;
      setAllInvoices(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
      setAllInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      const data = response.data.data || response.data;
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      const data = response.data.data || response.data;
      setAppointments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allInvoices];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => {
        const patientName = inv.patient
          ? `${inv.patient.first_name} ${inv.patient.last_name}`.toLowerCase()
          : '';
        return (
          patientName.includes(search) ||
          inv.invoice_number?.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(inv => inv.status === filterStatus);
    }
    
    // Calculate pagination
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total);
    
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
      return;
    }
    
    // Get paginated data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    setInvoices(paginatedData);
  };

  const onSubmit = async (data) => {
    try {
      if (editMode) {
        await api.put(`/invoices/${selectedInvoice.id}`, data);
        toast.success('Invoice updated successfully');
      } else {
        await api.post('/invoices', data);
        toast.success('Invoice created successfully');
      }
      fetchInvoices();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setEditMode(true);

    setValue('patient_id', invoice.patient_id);
    setValue('appointment_id', invoice.appointment_id || '');
    setValue('invoice_date', invoice.invoice_date);
    setValue('due_date', invoice.due_date || '');
    setValue('subtotal', invoice.subtotal);
    setValue('tax', invoice.tax);
    setValue('discount', invoice.discount);
    setValue('total', invoice.total);
    setValue('status', invoice.status);
    setValue('notes', invoice.notes || '');

    setModalVisible(true);
  };

  const handleDelete = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/invoices/${selectedInvoice.id}`);
      toast.success('Invoice deleted successfully');
      fetchInvoices();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleMarkAsPaid = async (invoice) => {
    try {
      await api.post(`/invoices/${invoice.id}/mark-paid`);
      toast.success('Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedInvoice(null);
    reset();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      partially_paid: 'info',
      overdue: 'danger',
      cancelled: 'secondary',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status.replace('_', ' ')}</CBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: 7 }).map((_, colIndex) => (
            <CTableDataCell key={colIndex}>
              <div style={{
                height: '20px', width: '80%',
                backgroundColor: '#e0e0e0', borderRadius: '4px',
                animation: 'skeleton-pulse 1.5s infinite ease-in-out'
              }} />
            </CTableDataCell>
          ))}
        </CTableRow>
      ))}
    </>
  );

  // Pagination
  const PaginationControl = () => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    };

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-medium-emphasis small">Page {currentPage} of {totalPages}</div>
        <CPagination>
          <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</CPaginationItem>
          <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</CPaginationItem>
          {getPageNumbers().map((page) => (
            <CPaginationItem key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
              {page}
            </CPaginationItem>
          ))}
          <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</CPaginationItem>
          <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>Last</CPaginationItem>
        </CPagination>
      </div>
    );
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <strong className="fs-5">
              <CIcon icon={cilMoney} className="me-2" />
              Invoices Management
            </strong>
            <CButtonGroup>
              <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <CIcon icon={cilFilter} className="me-2" />Filters
              </CButton>
              <CButton color="primary" onClick={() => setModalVisible(true)}>
                <CIcon icon={cilPlus} className="me-2" />Create Invoice
              </CButton>
            </CButtonGroup>
          </CCardHeader>
          <CCardBody>
            {/* Search & Filters */}
            <CRow className="mb-3">
              <CCol lg={showFilters ? 8 : 12}>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                  <CFormInput
                    placeholder="Search by patient or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <CButton color="secondary" variant="outline" onClick={() => setSearchTerm('')}>
                      <CIcon icon={cilX} />
                    </CButton>
                  )}
                </CInputGroup>
              </CCol>
              {showFilters && (
                <CCol lg={4} className="mt-3 mt-lg-0">
                  <div className="d-flex gap-2">
                    <CFormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </CFormSelect>
                    {filterStatus && (
                      <CButton color="secondary" variant="outline" onClick={clearFilters}>
                        <CIcon icon={cilX} />
                      </CButton>
                    )}
                  </div>
                </CCol>
              )}
            </CRow>

            {/* Table */}
            <div className="table-responsive">
              <CTable hover className="align-middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Invoice #</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Invoice Date</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Due Date</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : invoices.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center py-5">
                        <div className="text-medium-emphasis">
                          <CIcon icon={cilMoney} size="3xl" className="mb-3 opacity-25" />
                          <p className="mb-0">No invoices found</p>
                          {(searchTerm || filterStatus) && (
                            <small className="text-muted">Try adjusting your filters</small>
                          )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <CTableRow key={invoice.id}>
                        <CTableDataCell>
                          <strong>{invoice.invoice_number}</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          {invoice.patient
                            ? `${invoice.patient.first_name} ${invoice.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-md-table-cell">
                          {formatDate(invoice.invoice_date)}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">
                          {formatDate(invoice.due_date)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong>{formatCurrency(invoice.total)}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{getStatusBadge(invoice.status)}</CTableDataCell>
                        <CTableDataCell>
                          <CButtonGroup size="sm">
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <CButton
                                color="success"
                                variant="ghost"
                                onClick={() => handleMarkAsPaid(invoice)}
                                title="Mark as Paid"
                              >
                                <CIcon icon={cilCheckCircle} />
                              </CButton>
                            )}
                            <CButton
                              color="info"
                              variant="ghost"
                              onClick={() => handleEdit(invoice)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDelete(invoice)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CButtonGroup>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            </div>

            {/* Pagination */}
            {!loading && invoices.length > 0 && <PaginationControl />}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilMoney} className="me-2" />
            {editMode ? 'Edit Invoice' : 'Create New Invoice'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Patient *</CFormLabel>
                  <CFormSelect
                    {...register('patient_id', { required: 'Patient is required' })}
                    invalid={!!errors.patient_id}
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.patient_id && (
                    <div className="invalid-feedback d-block">{errors.patient_id.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Appointment (Optional)</CFormLabel>
                  <CFormSelect {...register('appointment_id')}>
                    <option value="">Select Appointment</option>
                    {appointments.map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {formatDate(appointment.appointment_date)} - {appointment.appointment_time}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Invoice Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    {...register('invoice_date', { required: 'Invoice date is required' })}
                    invalid={!!errors.invoice_date}
                  />
                  {errors.invoice_date && (
                    <div className="invalid-feedback d-block">{errors.invoice_date.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Due Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    {...register('due_date', { required: 'Due date is required' })}
                    invalid={!!errors.due_date}
                  />
                  {errors.due_date && (
                    <div className="invalid-feedback d-block">{errors.due_date.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Subtotal *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>$</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('subtotal', {
                        required: 'Subtotal is required',
                        min: { value: 0, message: 'Must be positive' },
                      })}
                      invalid={!!errors.subtotal}
                    />
                  </CInputGroup>
                  {errors.subtotal && (
                    <div className="invalid-feedback d-block">{errors.subtotal.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Tax</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>$</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('tax', {
                        min: { value: 0, message: 'Must be positive' },
                      })}
                    />
                  </CInputGroup>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Discount</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>$</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('discount', {
                        min: { value: 0, message: 'Must be positive' },
                      })}
                    />
                  </CInputGroup>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Total Amount *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>$</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      {...register('total')}
                      readOnly
                      style={{ backgroundColor: '#e9ecef' }}
                    />
                  </CInputGroup>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Status *</CFormLabel>
                  <CFormSelect
                    {...register('status', { required: 'Status is required' })}
                    invalid={!!errors.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </CFormSelect>
                  {errors.status && (
                    <div className="invalid-feedback d-block">{errors.status.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    placeholder="Enter any additional notes..."
                    {...register('notes')}
                  />
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancel</CButton>
            <CButton color="primary" type="submit">
              {editMode ? 'Update' : 'Create'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2 text-danger" />Confirm Delete
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0">
            Are you sure you want to delete invoice{' '}
            <strong>{selectedInvoice?.invoice_number}</strong>?
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Cancel</CButton>
          <CButton color="danger" onClick={confirmDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>

      <style>{`
        @keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .table tbody tr { transition: background-color 0.15s ease; }
        .table tbody tr:hover { background-color: rgba(0, 0, 0, 0.02) !important; }
        .btn { transition: all 0.2s ease !important; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>
    </CRow>
  );
};

export default InvoicesPage;