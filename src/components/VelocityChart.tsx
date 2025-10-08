import React from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { TrendingUp, Calendar, Target } from 'lucide-react';

interface VelocityChartProps {
  project: Project;
}

export function VelocityChart({ project }: VelocityChartProps) {
  const { getProjectSprints } = useApp();
  const sprints = getProjectSprints(project.id).sort((a, b) => a.sprintNumber - b.sprintNumber);
  const completedSprints = sprints.filter(s => s.status === 'closed');

  const maxSP = Math.max(
    ...completedSprints.map(s => Math.max(s.committedSp, s.completedSp)),
    20
  );

  const averageVelocity = completedSprints.length > 0
    ? Math.round(completedSprints.reduce((sum, s) => sum + s.completedSp, 0) / completedSprints.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm text-slate-700">
          <strong>Velocity</strong> tracks how many Story Points your team completes per sprint.
          Use this to plan future sprint capacity and predict delivery timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Current Velocity</div>
              <div className="text-2xl font-bold text-slate-900">{project.currentVelocity} SP</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">From most recent sprint</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Average Velocity</div>
              <div className="text-2xl font-bold text-slate-900">{averageVelocity} SP</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Across {completedSprints.length} completed sprint(s)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Total Sprints</div>
              <div className="text-2xl font-bold text-slate-900">{sprints.length}</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">{completedSprints.length} completed, {sprints.length - completedSprints.length} active</p>
        </div>
      </div>

      {completedSprints.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No Velocity Data Yet</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Complete your first sprint to start tracking velocity. Velocity helps you understand your team's capacity and plan future sprints more accurately.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Velocity History</h3>

          <div className="space-y-6">
            {completedSprints.map(sprint => {
              const committedPercent = (sprint.committedSp / maxSP) * 100;
              const completedPercent = (sprint.completedSp / maxSP) * 100;
              const completionRate = sprint.committedSp > 0 ? Math.round((sprint.completedSp / sprint.committedSp) * 100) : 0;

              return (
                <div key={sprint.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">Sprint {sprint.sprintNumber}</span>
                      <span className="text-sm text-slate-600 ml-2">
                        {sprint.startDate} - {sprint.endDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">
                        Completed: <span className="font-semibold text-emerald-700">{sprint.completedSp}</span> / {sprint.committedSp} SP
                      </div>
                      <div className={`text-sm font-medium ${
                        completionRate >= 100 ? 'text-emerald-600' :
                        completionRate >= 80 ? 'text-blue-600' :
                        completionRate >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {completionRate}% completion
                      </div>
                    </div>
                  </div>

                  <div className="relative h-12 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-slate-300 opacity-50"
                      style={{ width: `${committedPercent}%` }}
                    />
                    <div
                      className={`absolute inset-y-0 left-0 ${
                        completionRate >= 100 ? 'bg-emerald-500' :
                        completionRate >= 80 ? 'bg-blue-500' :
                        completionRate >= 60 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${completedPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-medium">
                      <span className={completedPercent > 15 ? 'text-white' : 'text-slate-700'}>
                        {sprint.completedSp} SP
                      </span>
                      <span className="text-slate-700">
                        {maxSP} SP
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 italic">{sprint.sprintGoal}</div>
                </div>
              );
            })}
          </div>

          {completedSprints.length >= 3 && (
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-slate-700">
                <strong>Insight:</strong> With {completedSprints.length} completed sprints, your average velocity of {averageVelocity} SP
                provides a reliable baseline for planning. Consider this when committing to future sprints.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
