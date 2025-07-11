import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Scatter, ScatterChart } from 'recharts';
import { generateColorFromId, getLightBackgroundColor } from './utils/colorUtils';

// Components
import ProjectManager from './components/ProjectManager';
import ReMetricSlider from './components/ReMetricSlider';
import RxIndicatorInput from './components/RxIndicatorInput';
import ReMetricInput from './components/ReMetricInput';
import QuadrantChart from './components/QuadrantChart';
import TemporalEvolutionChart from './components/TemporalEvolutionChart';
import { InfoIcon, PlusIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from './components/Icons';
import Tooltip from './components/Tooltip';



// Initial state
const INITIAL_METRICS = {
  L: 5,
  I: 5,
  F: 5,
  E: 5,
  X: 5,
  Fg: 5,
  Omega: 5
};

const INITIAL_METRIC_COMMENTS = {
  L: '',
  I: '',
  F: '',
  E: '',
  X: '',
  Fg: '',
  Omega: ''
};

const INITIAL_RX_INDICATORS = [
  { id: 1, name: 'Example: Soil Organic Matter (%)', value: 0.01 },
  { id: 2, name: 'Example: Employee Turnover Rate (Inverse)', value: 0.01 },
];

// Variable Definitions
export const variableDefinitions = {
  L: {
    name: "L – Localized Identity",
    description: "The system's rootedness in its specific context, culture, and place."
  },
  I: {
    name: "I – Interconnection",
    description: "The degree of integration and relationship across different parts of the system."
  },
  F: {
    name: "F – Feedback & Reciprocity",
    description: "The quality and responsiveness of feedback loops and mutual exchange."
  },
  E: {
    name: "E – Evolutionary Capacity",
    description: "The ability to learn, adapt, and transform under stress."
  },
  X: {
    name: "X – Extractive Pressure",
    description: "The extent of non-reciprocal resource depletion (labor, land, energy)."
  },
  Fg: {
    name: "Fg – Fragmentation",
    description: "Systemic incoherence, disconnection, or breakdown in shared meaning."
  },
  Omega: {
    name: "Ω – Overdetermination",
    description: "The degree of structural rigidity or institutional lock-in that prevents adaptation."
  },
};

function ReRxManager() {
  // State management
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('regenerativeRatioProjects');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  });
  
  // Reset all form fields to their initial state with metrics at 0.01
  const resetFormState = useCallback(() => {
    // Create a new metrics object with all values set to 0.01
    const resetMetrics = Object.keys(INITIAL_METRICS).reduce((acc, key) => ({
      ...acc,
      [key]: 0.01
    }), {});

    // Reset all state variables
    setMetrics(resetMetrics);
    setRxIndicators([{ id: 1, name: '', value: 0.01 }]);
    setSnapshotLabel('');
    setSnapshotDate(new Date().toISOString().split('T')[0]);
    setIndicatorComments({});
    setMetricComments({ ...INITIAL_METRIC_COMMENTS });
    setEditingSnapshotId(null);
  }, []);

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [rxIndicators, setRxIndicators] = useState(INITIAL_RX_INDICATORS);
  const [indicatorComments, setIndicatorComments] = useState({});
  const [metricComments, setMetricComments] = useState(INITIAL_METRIC_COMMENTS);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingSnapshotId, setEditingSnapshotId] = useState(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showQuadrantChart, setShowQuadrantChart] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);

  // Active project data
  const activeProject = useMemo(() =>
    projects.find(p => p.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  // Calculate Re (Regenerative Ratio)
  const calculateRe = useCallback(() => {
    const numerator = parseFloat(metrics.L) * parseFloat(metrics.I) * parseFloat(metrics.F) * parseFloat(metrics.E);
    const denominator = parseFloat(metrics.X) + parseFloat(metrics.Fg) + parseFloat(metrics.Omega);
    const reRaw = denominator !== 0 ? numerator / denominator : Infinity;
    const reLog = Math.log10(reRaw + 1);
    return { reRaw, reLog };
  }, [metrics]);

  // Update local storage when projects change
  useEffect(() => {
    try {
      localStorage.setItem('regenerativeRatioProjects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [projects]);

  // Initialize with a default project if none exists
  useEffect(() => {
    if (projects.length === 0) {
      const defaultProject = {
        id: `project-${Date.now()}`,
        name: 'Default Project',
        timePoints: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProjects([defaultProject]);
      setActiveProjectId(defaultProject.id);
    } else if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  // Get snapshots for active project
  const snapshots = useMemo(() =>
    activeProject?.timePoints || [],
    [activeProject]);

  // Calculate Rx (Realized Regeneration Index)
  const calculateRx = useCallback(() => {
    if (rxIndicators.length === 0) return { rx: 0, rxScaled: 0 };
    const total = rxIndicators.reduce((sum, ind) => sum + (isNaN(ind.value) ? 0 : ind.value), 0);
    const average = total / rxIndicators.length;
    const scaled = average * 0.552;
    return { rx: average, rxScaled: scaled };
  }, [rxIndicators]);

  // Get current values
  const { reRaw, reLog } = calculateRe();
  const { rx, rxScaled } = calculateRx();

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('regenerativeRatioProjects');
      console.log('Loading projects from localStorage:', savedProjects);

      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        console.log('Parsed projects:', parsedProjects);

        setProjects(parsedProjects);

        // Set the first project as active if none is set
        if (parsedProjects.length > 0 && !activeProjectId) {
          console.log('Setting initial active project:', parsedProjects[0].id);
          setActiveProjectId(parsedProjects[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) { // Only save if we have projects
      try {
        console.log('Saving projects to localStorage:', projects);
        localStorage.setItem('regenerativeRatioProjects', JSON.stringify(projects));
      } catch (error) {
        console.error('Error saving projects:', error);
      }
    }
  }, [projects]);

  // Project management
  const createProject = (name) => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: name.trim(),
      timePoints: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowProjectManager(false); // Close the project manager after creating a project
  };

  const deleteProject = (id) => {
    if (projects.length <= 1) return; // Prevent deleting the last project

    if (window.confirm('Are you sure you want to delete this project and all its snapshots?')) {
      setProjects(prev => {
        const updated = prev.filter(p => p.id !== id);

        // If the active project was deleted, switch to another one
        if (activeProjectId === id) {
          const nextProject = updated[0];
          setActiveProjectId(nextProject ? nextProject.id : null);
        }

        return updated;
      });
    }
  };

  // Update an existing snapshot
  const updateSnapshot = () => {
    if (!editingSnapshotId) return;

    const { reLog } = calculateRe();
    const { rxScaled } = calculateRx();

    // Prepare indicators with their comments
    const indicatorsWithComments = rxIndicators.map(indicator => ({
      ...indicator,
      comment: indicatorComments[indicator.id] || ''
    }));

    // Prepare metrics with their comments for saving
    const metricsWithComments = Object.keys(metrics).reduce((acc, key) => ({
      ...acc,
      [key]: metrics[key] // Keep just the value for now to maintain backward compatibility
    }), {});

    // Store metric comments separately in the snapshot
    const snapshotMetricComments = { ...metricComments };

    // Create timestamp from the selected date (set to noon to be consistent)
    const selectedDate = new Date(snapshotDate);
    selectedDate.setHours(12, 0, 0, 0);

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === activeProjectId) {
          return {
            ...proj,
            timePoints: proj.timePoints.map(tp => {
              if (tp.id === editingSnapshotId) {
                return {
                  ...tp,
                  label: snapshotLabel.trim() || `Snapshot ${new Date(selectedDate).toLocaleString()}`,
                  metrics: metricsWithComments,
                  metricComments: snapshotMetricComments,
                  rxIndicators: indicatorsWithComments,
                  timestamp: selectedDate.toISOString(),
                  reLog,
                  rxScaled,
                  x: reLog,
                  y: rxScaled
                };
              }
              return tp;
            }),
          };
        }
        return proj;
      })
    );

    // Reset editing state
    setEditingSnapshotId(null);
    setSnapshotLabel('');
    setSnapshotDate(new Date().toISOString().split('T')[0]);
    setIndicatorComments({});
    resetFormState();
  };

  // Cancel editing and reset form
  const cancelEdit = () => {
    resetFormState();
  };

  // Snapshot management
  const saveSnapshot = (customLabel = '') => {
    console.log('saveSnapshot called with:', { customLabel, snapshotLabel, activeProjectId });

    if (!activeProjectId) {
      console.error('No active project ID');
      return;
    }

    // Prepare indicators with their comments
    const indicatorsWithComments = rxIndicators.map(indicator => ({
      ...indicator,
      comment: indicatorComments[indicator.id] || ''
    }));

    // Format date as DD/MM/YYYY for the default label
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const label = customLabel || (snapshotLabel.trim() !== '' ? snapshotLabel : `Snapshot ${formatDate(snapshotDate)}`);
    console.log('Using label:', label);

    // Calculate values first
    const { reLog } = calculateRe();
    const { rxScaled } = calculateRx();

    // Prepare metrics with their comments for saving
    const metricsWithComments = Object.keys(metrics).reduce((acc, key) => ({
      ...acc,
      [key]: metrics[key] // Keep just the value for now to maintain backward compatibility
    }), {});

    // Store metric comments separately in the snapshot
    const snapshotMetricComments = { ...metricComments };

    // Create timestamp from the selected date (set to noon to be consistent)
    const selectedDate = new Date(snapshotDate);
    selectedDate.setHours(12, 0, 0, 0);

    const newSnapshot = {
      id: `snapshot-${Date.now()}`,
      label: label,
      metrics: metricsWithComments,
      metricComments: snapshotMetricComments,
      rxIndicators: indicatorsWithComments,
      timestamp: selectedDate.toISOString(),
      reLog,
      rxScaled,
      x: reLog,
      y: rxScaled
    };

    console.log('New snapshot data:', newSnapshot);

    setProjects(prev => {
      console.log('Previous projects state:', JSON.parse(JSON.stringify(prev)));

      const updated = prev.map(project => {
        if (project.id === activeProjectId) {
          const updatedProject = {
            ...project,
            timePoints: [...(project.timePoints || []), newSnapshot],
            updatedAt: new Date().toISOString()
          };
          console.log('Updated project:', updatedProject);
          return updatedProject;
        }
        return project;
      });

      console.log('Updated projects state:', JSON.parse(JSON.stringify(updated)));
      return updated;
    });

    // Reset the form state including all metrics, indicators, and comments
    resetFormState();
    console.log('Form reset after saving snapshot');
  };

  const deleteSnapshot = (snapshotId) => {
    if (!window.confirm('Are you sure you want to delete this snapshot?')) return;

    setProjects(prev =>
      prev.map(project =>
        project.id === activeProjectId
          ? {
            ...project,
            timePoints: project.timePoints.filter(s => s.id !== snapshotId),
            updatedAt: new Date().toISOString()
          }
          : project
      )
    );
  };

  // Handle edit button click for a snapshot
  const handleEditSnapshot = (snapshot, e) => {
    e.stopPropagation(); // Prevent triggering the row click
    loadSnapshot(snapshot, true);
  };

  // Load a snapshot's data into the UI
  const loadSnapshot = (snapshot, isEdit = false) => {
    if (!snapshot) return;

    // Update metrics
    setMetrics({
      L: Math.min(10, Math.max(0, snapshot.metrics?.L || 5)),
      I: Math.min(10, Math.max(0, snapshot.metrics?.I || 5)),
      F: Math.min(10, Math.max(0, snapshot.metrics?.F || 5)),
      E: Math.min(10, Math.max(0, snapshot.metrics?.E || 5)),
      X: Math.min(10, Math.max(0, snapshot.metrics?.X || 5)),
      Fg: Math.min(10, Math.max(0, snapshot.metrics?.Fg || 5)),
      Omega: Math.min(10, Math.max(0, snapshot.metrics?.Omega || 5))
    });

    // Set the snapshot date if we're editing
    if (isEdit && snapshot.timestamp) {
      const date = new Date(snapshot.timestamp);
      const dateString = date.toISOString().split('T')[0];
      setSnapshotDate(dateString);
    }

    // Load metric comments if they exist
    if (snapshot.metricComments) {
      setMetricComments({
        ...INITIAL_METRIC_COMMENTS,
        ...snapshot.metricComments
      });
    } else {
      setMetricComments(INITIAL_METRIC_COMMENTS);
    }

    // Load indicator comments
    if (snapshot.rxIndicators) {
      const comments = {};
      snapshot.rxIndicators.forEach(ind => {
        if (ind.comment) {
          comments[ind.id] = ind.comment;
        }
      });
      setIndicatorComments(comments);
    }
    
    // Set the snapshot label if we're editing
    if (isEdit) {
      setSnapshotLabel(snapshot.label || '');
      setEditingSnapshotId(snapshot.id);
    } else {
      setEditingSnapshotId(null);
    }

    // Update Rx indicators if they exist
    if (snapshot.rxIndicators?.length > 0) {
      setRxIndicators(
        snapshot.rxIndicators.map(ind => ({
          id: ind.id,
          name: ind.name || `Indicator ${ind.id}`,
          value: Math.min(10, Math.max(0.01, ind.value || 0.01))
        }))
      );
    }

    // Update the snapshot label for the next save
    setSnapshotLabel(snapshot.label || '');
  };

  // Rx Indicator management
  const handleMetricChange = (metric, value) => {
    const newValue = Math.min(10, Math.max(0, parseFloat(value) || 0));
    setMetrics(prev => ({
      ...prev,
      [metric]: newValue
    }));
    return newValue;
  };

  const handleMetricCommentChange = (metricId, text) => {
    setMetricComments(prev => ({
      ...prev,
      [metricId]: text
    }));
  };

  const handleRxIndicatorChange = (id, field, value) => {
    setRxIndicators(
      rxIndicators.map(ind => (ind.id === id ? { ...ind, [field]: value } : ind))
    );
  };

  const handleCommentChange = (indicatorId, text) => {
    setIndicatorComments(prev => ({
      ...prev,
      [indicatorId]: text
    }));
  };

  const handleRxIndicatorNameChange = (id, name) => {
    setRxIndicators(prev =>
      prev.map(indicator =>
        indicator.id === id
          ? { ...indicator, name: name || `Indicator ${id}` }
          : indicator
      )
    );
  };

  const addRxIndicator = () => {
    const newId = rxIndicators.length > 0 ? Math.max(...rxIndicators.map(i => i.id)) + 1 : 1;
    setRxIndicators([...rxIndicators, { id: newId, name: '', value: 0.01 }]);
  };

  const removeRxIndicator = (id) => {
    setRxIndicators(rxIndicators.filter(ind => ind.id !== id));
  };

  // Get chart data for the active project
  const getChartData = () => {
    if (!activeProject || !activeProject.timePoints) return [];

    return activeProject.timePoints.map(tp => ({
      name: tp.label,
      'Re (log)': tp.reLog,
      'Rx (scaled)': tp.rxScaled,
      date: new Date(tp.timestamp).toLocaleDateString(),
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle project manager visibility
  const toggleProjectManager = () => {
    setShowProjectManager(!showProjectManager);
  };

  // Toggle quadrant chart visibility
  const toggleQuadrantChart = () => {
    setShowQuadrantChart(!showQuadrantChart);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:pt-12 md:px-8">
      {/* License Banner */}
      <div 
        className="bg-blue-600 text-white text-center py-2 px-4 -mx-4 md:-mx-8 mb-6 md:mb-8 cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => setShowQRCode(true)}
      >
        <p className="text-xs md:text-sm">
          Licensed under Creative Commons BY-NC-ND 4.0. You may share this work with proper attribution, but you may not adapt, remix, or build upon it, and you may not use it for commercial purposes.
        </p>
      </div>

      {/* Main Header */}
      <header className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo-d.png" 
              alt="Logo" 
              className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                Regenerative Ratio Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                A dual diagnostic lens for system regeneration
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <button
              onClick={toggleProjectManager}
              className="flex-1 sm:flex-none px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100"
            >
              {showProjectManager ? 'Hide Projects' : 'Manage Projects'}
            </button>
            {/*
            <button
              onClick={toggleQuadrantChart}
              className="flex-1 sm:flex-none px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-100"
            >
              {showQuadrantChart ? 'Hide Quadrant' : 'Show Quadrant'}
            </button>
            */}
            <a href="https://docs.google.com/document/d/129K7wkojOXs2pjxlLWCisI21eKzQGhLt/edit#heading=h.gmmhipqfkea" target="_blank" className="flex-1 sm:flex-none px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-100">
            Read the Science
            </a>
          </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-medium">Re/Rx</span> is a dual diagnostic lens that reveals a system's <span className="font-medium">regenerative capacity (Re)</span> and its <span className="font-medium">real-world outcomes (Rx)</span>. Use this dashboard to track and analyze the health and performance of your regenerative systems.
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Regenerative Capacity (Re) Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(metrics).map(([key, value]) => {
                const definition = variableDefinitions[key];
                return (
                  <ReMetricInput
                    key={key}
                    id={key}
                    label={key}
                    value={value}
                    onChange={(newValue) => handleMetricChange(key, newValue)}
                    min={0.01}
                    max={10}
                    step={0.01}
                    definition={definition} // Pass the full definition object
                    comment={metricComments[key] || ''}
                    onCommentChange={handleMetricCommentChange}
                  />
                );
              })}
            </div>
          </div>

          {/* Rx Indicators */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Realized Regeneration (Rx) Indicators</h2>
              <button
                onClick={addRxIndicator}
                className="flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors w-full sm:w-auto"
              >
                <PlusIcon className="w-4 h-4 mr-1.5" /> Add Custom Indicator
              </button>
            </div>
            <div className="space-y-3">
              {rxIndicators.length === 0 ? (
                <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No indicators added yet. Click 'Add Custom Indicator' to get started.</p>
                </div>
              ) : (
                rxIndicators.map(ind => (
                  <RxIndicatorInput 
                    key={ind.id} 
                    indicator={ind} 
                    onUpdate={handleRxIndicatorChange} 
                    onRemove={removeRxIndicator}
                    comment={indicatorComments[ind.id] || ''}
                    onCommentChange={handleCommentChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Charts and Snapshots */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
          {/* Current Values */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Values</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="text-sm font-medium text-gray-600">Regenerative Capacity (Re)</h3>
                <p className="text-2xl font-bold">Re log: {reLog.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Re raw: {reRaw.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-sm font-medium text-gray-600">Realized Regeneration (Rx)</h3>
                <p className="text-2xl font-bold">Rx scaled: {rxScaled.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Rx raw: {rx.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingSnapshotId) {
                updateSnapshot();
              } else {
                saveSnapshot();
              }
            }} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {editingSnapshotId ? 'Edit Snapshot' : 'Create New Snapshot'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    placeholder="e.g., Project Milestone, Monthly Check-in"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={snapshotDate}
                      onChange={(e) => setSnapshotDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      editingSnapshotId 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow-md'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {editingSnapshotId ? 'Update Snapshot' : 'Save Snapshot'}
                  </button>
                  {editingSnapshotId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Snapshots */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Saved Snapshots</h2>
            {snapshots.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {[...snapshots].reverse().map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="p-3 border rounded hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => loadSnapshot(snapshot)}
                    style={{
                      backgroundColor: getLightBackgroundColor(generateColorFromId(snapshot.id), 0.2),
                      borderColor: generateColorFromId(snapshot.id)
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{snapshot.label}</p>
                        <p className="text-sm text-gray-500">{formatDate(snapshot.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Re: {snapshot.reLog?.toFixed(2) || 'N/A'}</p>
                        <p className="text-sm">Rx: {snapshot.rxScaled?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={(e) => handleEditSnapshot(snapshot, e)}
                        className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSnapshot(snapshot.id);
                        }}
                        className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No snapshots yet. Adjust metrics and click 'Save Snapshot' to create one.</p>
            )}
          </div>
        </div>
      </main>
      <div className="flex flex-col-reverse xl:flex-row justify-between gap-2 mt-4">
          {/* Temporal Evolution Chart */}
          <div className="bg-white p-6 rounded-lg shadow flex-1 min-w-[60vw] my-auto">
            <h2 className="text-xl font-semibold mb-4">Temporal Evolution</h2>
            <TemporalEvolutionChart data={snapshots} />
          </div>

          {/* Quadrant Chart */}
          {showQuadrantChart && (
            <QuadrantChart
              currentPoint={{
                x: reLog,
                y: rxScaled
              }}
              snapshots={snapshots}
              onPointClick={loadSnapshot}
            />
          )}
      </div>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Project Manager</h2>
                <button
                  onClick={() => setShowProjectManager(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <ProjectManager
                projects={projects}
                activeProjectId={activeProjectId}
                onProjectSelect={(projectId) => {
                  setActiveProjectId(projectId);
                  setShowProjectManager(false); // Close the modal after selecting a project
                }}
                onCreateProject={createProject}
                onDeleteProject={deleteProject}
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRCode(false)}
        >
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQRCode(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              aria-label="Close QR code"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <img 
              src="/qr-ribbon.jpg" 
              alt="QR Code" 
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReRxManager;
