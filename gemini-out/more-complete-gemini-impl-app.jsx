import React, { useState, useMemo, useCallback, useEffect } from 'react';

// --- Helper Components & Icons ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle inline-block ml-1 text-gray-400 hover:text-blue-500 transition-colors duration-200" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.055.492.11.558.153.065.042.095.103.095.177 0 .074-.03.135-.09.196-.06.06-.15.098-.28.118l-1.07.195-.09.38.98.194c.3.06.54.15.71.295.17.146.255.336.255.577 0 .24-.085.446-.255.614-.17.168-.415.252-.735.252-.22 0-.41-.03-.58-.09-.17-.06-.31-.14-.43-.24l-.11-.165.38-.275c.06.08.14.14.25.19.11.05.23.07.37.07.14 0 .26-.03.36-.08.1-.05.15-.12.15-.21 0-.09-.05-.16-.15-.22-.1-.06-.25-.1-.45-.13l-1.07-.195-.09-.38.98-.194c.3-.06.54-.15.71.295.17.146.255.336.255.577 0 .24-.085.446-.255.614-.17.168-.415.252-.735.252-.32 0-.58-.08-.78-.24-.2-.16-.3-.38-.3-.66 0-.23.08-.42.24-.57.16-.15.38-.25.66-.3l.98-.18-.09-.38-1.07.195c-.3.06-.54.15-.71.295-.17.146-.255.336.255.577 0 .24-.085.446-.255.614-.17.168-.415.252-.735.252h-.01zM8 4.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
);

