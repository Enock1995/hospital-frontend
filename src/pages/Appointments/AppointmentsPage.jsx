// src/pages/Appointments/AppointmentsPage.jsx
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
import { cilPlus, cilPencil, cilTrash, cilSearch, cilCalendar, cilX } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, appointment: null });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const extractData = (response) => {
    let data = response.data || response;
    if (data && data.data && Array.isArray(data.data)) data = data.data;
    return Array.isArray(data) ? data : [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/doctors'),
      ]);
      setAppointments(extractData(appointmentsRes.data));
      setPatients(extractData(patientsRes.data));
      setDoctors(extractData(doctorsRes.data));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAppointment(null);
    reset({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      type: 'consultation',
      reason: '',
      notes: '',
      duration: '30',
    });
    setShowModal(true);
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    const date = appointment.appointment_date ? appointment.appointment_date.split(' ')[0] : '';
    const time = appointment.appointment_date ? appointment.appointment_date.split(' ')[1]?.substring(0, 5) : '';
    reset({
      patient_id: appointment.patient_id || '',
      doctor_id: appointment.doctor_id || '',
      appointment_date: date,
      appointment_time: time,
      type: appointment.type || 'consultation',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      duration: appointment.duration || '30',
      status: appointment.status || 'scheduled',
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, data);
        toast.success('Appointment updated!');
      } else {
        await api.post('/appointments', data);
        toast.success('Appointment booked!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save appointment');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.appointment) return;
    try {
      await api.delete(`/appointments/${deleteModal.appointment.id}`);
      toast.success('Appointment deleted!');
      setDeleteModal({ show: false, appointment: null });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled!');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const search = searchTerm.toLowerCase();
    const patientName = `${apt.patient?.first_name} ${apt.patient?.last_name}`.toLowerCase();
    const doctorName = apt.doctor?.user?.name?.toLowerCase() || '';
    return patientName.includes(search) || doctorName.includes(search);
  });

  const getStatusBadge = (status) => {
    const colors = { 
      scheduled: 'primary', 
      confirmed: 'info', 
      in_progress: 'warning',
      completed: 'success', 
      cancelled: 'danger',
      no_show: 'secondary'
    };
    return <CBadge color={colors[status] || 'secondary'}>{status?.replace('_', ' ')}</CBadge>;
  };

  return (
    <>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <CRow className="align-items-center">
                <CCol><h4 className="mb-0"><CIcon icon={cilCalendar} className="me-2" />Appointments Management</h4></CCol>
                <CCol xs="auto"><CButton color="primary" onClick={openAddModal}><CIcon icon={cilPlus} className="me-2" />Book Appointment</CButton></CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                    <CFormInput placeholder="Search by patient or doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="text-end">
                  <p className="text-medium-emphasis mb-0">Total Appointments: <strong>{appointments.length}</strong></p>
                </CCol>
              </CRow>

              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /><p className="mt-2">Loading...</p></div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-5"><p className="text-muted">{searchTerm ? 'No appointments found.' : 'No appointments yet. Book your first appointment!'}</p></div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Patient</CTableHeaderCell>
                      <CTableHeaderCell>Doctor</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Time</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredAppointments.map(apt => (
                      <CTableRow key={apt.id}>
                        <CTableDataCell>#{apt.id}</CTableDataCell>
                        <CTableDataCell><strong>{apt.patient?.first_name} {apt.patient?.last_name}</strong></CTableDataCell>
                        <CTableDataCell>{apt.doctor?.user?.name || 'N/A'}<br /><small className="text-muted">{apt.doctor?.specialization}</small></CTableDataCell>
                        <CTableDataCell>{apt.appointment_date ? apt.appointment_date.split(' ')[0] : 'N/A'}</CTableDataCell>
                        <CTableDataCell>{apt.appointment_date ? apt.appointment_date.split(' ')[1]?.substring(0, 5) : 'N/A'}</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(apt.status)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" size="sm" className="me-2" onClick={() => openEditModal(apt)}><CIcon icon={cilPencil} /></CButton>
                          {apt.status === 'scheduled' && (
                            <CButton color="warning" size="sm" className="me-2" onClick={() => handleCancel(apt.id)}><CIcon icon={cilX} /></CButton>
                          )}
                          <CButton color="danger" size="sm" onClick={() => setDeleteModal({ show: true, appointment: apt })}><CIcon icon={cilTrash} /></CButton>
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
        <CModalHeader><CModalTitle>{editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}</CModalTitle></CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>Patient *</CFormLabel>
                <CFormSelect {...register('patient_id', { required: 'Patient is required' })} invalid={!!errors.patient_id}>
                  <option value="">Select patient</option>
                  {patients.map(p => (<option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>))}
                </CFormSelect>
                {errors.patient_id && <div className="invalid-feedback d-block">{errors.patient_id.message}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Doctor *</CFormLabel>
                <CFormSelect {...register('doctor_id', { required: 'Doctor is required' })} invalid={!!errors.doctor_id}>
                  <option value="">Select doctor</option>
                  {doctors.map(d => (<option key={d.id} value={d.id}>{d.user?.name} - {d.specialization}</option>))}
                </CFormSelect>
                {errors.doctor_id && <div className="invalid-feedback d-block">{errors.doctor_id.message}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Date *</CFormLabel>
                <CFormInput type="date" {...register('appointment_date', { required: 'Date is required' })} invalid={!!errors.appointment_date} />
                {errors.appointment_date && <div className="invalid-feedback d-block">{errors.appointment_date.message}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Time *</CFormLabel>
                <CFormInput type="time" {...register('appointment_time', { required: 'Time is required' })} invalid={!!errors.appointment_time} />
                {errors.appointment_time && <div className="invalid-feedback d-block">{errors.appointment_time.message}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Type *</CFormLabel>
                <CFormSelect {...register('type', { required: 'Type is required' })} invalid={!!errors.type}>
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="checkup">Checkup</option>
                </CFormSelect>
                {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Duration (minutes)</CFormLabel>
                <CFormSelect {...register('duration')}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </CFormSelect>
              </CCol>
              {editingAppointment && (
                <CCol md={6}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect {...register('status')}>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </CFormSelect>
                </CCol>
              )}
              <CCol md={12}>
                <CFormLabel>Reason for Visit *</CFormLabel>
                <CFormTextarea {...register('reason', { required: 'Reason is required' })} invalid={!!errors.reason} rows={2} placeholder="Describe the reason for appointment..." />
                {errors.reason && <div className="invalid-feedback d-block">{errors.reason.message}</div>}
              </CCol>
              <CCol md={12}>
                <CFormLabel>Additional Notes</CFormLabel>
                <CFormTextarea {...register('notes')} rows={2} placeholder="Any additional notes or special requirements..." />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><CSpinner size="sm" className="me-2" />Saving...</> : editingAppointment ? 'Update' : 'Book Appointment'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={deleteModal.show} onClose={() => setDeleteModal({ show: false, appointment: null })}>
        <CModalHeader><CModalTitle>Confirm Delete</CModalTitle></CModalHeader>
        <CModalBody>Delete this appointment? This cannot be undone.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ show: false, appointment: null })}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default AppointmentsPage;