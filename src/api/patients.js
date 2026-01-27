import axiosInstance from './axios';

// Get all patients with pagination and filters
export const getPatients = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/patients', { params });
    return response.data;
  } catch (error) {
    console.error('Get patients error:', error);
    throw error.response?.data || { message: 'Failed to fetch patients' };
  }
};

// Get single patient by ID
export const getPatient = async (id) => {
  try {
    const response = await axiosInstance.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get patient error:', error);
    throw error.response?.data || { message: 'Failed to fetch patient' };
  }
};

// Create new patient
export const createPatient = async (patientData) => {
  try {
    const response = await axiosInstance.post('/patients', patientData);
    return response.data;
  } catch (error) {
    console.error('Create patient error:', error);
    throw error.response?.data || { message: 'Failed to create patient' };
  }
};

// Update patient
export const updatePatient = async (id, patientData) => {
  try {
    const response = await axiosInstance.put(`/patients/${id}`, patientData);
    return response.data;
  } catch (error) {
    console.error('Update patient error:', error);
    throw error.response?.data || { message: 'Failed to update patient' };
  }
};

// Delete patient
export const deletePatient = async (id) => {
  try {
    const response = await axiosInstance.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete patient error:', error);
    throw error.response?.data || { message: 'Failed to delete patient' };
  }
};