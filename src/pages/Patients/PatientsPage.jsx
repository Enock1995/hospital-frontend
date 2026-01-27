// src/pages/Patients/PatientsPage.jsx
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
import { cilPlus, cilPencil, cilTrash, cilSearch, cilUser } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, patient: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients');
      const data = response.data.data || response.data;
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPatient(null);
    reset({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      blood_group: '',
      emergency_contact_phone: '',
      emergency_contact_name: '',
      medical_history: '',
      allergies: '',
    });
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    reset({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      blood_group: patient.blood_group || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, data);
        toast.success('Patient updated successfully!');
      } else {
        await api.post('/patients', data);
        toast.success('Patient added successfully!');
      }
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      const message = error.response?.data?.message || 'Failed to save patient';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.patient) return;

    try {
      await api.delete(`/patients/${deleteModal.patient.id}`);
      toast.success('Patient deleted successfully!');
      setDeleteModal({ show: false, patient: null });
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return (
      fullName.includes(search) ||
      patient.email?.toLowerCase().includes(search) ||
      patient.phone?.includes(search)
    );
  });

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <CRow className="align-items-center">
                <CCol>
                  <h4 className="mb-0">
                    <CIcon icon={cilUser} className="me-2" />
                    Patients Management
                  </h4>
                </CCol>
                <CCol xs="auto">
                  <CButton color="primary" onClick={openAddModal}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Patient
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              {/* Search Bar */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="text-end">
                  <p className="text-medium-emphasis mb-0">
                    Total Patients: <strong>{patients.length}</strong>
                  </p>
                </CCol>
              </CRow>

              {/* Table */}
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">
                    {searchTerm
                      ? 'No patients found matching your search.'
                      : 'No patients registered yet. Click "Add Patient" to get started.'}
                  </p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Age/Gender</CTableHeaderCell>
                      <CTableHeaderCell>Contact</CTableHeaderCell>
                      <CTableHeaderCell>Blood Group</CTableHeaderCell>
                      <CTableHeaderCell>Registered</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredPatients.map((patient) => (
                      <CTableRow key={patient.id}>
                        <CTableDataCell>#{patient.id}</CTableDataCell>
                        <CTableDataCell>
                          <strong>{patient.first_name} {patient.last_name}</strong>
                          <br />
                          <small className="text-muted">{patient.email}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          {calculateAge(patient.date_of_birth)} yrs
                          {patient.gender && ` / ${patient.gender}`}
                        </CTableDataCell>
                        <CTableDataCell>{patient.phone || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          {patient.blood_group ? (
                            <CBadge color="info">{patient.blood_group}</CBadge>
                          ) : (
                            'N/A'
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(patient.created_at).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(patient)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => setDeleteModal({ show: true, patient })}
                          >
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
          <CModalTitle>
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>First Name *</CFormLabel>
                <CFormInput
                  {...register('first_name', { required: 'First name is required' })}
                  invalid={!!errors.first_name}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <div className="invalid-feedback d-block">{errors.first_name.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Last Name *</CFormLabel>
                <CFormInput
                  {...register('last_name', { required: 'Last name is required' })}
                  invalid={!!errors.last_name}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <div className="invalid-feedback d-block">{errors.last_name.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  invalid={!!errors.email}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Phone *</CFormLabel>
                <CFormInput
                  {...register('phone', { required: 'Phone is required' })}
                  invalid={!!errors.phone}
                  placeholder="Phone number"
                />
                {errors.phone && (
                  <div className="invalid-feedback d-block">{errors.phone.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Date of Birth *</CFormLabel>
                <CFormInput
                  type="date"
                  {...register('date_of_birth', { required: 'Date of birth is required' })}
                  invalid={!!errors.date_of_birth}
                />
                {errors.date_of_birth && (
                  <div className="invalid-feedback d-block">
                    {errors.date_of_birth.message}
                  </div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Gender *</CFormLabel>
                <CFormSelect
                  {...register('gender', { required: 'Gender is required' })}
                  invalid={!!errors.gender}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </CFormSelect>
                {errors.gender && (
                  <div className="invalid-feedback d-block">{errors.gender.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Blood Group</CFormLabel>
                <CFormSelect {...register('blood_group')}>
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </CFormSelect>
              </CCol>

              <CCol md={12}>
                <CFormLabel>Address</CFormLabel>
                <CFormTextarea
                  {...register('address')}
                  rows={2}
                  placeholder="Full address"
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Emergency Contact Name</CFormLabel>
                <CFormInput
                  {...register('emergency_contact_name')}
                  placeholder="Contact person name"
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Emergency Contact Phone</CFormLabel>
                <CFormInput
                  {...register('emergency_contact_phone')}
                  placeholder="Emergency phone"
                />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Medical History</CFormLabel>
                <CFormTextarea
                  {...register('medical_history')}
                  rows={2}
                  placeholder="Any existing conditions, allergies, or medical history..."
                />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Allergies</CFormLabel>
                <CFormTextarea
                  {...register('allergies')}
                  rows={2}
                  placeholder="List any known allergies (medications, food, etc.)..."
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : editingPatient ? (
                'Update Patient'
              ) : (
                'Add Patient'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, patient: null })}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete patient{' '}
          <strong>{deleteModal.patient?.first_name} {deleteModal.patient?.last_name}</strong>? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeleteModal({ show: false, patient: null })}
          >
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default PatientsPage;