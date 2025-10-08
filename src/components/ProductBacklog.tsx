import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { Plus, GripVertical, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface ProductBacklogProps {
  project: Project;
}

const storyPointOptions = [1, 2, 3, 5, 8, 13] as const;

export function ProductBacklog({ project }: ProductBacklogProps) {
  const { getProjectPBIs, addPBI, updatePBI, updatePBIPriorities } = useApp();
  const [showNewPBI, setShowNewPBI] = useState(false);
  const [newPBITitle, setNewPBITitle] = useState('');
  const [newPBIPoints, setNewPBIPoints] = useState<number>(3);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const pbis = getProjectPBIs(project.id).sort((a, b) => a.priorityIndex - b.priorityIndex);
  const readyPBIs = pbis.filter(p => p.refinementStatus === 'ready');
  const vaguePBIs = pbis.filter(p => p.refinementStatus === 'vague');

  const handleAddPBI = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPBITitle.trim()) {
      const maxPbiNumber = Math.max(0, ...pbis.map(p => p.pbiNumber));
      const maxPriorityIndex = Math.max(-1, ...pbis.map(p => p.priorityIndex));

      addPBI({
        projectId: project.id,
        pbiNumber: maxPbiNumber + 1,
        title: newPBITitle,
        storyPoints: newPBIPoints as 1 | 2 | 3 | 5 | 8 | 13,
        priorityIndex: maxPriorityIndex + 1,
        refinementStatus: 'vague',
      });

      setNewPBITitle('');
      setNewPBIPoints(3);
      setShowNewPBI(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPBIs = [...pbis];
    const draggedPBI = newPBIs[draggedIndex];
    newPBIs.splice(draggedIndex, 1);
    newPBIs.splice(index, 0, draggedPBI);

    const updatedPBIs = newPBIs.map((pbi, idx) => ({
      ...pbi,
      priorityIndex: idx,
    }));

    updatePBIPriorities(updatedPBIs);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleRefinementStatus = (pbiId: string, currentStatus: string) => {
    updatePBI(pbiId, {
      refinementStatus: currentStatus === 'vague' ? 'ready' : 'vague',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm text-slate-700">
          <strong>Product Backlog</strong> contains all the work needed to achieve the Product Goal.
          Prioritize items by dragging them. Only <strong>Ready</strong> items can be pulled into a Sprint.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Product Backlog Items</h2>
        <button
          onClick={() => setShowNewPBI(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add PBI
        </button>
      </div>

      {showNewPBI && (
        <form onSubmit={handleAddPBI} className="bg-white rounded-lg border-2 border-emerald-500 p-6 shadow-lg">
          <h3 className="font-semibold text-slate-900 mb-4">New Product Backlog Item</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User Story
            </label>
            <p className="text-xs text-slate-500 mb-2 bg-slate-50 p-2 rounded">
              Format: <strong>As a [Role], I want [Goal], so that [Value]</strong>
            </p>
            <textarea
              value={newPBITitle}
              onChange={(e) => setNewPBITitle(e.target.value)}
              placeholder="As a Project Manager, I want to..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Story Points
              <span className="text-xs text-slate-500 ml-2">(Relative effort, not time)</span>
            </label>
            <div className="flex gap-2">
              {storyPointOptions.map(points => (
                <button
                  key={points}
                  type="button"
                  onClick={() => setNewPBIPoints(points)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    newPBIPoints === points
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {points}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowNewPBI(false);
                setNewPBITitle('');
                setNewPBIPoints(3);
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Add to Backlog
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" />
            Ready for Sprint ({readyPBIs.length})
          </h3>
          {readyPBIs.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <p className="text-slate-600">No items are ready yet. Refine vague items below.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {readyPBIs.map((pbi, index) => (
                <div
                  key={pbi.id}
                  draggable
                  onDragStart={() => handleDragStart(pbis.indexOf(pbi))}
                  onDragOver={(e) => handleDragOver(e, pbis.indexOf(pbi))}
                  onDragEnd={handleDragEnd}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-slate-200 cursor-move group"
                >
                  <div className="flex items-start gap-3">
                    <GripVertical size={20} className="text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                            PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                          </span>
                          <span className="text-sm text-slate-900">{pbi.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-amber-700 text-sm font-semibold">
                            <Zap size={14} />
                            {pbi.storyPoints} SP
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRefinementStatus(pbi.id, pbi.refinementStatus)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Mark as Vague
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-600" />
            Needs Refinement ({vaguePBIs.length})
          </h3>
          {vaguePBIs.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <p className="text-slate-600">All items are ready!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vaguePBIs.map((pbi) => (
                <div
                  key={pbi.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-amber-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                          </span>
                          <span className="text-sm text-slate-900">{pbi.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-amber-700 text-sm font-semibold">
                            <Zap size={14} />
                            {pbi.storyPoints} SP
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRefinementStatus(pbi.id, pbi.refinementStatus)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Mark as Ready
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
