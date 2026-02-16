import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilEnvelopeOpen,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilCommentSquare,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { toast } from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { user: authUser, logout: authLogout } = useAuth()
  const [notifications, setNotifications] = useState({
    updates: 0,
    messages: 0,
    tasks: 0,
    comments: 0,
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/counts')
      setNotifications(response.data)
    } catch (error) {
      console.log('Notifications endpoint not available')
    }
  }

  const handleLogout = async () => {
    try {
      await authLogout()
      toast.success('Logged out successfully')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  const getUserInitials = () => {
    if (!authUser) return 'U'
    const name = authUser.name || ''
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {authUser?.avatar ? (
          <CAvatar src={authUser.avatar} size="md" />
        ) : (
          <CAvatar color="primary" textColor="white" size="md">
            {getUserInitials()}
          </CAvatar>
        )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* User Info Header */}
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {authUser ? (
            <div>
              <div>{authUser.name}</div>
              <small className="text-medium-emphasis">{authUser.email}</small>
            </div>
          ) : (
            'Account'
          )}
        </CDropdownHeader>

        {/* Notifications */}
        <CDropdownItem onClick={() => handleNavigation('/notifications?tab=updates')}>
          <CIcon icon={cilBell} className="me-2" />
          Updates
          {notifications.updates > 0 && (
            <CBadge color="info" className="ms-2">
              {notifications.updates}
            </CBadge>
          )}
        </CDropdownItem>
        <CDropdownItem onClick={() => handleNavigation('/notifications?tab=messages')}>
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          {notifications.messages > 0 && (
            <CBadge color="success" className="ms-2">
              {notifications.messages}
            </CBadge>
          )}
        </CDropdownItem>
        <CDropdownItem onClick={() => handleNavigation('/notifications?tab=tasks')}>
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          {notifications.tasks > 0 && (
            <CBadge color="danger" className="ms-2">
              {notifications.tasks}
            </CBadge>
          )}
        </CDropdownItem>
        <CDropdownItem onClick={() => handleNavigation('/notifications?tab=comments')}>
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          {notifications.comments > 0 && (
            <CBadge color="warning" className="ms-2">
              {notifications.comments}
            </CBadge>
          )}
        </CDropdownItem>

        {/* Settings Section */}
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Settings
        </CDropdownHeader>
        <CDropdownItem onClick={() => handleNavigation('/profile')}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={() => handleNavigation('/settings')}>
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>

        {/* Logout */}
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} className="text-danger">
          <CIcon icon={cilLockLocked} className="me-2" />
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown