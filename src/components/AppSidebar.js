import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'
import { useAuth } from '../hooks/useAuth'

const AppSidebar = () => {
  console.log('🚨 APPSIDEBAR COMPONENT CALLED!')
  
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user, loading, isAuthenticated } = useAuth()

  // Debug logging
  console.log('📊 AppSidebar render:', { 
    hasUser: !!user, 
    userName: user?.name,
    hasRoles: !!user?.roles,
    rolesCount: user?.roles?.length,
    loading, 
    isAuthenticated,
    navigationItemsCount: navigation.length
  })

  // Filter navigation based on user roles
  const filteredNavigation = useMemo(() => {
    console.log('🔄 Filtering navigation...')
    
    // If still loading, show all navigation (will show briefly)
    if (loading) {
      console.log('⏳ Auth loading, showing all navigation')
      return navigation
    }

    // If no user or not authenticated, show all (shouldn't happen in protected routes)
    if (!isAuthenticated || !user) {
      console.log('⚠️ No user, showing all navigation')
      return navigation
    }

    // If user has no roles, show all navigation items
    if (!user.roles || user.roles.length === 0) {
      console.log('ℹ️ User has no roles, showing all navigation')
      return navigation
    }

    // Filter based on user roles
    const userRoles = user.roles.map(r => r.name)
    console.log('🔐 User roles:', userRoles)
    
    const filtered = navigation.filter(item => {
      // If no roles specified on the item, show to everyone
      if (!item.roles || item.roles.length === 0) {
        return true
      }
      
      // Check if user has any of the required roles
      const hasAccess = item.roles.some(role => userRoles.includes(role))
      
      if (!hasAccess) {
        console.log(`🚫 Hiding navigation item: ${item.name} (requires ${item.roles.join(', ')})`)
      }
      
      return hasAccess
    })

    console.log(`✅ Filtered navigation: ${filtered.length}/${navigation.length} items`)
    return filtered
  }, [user, loading, isAuthenticated])

  console.log('🎨 About to render sidebar with', filteredNavigation.length, 'items')

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={filteredNavigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)