import axiosInstance from './axios';

// Get all medical records with pagination and filters
export const getMedicalRecords = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/medical-records', { params });
    return response.data;
  } catch (error) {
    console.error('Get medical records error:', error);
    throw error.response?.data || { message: 'Failed to fetch medical records' };
  }
};

// Get single medical record by ID
export const getMedicalRecord = async (id) => {
  try {
    const response = await axiosInstance.get(`/medical-records/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get medical record error:', error);
    throw error.response?.data || { message: 'Failed to fetch medical record' };
  }
};

// Create new medical record
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await axiosInstance.post('/medical-records', recordData);
    return response.data;
  } catch (error) {
    console.error('Create medical record error:', error);
    throw error.response?.data || { message: 'Failed to create medical record' };
  }
};

// Update medical record
export const updateMedicalRecord = async (id, recordData) => {
  try {
    const response = await axiosInstance.put(`/medical-records/${id}`, recordData);
    return response.data;
  } catch (error) {
    console.error('Update medical record error:', error);
    throw error.response?.data || { message: 'Failed to update medical record' };
  }
};

// Delete medical record
export const deleteMedicalRecord = async (id) => {
  try {
    const response = await axiosInstance.delete(`/medical-records/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete medical record error:', error);
    throw error.response?.data || { message: 'Failed to delete medical record' };
  }
};