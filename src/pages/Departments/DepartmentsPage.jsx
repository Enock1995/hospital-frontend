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
  CFormSwitch,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilBuilding, cilCheckCircle, cilXCircle } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      const data = response.data.data || response.data;
      setDepartments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
      setDepartments([]);
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

  const onSubmit = async (data) => {
    try {
      // Convert is_active to boolean
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

  const getStatusBadge = (isActive) => {
    return (
      <CBadge color={isActive ? 'success' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </CBadge>
    );
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Departments Management</strong>
            <CButton color="primary" onClick={() => setModalVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Department
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Head of Department</CTableHeaderCell>
                    <CTableHeaderCell>Contact</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {departments.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No departments found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    departments.map((department) => (
                      <CTableRow key={department.id}>
                        <CTableDataCell>
                          <strong>{department.name}</strong>
                          {department.description && (
                            <>
                              <br />
                              <small className="text-muted">{department.description}</small>
                            </>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {department.head?.user
                            ? `Dr. ${department.head.user.name}`
                            : 'Not Assigned'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {department.phone && (
                            <>
                              {department.phone}
                              <br />
                            </>
                          )}
                          {department.email && (
                            <small className="text-muted">{department.email}</small>
                          )}
                          {!department.phone && !department.email && 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{getStatusBadge(department.is_active)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color={department.is_active ? 'warning' : 'success'}
                            size="sm"
                            className="me-2"
                            onClick={() => handleToggleStatus(department)}
                            title={department.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <CIcon icon={department.is_active ? cilXCircle : cilCheckCircle} />
                          </CButton>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(department)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(department)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
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
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the department{' '}
          <strong>{selectedDepartment?.name}</strong>?
          {selectedDepartment?.doctors?.length > 0 && (
            <div className="alert alert-warning mt-3">
              Warning: This department has assigned doctors. Please reassign them first.
            </div>
          )}
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
    </CRow>
  );
};

export default DepartmentsPage;