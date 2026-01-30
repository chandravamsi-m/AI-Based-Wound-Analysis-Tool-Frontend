
import { Search, Calendar, Filter, Plus, Eye } from 'lucide-react';
import './AssessmentHistory.css';

function AssessmentHistory() {
  const assessments = [
    {
      id: 1,
      date: 'Oct 24, 2023',
      time: '05:30',
      patient: 'Anil Kumar',
      mrn: 'MRN-8821',
      wound: 'Right Heel',
      woundType: 'Pressure Ulcer',
      area: '4.2 cm²',
      depth: '0.5 cm',
      granulation: 20,
      tissueBar: { red: 25.6, yellow: 64, dark: 38.4 },
      status: 'Deteriorating',
      statusColor: '#E55039',
      statusBg: 'rgba(229, 80, 57, 0.1)'
    },
    {
      id: 2,
      date: 'Oct 22, 2023',
      time: '05:30',
      patient: 'Sunita Sharma',
      mrn: 'MRN-9932',
      wound: 'Lower Left Leg',
      woundType: 'Venous Ulcer',
      area: '12.5 cm²',
      depth: '0.1 cm',
      granulation: 80,
      tissueBar: { red: 102.4, yellow: 12.8, dark: 0 },
      status: 'Healing',
      statusColor: '#007A55',
      statusBg: '#D0FAE5'
    },
    {
      id: 3,
      date: 'Oct 10, 2023',
      time: '05:30',
      patient: 'Anil Kumar',
      mrn: 'MRN-8821',
      wound: 'Right Heel',
      woundType: 'Pressure Ulcer',
      area: '3.8 cm²',
      depth: '0.4 cm',
      granulation: 30,
      tissueBar: { red: 38.4, yellow: 64, dark: 25.6 },
      status: 'Deteriorating',
      statusColor: '#E55039',
      statusBg: 'rgba(229, 80, 57, 0.1)'
    }
  ];

  return (
    <div className="assessment-history-page">
      <div className="assessment-history-header">
        <div className="assessment-history-title-section">
          <h1 className="assessment-history-title">Assessment History</h1>
          <p className="assessment-history-subtitle">
            View and manage wound assessments across all patients.
          </p>
        </div>
        <button className="btn-new-assessment">
          <Plus size={16} />
          <span>New Assessment</span>
        </button>
      </div>

      <div className="assessment-filters">
        <div className="assessment-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient, MRN, or wound location..."
            className="assessment-search-input"
          />
        </div>
        <select className="filter-dropdown">
          <option>All Statuses</option>
          <option>Healing</option>
          <option>Stationary</option>
          <option>Deteriorating</option>
        </select>
        <button className="btn-date-range">
          <Calendar size={16} />
          <span>Date Range</span>
        </button>
        <button className="btn-more-filters">
          <Filter size={16} />
          <span>More Filters</span>
        </button>
      </div>

      <div className="assessment-table-container">
        <table className="assessment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Wound</th>
              <th>Dimensions</th>
              <th>Tissue Comp.</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment.id}>
                <td>
                  <div className="date-cell">
                    <div className="date-with-icon">
                      <Calendar size={16} />
                      <span className="date-text">{assessment.date}</span>
                    </div>
                    <span className="time-text">{assessment.time}</span>
                  </div>
                </td>
                <td>
                  <div className="patient-cell">
                    <span className="patient-name">{assessment.patient}</span>
                    <span className="patient-mrn">{assessment.mrn}</span>
                  </div>
                </td>
                <td>
                  <div className="wound-cell">
                    <span className="wound-location">{assessment.wound}</span>
                    <span className="wound-type">{assessment.woundType}</span>
                  </div>
                </td>
                <td>
                  <div className="dimensions-cell">
                    <div className="dimension-item">
                      <span className="dimension-label">AREA</span>
                      <span className="dimension-value">{assessment.area}</span>
                    </div>
                    <div className="dimension-item">
                      <span className="dimension-label">DEPTH</span>
                      <span className="dimension-value">{assessment.depth}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="tissue-cell">
                    <div className="tissue-header">
                      <span className="tissue-label">Granulation</span>
                      <span className="tissue-percentage">{assessment.granulation}%</span>
                    </div>
                    <div className="tissue-bar">
                      <div
                        className="tissue-bar-segment tissue-bar-red"
                        style={{ width: `${assessment.tissueBar.red}px` }}
                      ></div>
                      <div
                        className="tissue-bar-segment tissue-bar-yellow"
                        style={{ width: `${assessment.tissueBar.yellow}px` }}
                      ></div>
                      {assessment.tissueBar.dark > 0 && (
                        <div
                          className="tissue-bar-segment tissue-bar-dark"
                          style={{ width: `${assessment.tissueBar.dark}px` }}
                        ></div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      background: assessment.statusBg,
                      color: assessment.statusColor
                    }}
                  >
                    {assessment.status}
                  </span>
                </td>
                <td className="text-right">
                  <button className="btn-view-assessment">
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="assessment-pagination">
        <div className="pagination-info">
          <span>Showing</span>
          <span className="pagination-number">3</span>
          <span>results</span>
        </div>
        <div className="pagination-controls">
          <button className="btn-pagination" disabled>Previous</button>
          <button className="btn-pagination" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentHistory;

