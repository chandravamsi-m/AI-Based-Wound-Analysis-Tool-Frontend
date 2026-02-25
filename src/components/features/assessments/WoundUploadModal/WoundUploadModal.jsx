import { useState, useEffect } from 'react';
import { X, Upload, Camera, AlertCircle } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './WoundUploadModal.css';

function WoundUploadModal({ onClose, onSuccess, onCompleted, preSelectedPatientId, taskId }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysisResult(null); // Reset analysis if file changes
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatientId || !selectedFile) {
            setError('Please select a patient and an image.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('patient', selectedPatientId);
        formData.append('image', selectedFile);
        formData.append('notes', notes);

        try {
            const response = await apiClient.post('/clinical/nurse/clinical/upload-wound/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const result = response?.data;
            const hasRequiredFields = !!(
                result &&
                result.image &&
                result.stage &&
                result.created_at &&
                typeof result.width !== 'undefined' &&
                typeof result.depth !== 'undefined'
            );

            if (!hasRequiredFields) {
                setError('Analysis completed, but the report payload was incomplete. Please try again.');
                return;
            }

            // Auto-complete task if opened via a task
            if (taskId) {
                try {
                    await apiClient.post(`/clinical/nurse/tasks/${taskId}/complete/`);
                } catch (taskErr) {
                    console.error('Task auto-completion failed:', taskErr);
                }
            }

            // Keep modal open and show report first.
            setAnalysisResult(result);
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalysisClose = () => {
        onClose?.();
        // Backward compatibility for existing callers
        onSuccess?.();
        onCompleted?.();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container upload-modal">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {analysisResult ? 'Clinical Analysis Report' : 'Upload Wound Detail'}
                    </h2>
                    <button
                        className="btn-close"
                        onClick={analysisResult ? handleAnalysisClose : onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {!analysisResult ? (
                    <form onSubmit={handleSubmit} className="modal-form">
                        {error && <div className="form-error">{error}</div>}

                        <div className="form-group full-width">
                            <label>Select Patient <span className="required">*</span></label>
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

                        <div className="form-group full-width">
                            <label>Wound Image <span className="required">*</span></label>
                            <div className="image-upload-area">
                                {previewUrl ? (
                                    <div className="image-preview-container">
                                        <img src={previewUrl} alt="Preview" className="image-preview" />
                                        <button type="button" className="btn-change-image" onClick={() => setSelectedFile(null) || setPreviewUrl(null)}>
                                            Change Image
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                        <Camera size={48} color="#cbd5e1" />
                                        <p>Click to upload or take a photo</p>
                                        <span>Supports: JPG, PNG</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Clinical Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter any relevant wound observations..."
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-save" disabled={loading || !selectedFile}>
                                <Upload size={16} />
                                <span>{loading ? 'Analyzing...' : 'Start Clinical Analysis'}</span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="modal-form analysis-results">
                        {analysisResult.is_escalated && (
                            <div style={{ marginBottom: '15px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={20} />
                                <span>ESCALATION ALERT: High Severity ({analysisResult.stage}) - Doctor Notified</span>
                            </div>
                        )}

                        <div className="report-header" style={{ marginBottom: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ color: '#64748b' }}>Patient:</span>
                                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{analysisResult.patient_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b' }}>Assessed By:</span>
                                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{analysisResult.nurse_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b' }}>Date:</span>
                                    <div style={{ fontWeight: '500' }}>{new Date(analysisResult.created_at).toLocaleString()}</div>
                                </div>
                                {analysisResult.notes && (
                                    <div style={{ gridColumn: 'span 2', marginTop: '5px', borderTop: '1px solid #e2e8f0', paddingTop: '5px' }}>
                                        <span style={{ color: '#64748b' }}>Notes:</span> {analysisResult.notes}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="result-image-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img src={analysisResult.image} alt="Analyzed Wound" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>

                        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div className="metric-card" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>Wound Width</h4>
                                <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>{analysisResult.width} cm</p>
                            </div>
                            <div className="metric-card" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>Wound Depth</h4>
                                <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>{analysisResult.depth} cm</p>
                            </div>
                        </div>

                        <div className="metric-card full" style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#0369a1', fontSize: '14px' }}>AI Stage Classification</h4>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#0284c7' }}>{analysisResult.stage}</p>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-save" onClick={handleAnalysisClose} style={{ width: '100%' }}>
                                Close & Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WoundUploadModal;
