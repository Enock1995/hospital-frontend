import axiosInstance from './axios';

// Get all appointments with pagination and filters
export const getAppointments = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/appointments', { params });
    return response.data;
  } catch (error) {
    console.error('Get appointments error:', error);
    throw error.response?.data || { message: 'Failed to fetch appointments' };
  }
};

// Get single appointment by ID
export const getAppointment = async (id) => {
  try {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get appointment error:', error);
    throw error.response?.data || { message: 'Failed to fetch appointment' };
  }
};

// Create new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Create appointment error:', error);
    throw error.response?.data || { message: 'Failed to create appointment' };
  }
};

// Update appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await axiosInstance.put(`/appointments/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Update appointment error:', error);
    throw error.response?.data || { message: 'Failed to update appointment' };
  }
};

// Delete appointment
export const deleteAppointment = async (id) => {
  try {
    const response = await axiosInstance.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete appointment error:', error);
    throw error.response?.data || { message: 'Failed to delete appointment' };
  }
};

// Cancel appointment
export const cancelAppointment = async (id) => {
  try {
    const response = await axiosInstance.patch(`/appointments/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Cancel appointment error:', error);
    throw error.response?.data || { message: 'Failed to cancel appointment' };
  }
};

// Get appointment statistics
export const getAppointmentStatistics = async () => {
  try {
    const response = await axiosInstance.get('/appointments/statistics');
    return response.data;
  } catch (error) {
    console.error('Get appointment statistics error:', error);
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};