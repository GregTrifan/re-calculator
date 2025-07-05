import React, { useState, useMemo, useCallback } from 'react';

// Helper Components
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle inline-block ml-1 text-gray-400 hover:text-blue-500 transition-colors duration-200" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.055.492.11.558.153.065.042.095.103.095.177 0 .074-.03.135-.09.196-.06.06-.15.098-.28.118l-1.07.195-.09.38.98.194c.3.06.54.15.71.295.17.146.255.336.255.577 0 .24-.085.446-.255.614-.17.168-.415.252-.735.252-.22 0-.41-.03-.58-.09-.17-.06-.31-.14-.43-.24l-.11-.165.38-.275c.06.08.14.14.25.19.11.05.23.07.37.07.14 0 .26-.03.36-.08.1-.05.15-.12.15-.21 0-.09-.05-.16-.15-.22-.1-.06-.25-.1-.45-.13l-1.07-.195-.09-.38.98-.194c.3-.06.54-.15.71-.295.17-.146.255.336.255.577 0 .24-.085.446-.255.614-.17.168-.415.252-.735.252-.32 0-.58-.08-.78-.24-.2-.16-.3-.38-.3-.66 0-.23.08-.42.24-.57.16-.15.38-.25.66-.3l.98-.18-.09-.38-1.07.195c-.3.06-.54.15-.71.295-.17.146-.255.336-.255.577 0 .24-.085.446-.255.614-.17.168-.415.252-.735.252h-.01zM8 4.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
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

// Variable Definitions from the document
const variableDefinitions = {
    L: { name: "L – Localized Identity", description: "The system's rootedness in its specific context, culture, and place. It measures the degree to which a system's identity and operations are informed by and coherent with its local human and non-human environment." },
    I: { name: "I – Interconnection", description: "The degree of integration, relationship, and mutual support across different parts of the system. It assesses the quality and density of connections, both internally and with external systems." },
    F: { name: "F – Feedback & Reciprocity", description: "The quality and responsiveness of feedback loops and the degree of mutual, non-extractive exchange. It measures how well a system senses, processes, and responds to information, and whether its exchanges are balanced." },
    E: { name: "E – Evolutionary Capacity", description: "The ability to learn, adapt, and transform in response to stress or changing conditions. It reflects the system's capacity for creativity, innovation, and developmental growth." },
    X: { name: "X – Extractive Pressure", description: "The extent of non-reciprocal resource depletion, such as labor, land, or energy. This represents forces that take from the system without giving back in a way that supports its health." },
    Fg: { name: "Fg – Fragmentation", description: "Systemic incoherence, disconnection, or a breakdown in shared meaning and function. It measures the degree to which the system's parts are isolated, in conflict, or working at cross-purposes." },
    Omega: { name: "Ω – Overdetermination", description: "The degree of structural rigidity, excessive control, or institutional lock-in that prevents adaptation. It measures how much a system is constrained by its own rules, bureaucracy, or path-dependencies." },
};

const Slider = ({ id, label, value, onChange, min = 0.01, max = 10, step = 0.01 }) => {
    const definition = variableDefinitions[id];
    return (
        <div className="mb-6">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                <Tooltip text={definition.description}>
                    <span className="font-bold">{definition.name}</span>
                    <InfoIcon />
                </Tooltip>
            </label>
            <div className="flex items-center space-x-4">
                <input
                    type="range"
                    id={id}
                    name={id}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-lg font-semibold text-blue-600 w-20 text-center bg-blue-50 px-2 py-1 rounded-md">{parseFloat(value).toFixed(2)}</span>
            </div>
        </div>
    );
};