const Tooltip = ({ text, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {text}
        </div>
    </div>
);

// --- Variable Definitions ---
const variableDefinitions = {
    L: { name: "L – Localized Identity", description: "The system's rootedness in its specific context, culture, and place." },
    I: { name: "I – Interconnection", description: "The degree of integration and relationship across different parts of the system." },
    F: { name: "F – Feedback & Reciprocity", description: "The quality and responsiveness of feedback loops and mutual exchange." },
    E: { name: "E – Evolutionary Capacity", description: "The ability to learn, adapt, and transform under stress." },
    X: { name: "X – Extractive Pressure", description: "The extent of non-reciprocal resource depletion (labor, land, energy)." },
    Fg: { name: "Fg – Fragmentation", description: "Systemic incoherence, disconnection, or breakdown in shared meaning." },
    Omega: { name: "Ω – Overdetermination", description: "The degree of structural rigidity or institutional lock-in that prevents adaptation." },
};

// --- Child Components ---

const Slider = ({ id, value, onChange }) => {
    const definition = variableDefinitions[id];
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                <Tooltip text={definition.description}>
                    <span className="font-bold">{definition.name}</span>
                    <InfoIcon />
                </Tooltip>
            </label>
            <div className="flex items-center space-x-4">
                <input
                    type="range" id={id} name={id} min="0.01" max="10" step="0.01"
                    value={value} onChange={onChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-md font-semibold text-blue-600 w-20 text-center bg-blue-50 px-2 py-1 rounded-md">{parseFloat(value).toFixed(2)}</span>
            </div>
        </div>
    );
};

const RxIndicator = ({ indicator, onUpdate, onRemove }) => (
    <div className="flex items-center space-x-2 mb-3 p-3 bg-gray-50 rounded-lg border">
        <input
            type="text" value={indicator.name}
            onChange={(e) => onUpdate(indicator.id, 'name', e.target.value)}
            placeholder="Indicator Name (e.g., 'Water Quality')"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <input
            type="number" value={indicator.value}
            onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
            min="0" max="1" step="0.01"
            className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
        />
        <button onClick={() => onRemove(indicator.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
        </button>
    </div>
);

const ProjectManager = ({ projects, activeProjectId, onSelect, onCreate, onDelete }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
            <label htmlFor="project-select" className="text-md font-medium text-gray-700">Active Project:</label>
            <select
                id="project-select"
                value={activeProjectId || ''}
                onChange={(e) => onSelect(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={onCreate} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">New Project</button>
            <button onClick={onDelete} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Delete Project</button>
        </div>
    </div>
);

const Dashboard = ({ timePoints, onSelectTimePoint, onDeleteTimePoint }) => {
    if (!window.Recharts) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Dashboard</h2>
                <div className="text-center py-10">
                    <p className="text-gray-500">Loading chart library...</p>
                    <p className="text-xs text-gray-400 mt-1">If this message persists, please reload the page.</p>
                </div>
            </div>
        );
    }
    
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: ChartTooltip, Legend, ResponsiveContainer } = window.Recharts;

    const chartData = timePoints.map(tp => ({
        name: tp.label,
        'Re log (Potential)': tp.reLog,
        'Rx scaled (Outcome)': tp.rxScaled,
    }));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Dashboard</h2>
            {timePoints.length > 0 ? (
                <>
                    <div className="h-80 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ChartTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Re log (Potential)" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="Rx scaled (Outcome)" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Saved Time Points</h3>
                    <div className="max-h-60 overflow-y-auto pr-2">
                        {timePoints.map(tp => (
                            <div key={tp.id} className="flex justify-between items-center p-3 mb-2 bg-gray-50 rounded-lg border hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{tp.label}</p>
                                    <p className="text-xs text-gray-500">Re: {tp.reLog.toFixed(2)} | Rx: {tp.rxScaled.toFixed(2)}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => onSelectTimePoint(tp.id)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200">Load</button>
                                    <button onClick={() => onDeleteTimePoint(tp.id)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No time points saved for this project yet.</p>
                    <p className="text-gray-500 mt-1">Enter data in the calculator and click "Save Time Point" to start.</p>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    // --- State Management ---
    const [calculatorState, setCalculatorState] = useState({
        l: 5, i: 5, f: 5, e: 5, x: 5, fg: 5, omega: 5,
        rxIndicators: [
            { id: 1, name: 'Example: Soil Organic Matter (%)', value: 0.6 },
            { id: 2, name: 'Example: Employee Retention Rate', value: 0.8 },
        ],
    });
    const [snapshotLabel, setSnapshotLabel] = useState('');
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);

    // --- localStorage Hooks ---
    useEffect(() => {
        try {
            const savedProjects = JSON.parse(localStorage.getItem('regenerativeProjects'));
            if (savedProjects && savedProjects.length > 0) {
                setProjects(savedProjects);
                setActiveProjectId(savedProjects[0].id);
            } else {
                const defaultProjectId = Date.now();
                const defaultProject = { id: defaultProjectId, name: 'My First Project', timePoints: [] };
                setProjects([defaultProject]);
                setActiveProjectId(defaultProject.id);
            }
        } catch (error) {
            console.error("Failed to load projects from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            try {
                localStorage.setItem('regenerativeProjects', JSON.stringify(projects));
            } catch (error) {
                console.error("Failed to save projects to localStorage", error);
            }
        }
    }, [projects]);
    
    // --- Memoized Calculations ---
    const { reLog, rxScaled } = useMemo(() => {
        const { l, i, f, e, x, fg, omega, rxIndicators } = calculatorState;
        const numerator = parseFloat(l) * parseFloat(i) * parseFloat(f) * parseFloat(e);
        const denominator = parseFloat(x) + parseFloat(fg) + parseFloat(omega);
        const raw = denominator > 0 ? numerator / denominator : Infinity;
        const reLogCalc = Math.log10(raw + 1);

        const rxTotal = rxIndicators.reduce((sum, ind) => sum + (isNaN(ind.value) ? 0 : ind.value), 0);
        const rxAvg = rxIndicators.length > 0 ? rxTotal / rxIndicators.length : 0;
        const rxScaledCalc = rxAvg * 5.5;

        return { reLog: reLogCalc, rxScaled: rxScaledCalc };
    }, [calculatorState]);

    // --- Event Handlers ---
    const handleSliderChange = useCallback((key, value) => {
        setCalculatorState(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleRxUpdate = useCallback((id, field, value) => {
        setCalculatorState(prev => ({
            ...prev,
            rxIndicators: prev.rxIndicators.map(ind => ind.id === id ? { ...ind, [field]: value } : ind)
        }));
    }, []);

    const handleRxRemove = useCallback((id) => {
        setCalculatorState(prev => ({
            ...prev,
            rxIndicators: prev.rxIndicators.filter(ind => ind.id !== id)
        }));
    }, []);
    
    const handleRxAdd = useCallback(() => {
        setCalculatorState(prev => {
            const newId = prev.rxIndicators.length > 0 ? Math.max(...prev.rxIndicators.map(i => i.id)) + 1 : 1;
            return {
                ...prev,
                rxIndicators: [...prev.rxIndicators, { id: newId, name: '', value: 0.5 }]
            };
        });
    }, []);

    // --- Project & Time Point Logic ---
    const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

    const createProject = () => {
        const name = prompt("Enter new project name:", `Project ${projects.length + 1}`);
        if (name) {
            const newProject = { id: Date.now(), name, timePoints: [] };
            setProjects([...projects, newProject]);
            setActiveProjectId(newProject.id);
        }
    };

    const deleteProject = () => {
        if (projects.length <= 1) {
            alert("You cannot delete the last project.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the project "${activeProject?.name}"? This action cannot be undone.`)) {
            const remainingProjects = projects.filter(p => p.id !== activeProjectId);
            setProjects(remainingProjects);
            setActiveProjectId(remainingProjects[0].id);
        }
    };

    const saveTimePoint = () => {
        if (!snapshotLabel.trim()) {
            alert("Please enter a label for this time point snapshot.");
            return;
        }
        if (activeProject) {
            const newTimePoint = {
                id: Date.now(),
                createdAt: Date.now(),
                label: snapshotLabel,
                reLog,
                rxScaled,
                snapshot: JSON.parse(JSON.stringify(calculatorState)) // Deep copy
            };
            const updatedProjects = projects.map(p =>
                p.id === activeProjectId
                    ? { ...p, timePoints: [...p.timePoints, newTimePoint].sort((a,b) => a.createdAt - b.createdAt) }
                    : p
            );
            setProjects(updatedProjects);
            setSnapshotLabel(''); // Clear label after saving
        }
    };

    const loadTimePoint = (timePointId) => {
        const timePoint = activeProject.timePoints.find(tp => tp.id === timePointId);
        if (timePoint) {
            setCalculatorState(JSON.parse(JSON.stringify(timePoint.snapshot))); // Deep copy
            setSnapshotLabel(timePoint.label);
        }
    };
    
    const deleteTimePoint = (timePointId) => {
         if (window.confirm(`Are you sure you want to delete this time point?`)) {
            const updatedProjects = projects.map(p => {
                if (p.id === activeProjectId) {
                    return { ...p, timePoints: p.timePoints.filter(tp => tp.id !== timePointId) };
                }
                return p;
            });
            setProjects(updatedProjects);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">Regenerative Ratio Dashboard</h1>
                    <p className="mt-1 text-md text-gray-600">Track the evolution of a system's health over time.</p>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <ProjectManager
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onSelect={setActiveProjectId}
                    onCreate={createProject}
                    onDelete={deleteProject}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Calculator */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Data Entry</h2>
                            <p className="text-sm text-gray-500">Use the sliders and indicators below to create a new time point snapshot.</p>
                        </div>
                        
                        {/* Re Calculator */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium text-green-700 mb-3">Re: Regenerative Capacities</h3>
                            {Object.keys(variableDefinitions).slice(0, 4).map(key =>
                                <Slider key={key} id={key} value={calculatorState[key.toLowerCase()]} onChange={(e) => handleSliderChange(key.toLowerCase(), e.target.value)} />
                            )}
                            <h3 className="text-lg font-medium text-red-700 mb-3 mt-6">Re: Degenerative Pressures</h3>
                            {Object.keys(variableDefinitions).slice(4).map(key =>
                                <Slider key={key} id={key} value={calculatorState[key === 'Omega' ? 'omega' : key.toLowerCase()]} onChange={(e) => handleSliderChange(key === 'Omega' ? 'omega' : key.toLowerCase(), e.target.value)} />
                            )}
                        </div>

                        {/* Rx Calculator */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium text-teal-700 mb-3">Rx: Realized Outcomes</h3>
                             {calculatorState.rxIndicators.map(ind => (
                                <RxIndicator key={ind.id} indicator={ind} onUpdate={handleRxUpdate} onRemove={handleRxRemove} />
                            ))}
                            <button onClick={handleRxAdd} className="w-full mt-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Add Indicator</button>
                        </div>
                        
                        <div className="border-t pt-6 space-y-4">
                             <div>
                                <label htmlFor="snapshot-label" className="block text-sm font-medium text-gray-700">Snapshot Label</label>
                                <input
                                    type="text"
                                    id="snapshot-label"
                                    value={snapshotLabel}
                                    onChange={(e) => setSnapshotLabel(e.target.value)}
                                    placeholder="e.g., Q3 2025 Check-in"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <button onClick={saveTimePoint} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-lg">
                                Save Time Point to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Dashboard */}
                    <Dashboard 
                        timePoints={activeProject?.timePoints || []}
                        onSelectTimePoint={loadTimePoint}
                        onDeleteTimePoint={deleteTimePoint}
                    />
                </div>
            </main>
            <footer className="text-center py-6 mt-8 border-t bg-white">
                <p className="text-sm text-gray-500">Formula based on "The Regenerative Ratio Formula" by Daniel Mihai & Sharon Gal-Or.</p>
            </footer>
        </div>
    );
};

export default App;
