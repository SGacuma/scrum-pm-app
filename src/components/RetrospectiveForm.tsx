import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sprint } from '../types';
import { MessageSquare, Lightbulb, CheckCircle } from 'lucide-react';

interface RetrospectiveFormProps {
  sprint: Sprint;
  onComplete: () => void;
}

export function RetrospectiveForm({ sprint, onComplete }: RetrospectiveFormProps) {
  const { getSprintRetrospective, addRetrospective, updateRetrospective } = useApp();
  const existingRetro = getSprintRetrospective(sprint.id);

  const [wentWell, setWentWell] = useState(existingRetro?.wentWell || '');
  const [toImprove, setToImprove] = useState(existingRetro?.toImprove || '');
  const [actionItem, setActionItem] = useState(existingRetro?.actionItem || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (existingRetro) {
      updateRetrospective(existingRetro.id, {
        wentWell,
        toImprove,
        actionItem,
      });
    } else {
      addRetrospective({
        sprintId: sprint.id,
        wentWell,
        toImprove,
        actionItem,
      });
    }

    onComplete();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-slate-200 px-8 py-6">
        <h2 className="text-2xl font-bold text-slate-900">Sprint {sprint.sprintNumber} Retrospective</h2>
        <p className="text-slate-600 mt-1">Reflect on what went well and what can be improved</p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-slate-700">
            <strong>Retrospective</strong> is where the team reflects on the sprint and creates a plan for improvements.
            The Action Item will be added as a task in the next sprint.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <CheckCircle size={18} className="text-emerald-600" />
            1. What went well?
          </label>
          <textarea
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            placeholder="List the positive aspects of the sprint..."
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none resize-none"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <MessageSquare size={18} className="text-amber-600" />
            2. What could be improved?
          </label>
          <textarea
            value={toImprove}
            onChange={(e) => setToImprove(e.target.value)}
            placeholder="Identify areas that need attention..."
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none resize-none"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Lightbulb size={18} className="text-blue-600" />
            3. Action Item
          </label>
          <p className="text-xs text-slate-500 mb-2">
            This will be added as a Process Task (T-PROC-#) in the next sprint
          </p>
          <textarea
            value={actionItem}
            onChange={(e) => setActionItem(e.target.value)}
            placeholder="Define a specific action to implement in the next sprint..."
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none resize-none"
            rows={3}
            required
          />
        </div>

        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-sm text-slate-700">
            <strong>Remember:</strong> The Action Item should be concrete and achievable. It will be tracked as a task in your next sprint to ensure continuous improvement.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Complete Retrospective
          </button>
        </div>
      </form>
    </div>
  );
}
