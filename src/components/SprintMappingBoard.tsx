import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, PBI, Sprint } from '../types';
import { Calendar, Package, Zap, GripVertical, ArrowRight } from 'lucide-react';

interface SprintMappingBoardProps {
  project: Project;
}

export function SprintMappingBoard({ project }: SprintMappingBoardProps) {
  const { getProjectPBIs, getProjectSprints, updatePBI } = useApp();
  const [draggedPBI, setDraggedPBI] = useState<PBI | null>(null);

  const allPBIs = getProjectPBIs(project.id);
  const sprints = getProjectSprints(project.id).sort((a, b) => a.sprintNumber - b.sprintNumber);
  const backlogPBIs = allPBIs.filter(p => !p.sprintId).sort((a, b) => a.priorityIndex - b.priorityIndex);

  const handleDragStart = (pbi: PBI) => {
    setDraggedPBI(pbi);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSprintId: string | null) => {
    if (draggedPBI) {
      updatePBI(draggedPBI.id, { sprintId: targetSprintId || undefined });
      setDraggedPBI(null);
    }
  };

  const getPBIsForSprint = (sprintId: string) => {
    return allPBIs.filter(p => p.sprintId === sprintId);
  };

  const getSprintStats = (sprint: Sprint) => {
    const sprintPBIs = getPBIsForSprint(sprint.id);
    const totalSP = sprintPBIs.reduce((sum, pbi) => sum + pbi.storyPoints, 0);
    return { count: sprintPBIs.length, totalSP };
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm text-slate-700">
          <strong>Sprint Mapping Board</strong> shows how Product Backlog Items are distributed across sprints.
          Drag and drop PBIs to assign or reassign them to different sprints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(null)}
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Product Backlog</h3>
                <p className="text-sm text-slate-600">Unassigned items</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{backlogPBIs.length}</div>
              <div className="text-xs text-slate-600">
                {backlogPBIs.reduce((sum, pbi) => sum + pbi.storyPoints, 0)} SP
              </div>
            </div>
          </div>

          {backlogPBIs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              All PBIs are assigned to sprints
            </div>
          ) : (
            <div className="space-y-2">
              {backlogPBIs.map(pbi => (
                <PBICard
                  key={pbi.id}
                  pbi={pbi}
                  onDragStart={() => handleDragStart(pbi)}
                />
              ))}
            </div>
          )}
        </div>

        {sprints.map(sprint => {
          const sprintPBIs = getPBIsForSprint(sprint.id);
          const stats = getSprintStats(sprint);

          return (
            <div
              key={sprint.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(sprint.id)}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                sprint.status === 'active'
                  ? 'border-blue-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sprint.status === 'active' ? 'bg-blue-100' : 'bg-emerald-100'
                  }`}>
                    <Calendar size={24} className={
                      sprint.status === 'active' ? 'text-blue-600' : 'text-emerald-600'
                    } />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Sprint {sprint.sprintNumber}</h3>
                      {sprint.status === 'active' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          Active
                        </span>
                      )}
                      {sprint.status === 'closed' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{sprint.sprintGoal}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{stats.count}</div>
                  <div className="text-xs text-slate-600">
                    {stats.totalSP} / {sprint.teamCapacity} SP
                  </div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-4 text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
                <span>{sprint.startDate} - {sprint.endDate}</span>
                <span>•</span>
                <span>Capacity: {sprint.teamCapacity} SP</span>
                {sprint.status === 'closed' && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      Completed: {sprint.completedSp} SP
                    </span>
                  </>
                )}
              </div>

              {sprintPBIs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                  Drop PBIs here to assign to this sprint
                </div>
              ) : (
                <div className="space-y-2">
                  {sprintPBIs.map(pbi => (
                    <PBICard
                      key={pbi.id}
                      pbi={pbi}
                      onDragStart={() => handleDragStart(pbi)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {sprints.length === 0 && (
          <div className="bg-slate-50 rounded-xl p-12 text-center">
            <Calendar size={48} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Sprints Yet</h3>
            <p className="text-slate-600">Create your first sprint to start organizing PBIs</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PBICardProps {
  pbi: PBI;
  onDragStart: () => void;
}

function PBICard({ pbi, onDragStart }: PBICardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-all cursor-move border border-slate-200 hover:border-slate-300 group"
    >
      <div className="flex items-start gap-3">
        <GripVertical size={18} className="text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                PBI-{String(pbi.pbiNumber).padStart(3, '0')}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                pbi.refinementStatus === 'ready'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {pbi.refinementStatus === 'ready' ? 'Ready' : 'Needs Refinement'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-amber-700 text-xs font-semibold flex-shrink-0">
              <Zap size={12} />
              {pbi.storyPoints} SP
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-snug">{pbi.title}</p>
        </div>
      </div>
    </div>
  );
}
