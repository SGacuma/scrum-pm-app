import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, Sprint } from '../types';
import { X, CheckCircle, TrendingUp } from 'lucide-react';
import { RetrospectiveForm } from './RetrospectiveForm';

interface SprintReviewProps {
  sprint: Sprint;
  project: Project;
  onClose: () => void;
}

type Step = 'review' | 'retrospective' | 'complete';

export function SprintReview({ sprint, project, onClose }: SprintReviewProps) {
  const { getSprintTasks, updateSprint, updateProject, state } = useApp();
  const [step, setStep] = useState<Step>('review');
  const [accepted, setAccepted] = useState(false);

  const tasks = getSprintTasks(sprint.id);
  const doneTasks = tasks.filter(t => t.status === 'done');
  const sprintPBIs = state.pbis.filter(p => p.sprintId === sprint.id);

  const completedPBIs = sprintPBIs.filter(pbi => {
    const pbiTasks = tasks.filter(t => t.pbiId === pbi.id);
    if (pbiTasks.length === 0) return false;
    return pbiTasks.every(t => t.status === 'done');
  });

  const completedSP = completedPBIs.reduce((sum, pbi) => sum + pbi.storyPoints, 0);

  const handleAccept = () => {
    updateSprint(sprint.id, {
      status: 'closed',
      completedSp: completedSP,
    });

    updateProject(project.id, {
      currentVelocity: completedSP,
    });

    setStep('retrospective');
  };

  if (step === 'retrospective') {
    return <RetrospectiveForm sprint={sprint} onComplete={() => setStep('complete')} />;
  }

  if (step === 'complete') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Sprint {sprint.sprintNumber} Complete!</h3>
          <p className="text-slate-600 mb-2">
            Your team completed <strong className="text-emerald-700">{completedSP} Story Points</strong>
          </p>
          <p className="text-slate-600 mb-6">
            This is your new velocity for planning the next sprint.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sprint {sprint.sprintNumber} Review</h2>
          <p className="text-slate-600 mt-1">Review what was accomplished during this sprint</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-slate-700">
            <strong>Sprint Review</strong> is where the team presents the Increment to stakeholders and determines what was completed.
            The Product Owner decides if the work meets the Sprint Goal.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-600 mb-1">Sprint Goal</div>
            <div className="text-slate-900">{sprint.sprintGoal}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Committed</div>
              <div className="text-2xl font-bold text-slate-900">{sprint.committedSp} SP</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-emerald-700">{completedSP} SP</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-blue-700">
                {sprint.committedSp > 0 ? Math.round((completedSP / sprint.committedSp) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Completed PBIs ({completedPBIs.length})</h3>
          {completedPBIs.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <p className="text-slate-600">No PBIs were fully completed in this sprint.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedPBIs.map(pbi => (
                <div key={pbi.id} className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-emerald-600 mt-0.5" />
                      <div>
                        <div className="font-mono text-sm font-bold text-emerald-700 mb-1">
                          PBI-{String(pbi.pbiNumber).padStart(3, '0')}
                        </div>
                        <p className="text-sm text-slate-900">{pbi.title}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded">
                      {pbi.storyPoints} SP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Incomplete PBIs ({sprintPBIs.length - completedPBIs.length})</h3>
          {sprintPBIs.length === completedPBIs.length ? (
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-emerald-700 font-medium">All PBIs completed!</p>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                {sprintPBIs.length - completedPBIs.length} PBI(s) were not completed and will return to the Product Backlog.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Product Owner Acceptance</h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div className="text-sm text-slate-700">
              I accept the Increment as meeting the Sprint Goal and Definition of Done.
              The completed Story Points ({completedSP} SP) will become the new Velocity.
            </div>
          </label>
        </div>

        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded flex items-start gap-3">
          <TrendingUp size={20} className="text-emerald-600 mt-0.5" />
          <div className="text-sm text-slate-700">
            <strong>New Velocity:</strong> {completedSP} SP will be used to plan the next sprint capacity.
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-300 flex items-center gap-2"
          >
            <CheckCircle size={20} />
            Accept & Continue to Retrospective
          </button>
        </div>
      </div>
    </div>
  );
}
