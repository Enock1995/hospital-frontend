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
  CButtonGroup,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilUser, cilSearch, cilFilter, cilX, cilWarning } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchQuery, filterGender, filterBloodGroup, allPatients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients');
      const data = response.data.data || response.data;
      const patientsData = Array.isArray(data) ? data : data.data || [];
      setAllPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
      setAllPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allPatients];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(patient =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery)
      );
    }
    
    // Apply gender filter
    if (filterGender) {
      filtered = filtered.filter(patient => patient.gender === filterGender);
    }
    
    // Apply blood group filter
    if (filterBloodGroup) {
      filtered = filtered.filter(patient => patient.blood_group === filterBloodGroup);
    }
    
    // Calculate pagination
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total);
    
    // Reset to page 1 if current page exceeds total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
      return;
    }
    
    // Get paginated data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    setPatients(paginatedData);
  };

  const onSubmit = async (data) => {
    try {
      if (editMode) {
        await api.put(`/patients/${selectedPatient.id}`, data);
        toast.success('Patient updated successfully');
      } else {
        await api.post('/patients', data);
        toast.success('Patient created successfully');
      }
      fetchPatients();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(error.response?.data?.message || 'Failed to save patient');
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setEditMode(true);

    setValue('first_name', patient.first_name);
    setValue('last_name', patient.last_name);
    setValue('email', patient.email || '');
    setValue('phone', patient.phone || '');
    setValue('date_of_birth', patient.date_of_birth || '');
    setValue('gender', patient.gender || '');
    setValue('blood_group', patient.blood_group || '');
    setValue('address', patient.address || '');
    setValue('emergency_contact', patient.emergency_contact || '');

    setModalVisible(true);
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/patients/${selectedPatient.id}`);
      toast.success('Patient deleted successfully');
      fetchPatients();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedPatient(null);
    reset();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterGender('');
    setFilterBloodGroup('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getGenderBadge = (gender) => {
    const colors = { male: 'primary', female: 'danger', other: 'info' };
    return <CBadge color={colors[gender?.toLowerCase()] || 'secondary'}>{gender}</CBadge>;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <CTableDataCell key={colIndex}>
              <div 
                style={{ 
                  height: '20px',
                  width: colIndex === 0 ? '80%' : '60%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  animation: 'skeleton-pulse 1.5s infinite ease-in-out'
                }}
              />
            </CTableDataCell>
          ))}
        </CTableRow>
      ))}
    </>
  );

  // Pagination component
  const PaginationControl = () => {
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
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-medium-emphasis small">
          Page {currentPage} of {totalPages}
        </div>
        <CPagination aria-label="Page navigation">
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            First
          </CPaginationItem>
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </CPaginationItem>
          
          {getPageNumbers().map((page) => (
            <CPaginationItem
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </CPaginationItem>
          ))}
          
          <CPaginationItem
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </CPaginationItem>
          <CPaginationItem
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </CPaginationItem>
        </CPagination>
      </div>
    );
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <strong className="fs-5">Patients Management</strong>
            <CButtonGroup>
              <CButton 
                color="info" 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <CIcon icon={cilFilter} className="me-2" />
                Filters
              </CButton>
              <CButton color="primary" onClick={() => setModalVisible(true)}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Patient
              </CButton>
            </CButtonGroup>
          </CCardHeader>
          <CCardBody>
            {/* Search & Filters */}
            <CRow className="mb-3">
              <CCol lg={showFilters ? 6 : 12}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <CButton color="secondary" variant="outline" onClick={() => setSearchQuery('')}>
                      <CIcon icon={cilX} />
                    </CButton>
                  )}
                </CInputGroup>
              </CCol>
              {showFilters && (
                <>
                  <CCol lg={3} className="mt-3 mt-lg-0">
                    <CFormSelect
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                    >
                      <option value="">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol lg={3} className="mt-3 mt-lg-0">
                    <div className="d-flex gap-2">
                      <CFormSelect
                        value={filterBloodGroup}
                        onChange={(e) => setFilterBloodGroup(e.target.value)}
                      >
                        <option value="">All Blood Groups</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </CFormSelect>
                      {(filterGender || filterBloodGroup) && (
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
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Contact</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">DOB</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Gender</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-xl-table-cell">Blood Group</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : patients.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center py-5">
                        <div className="text-medium-emphasis">
                          <CIcon icon={cilUser} size="3xl" className="mb-3 opacity-25" />
                          <p className="mb-0">No patients found</p>
                          {(searchQuery || filterGender || filterBloodGroup) && (
                            <small className="text-muted">Try adjusting your filters</small>
                          )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    patients.map((patient) => (
                      <CTableRow key={patient.id}>
                        <CTableDataCell>
                          <div>
                            <strong>{patient.first_name} {patient.last_name}</strong>
                            <div className="d-md-none small text-muted">
                              {patient.email || patient.phone}
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-md-table-cell">
                          {patient.phone && <div>{patient.phone}</div>}
                          {patient.email && <div className="small text-muted">{patient.email}</div>}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">
                          {formatDate(patient.date_of_birth)}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">
                          {patient.gender && getGenderBadge(patient.gender)}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-xl-table-cell">
                          {patient.blood_group && (
                            <CBadge color="danger" className="fw-semibold">
                              {patient.blood_group}
                            </CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButtonGroup size="sm">
                            <CButton
                              color="info"
                              variant="ghost"
                              onClick={() => handleEdit(patient)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDelete(patient)}
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
            {!loading && patients.length > 0 && <PaginationControl />}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilUser} className="me-2" />
            {editMode ? 'Edit Patient' : 'Add New Patient'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>First Name *</CFormLabel>
                  <CFormInput
                    type="text"
                    {...register('first_name', { required: 'First name is required' })}
                    invalid={!!errors.first_name}
                  />
                  {errors.first_name && (
                    <div className="invalid-feedback d-block">{errors.first_name.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Last Name *</CFormLabel>
                  <CFormInput
                    type="text"
                    {...register('last_name', { required: 'Last name is required' })}
                    invalid={!!errors.last_name}
                  />
                  {errors.last_name && (
                    <div className="invalid-feedback d-block">{errors.last_name.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput type="email" {...register('email')} />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Phone</CFormLabel>
                  <CFormInput type="text" {...register('phone')} />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Date of Birth</CFormLabel>
                  <CFormInput type="date" {...register('date_of_birth')} />
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Gender</CFormLabel>
                  <CFormSelect {...register('gender')}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </CFormSelect>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="mb-3">
                  <CFormLabel>Blood Group</CFormLabel>
                  <CFormSelect {...register('blood_group')}>
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Address</CFormLabel>
                  <CFormTextarea rows={2} {...register('address')} />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Emergency Contact</CFormLabel>
                  <CFormInput type="text" {...register('emergency_contact')} />
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancel
            </CButton>
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
            <CIcon icon={cilWarning} className="me-2 text-danger" />
            Delete Patient
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0">
            Are you sure you want to delete <strong>{selectedPatient?.first_name} {selectedPatient?.last_name}</strong>? 
            This action cannot be undone.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        .table tbody tr {
          transition: background-color 0.15s ease;
        }
        
        .table tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
        
        .btn {
          transition: all 0.2s ease !important;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        
        .card {
          transition: box-shadow 0.2s ease !important;
        }
      `}</style>
    </CRow>
  );
};

export default PatientsPage;