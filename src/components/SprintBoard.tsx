import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { PlayCircle, StopCircle, MessageSquare } from 'lucide-react';
import { SprintPlanningWizard } from './SprintPlanningWizard';
import { TaskBoard } from './TaskBoard';
import { SprintReview } from './SprintReview';

interface SprintBoardProps {
  project: Project;
}

export function SprintBoard({ project }: SprintBoardProps) {
  const { getProjectSprints, getActiveSprint } = useApp();
  const [showPlanningWizard, setShowPlanningWizard] = useState(false);
  const [showSprintReview, setShowSprintReview] = useState(false);

  const sprints = getProjectSprints(project.id);
  const activeSprint = getActiveSprint(project.id);
  const completedSprints = sprints.filter(s => s.status === 'closed').sort((a, b) => b.sprintNumber - a.sprintNumber);

  if (showPlanningWizard) {
    return <SprintPlanningWizard project={project} onClose={() => setShowPlanningWizard(false)} />;
  }

  if (showSprintReview && activeSprint) {
    return <SprintReview sprint={activeSprint} project={project} onClose={() => setShowSprintReview(false)} />;
  }

  if (!activeSprint) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <PlayCircle size={48} className="text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">No Active Sprint</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Start a new sprint to begin working on your Product Backlog Items. The Sprint Planning wizard will guide you through the process.
        </p>
        <button
          onClick={() => setShowPlanningWizard(true)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium inline-flex items-center gap-2"
        >
          <PlayCircle size={20} />
          Start Sprint Planning
        </button>

        {completedSprints.length > 0 && (
          <div className="mt-12">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Previous Sprints</h4>
            <div className="grid gap-4 max-w-2xl mx-auto">
              {completedSprints.map(sprint => (
                <div key={sprint.id} className="bg-slate-50 rounded-lg p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-slate-900">Sprint {sprint.sprintNumber}</h5>
                    <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded">
                      {sprint.completedSp} SP Completed
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{sprint.sprintGoal}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{sprint.startDate} to {sprint.endDate}</span>
                    <span>Committed: {sprint.committedSp} SP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Sprint {activeSprint.sprintNumber}</h3>
            <p className="text-slate-600 mt-1">{activeSprint.sprintGoal}</p>
          </div>
          <button
            onClick={() => setShowSprintReview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <StopCircle size={18} />
            End Sprint
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Sprint Duration</div>
            <div className="font-semibold text-slate-900">
              {activeSprint.startDate} - {activeSprint.endDate}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Team Capacity</div>
            <div className="font-semibold text-slate-900">{activeSprint.teamCapacity} SP</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Committed</div>
            <div className="font-semibold text-slate-900">{activeSprint.committedSp} SP</div>
          </div>
        </div>
      </div>

      <TaskBoard sprint={activeSprint} />
    </div>
  );
}
