import { useEffect, useState } from 'react';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './AssessmentDetailModal.css';

function AssessmentDetailModal({ assessmentId, onClose }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assessmentId) return;

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/clinical/assessments/${assessmentId}/`);
        setAssessment(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load assessment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  return (
    <div className="modal-overlay">
      <div className="modal-container assessment-detail-modal">
        <div className="modal-header">
          <h2 className="modal-title">Assessment Report</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-form">
          {loading && <div className="assessment-detail-state">Loading assessment...</div>}
          {error && <div className="assessment-detail-error">{error}</div>}

          {!loading && !error && assessment && (
            <>
              <div className="assessment-detail-top">
                <div className="assessment-detail-badge" style={{ background: assessment.status_bg, color: assessment.status_color }}>
                  {assessment.status}
                </div>
              </div>

              <div className="assessment-detail-grid">
                <div className="assessment-detail-item">
                  <span className="label">Patient</span>
                  <span className="value">{assessment.patient_name}</span>
                </div>
                <div className="assessment-detail-item">
                  <span className="label">MRN</span>
                  <span className="value">{assessment.patient_mrn}</span>
                </div>
                <div className="assessment-detail-item">
                  <span className="label">Wound</span>
                  <span className="value">{assessment.wound} ({assessment.wound_type})</span>
                </div>
                <div className="assessment-detail-item">
                  <span className="label">Stage</span>
                  <span className="value">{assessment.stage}</span>
                </div>
                <div className="assessment-detail-item">
                  <span className="label">Width</span>
                  <span className="value">{assessment.width} cm</span>
                </div>
                <div className="assessment-detail-item">
                  <span className="label">Depth</span>
                  <span className="value">{assessment.depth} cm</span>
                </div>
                <div className="assessment-detail-item full">
                  <span className="label"><Calendar size={14} /> Timestamp</span>
                  <span className="value">{assessment.created_at ? new Date(assessment.created_at).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="assessment-detail-item full">
                  <span className="label"><User size={14} /> Created By</span>
                  <span className="value">
                    {assessment.created_by_name || 'Unknown'} ({assessment.created_by_role || 'Unknown'})
                  </span>
                </div>
                <div className="assessment-detail-item full">
                  <span className="label">Notes</span>
                  <span className="value">{assessment.notes || 'No notes provided.'}</span>
                </div>
              </div>

              {assessment.is_escalated && (
                <div className="assessment-detail-alert">
                  <AlertCircle size={16} />
                  <span>Escalated assessment - urgent physician review recommended.</span>
                </div>
              )}

              <div className="assessment-detail-image-wrap">
                {assessment.image ? (
                  <img src={assessment.image} alt="Assessment" className="assessment-detail-image" />
                ) : (
                  <div className="assessment-detail-state">No image available for this assessment.</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-save" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentDetailModal;
