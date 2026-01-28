import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CBadge,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilBeaker, cilCheckCircle } from '@coreui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const LabTestsPage = () => {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { register: registerResult, handleSubmit: handleSubmitResult, reset: resetResult, formState: { errors: errorsResult } } = useForm();

  useEffect(() => {
    fetchLabTests();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lab-tests');
      const data = response.data.data || response.data;
      setLabTests(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      toast.error('Failed to fetch lab tests');
      setLabTests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      const data = response.data.data || response.data;
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      const data = response.data.data || response.data;
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editMode) {
        await api.put(`/lab-tests/${selectedLabTest.id}`, data);
        toast.success('Lab test updated successfully');
      } else {
        await api.post('/lab-tests', data);
        toast.success('Lab test created successfully');
      }
      fetchLabTests();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving lab test:', error);
      toast.error(error.response?.data?.message || 'Failed to save lab test');
    }
  };

  const onSubmitResult = async (data) => {
    try {
      await api.post(`/lab-tests/${selectedLabTest.id}/update-result`, data);
      toast.success('Test result updated successfully');
      fetchLabTests();
      handleCloseResultModal();
    } catch (error) {
      console.error('Error updating result:', error);
      toast.error(error.response?.data?.message || 'Failed to update result');
    }
  };

  const handleEdit = (labTest) => {
    setSelectedLabTest(labTest);
    setEditMode(true);

    setValue('patient_id', labTest.patient_id);
    setValue('doctor_id', labTest.doctor_id);
    setValue('test_name', labTest.test_name);
    setValue('test_description', labTest.test_description || '');
    setValue('test_date', labTest.test_date);
    setValue('result', labTest.result || '');
    setValue('status', labTest.status);
    setValue('cost', labTest.cost);
    setValue('notes', labTest.notes || '');

    setModalVisible(true);
  };

  const handleUpdateResult = (labTest) => {
    setSelectedLabTest(labTest);
    resetResult({
      result: labTest.result || '',
      status: 'completed',
    });
    setResultModalVisible(true);
  };

  const handleDelete = (labTest) => {
    setSelectedLabTest(labTest);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/lab-tests/${selectedLabTest.id}`);
      toast.success('Lab test deleted successfully');
      fetchLabTests();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting lab test:', error);
      toast.error('Failed to delete lab test');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditMode(false);
    setSelectedLabTest(null);
    reset();
  };

  const handleCloseResultModal = () => {
    setResultModalVisible(false);
    setSelectedLabTest(null);
    resetResult();
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return <CBadge color={colors[status] || 'secondary'}>{status.replace('_', ' ')}</CBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Lab Tests Management</strong>
            <CButton color="primary" onClick={() => setModalVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Lab Test
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Test Name</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Doctor</CTableHeaderCell>
                    <CTableHeaderCell>Test Date</CTableHeaderCell>
                    <CTableHeaderCell>Cost</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {labTests.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center">
                        No lab tests found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    labTests.map((labTest) => (
                      <CTableRow key={labTest.id}>
                        <CTableDataCell>
                          <strong>{labTest.test_name}</strong>
                          {labTest.test_description && (
                            <>
                              <br />
                              <small className="text-muted">{labTest.test_description}</small>
                            </>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {labTest.patient
                            ? `${labTest.patient.first_name} ${labTest.patient.last_name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {labTest.doctor?.user
                            ? `Dr. ${labTest.doctor.user.name}`
                            : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(labTest.test_date)}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(labTest.cost)}</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(labTest.status)}</CTableDataCell>
                        <CTableDataCell>
                          {(labTest.status === 'pending' || labTest.status === 'in_progress') && (
                            <CButton
                              color="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleUpdateResult(labTest)}
                              title="Update Result"
                            >
                              <CIcon icon={cilCheckCircle} />
                            </CButton>
                          )}
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(labTest)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(labTest)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add/Edit Modal */}
      <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilBeaker} className="me-2" />
            {editMode ? 'Edit Lab Test' : 'Add New Lab Test'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CModalBody>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Patient *</CFormLabel>
                  <CFormSelect
                    {...register('patient_id', { required: 'Patient is required' })}
                    invalid={!!errors.patient_id}
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.patient_id && (
                    <div className="invalid-feedback d-block">{errors.patient_id.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Doctor *</CFormLabel>
                  <CFormSelect
                    {...register('doctor_id', { required: 'Doctor is required' })}
                    invalid={!!errors.doctor_id}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.user?.name} - {doctor.specialization}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.doctor_id && (
                    <div className="invalid-feedback d-block">{errors.doctor_id.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Test Name *</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="e.g., Complete Blood Count (CBC)"
                    {...register('test_name', { required: 'Test name is required' })}
                    invalid={!!errors.test_name}
                  />
                  {errors.test_name && (
                    <div className="invalid-feedback d-block">{errors.test_name.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Test Description</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    placeholder="Brief description of the test"
                    {...register('test_description')}
                  />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Test Date *</CFormLabel>
                  <CFormInput
                    type="date"
                    {...register('test_date', { required: 'Test date is required' })}
                    invalid={!!errors.test_date}
                  />
                  {errors.test_date && (
                    <div className="invalid-feedback d-block">{errors.test_date.message}</div>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Cost *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>$</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('cost', {
                        required: 'Cost is required',
                        min: { value: 0, message: 'Cost must be positive' },
                      })}
                      invalid={!!errors.cost}
                    />
                  </CInputGroup>
                  {errors.cost && (
                    <div className="invalid-feedback d-block">{errors.cost.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Status *</CFormLabel>
                  <CFormSelect
                    {...register('status', { required: 'Status is required' })}
                    invalid={!!errors.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </CFormSelect>
                  {errors.status && (
                    <div className="invalid-feedback d-block">{errors.status.message}</div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Result</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    placeholder="Test results (will be filled after test completion)"
                    {...register('result')}
                  />
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    placeholder="Additional notes"
                    {...register('notes')}
                  />
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit">
              {editMode ? 'Update' : 'Create'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Update Result Modal */}
      <CModal visible={resultModalVisible} onClose={handleCloseResultModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>Update Test Result</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmitResult(onSubmitResult)}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Test Result *</CFormLabel>
              <CFormTextarea
                rows={4}
                placeholder="Enter test results..."
                {...registerResult('result', { required: 'Result is required' })}
                invalid={!!errorsResult.result}
              />
              {errorsResult.result && (
                <div className="invalid-feedback d-block">{errorsResult.result.message}</div>
              )}
            </div>
            <div className="mb-3">
              <CFormLabel>Status</CFormLabel>
              <CFormSelect {...registerResult('status')}>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </CFormSelect>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseResultModal}>
              Cancel
            </CButton>
            <CButton color="success" type="submit">
              Update Result
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the lab test{' '}
          <strong>{selectedLabTest?.test_name}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default LabTestsPage;