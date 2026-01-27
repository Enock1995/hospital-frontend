import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const PatientsPage = React.lazy(() => import('./pages/Patients/PatientsPage'))
const DoctorsPage = React.lazy(() => import('./pages/Doctors/DoctorsPage'))
const AppointmentsPage = React.lazy(() => import('./pages/Appointments/AppointmentsPage'))
const MedicalRecordsPage = React.lazy(() => import('./pages/MedicalRecords/MedicalRecordsPage'))
const MedicalRecords = React.lazy(() => import('./views/medical-records/MedicalRecords'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/patients', name: 'Patients', element: PatientsPage },
  { path: '/doctors', name: 'Doctors', element: DoctorsPage },
  { path: '/appointments', name: 'Appointments', element: AppointmentsPage },
  { path: '/medical-records', name: 'Medical Records', element: MedicalRecordsPage },
  { path: '/medical-records', name: 'Medical Records', element: MedicalRecords },
]

export default routes