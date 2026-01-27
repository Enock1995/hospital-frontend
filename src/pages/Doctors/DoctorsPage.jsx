// src/pages/Doctors/DoctorsPage.jsx
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
import { cilPlus, cilPencil, cilTrash, cilSearch, cilMedicalCross } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, doctor: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/doctors');
      let data = response.data.data || response.data;
      // Handle paginated response
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
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
      password: '', // Leave empty for edit
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

  const filteredDoctors = doctors.filter((doctor) => {
    const search = searchTerm.toLowerCase();
    return (
      doctor.name?.toLowerCase().includes(search) ||
      doctor.email?.toLowerCase().includes(search) ||
      doctor.specialization?.toLowerCase().includes(search) ||
      doctor.phone?.includes(search)
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
                    <CIcon icon={cilMedicalCross} className="me-2" />
                    Doctors Management
                  </h4>
                </CCol>
                <CCol xs="auto">
                  <CButton color="success" onClick={openAddModal}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Doctor
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Search by name, specialization, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="text-end">
                  <p className="text-medium-emphasis mb-0">
                    Total Doctors: <strong>{doctors.length}</strong>
                  </p>
                </CCol>
              </CRow>

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="success" />
                  <p className="mt-2">Loading doctors...</p>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">
                    {searchTerm
                      ? 'No doctors found matching your search.'
                      : 'No doctors registered yet. Click "Add Doctor" to get started.'}
                  </p>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Specialization</CTableHeaderCell>
                      <CTableHeaderCell>Contact</CTableHeaderCell>
                      <CTableHeaderCell>Fee</CTableHeaderCell>
                      <CTableHeaderCell>Experience</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredDoctors.map((doctor) => (
                      <CTableRow key={doctor.id}>
                        <CTableDataCell>#{doctor.id}</CTableDataCell>
                        <CTableDataCell>
                          <strong>{doctor.user?.name || 'N/A'}</strong>
                          <br />
                          <small className="text-muted">{doctor.qualification}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="success">{doctor.specialization}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {doctor.phone}
                          <br />
                          <small className="text-muted">{doctor.user?.email || 'N/A'}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          ${doctor.consultation_fee || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {doctor.experience_years ? `${doctor.experience_years} yrs` : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(doctor)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => setDeleteModal({ show: true, doctor })}
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
            {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </CModalTitle>
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
                {errors.name && (
                  <div className="invalid-feedback d-block">{errors.name.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Email *</CFormLabel>
                <CFormInput
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  invalid={!!errors.email}
                  placeholder="doctor@hospital.com"
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email.message}</div>
                )}
              </CCol>

              {!editingDoctor && (
                <CCol md={6}>
                  <CFormLabel>Password *</CFormLabel>
                  <CFormInput
                    type="password"
                    {...register('password', { 
                      required: editingDoctor ? false : 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    invalid={!!errors.password}
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && (
                    <div className="invalid-feedback d-block">{errors.password.message}</div>
                  )}
                </CCol>
              )}

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
                <CFormLabel>License Number *</CFormLabel>
                <CFormInput
                  {...register('license_number', { required: 'License number is required' })}
                  invalid={!!errors.license_number}
                  placeholder="Medical license number"
                />
                {errors.license_number && (
                  <div className="invalid-feedback d-block">{errors.license_number.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Specialization *</CFormLabel>
                <CFormSelect
                  {...register('specialization', { required: 'Specialization is required' })}
                  invalid={!!errors.specialization}
                >
                  <option value="">Select specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Dentistry">Dentistry</option>
                  <option value="ENT">ENT</option>
                  <option value="Psychiatry">Psychiatry</option>
                </CFormSelect>
                {errors.specialization && (
                  <div className="invalid-feedback d-block">{errors.specialization.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Qualification *</CFormLabel>
                <CFormInput
                  {...register('qualification', { required: 'Qualification is required' })}
                  invalid={!!errors.qualification}
                  placeholder="MBBS, MD"
                />
                {errors.qualification && (
                  <div className="invalid-feedback d-block">{errors.qualification.message}</div>
                )}
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
                {errors.experience_years && (
                  <div className="invalid-feedback d-block">{errors.experience_years.message}</div>
                )}
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
                {errors.consultation_fee && (
                  <div className="invalid-feedback d-block">{errors.consultation_fee.message}</div>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Department (Optional)</CFormLabel>
                <CFormInput
                  {...register('department_id')}
                  placeholder="Leave empty if no department"
                  disabled
                />
                <small className="text-muted">Department feature coming soon</small>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton color="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : editingDoctor ? (
                'Update Doctor'
              ) : (
                'Add Doctor'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, doctor: null })}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete Dr. <strong>{deleteModal.doctor?.user?.name}</strong>? 
          This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeleteModal({ show: false, doctor: null })}
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

export default DoctorsPage;