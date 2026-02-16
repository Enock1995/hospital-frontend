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
import { cilPlus, cilPencil, cilTrash, cilBuilding, cilCheckCircle, cilXCircle, cilSearch, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterStatus, allDepartments]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      const data = response.data.data || response.data;
      setAllDepartments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
      setAllDepartments([]);
    } finally {
      setLoading(false);
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

  const applyFiltersAndPagination = () => {
    let filtered = [...allDepartments];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(dept => {
        const headName = dept.head?.user?.name?.toLowerCase() || '';
        return (
          dept.name?.toLowerCase().includes(search) ||
          dept.description?.toLowerCase().includes(search) ||
          headName.includes(search)
        );
      });
    }
    
    // Apply status filter
    if (filterStatus) {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(dept => dept.is_active === isActive);
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
    
    setDepartments(paginatedData);
  };

  const onSubmit = async (data) => {
    try {
      data.is_active = data.is_active === 'true' || data.is_active === true;
      
      if (editMode) {
        await api.put(`/departments/${selectedDepartment.id}`, data);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', data);
        toast.success('Department created successfully');
      }
      fetchDepartments();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setEditMode(true);

    setValue('name', department.name);
    setValue('description', department.description || '');
    setValue('head_of_department', department.head_of_department || '');
    setValue('phone', department.phone || '');
    setValue('email', department.email || '');
    setValue('is_active', department.is_active ? 'true' : 'false');

    setModalVisible(true);
  };

  const handleDelete = (department) => {
    setSelectedDepartment(department);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/departments/${selectedDepartment.id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleToggleStatus = async (department) => {
    try {
      await api.post(`/departments/${department.id}/toggle-status`);
      toast.success('Department status updated successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update department status');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedDepartment(null);
    reset();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const getStatusBadge = (isActive) => {
    return (
      <CBadge color={isActive ? 'success' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </CBadge>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: 5 }).map((_, colIndex) => (
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
              <CIcon icon={cilBuilding} className="me-2" />
              Departments Management
            </strong>
            <CButtonGroup>
              <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <CIcon icon={cilFilter} className="me-2" />Filters
              </CButton>
              <CButton color="primary" onClick={() => setModalVisible(true)}>
                <CIcon icon={cilPlus} className="me-2" />Add Department
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
                    placeholder="Search by name, description, or head..."
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
                      <option value="inactive">Inactive</option>
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
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-lg-table-cell">Head of Department</CTableHeaderCell>
                    <CTableHeaderCell className="d-none d-md-table-cell">Contact</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : departments.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center py-5">
                        <div className="text-medium-emphasis">
                          <CIcon icon={cilBuilding} size="3xl" className="mb-3 opacity-25" />
                          <p className="mb-0">No departments found</p>
                          {(searchTerm || filterStatus) && (
                            <small className="text-muted">Try adjusting your filters</small>
                          )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    departments.map((department) => (
                      <CTableRow key={department.id}>
                        <CTableDataCell>
                          <div>
                            <strong>{department.name}</strong>
                            {department.description && (
                              <div className="small text-muted">{department.description}</div>
                            )}
                            <div className="d-lg-none small text-muted mt-1">
                              {department.head?.user ? `Dr. ${department.head.user.name}` : 'Not Assigned'}
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-lg-table-cell">
                          {department.head?.user
                            ? `Dr. ${department.head.user.name}`
                            : 'Not Assigned'}
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-md-table-cell">
                          {department.phone && <div>{department.phone}</div>}
                          {department.email && <div className="small text-muted">{department.email}</div>}
                          {!department.phone && !department.email && 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{getStatusBadge(department.is_active)}</CTableDataCell>
                        <CTableDataCell>
                          <CButtonGroup size="sm">
                            <CButton
                              color={department.is_active ? 'warning' : 'success'}
                              variant="ghost"
                              onClick={() => handleToggleStatus(department)}
                              title={department.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <CIcon icon={department.is_active ? cilXCircle : cilCheckCircle} />
                            </CButton>
                            <CButton
                              color="info"
                              variant="ghost"
                              onClick={() => handleEdit(department)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDelete(department)}
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
            {!loading && departments.length > 0 && <PaginationControl />}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilBuilding} className="me-2" />
            {editMode ? 'Edit Department' : 'Add New Department'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Department Name *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="e.g., Cardiology"
                    {...register('name', { required: 'Department name is required' })}
                    invalid={!!errors.name}
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">{errors.name.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Description</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    placeholder="Brief description of the department"
                    {...register('description')}
                  />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Head of Department</CFormLabel>
                  <CFormSelect {...register('head_of_department')}>
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user?.name} - {doctor.specialization}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Phone</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="Department phone number"
                    {...register('phone')}
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    placeholder="department@hospital.com"
                    {...register('email')}
                  />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    {...register('is_active', { required: 'Status is required' })}
                    invalid={!!errors.is_active}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </CFormSelect>
                  {errors.is_active && (
                    <div className="invalid-feedback d-block">{errors.is_active.message}</div>
                  )}
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
            Are you sure you want to delete the department{' '}
            <strong>{selectedDepartment?.name}</strong>?
          </p>
          {selectedDepartment?.doctors?.length > 0 && (
            <div className="alert alert-warning mt-3 mb-0">
              Warning: This department has assigned doctors. Please reassign them first.
            </div>
          )}
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

export default DepartmentsPage;