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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilBed, cilCheckCircle } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const BedAssignmentsPage = () => {
  const [bedAssignments, setBedAssignments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [dischargeModalVisible, setDischargeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBedAssignment, setSelectedBedAssignment] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { register: registerDischarge, handleSubmit: handleSubmitDischarge, reset: resetDischarge, formState: { errors: errorsDischarge } } = useForm();

  useEffect(() => {
    fetchBedAssignments();
    fetchPatients();
  }, []);

  const fetchBedAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bed-assignments');
      const data = response.data.data || response.data;
      setBedAssignments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching bed assignments:', error);
      toast.error('Failed to fetch bed assignments');
      setBedAssignments([]);
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

  const getStatusBadge = (status) => {
    const colors = {
      occupied: 'success',
      discharged: 'secondary',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status}</CBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Bed Assignments Management</strong>
            <CButton color="primary" onClick={() => setModalVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" />
              Assign Bed
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
                    <CTableHeaderCell>Bed Number</CTableHeaderCell>
                    <CTableHeaderCell>Ward</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Admission Date</CTableHeaderCell>
                    <CTableHeaderCell>Discharge Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {bedAssignments.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center">
                        No bed assignments found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    bedAssignments.map((bedAssignment) => (
                      <CTableRow key={bedAssignment.id}>
                        <CTableDataCell>
                          <strong>{bedAssignment.bed_number}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{bedAssignment.ward || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          {bedAssignment.patient
                            ? `${bedAssignment.patient.first_name} ${bedAssignment.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{formatDateTime(bedAssignment.admission_date)}</CTableDataCell>
                        <CTableDataCell>{formatDateTime(bedAssignment.discharge_date)}</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(bedAssignment.status)}</CTableDataCell>
                        <CTableDataCell>
                          {bedAssignment.status === 'occupied' && (
                            <CButton
                              color="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleDischarge(bedAssignment)}
                              title="Discharge Patient"
                            >
                              <CIcon icon={cilCheckCircle} />
                            </CButton>
                          )}
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(bedAssignment)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(bedAssignment)}
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
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancel
            </CButton>
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
            <CButton color="secondary" onClick={handleCloseDischargeModal}>
              Cancel
            </CButton>
            <CButton color="warning" type="submit">
              Discharge Patient
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
          Are you sure you want to delete the bed assignment for bed{' '}
          <strong>{selectedBedAssignment?.bed_number}</strong>?
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

export default BedAssignmentsPage;