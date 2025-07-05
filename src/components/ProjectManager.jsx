import React, { useState } from 'react';

const ProjectManager = ({
  projects = [],
  activeProjectId,
  onProjectSelect,
  onCreateProject,
  onDeleteProject,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Sort projects by most recently created
  const sortedProjects = [...filteredProjects].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
          <span className="text-sm text-gray-500">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Create Project Button */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-3"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </button>
        ) : (
          <form onSubmit={handleCreateProject} className="mb-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                autoFocus
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Project List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {sortedProjects.length > 0 ? (
          sortedProjects.map((project) => (
            <div 
              key={project.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                activeProjectId === project.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => onProjectSelect(project.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {project.timePoints?.length || 0} snapshot{project.timePoints?.length !== 1 ? 's' : ''}
                    <span className="mx-2 text-gray-300">•</span>
                    Created {formatDate(project.createdAt)}
                  </p>
                  {activeProjectId === project.id && project.timePoints?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last updated: {new Date(project.timePoints[project.timePoints.length - 1].timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                {projects.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete project "${project.name}" and all its snapshots?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 -mr-2"
                    title="Delete project"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchTerm ? 'No projects match your search' : 'No projects yet. Create one to get started!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
