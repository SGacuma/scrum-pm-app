import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, PBI, Sprint, Task, Retrospective } from '../types';
import { sampleProject, samplePBIs, sampleSprints, sampleTasks, sampleRetrospectives } from '../data/sampleData';

interface AppState {
  projects: Project[];
  pbis: PBI[];
  sprints: Sprint[];
  tasks: Task[];
  retrospectives: Retrospective[];
  currentProjectId: string | null;
}

interface AppContextType {
  state: AppState;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'currentVelocity'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addPBI: (pbi: Omit<PBI, 'id'>) => void;
  updatePBI: (id: string, updates: Partial<PBI>) => void;
  updatePBIPriorities: (pbis: PBI[]) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addRetrospective: (retro: Omit<Retrospective, 'id'>) => void;
  updateRetrospective: (id: string, updates: Partial<Retrospective>) => void;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => Project | undefined;
  getProjectPBIs: (projectId: string) => PBI[];
  getProjectSprints: (projectId: string) => Sprint[];
  getSprintTasks: (sprintId: string) => Task[];
  getSprintRetrospective: (sprintId: string) => Retrospective | undefined;
  getActiveSprint: (projectId: string) => Sprint | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem('simplescrum-state');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      projects: [sampleProject],
      pbis: samplePBIs,
      sprints: sampleSprints,
      tasks: sampleTasks,
      retrospectives: sampleRetrospectives,
      currentProjectId: 'project-titan',
    };
  });

  useEffect(() => {
    localStorage.setItem('simplescrum-state', JSON.stringify(state));
  }, [state]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'currentVelocity'>) => {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      currentVelocity: 0,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const addPBI = (pbi: Omit<PBI, 'id'>) => {
    const newPBI: PBI = {
      ...pbi,
      id: `pbi-${Date.now()}`,
    };
    setState(prev => ({ ...prev, pbis: [...prev.pbis, newPBI] }));
  };

  const updatePBI = (id: string, updates: Partial<PBI>) => {
    setState(prev => ({
      ...prev,
      pbis: prev.pbis.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const updatePBIPriorities = (pbis: PBI[]) => {
    setState(prev => ({
      ...prev,
      pbis: prev.pbis.map(p => {
        const updated = pbis.find(pbi => pbi.id === p.id);
        return updated || p;
      }),
    }));
  };

  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = {
      ...sprint,
      id: `sprint-${Date.now()}`,
    };
    setState(prev => ({ ...prev, sprints: [...prev.sprints, newSprint] }));
  };

  const updateSprint = (id: string, updates: Partial<Sprint>) => {
    setState(prev => ({
      ...prev,
      sprints: prev.sprints.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const addRetrospective = (retro: Omit<Retrospective, 'id'>) => {
    const newRetro: Retrospective = {
      ...retro,
      id: `retro-${Date.now()}`,
    };
    setState(prev => ({ ...prev, retrospectives: [...prev.retrospectives, newRetro] }));
  };

  const updateRetrospective = (id: string, updates: Partial<Retrospective>) => {
    setState(prev => ({
      ...prev,
      retrospectives: prev.retrospectives.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  };

  const setCurrentProject = (id: string | null) => {
    setState(prev => ({ ...prev, currentProjectId: id }));
  };

  const getCurrentProject = () => {
    return state.projects.find(p => p.id === state.currentProjectId);
  };

  const getProjectPBIs = (projectId: string) => {
    return state.pbis.filter(p => p.projectId === projectId);
  };

  const getProjectSprints = (projectId: string) => {
    return state.sprints.filter(s => s.projectId === projectId);
  };

  const getSprintTasks = (sprintId: string) => {
    return state.tasks.filter(t => t.sprintId === sprintId);
  };

  const getSprintRetrospective = (sprintId: string) => {
    return state.retrospectives.find(r => r.sprintId === sprintId);
  };

  const getActiveSprint = (projectId: string) => {
    return state.sprints.find(s => s.projectId === projectId && s.status === 'active');
  };

  const value: AppContextType = {
    state,
    addProject,
    updateProject,
    addPBI,
    updatePBI,
    updatePBIPriorities,
    addSprint,
    updateSprint,
    addTask,
    updateTask,
    addRetrospective,
    updateRetrospective,
    setCurrentProject,
    getCurrentProject,
    getProjectPBIs,
    getProjectSprints,
    getSprintTasks,
    getSprintRetrospective,
    getActiveSprint,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
