// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@hospital.com', // Pre-fill for testing
      password: 'password123',
    },
  });

  const onSubmit = async (data) => {
    console.log('='.repeat(60));
    console.log('🚀 LOGIN ATTEMPT STARTED');
    console.log('='.repeat(60));
    console.log('📝 Form data:', {
      email: data.email,
      passwordLength: data.password?.length,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);
    setError('');

    try {
      console.log('📡 Calling authAPI.login...');
      
      // Call login API
      const response = await authAPI.login(data);

      console.log('📥 API Response received:', {
        hasToken: !!response.token,
        tokenPreview: response.token?.substring(0, 10) + '...',
        hasUser: !!response.user,
        userName: response.user?.name,
        userEmail: response.user?.email,
        userRole: response.user?.role,
      });

      // Validate response structure
      if (!response.token) {
        console.error('❌ No token in response!');
        throw new Error('Invalid response: missing token');
      }

      if (!response.user) {
        console.error('❌ No user in response!');
        throw new Error('Invalid response: missing user data');
      }

      console.log('✅ Response validation passed');

      // Save to context and localStorage
      console.log('💾 Saving authentication data...');
      authLogin(response.user, response.token);

      // Verify saved data
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      console.log('✅ Verification after save:', {
        tokenSaved: !!savedToken,
        userSaved: !!savedUser,
        tokenMatches: savedToken === response.token,
      });

      toast.success(`Welcome back, ${response.user.name}!`, {
        duration: 3000,
        icon: '👋',
      });

      console.log('🎉 Login successful! Redirecting to dashboard...');
      console.log('='.repeat(60));

      // Small delay to ensure state updates
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);

    } catch (err) {
      console.error('='.repeat(60));
      console.error('❌ LOGIN FAILED');
      console.error('='.repeat(60));
      console.error('Error object:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error response headers:', err.response?.headers);
      console.error('='.repeat(60));

      // Extract error message
      let errorMessage = 'Login failed. Please try again.';

      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const data = err.response.data;

        console.log('📋 Error details:', {
          status,
          message: data?.message,
          errors: data?.errors,
        });

        if (status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 422) {
          errorMessage = data?.message || 'Validation error';
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            }
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (err.request) {
        // Request made but no response
        console.error('❌ No response received from server');
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else {
        // Error in request setup
        console.error('❌ Request setup error:', err.message);
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
      console.log('🏁 Login attempt finished');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="p-4">
              <CCardBody>
                <CForm onSubmit={handleSubmit(onSubmit)}>
                  <h1>Login</h1>
                  <p className="text-medium-emphasis">Sign In to your account</p>

                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="username"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      invalid={!!errors.email}
                    />
                  </CInputGroup>
                  {errors.email && (
                    <div className="text-danger small mb-2">{errors.email.message}</div>
                  )}

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      invalid={!!errors.password}
                    />
                  </CInputGroup>
                  {errors.password && (
                    <div className="text-danger small mb-2">{errors.password.message}</div>
                  )}

                  <CRow>
                    <CCol xs={6}>
                      <CButton
                        color="primary"
                        className="px-4"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Logging in...' : 'Login'}
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-right">
                      <CButton color="link" className="px-0">
                        Forgot password?
                      </CButton>
                    </CCol>
                  </CRow>

                  <div className="mt-3">
                    <p className="text-medium-emphasis">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-decoration-none">
                        Register here
                      </Link>
                    </p>
                  </div>

                  {/* Debug Info - Remove in production */}
                  <div className="mt-4 p-3 bg-light border rounded">
                    <small className="text-muted">
                      <strong>Test Credentials:</strong>
                      <br />
                      Email: admin@hospital.com
                      <br />
                      Password: password123
                    </small>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;