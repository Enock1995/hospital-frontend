import { useForm } from 'react-hook-form';
import { Loader2, FileText, User, UserCog, Stethoscope, Pill, Activity, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPatients } from '../api/patients';
import { getDoctors } from '../api/doctors';

const MedicalRecordForm = ({ record, onSubmit, isLoading, onCancel }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: record || {
      patient_id: '',
      doctor_id: '',
      visit_date: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      notes: '',
      follow_up_date: '',
      vital_signs: {
        blood_pressure: '',
        temperature: '',
        pulse: '',
        weight: '',
        height: '',
      },
    },
  });

  useEffect(() => {
    fetchPatientsAndDoctors();
  }, []);

  const fetchPatientsAndDoctors = async () => {
    try {
      setLoadingData(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        getPatients({ per_page: 100 }),
        getDoctors({ per_page: 100 }),
      ]);

      if (patientsRes.success) {
        setPatients(patientsRes.data.data || patientsRes.data);
      }
      if (doctorsRes.success) {
        setDoctors(doctorsRes.data.data || doctorsRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Patient & Doctor Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Patient & Doctor Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <select
              {...register('patient_id', { required: 'Patient is required' })}
              className={`w-full px-4 py-2 border ${
                errors.patient_id ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} - {patient.email}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
            )}
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attending Doctor *
            </label>
            <select
              {...register('doctor_id', { required: 'Doctor is required' })}
              className={`w-full px-4 py-2 border ${
                errors.doctor_id ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
            {errors.doctor_id && (
              <p className="mt-1 text-sm text-red-600">{errors.doctor_id.message}</p>
            )}
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Date *
            </label>
            <input
              type="date"
              {...register('visit_date', { required: 'Visit date is required' })}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border ${
                errors.visit_date ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.visit_date && (
              <p className="mt-1 text-sm text-red-600">{errors.visit_date.message}</p>
            )}
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Date
            </label>
            <input
              type="date"
              {...register('follow_up_date')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-red-600" />
          Vital Signs
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Blood Pressure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Pressure
            </label>
            <input
              type="text"
              {...register('vital_signs.blood_pressure')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="120/80"
            />
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°F)
            </label>
            <input
              type="text"
              {...register('vital_signs.temperature')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="98.6"
            />
          </div>

          {/* Pulse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pulse (bpm)
            </label>
            <input
              type="text"
              {...register('vital_signs.pulse')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="72"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="text"
              {...register('vital_signs.weight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="70"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="text"
              {...register('vital_signs.height')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="170"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
          Medical Information
        </h3>
        
        <div className="space-y-4">
          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms *
            </label>
            <textarea
              {...register('symptoms', { required: 'Symptoms are required' })}
              rows={3}
              className={`w-full px-4 py-2 border ${
                errors.symptoms ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Describe patient's symptoms..."
            />
            {errors.symptoms && (
              <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>
            )}
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis *
            </label>
            <textarea
              {...register('diagnosis', { required: 'Diagnosis is required' })}
              rows={3}
              className={`w-full px-4 py-2 border ${
                errors.diagnosis ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Medical diagnosis..."
            />
            {errors.diagnosis && (
              <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
            )}
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Plan *
            </label>
            <textarea
              {...register('treatment', { required: 'Treatment plan is required' })}
              rows={4}
              className={`w-full px-4 py-2 border ${
                errors.treatment ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Recommended treatment and care plan..."
            />
            {errors.treatment && (
              <p className="mt-1 text-sm text-red-600">{errors.treatment.message}</p>
            )}
          </div>

          {/* Prescription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Pill className="w-4 h-4 mr-1 text-purple-600" />
              Prescription/Medication
            </label>
            <textarea
              {...register('prescription')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Prescribed medications, dosage, and instructions..."
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-600" />
              Additional Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional observations or notes..."
            />
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-yellow-800 font-medium">Medical Record Confidentiality</p>
          <p className="text-sm text-yellow-700 mt-1">
            This information is confidential and protected under medical privacy laws. 
            Ensure all information is accurate and complete.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{record ? 'Update Record' : 'Create Record'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;