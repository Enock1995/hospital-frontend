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
  CFormSelect,
  CFormSwitch,
  CButton,
  CSpinner,
  CAlert,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSettings, cilBell, cilShieldAlt, cilSave } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'auto',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    twoFactorAuth: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/me/settings');
      setSettings({ ...settings, ...response.data });
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/user/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong className="fs-5">
              <CIcon icon={cilSettings} className="me-2" />
              Account Settings
            </strong>
          </CCardHeader>
          <CCardBody>
            {/* Tabs */}
            <CNav variant="tabs" role="tablist" className="mb-4">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'general'}
                  onClick={() => setActiveTab('general')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilSettings} className="me-2" />
                  General
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
              <CNavItem>
                <CNavLink
                  active={activeTab === 'privacy'}
                  onClick={() => setActiveTab('privacy')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilShieldAlt} className="me-2" />
                  Privacy & Security
                </CNavLink>
              </CNavItem>
            </CNav>

            {/* Tab Content */}
            <CTabContent>
              {/* General Settings */}
              <CTabPane visible={activeTab === 'general'}>
                <CRow className="justify-content-center">
                  <CCol md={8}>
                    <CForm>
                      <div className="mb-4">
                        <CFormLabel>Language</CFormLabel>
                        <CFormSelect
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </CFormSelect>
                      </div>

                      <div className="mb-4">
                        <CFormLabel>Timezone</CFormLabel>
                        <CFormSelect
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </CFormSelect>
                      </div>

                      <div className="mb-4">
                        <CFormLabel>Date Format</CFormLabel>
                        <CFormSelect
                          value={settings.dateFormat}
                          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </CFormSelect>
                      </div>

                      <div className="mb-4">
                        <CFormLabel>Theme</CFormLabel>
                        <CFormSelect
                          value={settings.theme}
                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto (System)</option>
                        </CFormSelect>
                      </div>

                      <CButton color="primary" onClick={saveSettings} disabled={saving}>
                        {saving ? (
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
                    </CForm>
                  </CCol>
                </CRow>
              </CTabPane>

              {/* Notification Settings */}
              <CTabPane visible={activeTab === 'notifications'}>
                <CRow className="justify-content-center">
                  <CCol md={8}>
                    <CForm>
                      <div className="mb-4 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Email Notifications</strong>
                          <p className="text-medium-emphasis mb-0 small">
                            Receive notifications via email
                          </p>
                        </div>
                        <CFormSwitch
                          size="xl"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        />
                      </div>

                      <div className="mb-4 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Push Notifications</strong>
                          <p className="text-medium-emphasis mb-0 small">
                            Receive push notifications in browser
                          </p>
                        </div>
                        <CFormSwitch
                          size="xl"
                          checked={settings.pushNotifications}
                          onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        />
                      </div>

                      <div className="mb-4 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Appointment Reminders</strong>
                          <p className="text-medium-emphasis mb-0 small">
                            Get reminders before appointments
                          </p>
                        </div>
                        <CFormSwitch
                          size="xl"
                          checked={settings.appointmentReminders}
                          onChange={(e) => handleSettingChange('appointmentReminders', e.target.checked)}
                        />
                      </div>

                      <div className="mb-4 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Marketing Emails</strong>
                          <p className="text-medium-emphasis mb-0 small">
                            Receive promotional emails and newsletters
                          </p>
                        </div>
                        <CFormSwitch
                          size="xl"
                          checked={settings.marketingEmails}
                          onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                        />
                      </div>

                      <CButton color="primary" onClick={saveSettings} disabled={saving}>
                        {saving ? (
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
                    </CForm>
                  </CCol>
                </CRow>
              </CTabPane>

              {/* Privacy Settings */}
              <CTabPane visible={activeTab === 'privacy'}>
                <CRow className="justify-content-center">
                  <CCol md={8}>
                    <CForm>
                      <div className="mb-4">
                        <CFormLabel>Profile Visibility</CFormLabel>
                        <CFormSelect
                          value={settings.profileVisibility}
                          onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="contacts">Contacts Only</option>
                        </CFormSelect>
                        <small className="text-medium-emphasis">
                          Control who can see your profile information
                        </small>
                      </div>

                      <div className="mb-4 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Show Email Address</strong>
                          <p className="text-medium-emphasis mb-0 small">
                            Display email on public profile
                          </p>
                        </div>
                        <CFormSwitch
                          size="xl"
                          checked={settings.showEmail}
                          onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                        />
                      </div>

                      <div className="mb-4 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Show Phone Number</strong>
                          <p className="text-medium-emphasis mb-0 small">
                            Display phone on public profile
                          </p>
                        </div>
                        <CFormSwitch
                          size="xl"
                          checked={settings.showPhone}
                          onChange={(e) => handleSettingChange('showPhone', e.target.checked)}
                        />
                      </div>

                      <CAlert color="warning" className="my-4">
                        <strong>Two-Factor Authentication</strong>
                        <p className="mb-2 mt-2">
                          Add an extra layer of security to your account
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Status: {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}</span>
                          <CFormSwitch
                            size="xl"
                            checked={settings.twoFactorAuth}
                            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                          />
                        </div>
                      </CAlert>

                      <CButton color="primary" onClick={saveSettings} disabled={saving}>
                        {saving ? (
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
                    </CForm>
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

export default SettingsPage;