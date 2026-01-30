import { useState, useEffect } from 'react';
import apiClient from '../../../../services/apiClient';
import './MyPatientsList.css';

function MyPatientsList({ searchQuery = '', onNavigate }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/clinical/patients/');
      const formattedPatients = response.data.map(p => ({
        id: p.id,
        patientId: p.mrn,
        initials: p.name.substring(0, 2).toLowerCase(),
        name: p.name,
        room: `ROOM ${p.bed || 'N/A'}`,
        status: p.status,
        statusColor: getStatusColor(p.status)
      }));
      setPatients(formattedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stable': return '#00BC7D';
      case 'Observation': return '#2B7FFF';
      case 'Critical': return '#FB2C36';
      case 'At Risk': return '#FE9A00';
      default: return '#00BC7D';
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.patientId.toLowerCase().includes(query)
    );
  });

  return (
    <div className="my-patients-list">
      <div className="patients-list-header">
        <h3 className="patients-list-title">PATIENTS</h3>
        <button
          className="patients-list-link"
          onClick={() => onNavigate && onNavigate('patients')}
          aria-label="View full patient list"
        >
          FULL LIST
        </button>
      </div>
      <div className="patients-list-items">
        {loading && <div className="patient-item-message">Loading patients...</div>}

        {error && (
          <div className="patient-item-message error">
            <span>{error}</span>
            <button onClick={fetchPatients} className="retry-btn">Retry</button>
          </div>
        )}

        {!loading && !error && filteredPatients.length === 0 && patients.length > 0 && (
          <div className="patient-item-message">No patients match your search.</div>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="patient-item-message">No patients assigned yet.</div>
        )}

        {!loading && !error && filteredPatients.map((patient) => (
          <div key={patient.id} className="patient-item">
            <div className="patient-item-left">
              <div className="patient-avatar">
                <span>{patient.initials}</span>
              </div>
              <div className="patient-info">
                <h4 className="patient-name">{patient.name}</h4>
                <p className="patient-room">{patient.room}</p>
              </div>
            </div>
            <div className="patient-status">
              <div
                className="patient-status-dot"
                style={{ background: patient.statusColor }}
              ></div>
              <span className="patient-status-text">{patient.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyPatientsList;

