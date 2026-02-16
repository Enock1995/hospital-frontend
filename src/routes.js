import React from 'react'

const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'))
const DashboardPage = React.lazy(() => import('./views/dashboard/DashboardPage'))
const PatientsPage = React.lazy(() => import('./pages/Patients/PatientsPage'))
const DoctorsPage = React.lazy(() => import('./pages/Doctors/DoctorsPage'))
const AppointmentsPage = React.lazy(() => import('./pages/Appointments/AppointmentsPage'))
const MedicalRecordsPage = React.lazy(() => import('./pages/MedicalRecords/MedicalRecordsPage'))
const PrescriptionsPage = React.lazy(() => import('./pages/Prescriptions/PrescriptionsPage'))
const InvoicesPage = React.lazy(() => import('./pages/Invoices/InvoicesPage'))
const LabTestsPage = React.lazy(() => import('./pages/LabTests/LabTestsPage'))
const DepartmentsPage = React.lazy(() => import('./pages/Departments/DepartmentsPage'))
const BedAssignmentsPage = React.lazy(() => import('./pages/BedAssignments/BedAssignmentsPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: DashboardPage },
  { path: '/patients', name: 'Patients', element: PatientsPage },
  { path: '/doctors', name: 'Doctors', element: DoctorsPage },
  { path: '/appointments', name: 'Appointments', element: AppointmentsPage },
  { path: '/medical-records', name: 'Medical Records', element: MedicalRecordsPage },
  { path: '/prescriptions', name: 'Prescriptions', element: PrescriptionsPage },
  { path: '/invoices', name: 'Invoices', element: InvoicesPage },
  { path: '/lab-tests', name: 'Lab Tests', element: LabTestsPage },
  { path: '/departments', name: 'Departments', element: DepartmentsPage },
  { path: '/bed-assignments', name: 'Bed Assignments', element: BedAssignmentsPage },
  { path: '/profile', name: 'Profile', element: ProfilePage },
  { path: '/settings', name: 'Settings', element: SettingsPage },
  { path: '/notifications', name: 'Notifications', element: NotificationsPage },

]

export default routes