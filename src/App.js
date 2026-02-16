import React, { Suspense } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import './scss/style.scss'
import './styles/enhanced-styles.css'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./pages/Auth/Login'))
const Register = React.lazy(() => import('./pages/Auth/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))

// ✅ FIXED: Now uses AuthContext and handles loading state
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  console.log('🔒 ProtectedRoute check:', { isAuthenticated, loading })
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Verifying authentication...</p>
        </div>
      </div>
    )
  }
  
  // Only redirect after loading is complete
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// ✅ ADDED: Prevent authenticated users from accessing login/register
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  console.log('🌐 PublicRoute check:', { isAuthenticated, loading })
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }
  
  // Redirect to dashboard if already authenticated
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={loading}>
          <Routes>
            {/* ✅ UPDATED: Wrap login/register with PublicRoute */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route path="/404" element={<Page404 />} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <DefaultLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </Suspense>
      </AuthProvider>
    </HashRouter>
  )
}

export default App