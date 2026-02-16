import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CSpinner,
  CButtonGroup,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilNotes, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, record: null });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterPatient, allRecords]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical-records');
      let data = response.data.data || response.data;
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      setAllRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to load medical records');
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      let data = response.data.data || response.data;
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      let data = response.data.data || response.data;
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allRecords];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        const patientName = record.patient ? `${record.patient.first_name} ${record.patient.last_name}`.toLowerCase() : '';
        const doctorName = record.doctor?.user?.name?.toLowerCase() || '';
        return (
          patientName.includes(search) ||
          doctorName.includes(search) ||
          record.diagnosis?.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply patient filter
    if (filterPatient) {
      filtered = filtered.filter((record) => record.patient_id === parseInt(filterPatient));
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
    
    setRecords(paginatedData);
  };

  const openAddModal = () => {
    setEditingRecord(null);
    reset({
      patient_id: '',
      doctor_id: '',
      visit_date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      symptoms: '',
      treatment: '',
      prescriptions: '',
      notes: '',
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      weight: '',
    });
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    reset({
      patient_id: record.patient_id || '',
      doctor_id: record.doctor_id || '',
      visit_date: record.visit_date || '',
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms || '',
      treatment: record.treatment || '',
      prescriptions: record.prescriptions || '',
      notes: record.notes || '',
      blood_pressure: record.blood_pressure || '',
      temperature: record.temperature || '',
      heart_rate: record.heart_rate || '',
      weight: record.weight || '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingRecord) {
        await api.put(`/medical-records/${editingRecord.id}`, data);
        toast.success('Medical record updated successfully!');
      } else {
        await api.post('/medical-records', data);
        toast.success('Medical record added successfully!');
      }
      setShowModal(false);
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      const message = error.response?.data?.message || 'Failed to save medical record';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.record) return;
    try {
      await api.delete(`/medical-records/${deleteModal.record.id}`);
      toast.success('Medical record deleted successfully!');
      setDeleteModal({ show: false, record: null });
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete medical record');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPatient('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <CTableDataCell key={colIndex}>
              <div style={{
                height: '20px', width: colIndex === 0 ? '40px' : '80%',
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
    <>
      <CRow>
        <CCol>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <strong className="fs-5">
                <CIcon icon={cilNotes} className="me-2" />
                Medical Records
              </strong>
              <CButtonGroup>
                <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <CIcon icon={cilFilter} className="me-2" />Filters
                </CButton>
                <CButton color="primary" onClick={openAddModal}>
                  <CIcon icon={cilPlus} className="me-2" />Add Record
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
                      placeholder="Search by patient, doctor, diagnosis..."
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
                      <CFormSelect value={filterPatient} onChange={(e) => setFilterPatient(e.target.value)}>
                        <option value="">All Patients</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                        ))}
                      </CFormSelect>
                      {filterPatient && (
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
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Patient</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-lg-table-cell">Doctor</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-md-table-cell">Visit Date</CTableHeaderCell>
                      <CTableHeaderCell>Diagnosis</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <LoadingSkeleton />
                    ) : records.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="6" className="text-center py-5">
                          <div className="text-medium-emphasis">
                            <CIcon icon={cilNotes} size="3xl" className="mb-3 opacity-25" />
                            <p className="mb-0">No medical records found</p>
                            {(searchTerm || filterPatient) && (
                              <small className="text-muted">Try adjusting your filters</small>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      records.map((record) => (
                        <CTableRow key={record.id}>
                          <CTableDataCell>#{record.id}</CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>
                                {record.patient ? `${record.patient.first_name} ${record.patient.last_name}` : 'N/A'}
                              </strong>
                              <div className="d-lg-none small text-muted">
                                {record.doctor?.user?.name ? `Dr. ${record.doctor.user.name}` : ''}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-lg-table-cell">
                            {record.doctor?.user?.name || 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">
                            {formatDate(record.visit_date)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info">{record.diagnosis || 'N/A'}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButtonGroup size="sm">
                              <CButton color="info" variant="ghost" onClick={() => openEditModal(record)}>
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton color="danger" variant="ghost" onClick={() => setDeleteModal({ show: true, record })}>
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
              {!loading && records.length > 0 && <PaginationControl />}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>Patient *</CFormLabel>
                <CFormSelect {...register('patient_id', { required: 'Patient is required' })} invalid={!!errors.patient_id}>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </CFormSelect>
                {errors.patient_id && <div className="invalid-feedback d-block">{errors.patient_id.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Doctor *</CFormLabel>
                <CFormSelect {...register('doctor_id', { required: 'Doctor is required' })} invalid={!!errors.doctor_id}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.user?.name || 'N/A'}</option>
                  ))}
                </CFormSelect>
                {errors.doctor_id && <div className="invalid-feedback d-block">{errors.doctor_id.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Visit Date *</CFormLabel>
                <CFormInput type="date" {...register('visit_date', { required: 'Date is required' })} invalid={!!errors.visit_date} />
                {errors.visit_date && <div className="invalid-feedback d-block">{errors.visit_date.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Diagnosis *</CFormLabel>
                <CFormInput {...register('diagnosis', { required: 'Diagnosis is required' })} invalid={!!errors.diagnosis} placeholder="Primary diagnosis" />
                {errors.diagnosis && <div className="invalid-feedback d-block">{errors.diagnosis.message}</div>}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Symptoms</CFormLabel>
                <CFormTextarea {...register('symptoms')} rows={2} placeholder="Patient symptoms" />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Treatment</CFormLabel>
                <CFormTextarea {...register('treatment')} rows={2} placeholder="Treatment plan" />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Prescriptions</CFormLabel>
                <CFormTextarea {...register('prescriptions')} rows={2} placeholder="Prescribed medications" />
              </CCol>

              <CCol md={3}>
                <CFormLabel>BP</CFormLabel>
                <CFormInput {...register('blood_pressure')} placeholder="120/80" />
              </CCol>

              <CCol md={3}>
                <CFormLabel>Temp (°C)</CFormLabel>
                <CFormInput {...register('temperature')} placeholder="37.0" />
              </CCol>

              <CCol md={3}>
                <CFormLabel>Heart Rate</CFormLabel>
                <CFormInput {...register('heart_rate')} placeholder="72" />
              </CCol>

              <CCol md={3}>
                <CFormLabel>Weight (kg)</CFormLabel>
                <CFormInput {...register('weight')} placeholder="70" />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Notes</CFormLabel>
                <CFormTextarea {...register('notes')} rows={2} placeholder="Additional notes" />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><CSpinner size="sm" className="me-2" />Saving...</> : editingRecord ? 'Update' : 'Add Record'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={deleteModal.show} onClose={() => setDeleteModal({ show: false, record: null })} alignment="center">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2 text-danger" />Confirm Delete
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0">Are you sure you want to delete this medical record? This action cannot be undone.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ show: false, record: null })}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>

      <style>{`
        @keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .table tbody tr { transition: background-color 0.15s ease; }
        .table tbody tr:hover { background-color: rgba(0, 0, 0, 0.02) !important; }
        .btn { transition: all 0.2s ease !important; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>
    </>
  );
};

export default MedicalRecordsPage;