import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Scatter, ScatterChart } from 'recharts';

// Components
import ProjectManager from './components/ProjectManager';
import MetricSlider from './components/MetricSlider';
import QuadrantChart from './components/QuadrantChart';
import { InfoIcon, PlusIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from './components/Icons';
import Tooltip from './components/Tooltip';

// Variable information for metrics
const VARIABLES = {
  L: { name: 'Life Support', description: 'Measures the system\'s ability to support life' },
  I: { name: 'Inputs', description: 'Measures the quality and quantity of inputs' },
  F: { name: 'Functionality', description: 'Measures the system\'s functional performance' },
  E: { name: 'Efficiency', description: 'Measures resource use efficiency' },
  X: { name: 'Extractive', description: 'Measures extractive impacts' },
  Fg: { name: 'Fossil Fuels', description: 'Measures fossil fuel dependency' },
  Ω: { name: 'Waste', description: 'Measures waste production' }
};

// Initial state
const INITIAL_METRICS = {
  L: 5,
  I: 5,
  F: 5,
  E: 5,
  X: 5,
  Fg: 5,
  Ω: 5
};

const INITIAL_RX_INDICATORS = [
  { id: 1, name: 'Biodiversity', value: 5 },
  { id: 2, name: 'Soil Health', value: 5 },
  { id: 3, name: 'Water Quality', value: 5 }
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
  Ω: { 
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
    const numerator = metrics.L * metrics.I * metrics.F * metrics.E;
    const denominator = metrics.X + metrics.Fg + metrics.Ω;
    const reRaw = denominator !== 0 ? numerator / denominator : 0;
    const reLog = Math.log10(reRaw + 1); // Log transform for better visualization
    
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
    if (rxIndicators.length === 0) return { rxRaw: 0, rxScaled: 0 };
    
    const sum = rxIndicators.reduce((acc, ind) => acc + ind.value, 0);
    const avg = sum / rxIndicators.length;
    const rxRaw = avg / 10; // Scale to 0-1
    const rxScaled = rxRaw * 10; // Scale to 0-10 for display
    
    return { rxRaw, rxScaled };
  }, [rxIndicators]);
  
  // Get current values
  const { reRaw, reLog } = calculateRe();
  const { rxRaw, rxScaled } = calculateRx();
  
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
    
    const newSnapshot = {
      id: Date.now().toString(),
      label: label.trim(),
      timestamp: new Date().toISOString(),
      metrics: { ...metrics },
      rxIndicators: rxIndicators.map(({ id, name, value }) => ({ id, name, value })),
      ...calculateRe(),
      ...calculateRx(),
      // Add coordinates for quadrant chart
      x: metrics.X + metrics.Fg + metrics.Ω,
      y: (metrics.L * metrics.I * metrics.F * metrics.E) / 100
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
      Ω: Math.min(10, Math.max(0, snapshot.metrics.Ω || 5))
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

  const handleRxIndicatorChange = (id, value) => {
    setRxIndicators(prev =>
      prev.map(indicator =>
        indicator.id === id 
          ? { 
              ...indicator, 
              value: Math.min(10, Math.max(0, parseFloat(value) || 0)) 
            } 
          : indicator
      )
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
    const newId = rxIndicators.length > 0 
      ? Math.max(...rxIndicators.map(i => i.id)) + 1 
      : 1;
    
    setRxIndicators(prev => [
      ...prev,
      { 
        id: newId, 
        name: `Indicator ${newId}`, 
        value: 5 
      }
    ]);
  };

  const removeRxIndicator = (id) => {
    if (rxIndicators.length > 1) {
      setRxIndicators(prev => prev.filter(i => i.id !== id));
    }
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
                <MetricSlider
                  key={key}
                  label={key}
                  value={value}
                  onChange={(val) => handleMetricChange(key, val)}
                  min={0}
                  max={10}
                  step={0.1}
                  variableInfo={VARIABLES[key]}
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
            <div className="space-y-4">
              {rxIndicators.map((indicator) => (
                <div key={indicator.id} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={indicator.name}
                    onChange={(e) => handleRxIndicatorNameChange(indicator.id, e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Indicator name"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={indicator.value}
                    onChange={(e) => handleRxIndicatorChange(indicator.id, e.target.value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{indicator.value}</span>
                  <button
                    onClick={() => removeRxIndicator(indicator.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={rxIndicators.length <= 1}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Charts and Snapshots */}
        <div className="space-y-6">
          {/* Current Values */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Values</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="text-sm font-medium text-gray-600">Regenerative Ratio (Re)</h3>
                <p className="text-2xl font-bold">{reRaw.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Log: {reLog.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-sm font-medium text-gray-600">Realized Regeneration (Rx)</h3>
                <p className="text-2xl font-bold">{rxScaled.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Raw: {rxRaw.toFixed(2)}</p>
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

          {/* Quadrant Chart */}
          {showQuadrantChart && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Regenerative Quadrant</h2>
              <div className="h-64">
                <QuadrantChart 
                  currentPoint={{ 
                    x: metrics.X + metrics.Fg + metrics.Ω, 
                    y: (metrics.L * metrics.I * metrics.F * metrics.E) / 100 
                  }}
                  snapshots={snapshots}
                  onPointClick={loadSnapshot}
                />
              </div>
            </div>
          )}

          {/* Snapshots */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Saved Snapshots</h2>
            {snapshots.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
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
                      <p className="text-sm">Re: {snapshot.reRaw.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Rx: {snapshot.rxScaled?.toFixed(2) || 'N/A'}</p>
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
