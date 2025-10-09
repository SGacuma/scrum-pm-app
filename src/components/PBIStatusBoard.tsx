import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, PBI, PBIStatus } from '../types';
import { ListTodo, Loader, CheckCircle2, Zap, GripVertical } from 'lucide-react';

interface PBIStatusBoardProps {
  project: Project;
}

const statusColumns = [
  { id: 'to_do' as PBIStatus, label: 'To Do', icon: ListTodo, color: 'slate' },
  { id: 'in_progress' as PBIStatus, label: 'In Progress', icon: Loader, color: 'blue' },
  { id: 'done' as PBIStatus, label: 'Done', icon: CheckCircle2, color: 'emerald' },
];

export function PBIStatusBoard({ project }: PBIStatusBoardProps) {
  const { getProjectPBIs, getProjectSprints, updatePBI, getSprintTasks } = useApp();
  const [draggedPBI, setDraggedPBI] = useState<PBI | null>(null);

  const allPBIs = getProjectPBIs(project.id);
  const sprints = getProjectSprints(project.id);

  const getPBIStatus = (pbi: PBI): PBIStatus => {
    if (pbi.status) return pbi.status;

    if (!pbi.sprintId) return 'to_do';

    const sprint = sprints.find(s => s.id === pbi.sprintId);
    if (!sprint) return 'to_do';

    if (sprint.status === 'closed') {
      const tasks = getSprintTasks(sprint.id).filter(t => t.pbiId === pbi.id);
      const allTasksDone = tasks.length > 0 && tasks.every(t => t.status === 'done');
      return allTasksDone ? 'done' : 'in_progress';
    }

    const tasks = getSprintTasks(sprint.id).filter(t => t.pbiId === pbi.id);
    if (tasks.length === 0) return 'to_do';

    const allTasksDone = tasks.every(t => t.status === 'done');
    const anyTaskInProgress = tasks.some(t => t.status === 'in_progress' || t.status === 'testing');

    if (allTasksDone) return 'done';
    if (anyTaskInProgress) return 'in_progress';
    return 'to_do';
  };

  const pbisWithStatus = allPBIs.map(pbi => ({
    ...pbi,
    calculatedStatus: getPBIStatus(pbi),
  }));

  const handleDragStart = (pbi: PBI) => {
    setDraggedPBI(pbi);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: PBIStatus) => {
    if (draggedPBI) {
      updatePBI(draggedPBI.id, { status });
      setDraggedPBI(null);
    }
  };

  const getSprintInfo = (sprintId?: string) => {
    if (!sprintId) return null;
    return sprints.find(s => s.id === sprintId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm text-slate-700">
          <strong>PBI Status Board</strong> shows the current state of all Product Backlog Items.
          Track progress from To Do through In Progress to Done. Drag and drop to manually update status.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {statusColumns.map(column => {
          const columnPBIs = pbisWithStatus.filter(p => p.calculatedStatus === column.id);
          const totalSP = columnPBIs.reduce((sum, pbi) => sum + pbi.storyPoints, 0);
          const Icon = column.icon;

          return (
            <div key={column.id} className="bg-slate-50 rounded-xl p-4 min-h-[600px]">
              <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 border-${column.color}-300`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-${column.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon size={18} className={`text-${column.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-900">{column.label}</h3>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold text-${column.color}-700`}>{columnPBIs.length}</div>
                  <div className="text-xs text-slate-600">{totalSP} SP</div>
                </div>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
                className="space-y-3"
              >
                {columnPBIs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No items
                  </div>
                ) : (
                  columnPBIs.map(pbi => {
                    const sprint = getSprintInfo(pbi.sprintId);

                    return (
                      <div
                        key={pbi.id}
                        draggable
                        onDragStart={() => handleDragStart(pbi)}
                        className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move border-l-4 group ${
                          column.id === 'done' ? 'border-emerald-500' :
                          column.id === 'in_progress' ? 'border-blue-500' :
                          'border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-3">
                          <GripVertical size={16} className="text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                                PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                              </span>
                              <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-amber-700 text-xs font-semibold">
                                <Zap size={12} />
                                {pbi.storyPoints} SP
                              </span>
                            </div>
                            <p className="text-sm text-slate-900 leading-snug mb-2">{pbi.title}</p>
                            {sprint && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-0.5 rounded font-medium ${
                                  sprint.status === 'active'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  Sprint {sprint.sprintNumber}
                                </span>
                                {sprint.status === 'active' && (
                                  <span className="text-blue-600 font-medium">Active</span>
                                )}
                              </div>
                            )}
                            {!sprint && (
                              <div className="text-xs text-slate-500 italic">
                                Not assigned to sprint
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Status Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {statusColumns.map(column => {
            const columnPBIs = pbisWithStatus.filter(p => p.calculatedStatus === column.id);
            const totalSP = columnPBIs.reduce((sum, pbi) => sum + pbi.storyPoints, 0);
            const percentage = allPBIs.length > 0 ? Math.round((columnPBIs.length / allPBIs.length) * 100) : 0;

            return (
              <div key={column.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{column.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{percentage}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${column.color}-500 transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{columnPBIs.length} PBIs</span>
                  <span>{totalSP} Story Points</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
        <p className="text-sm text-slate-700">
          <strong>Note:</strong> PBI status is automatically calculated based on task completion.
          You can manually override the status by dragging PBIs between columns.
        </p>
      </div>
    </div>
  );
}
