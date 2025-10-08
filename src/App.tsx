import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ProjectList } from './components/ProjectList';
import { ProjectDashboard } from './components/ProjectDashboard';
import { NewProjectWizard } from './components/NewProjectWizard';

function AppContent() {
  const { state } = useApp();
  const [showNewProject, setShowNewProject] = useState(false);

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
