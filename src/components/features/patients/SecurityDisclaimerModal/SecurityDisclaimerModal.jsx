import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import './SecurityDisclaimerModal.css';

function SecurityDisclaimerModal({ onConfirm, onCancel }) {
  return (
    <div className="security-modal-overlay">
      <div className="security-modal-container">
        <div className="security-modal-header">
          <div className="security-icon-circle">
            <Lock size={24} />
          </div>
          <div className="security-title-group">
            <h2 className="security-modal-title">Clinical Access Warning</h2>
            <span className="security-protocol-tag">RESTRICTED PROTOCOL</span>
          </div>
        </div>

        <div className="security-modal-body">
          <div className="security-alert-banner">
            <ShieldAlert size={20} />
            <span>Break-the-Glass Security Protocol Active</span>
          </div>

          <p className="security-message">
            You are attempting to access the <strong>Global Patient Registry</strong>.
            By standard protocol, your active workspace is limited to your assigned clinical tasks.
          </p>

          <div className="security-notice-list">
            <div className="security-notice-item">
              <div className="notice-dot red"></div>
              <p>This access event will be logged in the permanent audit trail.</p>
            </div>
            <div className="security-notice-item">
              <div className="notice-dot red"></div>
              <p>Your name, IP address, and timestamp will be reported to Clinical Governance.</p>
            </div>
            <div className="security-notice-item">
              <div className="notice-dot red"></div>
              <p>You must have a valid clinical justification for viewing unassigned records.</p>
            </div>
          </div>

          <div className="security-acknowledgment-box">
            <AlertTriangle size={18} color="#94a3b8" />
            <p>Unauthorized access to PHI (Protected Health Information) is a severe compliance violation.</p>
          </div>
        </div>

        <div className="security-modal-footer">
          <button className="btn-security-cancel" onClick={onCancel}>
            Return to Dashboard
          </button>
          <button className="btn-security-confirm" onClick={onConfirm}>
            I Understand & Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityDisclaimerModal;
