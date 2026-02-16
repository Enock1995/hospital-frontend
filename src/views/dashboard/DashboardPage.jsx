import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilUserFollow,
  cilCalendar,
  cilMoney,
  cilBed,
  cilBeaker,
  cilBuilding,
  cilSpeedometer,
} from '@coreui/icons';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState({
    appointments: [],
    patients: [],
    labTests: [],
    invoices: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      const data = response.data.data || response.data;
      
      setStats(data);
      setRecentActivities(data.recent_activities || {});
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <CCard className="mb-4">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-medium-emphasis small text-uppercase fw-semibold">{title}</div>
            <div className={`fs-4 fw-semibold text-${color}`}>{value}</div>
            {subtitle && <div className="small text-medium-emphasis">{subtitle}</div>}
          </div>
          <div className={`bg-${color} bg-opacity-10 p-3 rounded`}>
            <CIcon icon={icon} size="xl" className={`text-${color}`} />
          </div>
        </div>
      </CCardBody>
    </CCard>
  );

  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAppointmentBadge = (status) => {
    const colors = {
      scheduled: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status}</CBadge>;
  };

  const getInvoiceBadge = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'danger',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status}</CBadge>;
  };

  const getLabTestBadge = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status.replace('_', ' ')}</CBadge>;
  };

  return (
    <div>
      {/* Overview Stats */}
      <CRow>
        <CCol sm={6} lg={3}>
          <StatCard
            title="Total Patients"
            value={stats?.overview?.total_patients || 0}
            icon={cilPeople}
            color="primary"
            subtitle={`${stats?.overview?.active_patients || 0} active`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <StatCard
            title="Total Doctors"
            value={stats?.overview?.total_doctors || 0}
            icon={cilUserFollow}
            color="success"
            subtitle={`${stats?.overview?.total_departments || 0} departments`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <StatCard
            title="Appointments Today"
            value={stats?.appointments?.today?.total || 0}
            icon={cilCalendar}
            color="warning"
            subtitle={`${stats?.appointments?.today?.completed || 0} completed`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.financial?.summary?.total_revenue)}
            icon={cilMoney}
            color="info"
            subtitle={`${formatCurrency(stats?.financial?.summary?.total_pending)} pending`}
          />
        </CCol>
      </CRow>

      {/* Secondary Stats */}
      <CRow>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-medium-emphasis small">Available Beds</div>
                  <div className="fs-5 fw-semibold">{stats?.beds?.available_beds || 0}</div>
                </div>
                <CIcon icon={cilBed} size="xl" className="text-success" />
              </div>
              <div className="small text-medium-emphasis mt-2">
                {stats?.beds?.occupied_beds || 0} occupied / {stats?.beds?.total_beds || 0} total
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-medium-emphasis small">Pending Lab Tests</div>
                  <div className="fs-5 fw-semibold">{stats?.lab_tests?.pending || 0}</div>
                </div>
                <CIcon icon={cilBeaker} size="xl" className="text-warning" />
              </div>
              <div className="small text-medium-emphasis mt-2">
                {stats?.lab_tests?.in_progress || 0} in progress
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-medium-emphasis small">Active Departments</div>
                  <div className="fs-5 fw-semibold">{stats?.overview?.total_departments || 0}</div>
                </div>
                <CIcon icon={cilBuilding} size="xl" className="text-info" />
              </div>
              <div className="small text-medium-emphasis mt-2">
                Hospital operations
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-medium-emphasis small">Bed Occupancy</div>
                  <div className="fs-5 fw-semibold">{stats?.beds?.occupancy_rate || 0}%</div>
                </div>
                <CIcon icon={cilSpeedometer} size="xl" className="text-danger" />
              </div>
              <div className="small text-medium-emphasis mt-2">
                Current rate
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Appointment Stats */}
      <CRow>
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Appointment Overview</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="text-center">
                <CCol xs={4} className="border-end">
                  <div className="text-medium-emphasis small">Today</div>
                  <div className="fs-4 fw-semibold">{stats?.appointments?.today?.total || 0}</div>
                  <div className="small text-success">{stats?.appointments?.today?.completed || 0} done</div>
                </CCol>
                <CCol xs={4} className="border-end">
                  <div className="text-medium-emphasis small">This Week</div>
                  <div className="fs-4 fw-semibold">{stats?.appointments?.this_week?.total || 0}</div>
                  <div className="small text-success">{stats?.appointments?.this_week?.completed || 0} done</div>
                </CCol>
                <CCol xs={4}>
                  <div className="text-medium-emphasis small">This Month</div>
                  <div className="fs-4 fw-semibold">{stats?.appointments?.this_month?.total || 0}</div>
                  <div className="small text-success">{stats?.appointments?.this_month?.completed || 0} done</div>
                </CCol>
              </CRow>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="text-medium-emphasis">Upcoming Appointments</span>
                <strong>{stats?.appointments?.upcoming || 0}</strong>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Financial Overview */}
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Financial Overview</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-medium-emphasis">Invoice Revenue (Paid)</span>
                  <strong className="text-success">
                    {formatCurrency(stats?.financial?.invoices?.total_revenue)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-medium-emphasis">Pending Invoices</span>
                  <strong className="text-warning">
                    {formatCurrency(stats?.financial?.invoices?.pending_amount)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-medium-emphasis">Lab Tests Revenue</span>
                  <strong className="text-info">
                    {formatCurrency(stats?.financial?.lab_tests?.total_revenue)}
                  </strong>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">Total Revenue</span>
                <strong className="text-primary fs-5">
                  {formatCurrency(stats?.financial?.summary?.total_revenue)}
                </strong>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Recent Activities */}
      <CRow>
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Recent Appointments</strong>
            </CCardHeader>
            <CCardBody>
              <CTable small responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentActivities?.recent_appointments?.length > 0 ? (
                    recentActivities.recent_appointments.slice(0, 5).map((apt, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          {apt.patient
                            ? `${apt.patient.first_name} ${apt.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(apt.appointment_date)}</CTableDataCell>
                        <CTableDataCell>{getAppointmentBadge(apt.status)}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center text-medium-emphasis">
                        No recent appointments
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Recent Patients</strong>
            </CCardHeader>
            <CCardBody>
              <CTable small responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Registered</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentActivities?.recent_patients?.length > 0 ? (
                    recentActivities.recent_patients.slice(0, 5).map((patient, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          {patient.first_name} {patient.last_name}
                        </CTableDataCell>
                        <CTableDataCell>{patient.email || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{formatDate(patient.created_at)}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center text-medium-emphasis">
                        No recent patients
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Recent Lab Tests</strong>
            </CCardHeader>
            <CCardBody>
              <CTable small responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Test</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentActivities?.recent_lab_tests?.length > 0 ? (
                    recentActivities.recent_lab_tests.slice(0, 5).map((test, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>{test.test_name}</CTableDataCell>
                        <CTableDataCell>
                          {test.patient
                            ? `${test.patient.first_name} ${test.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{getLabTestBadge(test.status)}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center text-medium-emphasis">
                        No recent lab tests
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Recent Invoices</strong>
            </CCardHeader>
            <CCardBody>
              <CTable small responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Invoice #</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentActivities?.recent_invoices?.length > 0 ? (
                    recentActivities.recent_invoices.slice(0, 5).map((invoice, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>{invoice.invoice_number}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(invoice.total)}</CTableDataCell>
                        <CTableDataCell>{getInvoiceBadge(invoice.status)}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center text-medium-emphasis">
                        No recent invoices
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default DashboardPage;