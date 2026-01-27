// FILE: src/views/medical-records/MedicalRecords.js
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
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CAlert,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilSearch,
  cilMedicalCross,
  cilNotes,
} from '@coreui/icons';
import axios from 'axios';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    visit_date: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    vital_signs: {
      temperature: '',
      blood_pressure: '',
      heart_rate: '',
      respiratory_rate: '',
      weight: '',
      height: '',
    },
  });

  const API_URL = 'http://localhost:8000/api/v1';

  const extractData = (response) => {
    let data = response.data || response;
    if (data && data.data && Array.isArray(data.data)) data = data.data;
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, [filterPatient, filterDoctor, searchTerm]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterPatient) params.append('patient_id', filterPatient);
      if (filterDoctor) params.append('doctor_id', filterDoctor);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/medical-records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(extractData(response));
    } catch (error) {
      showAlert('Failed to fetch medical records', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(extractData(response));
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(extractData(response));
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(extractData(response));
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: '', color: 'success' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_id: '',
      visit_date: '',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      notes: '',
      vital_signs: {
        temperature: '',
        blood_pressure: '',
        heart_rate: '',
        respiratory_rate: '',
        weight: '',
        height: '',
      },
    });
    setCurrentRecord(null);
    setIsEditing(false);
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setIsEditing(true);
      setCurrentRecord(record);
      setFormData({
        patient_id: record.patient_id || '',
        doctor_id: record.doctor_id || '',
        appointment_id: record.appointment_id || '',
        visit_date: record.visit_date || '',
        diagnosis: record.diagnosis || '',
        symptoms: record.symptoms || '',
        treatment: record.treatment || '',
        notes: record.notes || '',
        vital_signs: record.vital_signs || {
          temperature: '',
          blood_pressure: '',
          heart_rate: '',
          respiratory_rate: '',
          weight: '',
          height: '',
        },
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalSignChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vital_signs: { ...prev.vital_signs, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Build vital signs as indexed array of key-value pairs
      const vitalSignsObj = formData.vital_signs;
      const hasAnyVitals = Object.values(vitalSignsObj).some(val => val !== '');
      
      let vitalSignsArray = null;
      if (hasAnyVitals) {
        vitalSignsArray = [];
        if (vitalSignsObj.temperature) vitalSignsArray.push({ key: 'temperature', value: vitalSignsObj.temperature });
        if (vitalSignsObj.blood_pressure) vitalSignsArray.push({ key: 'blood_pressure', value: vitalSignsObj.blood_pressure });
        if (vitalSignsObj.heart_rate) vitalSignsArray.push({ key: 'heart_rate', value: vitalSignsObj.heart_rate });
        if (vitalSignsObj.respiratory_rate) vitalSignsArray.push({ key: 'respiratory_rate', value: vitalSignsObj.respiratory_rate });
        if (vitalSignsObj.weight) vitalSignsArray.push({ key: 'weight', value: vitalSignsObj.weight });
        if (vitalSignsObj.height) vitalSignsArray.push({ key: 'height', value: vitalSignsObj.height });
      }
      
      const submitData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_id: formData.appointment_id || null,
        visit_date: formData.visit_date,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        treatment: formData.treatment,
        notes: formData.notes,
        vital_signs: vitalSignsArray,
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEditing) {
        await axios.put(`${API_URL}/medical-records/${currentRecord.id}`, submitData, config);
        showAlert('Medical record updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/medical-records`, submitData, config);
        showAlert('Medical record created successfully', 'success');
      }

      handleCloseModal();
      fetchRecords();
    } catch (error) {
      console.log('FULL ERROR:', error.response?.data);
      console.log('SUBMITTED DATA:', error.config?.data);
      const errorMessage = error.response?.data?.message || 'Operation failed';
      showAlert(errorMessage, 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/medical-records/${currentRecord.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert('Medical record deleted successfully', 'success');
      setDeleteModalVisible(false);
      fetchRecords();
    } catch (error) {
      showAlert('Failed to delete medical record', 'danger');
    }
  };

  const handleViewRecord = (record) => {
    setCurrentRecord(record);
    setViewModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPatientName = (patient) => {
    if (!patient) return 'N/A';
    return `${patient.first_name} ${patient.last_name}`;
  };

  const getDoctorName = (doctor) => {
    if (!doctor || !doctor.user) return 'N/A';
    return doctor.user.name;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <strong>
                <CIcon icon={cilMedicalCross} className="me-2" />
                Medical Records
              </strong>
              <CButton color="primary" onClick={() => handleOpenModal()}>
                <CIcon icon={cilPlus} className="me-1" />
                Add New Record
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {alert.show && (
              <CAlert color={alert.color} dismissible onClose={() => setAlert({ ...alert, show: false })}>
                {alert.message}
              </CAlert>
            )}

            {/* Filters */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Search diagnosis or symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CFormSelect value={filterPatient} onChange={(e) => setFilterPatient(e.target.value)}>
                  <option value="">All Patients</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {getPatientName(patient)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormSelect value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
                  <option value="">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {getDoctorName(doctor)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Visit Date</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Doctor</CTableHeaderCell>
                    <CTableHeaderCell>Diagnosis</CTableHeaderCell>
                    <CTableHeaderCell>Symptoms</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {records.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center">
                        No medical records found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    records.map((record) => (
                      <CTableRow key={record.id}>
                        <CTableDataCell>{formatDate(record.visit_date)}</CTableDataCell>
                        <CTableDataCell>{getPatientName(record.patient)}</CTableDataCell>
                        <CTableDataCell>Dr. {getDoctorName(record.doctor)}</CTableDataCell>
                        <CTableDataCell>
                          {record.diagnosis?.substring(0, 50)}
                          {record.diagnosis?.length > 50 ? '...' : ''}
                        </CTableDataCell>
                        <CTableDataCell>
                          {record.symptoms?.substring(0, 40) || 'N/A'}
                          {record.symptoms?.length > 40 ? '...' : ''}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewRecord(record)}
                          >
                            <CIcon icon={cilNotes} />
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(record)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => {
                              setCurrentRecord(record);
                              setDeleteModalVisible(true);
                            }}
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

      {/* Create/Edit Modal */}
      <CModal size="xl" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>{isEditing ? 'Edit Medical Record' : 'Create Medical Record'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Patient *</CFormLabel>
                  <CFormSelect
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {getPatientName(patient)} - {patient.phone}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Doctor *</CFormLabel>
                  <CFormSelect
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {getDoctorName(doctor)} - {doctor.specialization}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Visit Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Appointment (Optional)</CFormLabel>
                  <CFormSelect
                    name="appointment_id"
                    value={formData.appointment_id}
                    onChange={handleInputChange}
                  >
                    <option value="">No Appointment</option>
                    {appointments.map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {formatDate(appointment.appointment_date)} - {getPatientName(appointment.patient)}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel>Symptoms</CFormLabel>
              <CFormTextarea
                name="symptoms"
                rows={2}
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="Patient reported symptoms..."
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Diagnosis *</CFormLabel>
              <CFormTextarea
                name="diagnosis"
                rows={3}
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Medical diagnosis..."
                required
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Treatment</CFormLabel>
              <CFormTextarea
                name="treatment"
                rows={3}
                value={formData.treatment}
                onChange={handleInputChange}
                placeholder="Treatment plan and procedures..."
              />
            </div>

            <h6 className="mb-3 mt-4">Vital Signs</h6>
            <CRow>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>Temperature (°C)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.vital_signs.temperature}
                    onChange={handleVitalSignChange}
                    placeholder="36.5"
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>Blood Pressure</CFormLabel>
                  <CFormInput
                    type="text"
                    name="blood_pressure"
                    value={formData.vital_signs.blood_pressure}
                    onChange={handleVitalSignChange}
                    placeholder="120/80"
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>Heart Rate (bpm)</CFormLabel>
                  <CFormInput
                    type="number"
                    name="heart_rate"
                    value={formData.vital_signs.heart_rate}
                    onChange={handleVitalSignChange}
                    placeholder="72"
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>Respiratory Rate</CFormLabel>
                  <CFormInput
                    type="number"
                    name="respiratory_rate"
                    value={formData.vital_signs.respiratory_rate}
                    onChange={handleVitalSignChange}
                    placeholder="16"
                  />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Weight (kg)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.vital_signs.weight}
                    onChange={handleVitalSignChange}
                    placeholder="70.5"
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Height (cm)</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.1"
                    name="height"
                    value={formData.vital_signs.height}
                    onChange={handleVitalSignChange}
                    placeholder="175"
                  />
                </div>
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel>Additional Notes</CFormLabel>
              <CFormTextarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes..."
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit">
              {isEditing ? 'Update' : 'Create'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* View Modal */}
      <CModal size="lg" visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Medical Record Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {currentRecord && (
            <>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Patient:</strong> {getPatientName(currentRecord.patient)}
                </CCol>
                <CCol md={6}>
                  <strong>Doctor:</strong> Dr. {getDoctorName(currentRecord.doctor)}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Visit Date:</strong> {formatDate(currentRecord.visit_date)}
                </CCol>
                <CCol md={6}>
                  <strong>Appointment:</strong>{' '}
                  {currentRecord.appointment ? `#${currentRecord.appointment.id}` : 'Walk-in'}
                </CCol>
              </CRow>

              <hr />
              <h6>Symptoms</h6>
              <p>{currentRecord.symptoms || 'N/A'}</p>

              <h6>Diagnosis</h6>
              <p>{currentRecord.diagnosis || 'N/A'}</p>

              <h6>Treatment</h6>
              <p>{currentRecord.treatment || 'N/A'}</p>

              {currentRecord.vital_signs && (
                <>
                  <hr />
                  <h6>Vital Signs</h6>
                  <CRow>
                    <CCol md={3}>
                      <strong>Temperature:</strong> {currentRecord.vital_signs.temperature || 'N/A'} °C
                    </CCol>
                    <CCol md={3}>
                      <strong>BP:</strong> {currentRecord.vital_signs.blood_pressure || 'N/A'}
                    </CCol>
                    <CCol md={3}>
                      <strong>Heart Rate:</strong> {currentRecord.vital_signs.heart_rate || 'N/A'} bpm
                    </CCol>
                    <CCol md={3}>
                      <strong>Resp. Rate:</strong> {currentRecord.vital_signs.respiratory_rate || 'N/A'}
                    </CCol>
                  </CRow>
                  <CRow className="mt-2">
                    <CCol md={6}>
                      <strong>Weight:</strong> {currentRecord.vital_signs.weight || 'N/A'} kg
                    </CCol>
                    <CCol md={6}>
                      <strong>Height:</strong> {currentRecord.vital_signs.height || 'N/A'} cm
                    </CCol>
                  </CRow>
                </>
              )}

              {currentRecord.notes && (
                <>
                  <hr />
                  <h6>Additional Notes</h6>
                  <p>{currentRecord.notes}</p>
                </>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this medical record? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default MedicalRecords;