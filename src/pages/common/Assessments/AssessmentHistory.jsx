import { useCallback, useEffect, useState } from 'react';
import { Search, Calendar, Plus, Eye } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import WoundUploadModal from '../../../components/features/assessments/WoundUploadModal/WoundUploadModal';
import AssessmentDetailModal from '../../../components/features/assessments/AssessmentDetailModal/AssessmentDetailModal';
import './AssessmentHistory.css';

function AssessmentHistory() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const getGranulationByStage = (stage) => {
    const value = String(stage || '').toLowerCase();
    if (value === 'stage 1') return 80;
    if (value === 'stage 2') return 55;
    return 25;
  };

  const buildTissueBar = (granulation) => {
    const total = 128;
    const red = Math.round((granulation / 100) * total);
    const yellow = Math.round((((100 - granulation) * 0.7) / 100) * total);
    const dark = Math.max(0, total - red - yellow);
    return { red, yellow, dark };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'All Statuses') params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await apiClient.get('/clinical/assessments/', { params });
      const payload = response.data || {};
      const rows = Array.isArray(payload) ? payload : payload.results || [];

      setAssessments(rows);
      setTotalCount(Array.isArray(payload) ? rows.length : payload.count || rows.length);
      setTotalPages(Array.isArray(payload) ? 1 : payload.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assessments. Please try again.');
      setAssessments([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return (
    <div className="assessment-history-page">
      <div className="assessment-history-header">
        <div className="assessment-history-title-section">
          <h1 className="assessment-history-title">Assessment History</h1>
          <p className="assessment-history-subtitle">View and manage wound assessments across all patients.</p>
        </div>
        <button className="btn-new-assessment" onClick={() => setShowUploadModal(true)}>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-dropdown"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option>All Statuses</option>
          <option>Healing</option>
          <option>Stationary</option>
          <option>Deteriorating</option>
        </select>
        <div className="btn-date-range">
          <Calendar size={16} />
          <input
            type="date"
            className="assessment-date-input"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <span className="assessment-date-sep">-</span>
          <input
            type="date"
            className="assessment-date-input"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
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
            {loading && (
              <tr>
                <td colSpan="7" className="assessment-state-cell">Loading assessments...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="7" className="assessment-state-cell error">{error}</td>
              </tr>
            )}

            {!loading && !error && assessments.length === 0 && (
              <tr>
                <td colSpan="7" className="assessment-state-cell">No assessments found for current filters.</td>
              </tr>
            )}

            {!loading && !error && assessments.map((assessment) => {
              const granulation = getGranulationByStage(assessment.stage);
              const tissueBar = buildTissueBar(granulation);
              const createdAt = assessment.created_at ? new Date(assessment.created_at) : null;

              return (
                <tr key={assessment.id}>
                  <td>
                    <div className="date-cell">
                      <div className="date-with-icon">
                        <Calendar size={16} />
                        <span className="date-text">{createdAt ? createdAt.toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <span className="time-text">{createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="patient-cell">
                      <span className="patient-name">{assessment.patient_name}</span>
                      <span className="patient-mrn">{assessment.patient_mrn}</span>
                    </div>
                  </td>
                  <td>
                    <div className="wound-cell">
                      <span className="wound-location">{assessment.wound}</span>
                      <span className="wound-type">{assessment.wound_type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="dimensions-cell">
                      <div className="dimension-item">
                        <span className="dimension-label">AREA</span>
                        <span className="dimension-value">{assessment.width ? `${assessment.width} cm` : '--'}</span>
                      </div>
                      <div className="dimension-item">
                        <span className="dimension-label">DEPTH</span>
                        <span className="dimension-value">{assessment.depth ? `${assessment.depth} cm` : '--'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="tissue-cell">
                      <div className="tissue-header">
                        <span className="tissue-label">{assessment.stage || 'Stage'}</span>
                        <span className="tissue-percentage">{granulation}%</span>
                      </div>
                      <div className="tissue-bar">
                        <div className="tissue-bar-segment tissue-bar-red" style={{ width: `${tissueBar.red}px` }}></div>
                        <div className="tissue-bar-segment tissue-bar-yellow" style={{ width: `${tissueBar.yellow}px` }}></div>
                        {tissueBar.dark > 0 && <div className="tissue-bar-segment tissue-bar-dark" style={{ width: `${tissueBar.dark}px` }}></div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: assessment.status_bg, color: assessment.status_color }}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn-view-assessment" onClick={() => setSelectedAssessmentId(assessment.id)}>
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="assessment-pagination">
        <div className="pagination-info">
          <span>Showing </span>
          <span className="pagination-number">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}</span>
          <span> of {totalCount} results</span>
        </div>
        <div className="pagination-controls">
          <button className="btn-pagination" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <button className="btn-pagination" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </div>
      </div>

      {showUploadModal && (
        <WoundUploadModal
          onClose={() => setShowUploadModal(false)}
          onCompleted={() => {
            setShowUploadModal(false);
            fetchAssessments();
          }}
        />
      )}

      {selectedAssessmentId && (
        <AssessmentDetailModal assessmentId={selectedAssessmentId} onClose={() => setSelectedAssessmentId(null)} />
      )}
    </div>
  );
}

export default AssessmentHistory;