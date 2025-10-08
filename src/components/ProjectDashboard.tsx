import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, TrendingUp, Target, Calendar, ListTodo } from 'lucide-react';
import { ProductBacklog } from './ProductBacklog';
import { SprintBoard } from './SprintBoard';
import { VelocityChart } from './VelocityChart';

type View = 'backlog' | 'sprint' | 'velocity';

export function ProjectDashboard() {
  const { getCurrentProject, getProjectSprints, setCurrentProject } = useApp();
  const [activeView, setActiveView] = useState<View>('backlog');
  const project = getCurrentProject();

  if (!project) {
    return null;
  }

  const sprints = getProjectSprints(project.id);
  const activeSprint = sprints.find(s => s.status === 'active');
  const completedSprints = sprints.filter(s => s.status === 'closed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentProject(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Projects
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
              <TrendingUp size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">
                Velocity: <span className="text-emerald-700">{project.currentVelocity} SP</span>
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
            <div className="flex items-start gap-2 text-slate-600">
              <Target size={18} className="mt-1 flex-shrink-0" />
              <p className="text-sm leading-relaxed">{project.productGoal}</p>
            </div>
          </div>

          {activeSprint && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <span className="font-semibold text-slate-900">Sprint {activeSprint.sprintNumber} Active</span>
                    <p className="text-sm text-slate-600">{activeSprint.sprintGoal}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Committed</div>
                  <div className="text-lg font-bold text-blue-700">{activeSprint.committedSp} SP</div>
                </div>
              </div>
            </div>
          )}

          <nav className="flex gap-2">
            <button
              onClick={() => setActiveView('backlog')}
              className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
                activeView === 'backlog'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ListTodo size={18} />
                Product Backlog
              </div>
            </button>
            <button
              onClick={() => setActiveView('sprint')}
              className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
                activeView === 'sprint'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                Sprint Board
              </div>
            </button>
            <button
              onClick={() => setActiveView('velocity')}
              className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
                activeView === 'velocity'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                Velocity Chart
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'backlog' && <ProductBacklog project={project} />}
        {activeView === 'sprint' && <SprintBoard project={project} />}
        {activeView === 'velocity' && <VelocityChart project={project} />}
      </div>
    </div>
  );
}
