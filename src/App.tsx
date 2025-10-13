import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ProjectList } from './components/ProjectList';
import { ProjectDashboard } from './components/ProjectDashboard';
import { NewProjectWizard } from './components/NewProjectWizard';
import { Auth } from './components/Auth';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { state } = useApp();
  const [showNewProject, setShowNewProject] = useState(false);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading SimpleScrum...</p>
        </div>
      </div>
    );
  }

  if (!state.user) {
    return <Auth />;
  }

  return (
    <>
      {state.currentProjectId ? (
        <ProjectDashboard />
      ) : (
        <ProjectList onNewProject={() => setShowNewProject(true)} />
      )}

      {showNewProject && (
        <NewProjectWizard onClose={() => setShowNewProject(false)} />
      )}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