const ResultBar = ({ label, value, max, colorClass, tooltip }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                 <Tooltip text={tooltip}>
                    <span className="text-base font-medium text-gray-700">{label}</span>
                     <InfoIcon />
                </Tooltip>
                <span className={`text-base font-medium ${colorClass.replace('bg-', 'text-')}`}>{value.toFixed(3)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const RxIndicator = ({ indicator, onUpdate, onRemove }) => {
    return (
        <div className="flex items-center space-x-2 mb-3 p-3 bg-gray-50 rounded-lg border">
            <input
                type="text"
                value={indicator.name}
                onChange={(e) => onUpdate(indicator.id, 'name', e.target.value)}
                placeholder="Indicator Name (e.g., 'Water Quality')"
                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <input
                type="number"
                value={indicator.value}
                onChange={(e) => onUpdate(indicator.id, 'value', parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.01"
                className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
            />
            <button onClick={() => onRemove(indicator.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            </button>
        </div>
    );
};


const App = () => {
    // State for Re formula variables
    const [l, setL] = useState(5);
    const [i, setI] = useState(5);
    const [f, setF] = useState(5);
    const [e, setE] = useState(5);
    const [x, setX] = useState(5);
    const [fg, setFg] = useState(5);
    const [omega, setOmega] = useState(5);
    
    // State for Rx indicators
    const [rxIndicators, setRxIndicators] = useState([
        { id: 1, name: 'Example: Soil Organic Matter (%)', value: 0.6 },
        { id: 2, name: 'Example: Employee Turnover Rate (Inverse)', value: 0.8 },
    ]);

    const handleSliderChange = useCallback((setter) => (event) => {
        setter(event.target.value);
    }, []);

    const { reRaw, reLog } = useMemo(() => {
        const numerator = parseFloat(l) * parseFloat(i) * parseFloat(f) * parseFloat(e);
        const denominator = parseFloat(x) + parseFloat(fg) + parseFloat(omega);
        
        // Avoid division by zero, though inputs are >= 0.01
        if (denominator === 0) return { reRaw: Infinity, reLog: Infinity };

        const raw = numerator / denominator;
        const log = Math.log10(raw + 1);
        return { reRaw: raw, reLog: log };
    }, [l, i, f, e, x, fg, omega]);

    const { rx, rxScaled } = useMemo(() => {
        if (rxIndicators.length === 0) return { rx: 0, rxScaled: 0 };
        const total = rxIndicators.reduce((sum, ind) => sum + (isNaN(ind.value) ? 0 : ind.value), 0);
        const average = total / rxIndicators.length;
        const scaled = average * 5.5;
        return { rx: average, rxScaled: scaled };
    }, [rxIndicators]);

    const addRxIndicator = () => {
        const newId = rxIndicators.length > 0 ? Math.max(...rxIndicators.map(i => i.id)) + 1 : 1;
        setRxIndicators([...rxIndicators, { id: newId, name: '', value: 0.5 }]);
    };

    const updateRxIndicator = (id, field, value) => {
        setRxIndicators(
            rxIndicators.map(ind => (ind.id === id ? { ...ind, [field]: value } : ind))
        );
    };

    const removeRxIndicator = (id) => {
        setRxIndicators(rxIndicators.filter(ind => ind.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">Regenerative Ratio Calculator</h1>
                    <p className="mt-1 text-md text-gray-600">An interactive tool to apply the Re & Rx formulas for systemic health analysis.</p>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Calculators */}
                    <div className="space-y-8">
                        {/* Re Calculator */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Re: Regenerative Ratio (Potential)</h2>
                            <p className="text-sm text-gray-500 mb-6">Adjust the sliders to score the system's regenerative potential vs. its degenerative pressures.</p>
                            
                            <div className="mb-6 border-t pt-4">
                                <h3 className="text-lg font-medium text-green-700 mb-3">Regenerative Capacities (Numerator)</h3>
                                <Slider id="L" label="Localized Identity" value={l} onChange={handleSliderChange(setL)} />
                                <Slider id="I" label="Interconnection" value={i} onChange={handleSliderChange(setI)} />
                                <Slider id="F" label="Feedback & Reciprocity" value={f} onChange={handleSliderChange(setF)} />
                                <Slider id="E" label="Evolutionary Capacity" value={e} onChange={handleSliderChange(setE)} />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-red-700 mb-3">Degenerative Pressures (Denominator)</h3>
                                <Slider id="X" label="Extractive Pressure" value={x} onChange={handleSliderChange(setX)} />
                                <Slider id="Fg" label="Fragmentation" value={fg} onChange={handleSliderChange(setFg)} />
                                <Slider id="Omega" label="Overdetermination" value={omega} onChange={handleSliderChange(setOmega)} />
                            </div>
                        </div>

                        {/* Rx Calculator */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Rx: Realized Regeneration (Outcomes)</h2>
                            <p className="text-sm text-gray-500 mb-6">Add and score verifiable indicators (0 to 1) to measure real-world regenerative outcomes.</p>
                            
                            <div className="space-y-2 mb-4">
                                {rxIndicators.map(ind => (
                                    <RxIndicator key={ind.id} indicator={ind} onUpdate={updateRxIndicator} onRemove={removeRxIndicator} />
                                ))}
                            </div>
                            <button onClick={addRxIndicator} className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle mr-2" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                                Add Indicator
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results & Explanation */}
                    <div className="sticky top-8 self-start">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Analysis & Results</h2>
                            
                            <div className="p-4 bg-gray-50 rounded-lg mb-6">
                                <h3 className="font-semibold text-lg mb-2">Re Score</h3>
                                <p className="text-sm text-gray-600">
                                    Raw: <span className="font-mono">{reRaw.toLocaleString(undefined, {maximumFractionDigits: 2})}</span> | 
                                    Log-Transformed: <span className="font-mono font-bold text-blue-700">{reLog.toFixed(3)}</span>
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg mb-6">
                                <h3 className="font-semibold text-lg mb-2">Rx Score</h3>
                                <p className="text-sm text-gray-600">
                                    Average: <span className="font-mono">{rx.toFixed(3)}</span> | 
                                    Scaled for Comparison: <span className="font-mono font-bold text-teal-700">{rxScaled.toFixed(3)}</span>
                                </p>
                            </div>

                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-xl font-semibold mb-4 text-center">Potential vs. Outcome</h3>
                                <ResultBar 
                                    label="Re log (Potential)" 
                                    value={reLog} 
                                    max={4} // log10(10000/0.03 + 1) is ~5.5, but log10(10000/30) is ~2.5. 4 is a reasonable max for visualization.
                                    colorClass="bg-blue-500"
                                    tooltip="Measures the system's latent capacity to regenerate based on its structure and pressures."
                                />
                                <ResultBar 
                                    label="Rx scaled (Outcome)" 
                                    value={rxScaled} 
                                    max={5.5} // Rx is 0-1, scaled by 5.5
                                    colorClass="bg-teal-500"
                                    tooltip="Measures the system's actual, realized regenerative performance based on observed indicators."
                                />
                            </div>
                             <div className="mt-6 text-center text-xs text-gray-500">
                                <p>A gap between Re and Rx can indicate untapped potential or implementation challenges.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="text-center py-6 mt-8 border-t bg-white">
                <p className="text-sm text-gray-500">Formula and concepts based on "The Regenerative Ratio Formula" by Daniel Mihai and Sharon Gal-Or.</p>
                <p className="text-xs text-gray-400 mt-1">For inquiries about the formula, contact the authors.</p>
            </footer>
        </div>
    );
};

export default App;
