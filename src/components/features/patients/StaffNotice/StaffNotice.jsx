import { AlertCircle } from 'lucide-react';
import './StaffNotice.css';

function StaffNotice() {
  return (
    <div className="staff-notice">
      <div className="staff-notice-header">
        <AlertCircle size={16} />
        <h3 className="staff-notice-title">STAFF NOTICE</h3>
      </div>
      <p className="staff-notice-text">
        New wound assessment protocols for diabetic foot ulcers (DFUs) are now active. 
        Please ensure 3-angle photo captures for all new DFU intakes.
      </p>
    </div>
  );
}

export default StaffNotice;

