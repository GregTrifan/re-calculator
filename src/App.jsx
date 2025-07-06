import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Scatter, ScatterChart } from 'recharts';

// Components
import ProjectManager from './components/ProjectManager';
import ReMetricSlider from './components/ReMetricSlider';
import RxIndicatorInput from './components/RxIndicatorInput';
import QuadrantChart from './components/QuadrantChart';
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

const INITIAL_RX_INDICATORS = [
  { id: 1, name: 'Example: Soil Organic Matter (%)', value: 6 },
  { id: 2, name: 'Example: Employee Turnover Rate (Inverse)', value: 8 },
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

function App() {
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

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [rxIndicators, setRxIndicators] = useState(INITIAL_RX_INDICATORS);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showQuadrantChart, setShowQuadrantChart] = useState(true);

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

  // Snapshot management
  const saveSnapshot = (customLabel = '') => {
    console.log('saveSnapshot called with:', { customLabel, snapshotLabel, activeProjectId });

    if (!activeProjectId) {
      console.error('No active project ID');
      return;
    }

    const label = customLabel || (snapshotLabel.trim() !== '' ? snapshotLabel : `Snapshot ${new Date().toLocaleString()}`);
    console.log('Using label:', label);

    // Calculate values first
    const { reLog } = calculateRe();
    const { rxScaled } = calculateRx();

    const newSnapshot = {
      id: Date.now().toString(),
      label: label.trim(),
      timestamp: new Date().toISOString(),
      metrics: { ...metrics },
      rxIndicators: rxIndicators.map(({ id, name, value }) => ({ id, name, value })),
      reLog,
      rxScaled,
      // Add coordinates for quadrant chart using the calculated values
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

    // Reset the snapshot label
    setSnapshotLabel('');
    console.log('Snapshot label cleared');
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

  // Load a snapshot's data into the UI
  const loadSnapshot = (snapshot) => {
    if (!snapshot) return;

    // Update metrics
    setMetrics({
      ...snapshot.metrics,
      // Ensure all metrics are defined and within range
      L: Math.min(10, Math.max(0, snapshot.metrics.L || 5)),
      I: Math.min(10, Math.max(0, snapshot.metrics.I || 5)),
      F: Math.min(10, Math.max(0, snapshot.metrics.F || 5)),
      E: Math.min(10, Math.max(0, snapshot.metrics.E || 5)),
      X: Math.min(10, Math.max(0, snapshot.metrics.X || 5)),
      Fg: Math.min(10, Math.max(0, snapshot.metrics.Fg || 5)),
      Omega: Math.min(10, Math.max(0, snapshot.metrics.Omega || 5))
    });

    // Update Rx indicators if they exist
    if (snapshot.rxIndicators?.length > 0) {
      setRxIndicators(
        snapshot.rxIndicators.map(ind => ({
          id: ind.id,
          name: ind.name || `Indicator ${ind.id}`,
          value: Math.min(10, Math.max(0, ind.value || 5))
        }))
      );
    }

    // Update the snapshot label for the next save
    setSnapshotLabel(snapshot.label || '');
  };

  // Rx Indicator management
  const handleMetricChange = (metric, value) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: Math.min(10, Math.max(0, parseFloat(value) || 0))
    }));
  };

  const handleRxIndicatorChange = (id, field, value) => {
    setRxIndicators(
      rxIndicators.map(ind => (ind.id === id ? { ...ind, [field]: value } : ind))
    );
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
    setRxIndicators([...rxIndicators, { id: newId, name: '', value: 0.5 }]);
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Regenerative Ratio Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleProjectManager}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              {showProjectManager ? 'Hide Projects' : 'Manage Projects'}
            </button>
            <button
              onClick={toggleQuadrantChart}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
            >
              {showQuadrantChart ? 'Hide Quadrant' : 'Show Quadrant'}
            </button>
          </div>
        </div>
        <p className="text-gray-600">Measure and track your system's health over time</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Regenerative Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(metrics).map(([key, value]) => (
                <ReMetricSlider
                  key={key}
                  id={key}
                  label={key}
                  value={value}
                  onChange={(e) => handleMetricChange(key, parseFloat(e.target.value))}
                  min={0.01}
                  max={10}
                  step={0.01}
                  definition={variableDefinitions[key]}
                />
              ))}
            </div>
          </div>

          {/* Rx Indicators */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Realized Regeneration (Rx) Indicators</h2>
              <button
                onClick={addRxIndicator}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> Add Indicator
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {rxIndicators.map(ind => (
                <RxIndicatorInput key={ind.id} indicator={ind} onUpdate={handleRxIndicatorChange} onRemove={removeRxIndicator} />
              ))}
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
                <h3 className="text-sm font-medium text-gray-600">Realized Regeneration Index (Rx)</h3>
                <p className="text-2xl font-bold">Rx scaled: {rxScaled.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Rx raw: {rx.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveSnapshot();
            }} className="mt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  placeholder="Enter a label (optional)"
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Save Snapshot
                </button>
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
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => loadSnapshot(snapshot)}
                  >
                    <div>
                      <p className="font-medium">{snapshot.label}</p>
                      <p className="text-sm text-gray-500">{formatDate(snapshot.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Re: {snapshot.reLog?.toFixed(2) || 'N/A'}</p>
                      <p className="text-sm">Rx: {snapshot.rxScaled?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No snapshots yet. Adjust metrics and click 'Save Snapshot' to create one.</p>
            )}
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
      </main>

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
    </div>
  );
}

export default App;
