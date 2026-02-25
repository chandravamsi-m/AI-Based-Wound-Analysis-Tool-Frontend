import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import PatientDetailsModal from '../../../components/features/patients/PatientDetailsModal/PatientDetailsModal';
import './PatientsList.css';

function PatientsList({ onAddPatient }) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const itemsPerPage = 5;

  // Get current user to check role
  const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const isNurse = currentUser?.role === 'Nurse';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      // Backend handles role-based filtering:
      // Nurses: assigned only | Doctors/Admins: full registry
      const response = await apiClient.get('/clinical/patients/');

      const formatted = response.data.map(p => {
        let riskLvl = 'Low';
        let rColor = '#007A55';
        let rBg = '#D0FAE5';

        if (p.status === 'Critical') {
          riskLvl = 'High';
          rColor = '#C10007';
          rBg = '#FFE2E2';
        } else if (p.status === 'Observation' || p.status === 'At Risk') {
          riskLvl = 'Moderate';
          rColor = '#BB4D00';
          rBg = '#FEF3C6';
        }

        return {
          id: p.id,
          name: p.name,
          mrn: p.mrn,
          riskLevel: riskLvl,
          riskColor: rColor,
          riskBg: rBg,
          lastVisit: p.admission_date ? new Date(p.admission_date).toLocaleDateString() : 'New',
          activeWounds: p.active_wounds || 0,
          ...p
        };
      });
      setPatients(formatted);
    } catch (err) {
      console.error("Failed to fetch patients", err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredPatients.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="patients-list-page">
      <header className="patients-header">
        <div className="patients-header-main">
          <div className="patients-header-left">
            <h1 className="patients-header-title">Patients</h1>
            <p className="patients-header-subtitle">Manage patient records and wound history.</p>
          </div>
          <div className="patients-header-right">
            {!isNurse && (
              <button className="btn-add-patient" onClick={onAddPatient}>
                <Plus size={16} />
                <span>Add Patient</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="patients-list-container">
        <div className="patients-toolbar">
          <div className="patients-toolbar-left">
            <div className="patients-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or MRN..."
                className="patients-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button className="btn-filter" onClick={() => alert('Filter options coming soon...')}>
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="patients-table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>MRN</th>
                <th>Risk Level</th>
                <th className="hide-on-mobile">Last Visit</th>
                <th className="hide-on-mobile">Active Wounds</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading patients...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</div>
                    <button onClick={fetchPatients} style={{ padding: '8px 16px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>
                      Retry
                    </button>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    {searchTerm ? 'No patients match your search.' : 'No patients found. Add a new patient to get started.'}
                  </td>
                </tr>
              ) : (
                currentData.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-name-cell">
                        <div className="patient-avatar-placeholder">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="patient-name">{patient.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="patient-mrn">{patient.mrn}</span>
                    </td>
                    <td>
                      <span
                        className="risk-badge"
                        style={{
                          background: patient.riskBg,
                          color: patient.riskColor
                        }}
                      >
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="hide-on-mobile">
                      <span className="patient-date">{patient.lastVisit}</span>
                    </td>
                    <td className="hide-on-mobile">
                      <span className="patient-wounds">{patient.activeWounds}</span>
                    </td>
                    <td className="text-right">
                      <button className="btn-view" onClick={() => setSelectedPatient(patient)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="patients-list-footer">
          <div className="patients-notice">
            CLINICAL GOVERNANCE: ALL RECORDS ARE AUDITED BY SYSTEM SPECIALISTS
          </div>
          <div className="patients-pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

export default PatientsList;
