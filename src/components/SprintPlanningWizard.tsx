import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface SprintPlanningWizardProps {
  project: Project;
  onClose: () => void;
}

type Step = 'capacity' | 'select-pbis' | 'goal' | 'confirm';

export function SprintPlanningWizard({ project, onClose }: SprintPlanningWizardProps) {
  const { getProjectPBIs, getProjectSprints, addSprint, updatePBI } = useApp();
  const [step, setStep] = useState<Step>('capacity');
  const [teamCapacity, setTeamCapacity] = useState(project.currentVelocity || 14);
  const [selectedPBIIds, setSelectedPBIIds] = useState<string[]>([]);
  const [sprintGoal, setSprintGoal] = useState('');

  const pbis = getProjectPBIs(project.id).filter(p => p.refinementStatus === 'ready' && !p.sprintId);
  const sprints = getProjectSprints(project.id);
  const nextSprintNumber = Math.max(0, ...sprints.map(s => s.sprintNumber)) + 1;

  const selectedPBIs = pbis.filter(p => selectedPBIIds.includes(p.id));
  const totalSelectedSP = selectedPBIs.reduce((sum, pbi) => sum + pbi.storyPoints, 0);

  const togglePBI = (pbiId: string) => {
    setSelectedPBIIds(prev =>
      prev.includes(pbiId) ? prev.filter(id => id !== pbiId) : [...prev, pbiId]
    );
  };

  const handleComplete = () => {
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);

    const sprintId = `sprint-${Date.now()}`;

    addSprint({
      projectId: project.id,
      sprintNumber: nextSprintNumber,
      sprintGoal,
      teamCapacity,
      committedSp: totalSelectedSP,
      completedSp: 0,
      startDate: today.toISOString().split('T')[0],
      endDate: twoWeeksLater.toISOString().split('T')[0],
      status: 'active',
    });

    selectedPBIIds.forEach(pbiId => {
      updatePBI(pbiId, { sprintId });
    });

    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sprint {nextSprintNumber} Planning</h2>
          <p className="text-slate-600 mt-1">Follow the guided steps to plan your sprint</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          {(['capacity', 'select-pbis', 'goal', 'confirm'] as const).map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step === s ? 'bg-emerald-600 text-white' :
                ['capacity', 'select-pbis', 'goal', 'confirm'].indexOf(step) > idx ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-200 text-slate-500'
              }`}>
                {idx + 1}
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  ['capacity', 'select-pbis', 'goal', 'confirm'].indexOf(step) > idx ? 'bg-emerald-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 'capacity' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-slate-700">
                <strong>Team Capacity</strong> is the total Story Points your team can commit to completing in this sprint.
                {project.currentVelocity > 0 && ` Based on your velocity, we recommend ${project.currentVelocity} SP.`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Team Capacity (Story Points)
              </label>
              <input
                type="number"
                min="1"
                value={teamCapacity}
                onChange={(e) => setTeamCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none text-lg font-semibold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('select-pbis')}
                disabled={teamCapacity < 1}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'select-pbis' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-slate-700">
                Select Product Backlog Items from the <strong>Ready</strong> list to include in this sprint.
                Try to stay within your team capacity of <strong>{teamCapacity} SP</strong>.
              </p>
            </div>

            <div className="flex items-center justify-between bg-slate-100 rounded-lg p-4">
              <div className="text-slate-700">
                <span className="font-semibold">Selected:</span> {totalSelectedSP} SP
              </div>
              <div className={`font-semibold ${
                totalSelectedSP > teamCapacity ? 'text-red-600' :
                totalSelectedSP === teamCapacity ? 'text-emerald-600' :
                'text-amber-600'
              }`}>
                {totalSelectedSP > teamCapacity && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={16} />
                    Over capacity by {totalSelectedSP - teamCapacity} SP
                  </span>
                )}
                {totalSelectedSP <= teamCapacity && `${teamCapacity - totalSelectedSP} SP remaining`}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pbis.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-8 text-center">
                  <p className="text-slate-600">No ready PBIs available. Please refine items in the Product Backlog first.</p>
                </div>
              ) : (
                pbis.map(pbi => (
                  <label
                    key={pbi.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPBIIds.includes(pbi.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPBIIds.includes(pbi.id)}
                      onChange={() => togglePBI(pbi.id)}
                      className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded">
                          {pbi.storyPoints} SP
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{pbi.title}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setStep('capacity')}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep('goal')}
                disabled={selectedPBIIds.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'goal' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-slate-700">
                The <strong>Sprint Goal</strong> is a single sentence that describes what you aim to achieve in this sprint.
                It should provide focus and alignment for the team.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sprint Goal
              </label>
              <textarea
                value={sprintGoal}
                onChange={(e) => setSprintGoal(e.target.value)}
                placeholder="e.g., Deliver the fundamental core functionality for user login and project setup."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setStep('select-pbis')}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!sprintGoal.trim()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
              <p className="text-sm text-slate-700">
                Review your sprint plan below and click <strong>Start Sprint</strong> to begin.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Sprint Number</div>
                <div className="text-lg font-bold text-slate-900">Sprint {nextSprintNumber}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Sprint Goal</div>
                <div className="text-slate-900">{sprintGoal}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-600 mb-1">Team Capacity</div>
                  <div className="text-lg font-bold text-slate-900">{teamCapacity} SP</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-600 mb-1">Committed</div>
                  <div className="text-lg font-bold text-slate-900">{totalSelectedSP} SP</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 mb-2">Selected PBIs ({selectedPBIs.length})</div>
                <div className="space-y-1">
                  {selectedPBIs.map(pbi => (
                    <div key={pbi.id} className="flex items-center gap-2 text-sm">
                      <span className="font-mono font-bold text-emerald-700">
                        PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                      </span>
                      <span className="text-slate-600">({pbi.storyPoints} SP)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setStep('goal')}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Start Sprint
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
