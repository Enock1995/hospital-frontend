import axiosInstance from './axios';

// Get dashboard overview statistics
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw error.response?.data || { message: 'Failed to fetch dashboard data' };
  }
};

// Get patient analytics
export const getPatientAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/patient-analytics');
    return response.data;
  } catch (error) {
    console.error('Patient analytics error:', error);
    throw error.response?.data || { message: 'Failed to fetch patient analytics' };
  }
};

// Get doctor analytics
export const getDoctorAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/doctor-analytics');
    return response.data;
  } catch (error) {
    console.error('Doctor analytics error:', error);
    throw error.response?.data || { message: 'Failed to fetch doctor analytics' };
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/revenue-analytics');
    return response.data;
  } catch (error) {
    console.error('Revenue analytics error:', error);
    throw error.response?.data || { message: 'Failed to fetch revenue analytics' };
  }
};