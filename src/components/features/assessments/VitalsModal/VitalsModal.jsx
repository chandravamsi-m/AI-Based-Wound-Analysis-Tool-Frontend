import { useState, useEffect } from 'react';
import { X, Activity, Heart, Wind, Droplets, ClipboardList } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './VitalsModal.css';

function VitalsModal({ onClose, onSuccess, preSelectedPatientId, taskId }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId || '');
    const [heartRate, setHeartRate] = useState('');
    const [respiratoryRate, setRespiratoryRate] = useState('');
    const [oxygenSaturation, setOxygenSaturation] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await apiClient.get('/clinical/patients/'); // Only assigned patients
            setPatients(response.data);
            if (!preSelectedPatientId && response.data.length > 0) {
                setSelectedPatientId(response.data[0].id);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert empty strings to null for optional clinical fields
        const data = {
            patient: selectedPatientId,
            heart_rate: heartRate === '' ? null : parseInt(heartRate),
            respiratory_rate: respiratoryRate === '' ? null : parseInt(respiratoryRate),
            oxygen_saturation: oxygenSaturation === '' ? null : parseInt(oxygenSaturation),
            nurse_notes: notes
        };

        try {
            await apiClient.post('/clinical/nurse/clinical/record-vitals/', data);

            // Auto-complete task if record was opened via a task
            if (taskId) {
                try {
                    await apiClient.post(`/clinical/nurse/tasks/${taskId}/complete/`);
                } catch (taskErr) {
                    console.error('Task auto-completion failed:', taskErr);
                }
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to save vitals:', err);
            const serverError = err.response?.data;
            if (serverError && typeof serverError === 'object') {
                const message = Object.values(serverError).flat().join(' ');
                setError(message || 'Failed to save vital signs.');
            } else {
                setError('Service unavailable. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container vitals-modal">
                <div className="modal-header vitals-header">
                    <div className="vitals-title-group">
                        <Activity className="vitals-icon-header" size={24} />
                        <h2 className="modal-title">Record Patient Vitals</h2>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="form-error">{error}</div>}

                    <div className="form-group full-width">
                        <label>
                            Select Patient <span className="required">*</span>
                        </label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            required
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Heart Rate (BPM)</label>
                            <input
                                type="number"
                                value={heartRate}
                                onChange={(e) => setHeartRate(e.target.value)}
                                placeholder="80"
                            />
                        </div>

                        <div className="form-group">
                            <label>Oxygen Saturation (%)</label>
                            <input
                                type="number"
                                value={oxygenSaturation}
                                onChange={(e) => setOxygenSaturation(e.target.value)}
                                placeholder="98"
                            />
                        </div>

                        <div className="form-group">
                            <label>Respiratory Rate (BPM)</label>
                            <input
                                type="number"
                                value={respiratoryRate}
                                onChange={(e) => setRespiratoryRate(e.target.value)}
                                placeholder="16"
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Nursing Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter any clinical observations..."
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Vital Signs'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VitalsModal;
