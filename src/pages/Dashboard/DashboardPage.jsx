// src/pages/Dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CWidgetStatsF,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilMedicalCross,
  cilCalendar,
  cilMoney,
  cilChartLine,
  cilArrowRight,
} from '@coreui/icons';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/appointments'),
      ]);

      const patients = patientsRes.data.data || patientsRes.data;
      const doctors = doctorsRes.data.data || doctorsRes.data;
      const appointments = appointmentsRes.data.data || appointmentsRes.data;

      // Calculate statistics
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = Array.isArray(appointments)
        ? appointments.filter((apt) => apt.appointment_date?.startsWith(today))
        : [];
      
      const pendingAppointments = Array.isArray(appointments)
        ? appointments.filter((apt) => apt.status === 'pending')
        : [];

      // Get recent appointments (last 5)
      const sortedAppointments = Array.isArray(appointments)
        ? [...appointments].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          ).slice(0, 5)
        : [];

      // Get recent patients (last 5)
      const sortedPatients = Array.isArray(patients)
        ? [...patients].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          ).slice(0, 5)
        : [];

      setStats({
        totalPatients: Array.isArray(patients) ? patients.length : 0,
        totalDoctors: Array.isArray(doctors) ? doctors.length : 0,
        todayAppointments: todayAppointments.length,
        pendingAppointments: pendingAppointments.length,
        totalRevenue: 0, // Will be calculated from invoices module
        monthlyRevenue: 0,
      });

      setRecentAppointments(sortedAppointments);
      setRecentPatients(sortedPatients);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      confirmed: { color: 'info', label: 'Confirmed' },
      completed: { color: 'success', label: 'Completed' },
      cancelled: { color: 'danger', label: 'Cancelled' },
    };
    const config = statusConfig[status] || { color: 'secondary', label: status };
    return <CBadge color={config.color}>{config.label}</CBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <CRow className="mb-4">
        <CCol>
          <h2>Hospital Dashboard</h2>
          <p className="text-medium-emphasis">
            Overview of your hospital management system
          </p>
        </CCol>
      </CRow>

      {/* Statistics Cards */}
      <CRow className="g-4 mb-4">
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="primary"
            icon={<CIcon icon={cilPeople} height={24} />}
            title="Total Patients"
            value={stats.totalPatients.toString()}
            footer={
              <CButton
                color="primary"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/patients')}
              >
                View All <CIcon icon={cilArrowRight} />
              </CButton>
            }
          />
        </CCol>

        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="success"
            icon={<CIcon icon={cilMedicalCross} height={24} />}
            title="Total Doctors"
            value={stats.totalDoctors.toString()}
            footer={
              <CButton
                color="success"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/doctors')}
              >
                View All <CIcon icon={cilArrowRight} />
              </CButton>
            }
          />
        </CCol>

        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="warning"
            icon={<CIcon icon={cilCalendar} height={24} />}
            title="Today's Appointments"
            value={stats.todayAppointments.toString()}
            footer={
              <CButton
                color="warning"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/appointments')}
              >
                View All <CIcon icon={cilArrowRight} />
              </CButton>
            }
          />
        </CCol>

        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="info"
            icon={<CIcon icon={cilChartLine} height={24} />}
            title="Pending Appointments"
            value={stats.pendingAppointments.toString()}
            footer={
              <CButton
                color="info"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/appointments')}
              >
                View All <CIcon icon={cilArrowRight} />
              </CButton>
            }
          />
        </CCol>
      </CRow>

      {/* Recent Data Tables */}
      <CRow className="g-4">
        {/* Recent Appointments */}
        <CCol xs={12} lg={6}>
          <CCard>
            <CCardHeader>
              <strong>Recent Appointments</strong>
            </CCardHeader>
            <CCardBody>
              {recentAppointments.length === 0 ? (
                <p className="text-center text-muted py-3">
                  No appointments yet. Book your first appointment!
                </p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Patient</CTableHeaderCell>
                      <CTableHeaderCell>Doctor</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentAppointments.map((appointment) => (
                      <CTableRow key={appointment.id}>
                        <CTableDataCell>
                          {appointment.patient?.first_name && appointment.patient?.last_name
                            ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {appointment.doctor?.name || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(appointment.appointment_date)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {getStatusBadge(appointment.status)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
              <div className="text-center mt-3">
                <CButton
                  color="primary"
                  variant="outline"
                  onClick={() => navigate('/appointments')}
                >
                  View All Appointments
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Recent Patients */}
        <CCol xs={12} lg={6}>
          <CCard>
            <CCardHeader>
              <strong>Recent Patients</strong>
            </CCardHeader>
            <CCardBody>
              {recentPatients.length === 0 ? (
                <p className="text-center text-muted py-3">
                  No patients registered yet. Add your first patient!
                </p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Phone</CTableHeaderCell>
                      <CTableHeaderCell>Registered</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentPatients.map((patient) => (
                      <CTableRow key={patient.id}>
                        <CTableDataCell>
                          {patient.first_name} {patient.last_name}
                        </CTableDataCell>
                        <CTableDataCell>{patient.phone || 'N/A'}</CTableDataCell>
                        <CTableDataCell>
                          {formatDate(patient.created_at)}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
              <div className="text-center mt-3">
                <CButton
                  color="primary"
                  variant="outline"
                  onClick={() => navigate('/patients')}
                >
                  View All Patients
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Quick Actions */}
      <CRow className="mt-4">
        <CCol>
          <CCard>
            <CCardHeader>
              <strong>Quick Actions</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol xs={12} sm={6} md={3}>
                  <CButton
                    color="primary"
                    className="w-100"
                    onClick={() => navigate('/patients')}
                  >
                    <CIcon icon={cilPeople} className="me-2" />
                    Add Patient
                  </CButton>
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CButton
                    color="success"
                    className="w-100"
                    onClick={() => navigate('/appointments')}
                  >
                    <CIcon icon={cilCalendar} className="me-2" />
                    Book Appointment
                  </CButton>
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CButton
                    color="info"
                    className="w-100"
                    onClick={() => navigate('/doctors')}
                  >
                    <CIcon icon={cilMedicalCross} className="me-2" />
                    Manage Doctors
                  </CButton>
                </CCol>
                <CCol xs={12} sm={6} md={3}>
                  <CButton
                    color="warning"
                    className="w-100"
                    onClick={() => navigate('/medical-records')}
                  >
                    <CIcon icon={cilChartLine} className="me-2" />
                    Medical Records
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default DashboardPage;