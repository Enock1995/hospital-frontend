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
  },
  {
    component: CNavTitle,
    name: 'Patient Management',
  },
  {
    component: CNavItem,
    name: 'Patients',
    to: '/patients',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Medical Records',
    to: '/medical-records',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Prescriptions',
    to: '/prescriptions',
    icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Hospital Operations',
  },
  {
    component: CNavItem,
    name: 'Doctors',
    to: '/doctors',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Departments',
    to: '/departments',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Appointments',
    to: '/appointments',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Lab Tests',
    to: '/lab-tests',
    icon: <CIcon icon={cilBeaker} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Bed Management',
    to: '/bed-assignments',
    icon: <CIcon icon={cilBed} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Billing',
  },
  {
    component: CNavItem,
    name: 'Invoices',
    to: '/invoices',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
  },
]

export default _nav