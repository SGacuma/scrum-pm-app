import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle } from 'lucide-react';

interface NewProjectWizardProps {
  onClose: () => void;
}

export function NewProjectWizard({ onClose }: NewProjectWizardProps) {
  const { addProject, setCurrentProject } = useApp();
  const [name, setName] = useState('');
  const [productGoal, setProductGoal] = useState('');
  const [step, setStep] = useState<'name' | 'goal' | 'next-steps'>('name');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'name' && name.trim()) {
      setStep('goal');
    } else if (step === 'goal' && productGoal.trim()) {
      const projectId = `project-${Date.now()}`;
      addProject({ name, productGoal });
      setStep('next-steps');
      setTimeout(() => {
        setCurrentProject(projectId);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {step === 'name' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Titan: Core Application Deployment"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                  autoFocus
                  required
                />
                <p className="text-sm text-slate-500 mt-2">
                  Choose a descriptive name that reflects what you're building
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 'goal' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Goal
                </label>
                <p className="text-sm text-slate-600 mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  The Product Goal is the product's ultimate purpose. It anchors all the work your team will do.
                </p>
                <textarea
                  value={productGoal}
                  onChange={(e) => setProductGoal(e.target.value)}
                  placeholder="e.g., Launch a functional MVP platform that allows users to create and manage basic projects using agile frameworks by the end of Sprint 3."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none transition-colors resize-none"
                  rows={5}
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('name')}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          )}

          {step === 'next-steps' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Project Created!</h3>
              <div className="bg-slate-50 rounded-lg p-6 text-left max-w-md mx-auto mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Get Started Checklist:</h4>
                <ol className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">1.</span>
                    <span>Define Product Goal (Done!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-400">2.</span>
                    <span>Add Backlog Items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-400">3.</span>
                    <span>Start Sprint 1</span>
                  </li>
                </ol>
              </div>
              <p className="text-slate-600">Redirecting to your project...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
