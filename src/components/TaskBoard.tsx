import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sprint, TaskStatus } from '../types';
import { Plus, User } from 'lucide-react';

interface TaskBoardProps {
  sprint: Sprint;
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'to_do', label: 'To Do', color: 'slate' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'testing', label: 'Testing/Review', color: 'amber' },
  { id: 'done', label: 'Done', color: 'emerald' },
];

export function TaskBoard({ sprint }: TaskBoardProps) {
  const { getSprintTasks, updateTask, addTask, state } = useApp();
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskPBIId, setNewTaskPBIId] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('');
  const [newTaskHours, setNewTaskHours] = useState(4);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const tasks = getSprintTasks(sprint.id);
  const sprintPBIs = state.pbis.filter(p => p.sprintId === sprint.id);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskDescription.trim()) {
      let taskId: string;

      if (newTaskPBIId === 'process') {
        const processTasks = tasks.filter(t => t.taskId.startsWith('T-PROC-'));
        const nextProcNumber = processTasks.length + 1;
        taskId = `T-PROC-${nextProcNumber}`;
      } else {
        const pbi = state.pbis.find(p => p.id === newTaskPBIId);
        if (!pbi) return;

        const pbiTasks = tasks.filter(t => t.pbiId === newTaskPBIId);
        const nextTaskNumber = pbiTasks.length + 1;
        taskId = `T-${String(pbi.pbiNumber).padStart(3, '0')}-${nextTaskNumber}`;
      }

      addTask({
        taskId,
        sprintId: sprint.id,
        pbiId: newTaskPBIId === 'process' ? undefined : newTaskPBIId,
        description: newTaskDescription,
        status: 'to_do',
        owner: newTaskOwner,
        timeEstimateHours: newTaskHours,
      });

      setNewTaskDescription('');
      setNewTaskOwner('');
      setNewTaskHours(4);
      setNewTaskPBIId('');
      setShowNewTask(false);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId) {
      updateTask(draggedTaskId, { status });
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Task Board</h3>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {showNewTask && (
        <form onSubmit={handleAddTask} className="bg-white rounded-lg border-2 border-emerald-500 p-6 shadow-lg">
          <h4 className="font-semibold text-slate-900 mb-4">New Task</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Related PBI
              </label>
              <select
                value={newTaskPBIId}
                onChange={(e) => setNewTaskPBIId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none"
                required
              >
                <option value="">Select a PBI...</option>
                {sprintPBIs.map(pbi => (
                  <option key={pbi.id} value={pbi.id}>
                    PBI-{String(pbi.pbiNumber).padStart(3, '0')} - {pbi.title}
                  </option>
                ))}
                <option value="process">Process/Team Task (T-PROC)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Description
              </label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none resize-none"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Owner
                </label>
                <input
                  type="text"
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  placeholder="e.g., Dev A"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimate (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newTaskHours}
                  onChange={(e) => setNewTaskHours(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowNewTask(false);
                setNewTaskDescription('');
                setNewTaskOwner('');
                setNewTaskHours(4);
                setNewTaskPBIId('');
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);

          return (
            <div key={column.id} className="bg-slate-50 rounded-lg p-4 min-h-[500px]">
              <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 border-${column.color}-300`}>
                <h4 className="font-semibold text-slate-900">{column.label}</h4>
                <span className={`px-2 py-1 bg-${column.color}-100 text-${column.color}-700 text-xs font-bold rounded-full`}>
                  {columnTasks.length}
                </span>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
                className="space-y-3"
              >
                {columnTasks.map(task => {
                  const pbi = task.pbiId ? state.pbis.find(p => p.id === task.pbiId) : null;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move border-l-4 ${
                        column.id === 'done' ? 'border-emerald-500' :
                        column.id === 'in_progress' ? 'border-blue-500' :
                        column.id === 'testing' ? 'border-amber-500' :
                        'border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {task.taskId}
                        </span>
                        {task.timeEstimateHours > 0 && (
                          <span className="text-xs text-slate-500">{task.timeEstimateHours}h</span>
                        )}
                      </div>

                      {pbi && (
                        <div className="text-xs text-emerald-700 font-medium mb-1">
                          PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                        </div>
                      )}

                      <p className="text-sm text-slate-900 mb-2 leading-snug">{task.description}</p>

                      {task.owner && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <User size={12} />
                          {task.owner}
                        </div>
                      )}
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm text-slate-700">
          <strong>Tip:</strong> Drag and drop tasks between columns to update their status.
          Tasks must use the format <strong>T-[PBI#]-[#]</strong> for traceability.
        </p>
      </div>
    </div>
  );
}
