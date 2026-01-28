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
import { cilPlus, cilPencil, cilTrash, cilMedicalCross } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');

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

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions');
      const data = response.data.data || response.data;
      setPrescriptions(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
      setPrescriptions([]);
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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Prescriptions Management</strong>
            <CButton color="primary" onClick={() => setModalVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Prescription
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
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Doctor</CTableHeaderCell>
                    <CTableHeaderCell>Medication</CTableHeaderCell>
                    <CTableHeaderCell>Dosage</CTableHeaderCell>
                    <CTableHeaderCell>Frequency</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {prescriptions.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center">
                        No prescriptions found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    prescriptions.map((prescription) => (
                      <CTableRow key={prescription.id}>
                        <CTableDataCell>{formatDate(prescription.prescribed_date)}</CTableDataCell>
                        <CTableDataCell>
                          {prescription.patient
                            ? `${prescription.patient.first_name} ${prescription.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {prescription.doctor?.user
                            ? `Dr. ${prescription.doctor.user.name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{prescription.medication_name}</CTableDataCell>
                        <CTableDataCell>{prescription.dosage}</CTableDataCell>
                        <CTableDataCell>{prescription.frequency}</CTableDataCell>
                        <CTableDataCell>{prescription.duration_days} days</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(prescription.status)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(prescription)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(prescription)}
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
          Are you sure you want to delete this prescription for{' '}
          <strong>{selectedPrescription?.medication_name}</strong>?
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

export default PrescriptionsPage;