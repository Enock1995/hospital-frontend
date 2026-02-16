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
import { cilPlus, cilPencil, cilTrash, cilBed, cilCheckCircle, cilSearch, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const BedAssignmentsPage = () => {
  const [bedAssignments, setBedAssignments] = useState([]);
  const [allBedAssignments, setAllBedAssignments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [dischargeModalVisible, setDischargeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBedAssignment, setSelectedBedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { register: registerDischarge, handleSubmit: handleSubmitDischarge, reset: resetDischarge, formState: { errors: errorsDischarge } } = useForm();

  useEffect(() => {
    fetchBedAssignments();
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterStatus, filterWard, allBedAssignments]);

  const fetchBedAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bed-assignments');
      const data = response.data.data || response.data;
      setAllBedAssignments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching bed assignments:', error);
      toast.error('Failed to fetch bed assignments');
      setAllBedAssignments([]);
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

  const applyFiltersAndPagination = () => {
    let filtered = [...allBedAssignments];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(bed => {
        const patientName = bed.patient
          ? `${bed.patient.first_name} ${bed.patient.last_name}`.toLowerCase()
          : '';
        return (
          patientName.includes(search) ||
          bed.bed_number?.toLowerCase().includes(search) ||
          bed.ward?.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(bed => bed.status === filterStatus);
    }
    
    // Apply ward filter
    if (filterWard) {
      filtered = filtered.filter(bed => bed.ward === filterWard);
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
    
    setBedAssignments(paginatedData);
  };

  const onSubmit = async (data) => {
    try {
      if (editMode) {
        await api.put(`/bed-assignments/${selectedBedAssignment.id}`, data);
        toast.success('Bed assignment updated successfully');
      } else {
        await api.post('/bed-assignments', data);
        toast.success('Bed assignment created successfully');
      }
      fetchBedAssignments();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving bed assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to save bed assignment');
    }
  };

  const onSubmitDischarge = async (data) => {
    try {
      await api.post(`/bed-assignments/${selectedBedAssignment.id}/discharge`, data);
      toast.success('Patient discharged successfully');
      fetchBedAssignments();
      handleCloseDischargeModal();
    } catch (error) {
      console.error('Error discharging patient:', error);
      toast.error(error.response?.data?.message || 'Failed to discharge patient');
    }
  };

  const handleEdit = (bedAssignment) => {
    setSelectedBedAssignment(bedAssignment);
    setEditMode(true);

    setValue('patient_id', bedAssignment.patient_id);
    setValue('bed_number', bedAssignment.bed_number);
    setValue('ward', bedAssignment.ward || '');
    setValue('admission_date', bedAssignment.admission_date?.split('T')[0]);
    setValue('discharge_date', bedAssignment.discharge_date?.split('T')[0] || '');
    setValue('status', bedAssignment.status);
    setValue('notes', bedAssignment.notes || '');

    setModalVisible(true);
  };

  const handleDischarge = (bedAssignment) => {
    setSelectedBedAssignment(bedAssignment);
    resetDischarge({
      discharge_date: new Date().toISOString().split('T')[0],
      notes: bedAssignment.notes || '',
    });
    setDischargeModalVisible(true);
  };

  const handleDelete = (bedAssignment) => {
    setSelectedBedAssignment(bedAssignment);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/bed-assignments/${selectedBedAssignment.id}`);
      toast.success('Bed assignment deleted successfully');
      fetchBedAssignments();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting bed assignment:', error);
      toast.error('Failed to delete bed assignment');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedBedAssignment(null);
    reset();
  };

  const handleCloseDischargeModal = () => {
    setDischargeModalVisible(false);
    setSelectedBedAssignment(null);
    resetDischarge();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterWard('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const colors = {
      occupied: 'success',
      discharged: 'secondary',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status}</CBadge>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get unique wards for filter
  const uniqueWards = [...new Set(allBedAssignments.map(bed => bed.ward).filter(Boolean))];

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
              <CIcon icon={cilBed} className="me-2" />
              Bed Assignments Management
            </strong>
            <CButtonGroup>
              <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <CIcon icon={cilFilter} className="me-2" />Filters
              </CButton>
              <CButton color="primary" onClick={() => setModalVisible(true)}>
                <CIcon icon={cilPlus} className="me-2" />Assign Bed
              </CButton>
            </CButtonGroup>
          </CCardHeader>
          <CCardBody>
            {/* Search & Filters */}
            <CRow className="mb-3">
              <CCol lg={showFilters ? 6 : 12}>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                  <CFormInput
                    placeholder="Search by patient, bed number, or ward..."
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
                <>
                  <CCol lg={3} className="mt-3 mt-lg-0">
                    <CFormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="">All Status</option>
                      <option value="occupied">Occupied</option>
                      <option value="discharged">Discharged</option>
                    </CFormSelect>
                  </CCol>
                  <CCol lg={3} className="mt-3 mt-lg-0">
                    <div className="d-flex gap-2">
                      <CFormSelect value={filterWard} onChange={(e) => setFilterWard(e.target.value)}>
                        <option value="">All Wards</option>
                        {uniqueWards.map(ward => (
                          <option key={ward} value={ward}>{ward}</option>
                        ))}
                      </CFormSelect>
                      {(filterStatus || filterWard) && (
                        <CButton color="secondary" variant="outline" onClick={clearFilters}>
                          <CIcon icon={cilX} />
                        </CButton>
                      )}
                    </div>
                  </CCol>
                </>
              )}
            </CRow>

            {/* Table */}
            <div className="table-responsive">
              <CTable hover className="align-middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Bed Number</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Ward</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Admission Date</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-xl-table-cell">Discharge Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : bedAssignments.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center py-5">
                        <div className="text-medium-emphasis">
                          <CIcon icon={cilBed} size="3xl" className="mb-3 opacity-25" />
                          <p className="mb-0">No bed assignments found</p>
                          {(searchTerm || filterStatus || filterWard) && (
                            <small className="text-muted">Try adjusting your filters</small>
                          )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    bedAssignments.map((bedAssignment) => (
                      <CTableRow key={bedAssignment.id}>
                        <CTableDataCell>
                          <strong>{bedAssignment.bed_number}</strong>
                          <div className="d-md-none small text-muted">{bedAssignment.ward || 'N/A'}</div>
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-md-table-cell">
                          {bedAssignment.ward || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {bedAssignment.patient
                            ? `${bedAssignment.patient.first_name} ${bedAssignment.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">
                          {formatDateTime(bedAssignment.admission_date)}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-xl-table-cell">
                          {formatDateTime(bedAssignment.discharge_date)}
                        </CTableDataCell>
                        <CTableDataCell>{getStatusBadge(bedAssignment.status)}</CTableDataCell>
                        <CTableDataCell>
                          <CButtonGroup size="sm">
                            {bedAssignment.status === 'occupied' && (
                              <CButton
                                color="warning"
                                variant="ghost"
                                onClick={() => handleDischarge(bedAssignment)}
                                title="Discharge Patient"
                              >
                                <CIcon icon={cilCheckCircle} />
                              </CButton>
                            )}
                            <CButton
                              color="info"
                              variant="ghost"
                              onClick={() => handleEdit(bedAssignment)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDelete(bedAssignment)}
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
            {!loading && bedAssignments.length > 0 && <PaginationControl />}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilBed} className="me-2" />
            {editMode ? 'Edit Bed Assignment' : 'Assign New Bed'}
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
                  <CFormLabel>Ward *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="e.g., ICU, General Ward"
                    {...register('ward', { required: 'Ward is required' })}
                    invalid={!!errors.ward}
                  />
                  {errors.ward && (
                    <div className="invalid-feedback d-block">{errors.ward.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Bed Number *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="e.g., B-101"
                    {...register('bed_number', { required: 'Bed number is required' })}
                    invalid={!!errors.bed_number}
                  />
                  {errors.bed_number && (
                    <div className="invalid-feedback d-block">{errors.bed_number.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Status *</CFormLabel>
                  <CFormSelect
                    {...register('status', { required: 'Status is required' })}
                    invalid={!!errors.status}
                  >
                    <option value="occupied">Occupied</option>
                    <option value="discharged">Discharged</option>
                  </CFormSelect>
                  {errors.status && (
                    <div className="invalid-feedback d-block">{errors.status.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Admission Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    {...register('admission_date', { required: 'Admission date is required' })}
                    invalid={!!errors.admission_date}
                  />
                  {errors.admission_date && (
                    <div className="invalid-feedback d-block">{errors.admission_date.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Discharge Date</CFormLabel>
                  <CFormInput
                    type="date"
                    {...register('discharge_date')}
                  />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    placeholder="Additional notes about the bed assignment"
                    {...register('notes')}
                  />
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancel</CButton>
            <CButton color="primary" type="submit">
              {editMode ? 'Update' : 'Assign'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Discharge Modal */}
      <CModal visible={dischargeModalVisible} onClose={handleCloseDischargeModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>Discharge Patient</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmitDischarge(onSubmitDischarge)}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Discharge Date *</CFormLabel>
              <CFormInput
                type="date"
                {...registerDischarge('discharge_date', { required: 'Discharge date is required' })}
                invalid={!!errorsDischarge.discharge_date}
              />
              {errorsDischarge.discharge_date && (
                <div className="invalid-feedback d-block">{errorsDischarge.discharge_date.message}</div>
              )}
            </div>
            <div className="mb-3">
              <CFormLabel>Discharge Notes</CFormLabel>
              <CFormTextarea
                rows={3}
                placeholder="Enter discharge notes..."
                {...registerDischarge('notes')}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseDischargeModal}>Cancel</CButton>
            <CButton color="warning" type="submit">Discharge Patient</CButton>
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
            Are you sure you want to delete the bed assignment for bed{' '}
            <strong>{selectedBedAssignment?.bed_number}</strong>?
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

export default BedAssignmentsPage;