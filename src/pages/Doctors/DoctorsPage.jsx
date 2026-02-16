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
  CInputGroup,
  CInputGroupText,
  CBadge,
  CSpinner,
  CButtonGroup,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilMedicalCross, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, doctor: null });
  
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
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterSpecialization, allDoctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/doctors');
      let data = response.data.data || response.data;
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      setAllDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allDoctors];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((doctor) =>
        doctor.user?.name?.toLowerCase().includes(search) ||
        doctor.user?.email?.toLowerCase().includes(search) ||
        doctor.specialization?.toLowerCase().includes(search) ||
        doctor.phone?.includes(search)
      );
    }
    
    // Apply specialization filter
    if (filterSpecialization) {
      filtered = filtered.filter((doctor) => doctor.specialization === filterSpecialization);
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
    
    setDoctors(paginatedData);
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      license_number: '',
      qualification: '',
      experience_years: '',
      consultation_fee: '',
      department_id: '',
      is_available: true,
    });
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    reset({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      password: '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || '',
      license_number: doctor.license_number || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || '',
      consultation_fee: doctor.consultation_fee || '',
      department_id: doctor.department_id || '',
      is_available: doctor.is_available !== undefined ? doctor.is_available : true,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, data);
        toast.success('Doctor updated successfully!');
      } else {
        await api.post('/doctors', data);
        toast.success('Doctor added successfully!');
      }
      setShowModal(false);
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      const message = error.response?.data?.message || 'Failed to save doctor';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.doctor) return;

    try {
      await api.delete(`/doctors/${deleteModal.doctor.id}`);
      toast.success('Doctor deleted successfully!');
      setDeleteModal({ show: false, doctor: null });
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSpecialization('');
    setCurrentPage(1);
  };

  const specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics',
    'General Medicine', 'Surgery', 'Gynecology', 'Ophthalmology', 'Dentistry', 'ENT', 'Psychiatry'
  ];

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: 7 }).map((_, colIndex) => (
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
                <CIcon icon={cilMedicalCross} className="me-2" />
                Doctors Management
              </strong>
              <CButtonGroup>
                <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <CIcon icon={cilFilter} className="me-2" />Filters
                </CButton>
                <CButton color="success" onClick={openAddModal}>
                  <CIcon icon={cilPlus} className="me-2" />Add Doctor
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
                      placeholder="Search by name, specialization, email, phone..."
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
                      <CFormSelect value={filterSpecialization} onChange={(e) => setFilterSpecialization(e.target.value)}>
                        <option value="">All Specializations</option>
                        {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </CFormSelect>
                      {filterSpecialization && (
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
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-lg-table-cell">Specialization</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-md-table-cell">Contact</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-xl-table-cell">Fee</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-xl-table-cell">Experience</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <LoadingSkeleton />
                    ) : doctors.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center py-5">
                          <div className="text-medium-emphasis">
                            <CIcon icon={cilMedicalCross} size="3xl" className="mb-3 opacity-25" />
                            <p className="mb-0">No doctors found</p>
                            {(searchTerm || filterSpecialization) && (
                              <small className="text-muted">Try adjusting your filters</small>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      doctors.map((doctor) => (
                        <CTableRow key={doctor.id}>
                          <CTableDataCell>#{doctor.id}</CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{doctor.user?.name || 'N/A'}</strong>
                              <div className="small text-muted">{doctor.qualification}</div>
                              <div className="d-lg-none">
                                <CBadge color="success" className="mt-1">{doctor.specialization}</CBadge>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-lg-table-cell">
                            <CBadge color="success">{doctor.specialization}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">
                            {doctor.phone && <div>{doctor.phone}</div>}
                            {doctor.user?.email && <div className="small text-muted">{doctor.user.email}</div>}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-xl-table-cell">
                            ${doctor.consultation_fee || 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-xl-table-cell">
                            {doctor.experience_years ? `${doctor.experience_years} yrs` : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButtonGroup size="sm">
                              <CButton color="info" variant="ghost" onClick={() => openEditModal(doctor)}>
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton color="danger" variant="ghost" onClick={() => setDeleteModal({ show: true, doctor })}>
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
              {!loading && doctors.length > 0 && <PaginationControl />}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>Full Name *</CFormLabel>
                <CFormInput
                  {...register('name', { required: 'Name is required' })}
                  invalid={!!errors.name}
                  placeholder="Dr. John Doe"
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Email *</CFormLabel>
                <CFormInput
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                  })}
                  invalid={!!errors.email}
                  placeholder="doctor@hospital.com"
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
              </CCol>

              {!editingDoctor && (
                <CCol md={6}>
                  <CFormLabel>Password *</CFormLabel>
                  <CFormInput
                    type="password"
                    {...register('password', {
                      required: editingDoctor ? false : 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                    invalid={!!errors.password}
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                </CCol>
              )}

              <CCol md={6}>
                <CFormLabel>Phone *</CFormLabel>
                <CFormInput
                  {...register('phone', { required: 'Phone is required' })}
                  invalid={!!errors.phone}
                  placeholder="Phone number"
                />
                {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>License Number *</CFormLabel>
                <CFormInput
                  {...register('license_number', { required: 'License number is required' })}
                  invalid={!!errors.license_number}
                  placeholder="Medical license number"
                />
                {errors.license_number && <div className="invalid-feedback d-block">{errors.license_number.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Specialization *</CFormLabel>
                <CFormSelect
                  {...register('specialization', { required: 'Specialization is required' })}
                  invalid={!!errors.specialization}
                >
                  <option value="">Select specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </CFormSelect>
                {errors.specialization && <div className="invalid-feedback d-block">{errors.specialization.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Qualification *</CFormLabel>
                <CFormInput
                  {...register('qualification', { required: 'Qualification is required' })}
                  invalid={!!errors.qualification}
                  placeholder="MBBS, MD"
                />
                {errors.qualification && <div className="invalid-feedback d-block">{errors.qualification.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Experience (Years) *</CFormLabel>
                <CFormInput
                  type="number"
                  {...register('experience_years', {
                    required: 'Experience is required',
                    min: { value: 0, message: 'Experience cannot be negative' }
                  })}
                  invalid={!!errors.experience_years}
                  placeholder="Years of experience"
                  min="0"
                />
                {errors.experience_years && <div className="invalid-feedback d-block">{errors.experience_years.message}</div>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Consultation Fee ($) *</CFormLabel>
                <CFormInput
                  type="number"
                  {...register('consultation_fee', {
                    required: 'Consultation fee is required',
                    min: { value: 0, message: 'Fee cannot be negative' }
                  })}
                  invalid={!!errors.consultation_fee}
                  placeholder="50"
                  min="0"
                  step="0.01"
                />
                {errors.consultation_fee && <div className="invalid-feedback d-block">{errors.consultation_fee.message}</div>}
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
            <CButton color="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><CSpinner size="sm" className="me-2" />Saving...</> : editingDoctor ? 'Update Doctor' : 'Add Doctor'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={deleteModal.show} onClose={() => setDeleteModal({ show: false, doctor: null })} alignment="center">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2 text-danger" />Delete Doctor
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0">Are you sure you want to delete Dr. <strong>{deleteModal.doctor?.user?.name}</strong>? This action cannot be undone.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ show: false, doctor: null })}>Cancel</CButton>
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

export default DoctorsPage;