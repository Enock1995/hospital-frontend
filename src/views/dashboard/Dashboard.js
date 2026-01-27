// src/views/dashboard/Dashboard.js
// Replace the DEFAULT CoreUI dashboard with this

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
  CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilMedicalCross,
  cilCalendar,
  cilChartLine,
  cilArrowRight,
} from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/appointments'),
      ]);

      const patients = extractData(patientsRes.data);
      const doctors = extractData(doctorsRes.data);
      const appointments = extractData(appointmentsRes.data);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => apt.appointment_date?.startsWith(today));
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        todayAppointments: todayAppointments.length,
        pendingAppointments: pendingAppointments.length,
      });

      setRecentAppointments(appointments.slice(0, 5));
      setRecentPatients(patients.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractData = (response) => {
    let data = response.data || response;
    if (data && data.data && Array.isArray(data.data)) data = data.data;
    return Array.isArray(data) ? data : [];
  };

  const getStatusBadge = (status) => {
    const colors = { pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'danger' };
    return <CBadge color={colors[status] || 'secondary'}>{status}</CBadge>;
  };

  if (loading) return <div className="text-center py-5"><CSpinner color="primary" /><p className="mt-2">Loading...</p></div>;

  return (
    <>
      <CRow className="mb-4">
        <CCol><h2>Hospital Dashboard</h2><p className="text-muted">Overview of your hospital management system</p></CCol>
      </CRow>

      <CRow className="g-4 mb-4">
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF color="primary" icon={<CIcon icon={cilPeople} height={24} />} title="Total Patients" value={stats.totalPatients.toString()} 
            footer={<CButton color="primary" variant="ghost" size="sm" onClick={() => navigate('/patients')}>View All <CIcon icon={cilArrowRight} /></CButton>} />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF color="success" icon={<CIcon icon={cilMedicalCross} height={24} />} title="Total Doctors" value={stats.totalDoctors.toString()} 
            footer={<CButton color="success" variant="ghost" size="sm" onClick={() => navigate('/doctors')}>View All <CIcon icon={cilArrowRight} /></CButton>} />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF color="warning" icon={<CIcon icon={cilCalendar} height={24} />} title="Today's Appointments" value={stats.todayAppointments.toString()} 
            footer={<CButton color="warning" variant="ghost" size="sm" onClick={() => navigate('/appointments')}>View All <CIcon icon={cilArrowRight} /></CButton>} />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF color="info" icon={<CIcon icon={cilChartLine} height={24} />} title="Pending Appointments" value={stats.pendingAppointments.toString()} 
            footer={<CButton color="info" variant="ghost" size="sm" onClick={() => navigate('/appointments')}>View All <CIcon icon={cilArrowRight} /></CButton>} />
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol xs={12} lg={6}>
          <CCard>
            <CCardHeader><strong>Recent Appointments</strong></CCardHeader>
            <CCardBody>
              {recentAppointments.length === 0 ? (
                <p className="text-center text-muted py-3">No appointments yet</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Patient</CTableHeaderCell>
                      <CTableHeaderCell>Doctor</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentAppointments.map(apt => (
                      <CTableRow key={apt.id}>
                        <CTableDataCell>{apt.patient?.first_name} {apt.patient?.last_name}</CTableDataCell>
                        <CTableDataCell>{apt.doctor?.user?.name}</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(apt.status)}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={6}>
          <CCard>
            <CCardHeader><strong>Recent Patients</strong></CCardHeader>
            <CCardBody>
              {recentPatients.length === 0 ? (
                <p className="text-center text-muted py-3">No patients yet</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Phone</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentPatients.map(patient => (
                      <CTableRow key={patient.id}>
                        <CTableDataCell>{patient.first_name} {patient.last_name}</CTableDataCell>
                        <CTableDataCell>{patient.phone}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;