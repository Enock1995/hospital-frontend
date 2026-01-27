import axiosInstance from './axios';

// Get all doctors with pagination and filters
export const getDoctors = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/doctors', { params });
    return response.data;
  } catch (error) {
    console.error('Get doctors error:', error);
    throw error.response?.data || { message: 'Failed to fetch doctors' };
  }
};

// Get single doctor by ID
export const getDoctor = async (id) => {
  try {
    const response = await axiosInstance.get(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get doctor error:', error);
    throw error.response?.data || { message: 'Failed to fetch doctor' };
  }
};

// Create new doctor
export const createDoctor = async (doctorData) => {
  try {
    const response = await axiosInstance.post('/doctors', doctorData);
    return response.data;
  } catch (error) {
    console.error('Create doctor error:', error);
    throw error.response?.data || { message: 'Failed to create doctor' };
  }
};

// Update doctor
export const updateDoctor = async (id, doctorData) => {
  try {
    const response = await axiosInstance.put(`/doctors/${id}`, doctorData);
    return response.data;
  } catch (error) {
    console.error('Update doctor error:', error);
    throw error.response?.data || { message: 'Failed to update doctor' };
  }
};

// Delete doctor
export const deleteDoctor = async (id) => {
  try {
    const response = await axiosInstance.delete(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete doctor error:', error);
    throw error.response?.data || { message: 'Failed to delete doctor' };
  }
};