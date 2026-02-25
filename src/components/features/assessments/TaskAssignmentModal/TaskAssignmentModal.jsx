import { useState, useEffect } from 'react';
import { X, ClipboardList, Send } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './TaskAssignmentModal.css';

function TaskAssignmentModal({ onClose, onSuccess }) {
    const [patients, setPatients] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        patient: '',
        assigned_to: '',
        title: '',
        due_time: '',
        priority: 'medium',
        task_type: 'GEN' // New field
    });

    useEffect(() => {
        fetchPatients();
        fetchNurses();
    }, []);

    const fetchPatients = async () => {
        try {
            // Doctors see all patients
            const response = await apiClient.get('/clinical/patients/');
            setPatients(response.data);
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
    };

    const fetchNurses = async () => {
        try {
            // Optimized: Fetch only Nurses via backend filtering + limit
            const response = await apiClient.get('/users/', {
                params: { role: 'Nurse', limit: 20 }
            });
            setNurses(response.data);
        } catch (err) {
            console.error('Error fetching nurses:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patient) {
            setError('Please select a patient.');
            return;
        }
        if (!formData.assigned_to) {
            setError('Please assign this task to a nurse.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await apiClient.post('/clinical/doctor/tasks/', formData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Task assignment failed:', err);
            setError('Failed to assign work. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container task-modal">
                <div className="modal-header doctor-header">
                    <div className="header-title-group">
                        <ClipboardList size={20} color="#2f65ac" />
                        <h2 className="modal-title">Doctor's Work Assignment</h2>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <p className="form-intro">As a Lead Specialist, specify the clinical task and assign it to the nursing staff.</p>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-group full-width">
                        <label>Select Patient <span className="required">*</span></label>
                        <select
                            name="patient"
                            value={formData.patient}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Search Patient Name --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Assign to Nurse <span className="required">*</span></label>
                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Nursing Staff --</option>
                            {nurses.map(n => (
                                <option key={n.id} value={n.id}>
                                    {n.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Clinical Instruction / Task <span className="required">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Change dressing, Administer IV"
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Task Category <span className="required">*</span></label>
                            <select
                                name="task_type"
                                value={formData.task_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="GEN">General Nursing</option>
                                <option value="VITALS">Vital Signs Check</option>
                                <option value="WOUND_CARE">Wound Assessment</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority Level</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Routine</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Due Time <span className="required">*</span></label>
                        <input
                            type="time"
                            name="due_time"
                            value={formData.due_time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Discard</button>
                        <button type="submit" className="btn-save btn-assign" disabled={loading}>
                            <Send size={16} />
                            <span>{loading ? 'Assigning...' : 'Assign to Nurse'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskAssignmentModal;
