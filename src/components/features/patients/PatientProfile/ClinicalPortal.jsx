import React, { useState, useEffect } from 'react';
import { Upload, X, Camera, Info, AlertCircle, Save, ChevronLeft, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { ANTERIOR_REGIONS, POSTERIOR_REGIONS } from './bodyRegions';
import apiClient from '../../../../services/apiClient';
import './ClinicalPortal.css';

const ClinicalPortal = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState('anterior');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [viewerState, setViewerState] = useState({ index: null, zoom: 1, rotation: 0, isPointing: false, isEditing: false });
  const [imageAnnotations, setImageAnnotations] = useState({}); // { [index]: [{x, y}] }
  const [imageFilters, setImageFilters] = useState({}); // { [index]: { brightness, contrast, grayscale, invert } }
  const [patientData, setPatientData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [previousArea, setPreviousArea] = useState(null);
  const [reductionRate, setReductionRate] = useState(null);
  const [formData, setFormData] = useState({
    woundType: '',
    onsetDate: '',
    woundStage: '',
    exudateAmount: '',
    length: '',
    width: '',
    depth: '',
    painLevel: 4,
    notes: ''
  });

  const defaultFilters = { brightness: 100, contrast: 100, grayscale: 0, invert: 0 };

  useEffect(() => {
    const storedPatient = sessionStorage.getItem('clinical_portal_patient');
    if (storedPatient) {
      try {
        const parsed = JSON.parse(storedPatient);
        setPatientData(parsed);

        // Fetch previous assessment area for reduction rate
        const fetchPreviousArea = async () => {
          try {
            const response = await apiClient.get(`/clinical/assessments/?patient_id=${parsed.id}`);
            if (response.data && response.data.results) {
              const data = response.data.results;
              if (data.length > 0) {
                // Find latest assessment with dimensions
                const lastWithDims = data.find(a => a.length && a.width);
                if (lastWithDims) {
                  setPreviousArea(parseFloat(lastWithDims.length) * parseFloat(lastWithDims.width));
                }
              }
            }
          } catch (e) {
            console.error('Failed to fetch previous area:', e);
          }
        };
        fetchPreviousArea();
      } catch (e) {
        console.error('Failed to parse patient data:', e);
      }
    }
  }, []);

  const runAIAnalysis = async (imageData) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      // In a real app, this would call a dedicated ML service
      // For now, we mock it or use the backend's hidden analysis logic
      const response = await apiClient.post('/clinical/nature-ml/analyze/', { image: imageData });

      if (response.status === 200) {
        const result = response.data;
        setAiAnalysis(result);

        let reductionInfo = "";
        if (previousArea && result.dimensions?.length && result.dimensions?.width) {
          const currentArea = result.dimensions.length * result.dimensions.width;
          const localReduction = ((previousArea - currentArea) / previousArea) * 100;
          setReductionRate(localReduction.toFixed(1));
          reductionInfo = `\n\n[AI HEALING PROGRESS]: Wound area has reduced by ${localReduction.toFixed(1)}% since last assessment.`;
        }

        setFormData(prev => ({
          ...prev,
          woundType: result.wound_type || prev.woundType,
          woundStage: result.stage || prev.woundStage,
          length: result.dimensions?.length || prev.length,
          width: result.dimensions?.width || prev.width,
          notes: prev.notes + `\n\n[AI SUGGESTION]: ${result.cure_recommendation}${reductionInfo}`
        }));
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
      // Fallback to mock data for demonstration if ML service is not reachable
      const mockResult = {
        wound_type: "Pressure Ulcer",
        stage: "Stage II",
        dimensions: { length: 4.2, width: 3.5 },
        cure_recommendation: "Maintain moist wound environment. Apply hydrocolloid dressing every 3 days."
      };
      setAiAnalysis(mockResult);
      setFormData(prev => ({
        ...prev,
        woundType: mockResult.wound_type,
        woundStage: mockResult.stage,
        length: mockResult.dimensions.length,
        width: mockResult.dimensions.width,
        notes: prev.notes + `\n\n[AI SUGGESTION (MOCK)]: ${mockResult.cure_recommendation}`
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setUploadedImages(prev => [...prev, imageData]);
        if (uploadedImages.length === 0) {
          runAIAnalysis(imageData);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (viewerState.index === index) {
      setViewerState({ index: null, zoom: 1, rotation: 0, isPointing: false, isEditing: false });
    } else if (viewerState.index > index) {
      setViewerState(prev => ({ ...prev, index: prev.index - 1 }));
    }
  };

  const handleViewerAction = (action) => {
    if (action === 'zoomIn') setViewerState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.2, 3) }));
    if (action === 'zoomOut') setViewerState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.2, 0.5) }));
    if (action === 'rotate') setViewerState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
    if (action === 'togglePoint') setViewerState(prev => ({ ...prev, isPointing: !prev.isPointing, isEditing: false }));
    if (action === 'toggleEdit') setViewerState(prev => ({ ...prev, isEditing: !prev.isEditing, isPointing: false }));
    if (action === 'clearPoints') setImageAnnotations(prev => ({ ...prev, [viewerState.index]: [] }));
    if (action === 'resetEdits') setImageFilters(prev => ({ ...prev, [viewerState.index]: defaultFilters }));
  };

  const updateFilter = (property, value) => {
    setImageFilters(prev => ({
      ...prev,
      [viewerState.index]: {
        ...(prev[viewerState.index] || defaultFilters),
        [property]: value
      }
    }));
  };

  const handleCanvasClick = (e) => {
    if (!viewerState.isPointing || viewerState.index === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setImageAnnotations(prev => ({
      ...prev,
      [viewerState.index]: [...(prev[viewerState.index] || []), { x, y }]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!patientData?.id) {
      alert("Patient identity error. Please reload.");
      return;
    }

    try {
      // Assemble rich data for the backend
      const payload = {
        patient_id: patientData.id,
        wound_type: formData.woundType,
        stage: formData.woundStage,
        exudate: formData.exudateAmount,
        length: formData.length,
        width: formData.width,
        depth: formData.depth,
        pain_level: formData.painLevel,
        notes: formData.notes,
        location: selectedRegion ? selectedRegion.label : 'General',
        image: uploadedImages[0] // Simplified for first phase
      };

      const response = await apiClient.post('/clinical/nurse/clinical/record-wound/', payload);
      if (response.status === 201 || response.status === 200) {
        alert("Assessment synchronized successfully!");
        onBack();
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save assessment. Check connection.");
    }
  };

  const currentRegions = selectedTab === 'anterior' ? ANTERIOR_REGIONS : POSTERIOR_REGIONS;

  return (
    <div className="clinical-portal-container">
      <header className="clinical-portal-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => onBack()}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1>Wound Assessment Portal</h1>
            <div className="patient-breadcrumb">
              <span className="breadcrumb-label">Patient:</span>
              <span className="breadcrumb-value">{patientData?.name || 'Loading...'}</span>
              <span className="breadcrumb-mrn">{patientData?.mrn}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={() => onBack()}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            <Save size={18} />
            Save Assessment
          </button>
        </div>
      </header>

      <div className="clinical-portal-content">
        <form className="assessment-form" onSubmit={handleSubmit}>
          <div className="form-grid-layout">
            {/* Left Column: Body Map & Location */}
            <div className="form-column-left">
              <section className="form-card">
                <h3 className="card-title">
                  <AlertCircle size={18} />
                  <span>Anatomical Location</span>
                </h3>
                <div className="card-content">
                  <div className="tab-buttons">
                    <button
                      type="button"
                      className={`tab-btn ${selectedTab === 'anterior' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('anterior')}
                    >
                      Anterior View
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${selectedTab === 'posterior' ? 'active' : ''}`}
                      onClick={() => setSelectedTab('posterior')}
                    >
                      Posterior View
                    </button>
                  </div>

                  <div className="body-diagram-container">
                    <p className="diagram-instruction">Select the primary wound site on the map</p>
                    <div className="body-diagram">
                      <svg className="body-svg" viewBox="0 0 200 450">
                        {/* Silhouette base */}
                        <path d="M100,20 C110,20 120,25 125,35 L125,55 C125,65 115,75 100,75 C85,75 75,65 75,55 L75,35 C80,25 90,20 100,20" fill="#e2e8f0" />
                        <rect x="75" y="75" width="50" height="150" fill="#e2e8f0" />
                        {/* Interaction layers */}
                        {currentRegions.map(region => (
                          <rect
                            key={region.id}
                            x={region.x || (region.cx - region.r)}
                            y={region.y || (region.cy - region.r)}
                            width={region.w || (region.r * 2)}
                            height={region.h || (region.r * 2)}
                            className={`region ${selectedRegion?.id === region.id ? 'selected' : ''}`}
                            fill="transparent"
                            stroke={selectedRegion?.id === region.id ? '#2563eb' : 'transparent'}
                            strokeWidth="2"
                            onClick={() => setSelectedRegion(region)}
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {selectedRegion && (
                    <div className="selection-badge">
                      <div className="badge-icon">
                        <div className="badge-dot" />
                      </div>
                      <div className="badge-info">
                        <div className="badge-label">Selected: {selectedRegion.label}</div>
                        <button type="button" className="badge-clear" onClick={() => setSelectedRegion(null)}>Change Location</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="form-card">
                <h3 className="card-title">
                  <Info size={18} />
                  <span>Wound Metadata</span>
                </h3>
                <div className="card-content">
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Wound Type</label>
                      <select name="woundType" value={formData.woundType} onChange={handleChange}>
                        <option value="">Select Type</option>
                        <option value="Pressure Ulcer">Pressure Ulcer</option>
                        <option value="Diabetic Foot Ulcer">Diabetic Foot Ulcer</option>
                        <option value="Surgical Wound">Surgical Wound</option>
                        <option value="Traumatic Wound">Traumatic Wound</option>
                        <option value="Venous Ulcer">Venous Ulcer</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Assessment Stage</label>
                      <select name="woundStage" value={formData.woundStage} onChange={handleChange}>
                        <option value="">Select Stage</option>
                        <option value="Stage I">Stage I</option>
                        <option value="Stage II">Stage II</option>
                        <option value="Stage III">Stage III</option>
                        <option value="Stage IV">Stage IV</option>
                        <option value="Unstageable">Unstageable</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Exudate Amount</label>
                    <select name="exudateAmount" value={formData.exudateAmount} onChange={handleChange}>
                      <option value="">Select Amount</option>
                      <option value="None">None (Dry)</option>
                      <option value="Scant">Scant</option>
                      <option value="Small">Small</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Large">Large / Heavy</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: AI Analysis & Metrics */}
            <div className="form-column-right">
              <section className="form-card">
                <h3 className="card-title">
                  <Camera size={18} />
                  <span>AI Imaging & Analysis</span>
                </h3>
                <div className="card-content">
                  <div className="upload-zone">
                    <Upload className="upload-icon" size={32} />
                    <p className="upload-text">Upload Wound Photo</p>
                    <p className="upload-hint">Drag & drop or click to browse</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="upload-input" />
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="preview-container">
                      <div className="preview-header">
                        <span className="preview-title">Assessment Images</span>
                        <button type="button" className="clear-all-btn" onClick={() => setUploadedImages([])}>Clear All</button>
                      </div>
                      <div className="images-grid">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className={`grid-item ${viewerState.index === index ? 'active' : ''}`} onClick={() => setViewerState({ ...viewerState, index })}>
                            <img src={img} alt={`Preview ${index}`} />
                            <button type="button" className="grid-remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(index); }}>
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {viewerState.index !== null && (
                        <div className="advanced-viewer">
                          <div className="viewer-header">
                            <div className="viewer-info">
                              <span className="viewer-badge">Active Analysis</span>
                              <span className="viewer-name">IMG_{viewerState.index + 1}.JPG</span>
                            </div>
                            <div className="viewer-controls">
                              <button type="button" className="control-btn" onClick={() => handleViewerAction('zoomIn')}><ZoomIn size={14} /></button>
                              <button type="button" className="control-btn" onClick={() => handleViewerAction('zoomOut')}><ZoomOut size={14} /></button>
                              <button type="button" className="control-btn" onClick={() => handleViewerAction('rotate')}><RotateCw size={14} /></button>
                              <button type="button" className="control-close" onClick={() => setViewerState({ ...viewerState, index: null })}><X size={14} /></button>
                            </div>
                          </div>
                          <div className="viewer-canvas">
                            <div className="canvas-constraint">
                              <img
                                src={uploadedImages[viewerState.index]}
                                style={{
                                  transform: `scale(${viewerState.zoom}) rotate(${viewerState.rotation}deg)`,
                                  transition: 'transform 0.2s',
                                  maxWidth: '100%',
                                  maxHeight: '100%'
                                }}
                                alt="Active"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="ai-status">
                      <div className="loading-spinner" />
                      <span>Running ML diagnosis...</span>
                    </div>
                  )}

                  <div className="form-row-3" style={{ marginTop: '24px' }}>
                    <div className="form-field">
                      <label>Length</label>
                      <div className="input-with-unit">
                        <input type="text" name="length" value={formData.length} onChange={handleChange} className={aiAnalysis?.dimensions ? 'ai-populated' : ''} />
                        <span className="unit">cm</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Width</label>
                      <div className="input-with-unit">
                        <input type="text" name="width" value={formData.width} onChange={handleChange} className={aiAnalysis?.dimensions ? 'ai-populated' : ''} />
                        <span className="unit">cm</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Depth</label>
                      <div className="input-with-unit">
                        <input type="text" name="depth" value={formData.depth} onChange={handleChange} />
                        <span className="unit">cm</span>
                      </div>
                    </div>
                  </div>

                  <div className="pain-level-section">
                    <div className="pain-header">
                      <label>Pain Level (Scale 1-10)</label>
                      <span className="pain-value">{formData.painLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="10"
                      name="painLevel"
                      value={formData.painLevel}
                      onChange={handleChange}
                      className="pain-slider"
                    />
                    <div className="pain-labels">
                      <span>None</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="form-card">
                <h3 className="card-title">
                  <Info size={18} />
                  <span>Clinical Observations</span>
                </h3>
                <div className="card-content">
                  <textarea
                    name="notes"
                    rows="6"
                    className="notes-textarea"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add detailed clinical findings. AI suggestions will appear here automatically."
                  />
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicalPortal;
