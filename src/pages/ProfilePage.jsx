import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CAvatar,
  CSpinner,
  CAlert,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked, cilBell, cilSave } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { user: authUser, updateUser } = useAuth();

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile } } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch, formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword } } = useForm();

  const newPassword = watch('new_password');

  // Debug: Log current user avatar
  useEffect(() => {
    console.log('👤 Current authUser:', authUser);
    console.log('📸 Current avatar URL:', authUser?.avatar);
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      resetProfile({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        bio: authUser.bio || '',
      });
      setLoading(false);
    }
  }, [authUser, resetProfile]);

  const onSubmitProfile = async (data) => {
    try {
      const response = await api.put('/user/profile', data);
      
      // Update AuthContext so changes reflect everywhere
      updateUser(response.data.data || response.data);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await api.put('/user/profile/password', {
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirmation: data.confirm_password,
      });
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('🔵 Starting avatar upload...');

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    console.log('✅ File validation passed:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      console.log('✅ Preview set');
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      console.log('📤 Uploading to /user/profile/avatar...');
      
      const response = await api.post('/user/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Debug: Log the full response
      console.log('✅ Upload successful!');
      console.log('📸 Full response:', response.data);
      console.log('📸 Response data:', response.data.data);
      console.log('📸 Avatar URL received:', response.data.data?.avatar);
      
      const userData = response.data.data;
      
      // Update AuthContext with new avatar
      console.log('💾 Updating user context with:', { avatar: userData.avatar });
      updateUser({ avatar: userData.avatar });
      
      console.log('✅ Context updated. New authUser should have avatar:', userData.avatar);
      
      toast.success('Avatar updated successfully!');
      setAvatarPreview(null);
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      setAvatarPreview(null);
    }
  };

  const getUserInitials = () => {
    if (!authUser?.name) return 'U';
    const parts = authUser.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return authUser.name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong className="fs-5">
              <CIcon icon={cilUser} className="me-2" />
              My Profile
            </strong>
          </CCardHeader>
          <CCardBody>
            {/* Tabs */}
            <CNav variant="tabs" role="tablist" className="mb-4">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilUser} className="me-2" />
                  Profile Information
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'password'}
                  onClick={() => setActiveTab('password')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilLockLocked} className="me-2" />
                  Change Password
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilBell} className="me-2" />
                  Notifications
                </CNavLink>
              </CNavItem>
            </CNav>

            {/* Tab Content */}
            <CTabContent>
              {/* Profile Tab */}
              <CTabPane visible={activeTab === 'profile'}>
                <CRow>
                  <CCol md={3} className="text-center mb-4">
                    <div className="mb-3">
                      {avatarPreview || authUser?.avatar ? (
                        <CAvatar src={avatarPreview || authUser.avatar} size="xl" />
                      ) : (
                        <CAvatar color="primary" textColor="white" size="xl">
                          <span style={{ fontSize: '2rem' }}>{getUserInitials()}</span>
                        </CAvatar>
                      )}
                    </div>
                    <CButton color="primary" size="sm" onClick={() => document.getElementById('avatarInput').click()}>
                      Change Avatar
                    </CButton>
                    <input
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <div className="mt-3">
                      <h5>{authUser?.name}</h5>
                      <p className="text-medium-emphasis">{authUser?.email}</p>
                      {authUser?.roles && authUser.roles.length > 0 && (
                        <p className="text-medium-emphasis small">
                          Role: <strong>{authUser.roles.map(r => r.name).join(', ')}</strong>
                        </p>
                      )}
                    </div>
                  </CCol>

                  <CCol md={9}>
                    <CForm onSubmit={handleSubmitProfile(onSubmitProfile)}>
                      <CRow className="g-3">
                        <CCol md={6}>
                          <CFormLabel>Full Name *</CFormLabel>
                          <CFormInput
                            {...registerProfile('name', { required: 'Name is required' })}
                            invalid={!!errorsProfile.name}
                          />
                          {errorsProfile.name && (
                            <div className="invalid-feedback d-block">{errorsProfile.name.message}</div>
                          )}
                        </CCol>

                        <CCol md={6}>
                          <CFormLabel>Email *</CFormLabel>
                          <CFormInput
                            type="email"
                            {...registerProfile('email', { required: 'Email is required' })}
                            invalid={!!errorsProfile.email}
                          />
                          {errorsProfile.email && (
                            <div className="invalid-feedback d-block">{errorsProfile.email.message}</div>
                          )}
                        </CCol>

                        <CCol md={12}>
                          <CFormLabel>Phone</CFormLabel>
                          <CFormInput {...registerProfile('phone')} placeholder="+1 (555) 123-4567" />
                        </CCol>

                        <CCol md={12}>
                          <CFormLabel>Bio</CFormLabel>
                          <CFormTextarea
                            rows={4}
                            placeholder="Tell us about yourself..."
                            {...registerProfile('bio')}
                          />
                        </CCol>

                        <CCol xs={12}>
                          <CButton color="primary" type="submit" disabled={isSubmittingProfile}>
                            {isSubmittingProfile ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CIcon icon={cilSave} className="me-2" />
                                Save Changes
                              </>
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCol>
                </CRow>
              </CTabPane>

              {/* Password Tab */}
              <CTabPane visible={activeTab === 'password'}>
                <CRow className="justify-content-center">
                  <CCol md={6}>
                    <CAlert color="info" className="mb-4">
                      <strong>Password Requirements:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Minimum 8 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                      </ul>
                    </CAlert>

                    <CForm onSubmit={handleSubmitPassword(onSubmitPassword)}>
                      <div className="mb-3">
                        <CFormLabel>Current Password *</CFormLabel>
                        <CFormInput
                          type="password"
                          {...registerPassword('current_password', { required: 'Current password is required' })}
                          invalid={!!errorsPassword.current_password}
                        />
                        {errorsPassword.current_password && (
                          <div className="invalid-feedback d-block">{errorsPassword.current_password.message}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <CFormLabel>New Password *</CFormLabel>
                        <CFormInput
                          type="password"
                          {...registerPassword('new_password', {
                            required: 'New password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          })}
                          invalid={!!errorsPassword.new_password}
                        />
                        {errorsPassword.new_password && (
                          <div className="invalid-feedback d-block">{errorsPassword.new_password.message}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <CFormLabel>Confirm New Password *</CFormLabel>
                        <CFormInput
                          type="password"
                          {...registerPassword('confirm_password', {
                            required: 'Please confirm your password',
                            validate: (value) => value === newPassword || 'Passwords do not match',
                          })}
                          invalid={!!errorsPassword.confirm_password}
                        />
                        {errorsPassword.confirm_password && (
                          <div className="invalid-feedback d-block">{errorsPassword.confirm_password.message}</div>
                        )}
                      </div>

                      <CButton color="primary" type="submit" disabled={isSubmittingPassword}>
                        {isSubmittingPassword ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilLockLocked} className="me-2" />
                            Change Password
                          </>
                        )}
                      </CButton>
                    </CForm>
                  </CCol>
                </CRow>
              </CTabPane>

              {/* Notifications Tab */}
              <CTabPane visible={activeTab === 'notifications'}>
                <CRow className="justify-content-center">
                  <CCol md={8}>
                    <CAlert color="info">
                      <strong>Notification preferences</strong>
                      <p className="mb-0 mt-2">
                        Manage your notification settings in the Settings page.
                      </p>
                    </CAlert>
                  </CCol>
                </CRow>
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ProfilePage;