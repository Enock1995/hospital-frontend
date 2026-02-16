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
import { cilPlus, cilPencil, cilTrash, cilMedicalCross, cilSearch, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchMedicalRecordsByPatient(selectedPatientId);
    } else {
      setMedicalRecords([]);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterStatus, allPrescriptions]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions');
      const data = response.data.data || response.data;
      setAllPrescriptions(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
      setAllPrescriptions([]);
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

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      const data = response.data.data || response.data;
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const fetchMedicalRecordsByPatient = async (patientId) => {
    try {
      const response = await api.get(`/medical-records?patient_id=${patientId}`);
      const data = response.data.data || response.data;
      setMedicalRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setMedicalRecords([]);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allPrescriptions];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((prescription) => {
        const patientName = prescription.patient
          ? `${prescription.patient.first_name} ${prescription.patient.last_name}`.toLowerCase()
          : '';
        const doctorName = prescription.doctor?.user?.name?.toLowerCase() || '';
        return (
          patientName.includes(search) ||
          doctorName.includes(search) ||
          prescription.medication_name?.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter((prescription) => prescription.status === filterStatus);
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
    
    setPrescriptions(paginatedData);
  };

  const onSubmit = async (data) => {
    try {
      if (editMode) {
        await api.put(`/prescriptions/${selectedPrescription.id}`, data);
        toast.success('Prescription updated successfully');
      } else {
        await api.post('/prescriptions', data);
        toast.success('Prescription created successfully');
      }
      fetchPrescriptions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to save prescription');
    }
  };

  const handleEdit = (prescription) => {
    setSelectedPrescription(prescription);
    setEditMode(true);
    setSelectedPatientId(prescription.patient_id);
    
    setValue('patient_id', prescription.patient_id);
    setValue('medical_record_id', prescription.medical_record_id || '');
    setValue('doctor_id', prescription.doctor_id);
    setValue('prescribed_date', prescription.prescribed_date);
    setValue('medication_name', prescription.medication_name);
    setValue('dosage', prescription.dosage);
    setValue('frequency', prescription.frequency);
    setValue('duration_days', prescription.duration_days);
    setValue('instructions', prescription.instructions || '');
    setValue('status', prescription.status);
    
    setModalVisible(true);
  };

  const handleDelete = (prescription) => {
    setSelectedPrescription(prescription);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/prescriptions/${selectedPrescription.id}`);
      toast.success('Prescription deleted successfully');
      fetchPrescriptions();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedPrescription(null);
    setSelectedPatientId('');
    setMedicalRecords([]);
    reset();
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    setValue('patient_id', patientId);
    setValue('medical_record_id', '');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      completed: 'info',
      cancelled: 'danger',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status}</CBadge>;
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
          {Array.from({ length: 9 }).map((_, colIndex) => (
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
            <strong className="fs-5">Prescriptions Management</strong>
            <CButtonGroup>
              <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <CIcon icon={cilFilter} className="me-2" />Filters
              </CButton>
              <CButton color="primary" onClick={() => setModalVisible(true)}>
                <CIcon icon={cilPlus} className="me-2" />Add Prescription
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
                    placeholder="Search by patient, doctor, medication..."
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
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
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
                    <CTableHeaderCell className="d-none d-md-table-cell">Date</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Doctor</CTableHeaderCell>
                    <CTableHeaderCell>Medication</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-xl-table-cell">Dosage</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-xl-table-cell">Frequency</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Duration</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : prescriptions.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center py-5">
                        <div className="text-medium-emphasis">
                          <CIcon icon={cilMedicalCross} size="3xl" className="mb-3 opacity-25" />
                          <p className="mb-0">No prescriptions found</p>
                          {(searchTerm || filterStatus) && (
                            <small className="text-muted">Try adjusting your filters</small>
                          )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    prescriptions.map((prescription) => (
                      <CTableRow key={prescription.id}>
                        <CTableDataCell className="d-none d-md-table-cell">
                          {formatDate(prescription.prescribed_date)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>
                              {prescription.patient
                                ? `${prescription.patient.first_name} ${prescription.patient.last_name}`
                                : 'N/A'}
                            </strong>
                            <div className="d-lg-none small text-muted">
                              {prescription.doctor?.user?.name ? `Dr. ${prescription.doctor.user.name}` : ''}
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">
                          {prescription.doctor?.user?.name
                            ? `Dr. ${prescription.doctor.user.name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong>{prescription.medication_name}</strong>
                          <div className="d-xl-none small text-muted">
                            {prescription.dosage} - {prescription.frequency}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-xl-table-cell">{prescription.dosage}</CTableDataCell>
                        <CTableDataCell className="d-none d-xl-table-cell">{prescription.frequency}</CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">{prescription.duration_days} days</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(prescription.status)}</CTableDataCell>
                        <CTableDataCell>
                          <CButtonGroup size="sm">
                            <CButton color="info" variant="ghost" onClick={() => handleEdit(prescription)}>
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="danger" variant="ghost" onClick={() => handleDelete(prescription)}>
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
            {!loading && prescriptions.length > 0 && <PaginationControl />}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilMedicalCross} className="me-2" />
            {editMode ? 'Edit Prescription' : 'Add New Prescription'}
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
                    onChange={handlePatientChange}
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
                  <CFormLabel>Medical Record *</CFormLabel>
                  <CFormSelect
                    {...register('medical_record_id', { required: 'Medical record is required' })}
                    invalid={!!errors.medical_record_id}
                    disabled={!selectedPatientId}
                  >
                    <option value="">Select Medical Record</option>
                    {medicalRecords.map((record) => (
                      <option key={record.id} value={record.id}>
                        {formatDate(record.visit_date)} - {record.diagnosis}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.medical_record_id && (
                    <div className="invalid-feedback d-block">{errors.medical_record_id.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Doctor *</CFormLabel>
                  <CFormSelect
                    {...register('doctor_id', { required: 'Doctor is required' })}
                    invalid={!!errors.doctor_id}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user?.name} - {doctor.specialization}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.doctor_id && (
                    <div className="invalid-feedback d-block">{errors.doctor_id.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Prescribed Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    {...register('prescribed_date', { required: 'Date is required' })}
                    invalid={!!errors.prescribed_date}
                  />
                  {errors.prescribed_date && (
                    <div className="invalid-feedback d-block">{errors.prescribed_date.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Medication Name *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="Enter medication name"
                    {...register('medication_name', { required: 'Medication name is required' })}
                    invalid={!!errors.medication_name}
                  />
                  {errors.medication_name && (
                    <div className="invalid-feedback d-block">{errors.medication_name.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Dosage *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="e.g., 500mg"
                    {...register('dosage', { required: 'Dosage is required' })}
                    invalid={!!errors.dosage}
                  />
                  {errors.dosage && (
                    <div className="invalid-feedback d-block">{errors.dosage.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Frequency *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="e.g., Twice daily"
                    {...register('frequency', { required: 'Frequency is required' })}
                    invalid={!!errors.frequency}
                  />
                  {errors.frequency && (
                    <div className="invalid-feedback d-block">{errors.frequency.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Duration (Days) *</CFormLabel>
                  <CFormInput
                    type="number"
                    placeholder="e.g., 7"
                    {...register('duration_days', {
                      required: 'Duration is required',
                      min: { value: 1, message: 'Duration must be at least 1 day' },
                    })}
                    invalid={!!errors.duration_days}
                  />
                  {errors.duration_days && (
                    <div className="invalid-feedback d-block">{errors.duration_days.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Status *</CFormLabel>
                  <CFormSelect
                    {...register('status', { required: 'Status is required' })}
                    invalid={!!errors.status}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
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
                  <CFormLabel>Instructions</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    placeholder="Enter instructions for the patient"
                    {...register('instructions')}
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
            Are you sure you want to delete this prescription for{' '}
            <strong>{selectedPrescription?.medication_name}</strong>?
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

export default PrescriptionsPage;