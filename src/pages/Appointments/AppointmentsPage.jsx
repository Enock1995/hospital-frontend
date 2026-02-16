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
  CButtonGroup,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilSearch, cilCalendar, cilX, cilFilter, cilWarning } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, appointment: null });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [currentPage, searchTerm, filterStatus, allAppointments]);

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
      setAllAppointments(extractData(appointmentsRes.data));
      setPatients(extractData(patientsRes.data));
      setDoctors(extractData(doctorsRes.data));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
      setAllAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allAppointments];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => {
        const patientName = `${apt.patient?.first_name} ${apt.patient?.last_name}`.toLowerCase();
        const doctorName = apt.doctor?.user?.name?.toLowerCase() || '';
        return patientName.includes(search) || doctorName.includes(search);
      });
    }
    
    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(apt => apt.status === filterStatus);
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
    
    setAppointments(paginatedData);
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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <CTableRow key={rowIndex}>
          {Array.from({ length: 7 }).map((_, colIndex) => (
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
    <>
      <CRow>
        <CCol>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <strong className="fs-5">
                <CIcon icon={cilCalendar} className="me-2" />Appointments Management
              </strong>
              <CButtonGroup>
                <CButton color="info" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <CIcon icon={cilFilter} className="me-2" />Filters
                </CButton>
                <CButton color="primary" onClick={openAddModal}>
                  <CIcon icon={cilPlus} className="me-2" />Book Appointment
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
                      placeholder="Search by patient or doctor..." 
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
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
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
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Patient</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-lg-table-cell">Doctor</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-md-table-cell">Date</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-md-table-cell">Time</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <LoadingSkeleton />
                    ) : appointments.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center py-5">
                          <div className="text-medium-emphasis">
                            <CIcon icon={cilCalendar} size="3xl" className="mb-3 opacity-25" />
                            <p className="mb-0">No appointments found</p>
                            {(searchTerm || filterStatus) && (
                              <small className="text-muted">Try adjusting your filters</small>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      appointments.map(apt => (
                        <CTableRow key={apt.id}>
                          <CTableDataCell>#{apt.id}</CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{apt.patient?.first_name} {apt.patient?.last_name}</strong>
                              <div className="d-lg-none small text-muted">
                                {apt.doctor?.user?.name || 'N/A'}
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-lg-table-cell">
                            {apt.doctor?.user?.name || 'N/A'}
                            <br /><small className="text-muted">{apt.doctor?.specialization}</small>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">
                            {apt.appointment_date ? apt.appointment_date.split(' ')[0] : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell">
                            {apt.appointment_date ? apt.appointment_date.split(' ')[1]?.substring(0, 5) : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>{getStatusBadge(apt.status)}</CTableDataCell>
                          <CTableDataCell>
                            <CButtonGroup size="sm">
                              <CButton color="info" variant="ghost" onClick={() => openEditModal(apt)}>
                                <CIcon icon={cilPencil} />
                              </CButton>
                              {apt.status === 'scheduled' && (
                                <CButton color="warning" variant="ghost" onClick={() => handleCancel(apt.id)}>
                                  <CIcon icon={cilX} />
                                </CButton>
                              )}
                              <CButton color="danger" variant="ghost" onClick={() => setDeleteModal({ show: true, appointment: apt })}>
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
              {!loading && appointments.length > 0 && <PaginationControl />}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
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
      <CModal visible={deleteModal.show} onClose={() => setDeleteModal({ show: false, appointment: null })} alignment="center">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2 text-danger" />Confirm Delete
          </CModalTitle>
        </CModalHeader>
        <CModalBody><p className="mb-0">Delete this appointment? This cannot be undone.</p></CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ show: false, appointment: null })}>Cancel</CButton>
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

export default AppointmentsPage;