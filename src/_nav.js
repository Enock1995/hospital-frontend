import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilUserFollow,
  cilCalendar,
  cilNotes,
  cilMedicalCross,
  cilMoney,
  cilBeaker,
  cilBuilding,
  cilBed,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    roles: ['admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist'], // All roles
  },
  {
    component: CNavTitle,
    name: 'Patient Management',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    component: CNavItem,
    name: 'Patients',
    to: '/patients',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    component: CNavItem,
    name: 'Medical Records',
    to: '/medical-records',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    roles: ['admin', 'doctor', 'nurse'],
  },
  {
    component: CNavItem,
    name: 'Prescriptions',
    to: '/prescriptions',
    icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
    roles: ['admin', 'doctor', 'pharmacist', 'nurse'],
  },
  {
    component: CNavTitle,
    name: 'Hospital Operations',
    roles: ['admin', 'doctor', 'receptionist', 'nurse'],
  },
  {
    component: CNavItem,
    name: 'Doctors',
    to: '/doctors',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    roles: ['admin', 'receptionist'],
  },
  {
    component: CNavItem,
    name: 'Departments',
    to: '/departments',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    roles: ['admin', 'receptionist'],
  },
  {
    component: CNavItem,
    name: 'Appointments',
    to: '/appointments',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    roles: ['admin', 'doctor', 'receptionist', 'nurse'],
  },
  {
    component: CNavItem,
    name: 'Lab Tests',
    to: '/lab-tests',
    icon: <CIcon icon={cilBeaker} customClassName="nav-icon" />,
    roles: ['admin', 'doctor', 'lab_technician', 'nurse'],
  },
  {
    component: CNavItem,
    name: 'Bed Management',
    to: '/bed-assignments',
    icon: <CIcon icon={cilBed} customClassName="nav-icon" />,
    roles: ['admin', 'nurse'],
  },
  {
    component: CNavTitle,
    name: 'Billing',
    roles: ['admin', 'receptionist'],
  },
  {
    component: CNavItem,
    name: 'Invoices',
    to: '/invoices',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    roles: ['admin', 'receptionist'],
  },
]

export default _nav