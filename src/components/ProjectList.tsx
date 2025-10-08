import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, TrendingUp } from 'lucide-react';

interface ProjectListProps {
  onNewProject: () => void;
}

export function ProjectList({ onNewProject }: ProjectListProps) {
  const { state, setCurrentProject } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">SimpleScrum</h1>
            <p className="text-slate-600">Your intuitive project management platform</p>
          </div>
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map(project => (
            <button
              key={project.id}
              onClick={() => setCurrentProject(project.id)}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 text-left group border-2 border-transparent hover:border-emerald-500"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    {project.currentVelocity} SP
                  </span>
                </div>
              </div>
              <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                {project.productGoal}
              </p>
            </button>
          ))}
        </div>

        {state.projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={48} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Create your first project to get started with Scrum</p>
            <button
              onClick={onNewProject}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
