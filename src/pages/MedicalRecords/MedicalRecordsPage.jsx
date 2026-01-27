// src/pages/MedicalRecords/MedicalRecordsPage.jsx
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilNotes } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, record: null });

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

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical-records');
      let data = response.data.data || response.data;
      if (data && data.data && Array.isArray(data.data)) data = data.data;
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to load medical records');
      setRecords([]);
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

  const filteredRecords = records.filter((record) => {
    const search = searchTerm.toLowerCase();
    const patientName = record.patient ? `${record.patient.first_name} ${record.patient.last_name}`.toLowerCase() : '';
    const doctorName = record.doctor?.user?.name?.toLowerCase() || '';
    return (
      patientName.includes(search) ||
      doctorName.includes(search) ||
      record.diagnosis?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <CRow className="align-items-center">
                <CCol>
                  <h4 className="mb-0">
                    <CIcon icon={cilNotes} className="me-2" />
                    Medical Records
                  </h4>
                </CCol>
                <CCol xs="auto">
                  <CButton color="primary" onClick={openAddModal}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Record
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                    <CFormInput
                      placeholder="Search by patient, doctor, diagnosis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="text-end">
                  <p className="text-medium-emphasis mb-0">
                    Total Records: <strong>{records.length}</strong>
                  </p>
                </CCol>
              </CRow>

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Loading records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">
                    {searchTerm ? 'No records found.' : 'No medical records yet.'}
                  </p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Patient</CTableHeaderCell>
                      <CTableHeaderCell>Doctor</CTableHeaderCell>
                      <CTableHeaderCell>Visit Date</CTableHeaderCell>
                      <CTableHeaderCell>Diagnosis</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredRecords.map((record) => (
                      <CTableRow key={record.id}>
                        <CTableDataCell>#{record.id}</CTableDataCell>
                        <CTableDataCell>
                          {record.patient ? `${record.patient.first_name} ${record.patient.last_name}` : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {record.doctor?.user?.name || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(record.visit_date).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="info">{record.diagnosis || 'N/A'}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" size="sm" className="me-2" onClick={() => openEditModal(record)}>
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" onClick={() => setDeleteModal({ show: true, record })}>
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={showModal} onClose={() => setShowModal(false)}>
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
      <CModal visible={deleteModal.show} onClose={() => setDeleteModal({ show: false, record: null })}>
        <CModalHeader><CModalTitle>Confirm Delete</CModalTitle></CModalHeader>
        <CModalBody>Are you sure you want to delete this medical record? This action cannot be undone.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ show: false, record: null })}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default MedicalRecordsPage;