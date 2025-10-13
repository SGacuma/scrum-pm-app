import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, PBI, Sprint, Task, Retrospective } from '../types';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AppState {
  projects: Project[];
  pbis: PBI[];
  sprints: Sprint[];
  tasks: Task[];
  retrospectives: Retrospective[];
  currentProjectId: string | null;
  loading: boolean;
  user: User | null;
}

interface AppContextType {
  state: AppState;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'currentVelocity'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  addPBI: (pbi: Omit<PBI, 'id'>) => Promise<void>;
  updatePBI: (id: string, updates: Partial<PBI>) => Promise<void>;
  updatePBIPriorities: (pbis: PBI[]) => Promise<void>;
  addSprint: (sprint: Omit<Sprint, 'id'>) => Promise<void>;
  updateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  addRetrospective: (retro: Omit<Retrospective, 'id'>) => Promise<void>;
  updateRetrospective: (id: string, updates: Partial<Retrospective>) => Promise<void>;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => Project | undefined;
  getProjectPBIs: (projectId: string) => PBI[];
  getProjectSprints: (projectId: string) => Sprint[];
  getSprintTasks: (sprintId: string) => Task[];
  getSprintRetrospective: (sprintId: string) => Retrospective | undefined;
  getActiveSprint: (projectId: string) => Sprint | undefined;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    projects: [],
    pbis: [],
    sprints: [],
    tasks: [],
    retrospectives: [],
    currentProjectId: null,
    loading: true,
    user: null,
  });

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, loading: false, user: null }));
        return;
      }

      const [projectsRes, pbisRes, sprintsRes, tasksRes, retrospectivesRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('pbis').select('*').order('priority_index', { ascending: true }),
        supabase.from('sprints').select('*').order('sprint_number', { ascending: true }),
        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
        supabase.from('retrospectives').select('*'),
      ]);

      setState(prev => ({
        ...prev,
        projects: projectsRes.data || [],
        pbis: pbisRes.data || [],
        sprints: sprintsRes.data || [],
        tasks: tasksRes.data || [],
        retrospectives: retrospectivesRes.data || [],
        loading: false,
        user,
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchAllData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAllData();
      } else {
        setState({
          projects: [],
          pbis: [],
          sprints: [],
          tasks: [],
          retrospectives: [],
          currentProjectId: null,
          loading: false,
          user: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshData = async () => {
    await fetchAllData();
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'currentVelocity'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        product_goal: project.productGoal,
        user_id: state.user?.id,
      }])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, data],
      }));
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.productGoal !== undefined) dbUpdates.product_goal = updates.productGoal;
    if (updates.currentVelocity !== undefined) dbUpdates.current_velocity = updates.currentVelocity;

    const { error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const addPBI = async (pbi: Omit<PBI, 'id'>) => {
    const { data, error } = await supabase
      .from('pbis')
      .insert([{
        project_id: pbi.projectId,
        pbi_number: pbi.pbiNumber,
        title: pbi.title,
        story_points: pbi.storyPoints,
        priority_index: pbi.priorityIndex,
        refinement_status: pbi.refinementStatus,
        sprint_id: pbi.sprintId || null,
        status: pbi.status || null,
      }])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setState(prev => ({
        ...prev,
        pbis: [...prev.pbis, data],
      }));
    }
  };

  const updatePBI = async (id: string, updates: Partial<PBI>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.storyPoints !== undefined) dbUpdates.story_points = updates.storyPoints;
    if (updates.priorityIndex !== undefined) dbUpdates.priority_index = updates.priorityIndex;
    if (updates.refinementStatus !== undefined) dbUpdates.refinement_status = updates.refinementStatus;
    if (updates.sprintId !== undefined) dbUpdates.sprint_id = updates.sprintId || null;
    if (updates.status !== undefined) dbUpdates.status = updates.status || null;

    const { error } = await supabase
      .from('pbis')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

    setState(prev => ({
      ...prev,
      pbis: prev.pbis.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const updatePBIPriorities = async (pbis: PBI[]) => {
    const updates = pbis.map(pbi => ({
      id: pbi.id,
      priority_index: pbi.priorityIndex,
    }));

    for (const update of updates) {
      await supabase
        .from('pbis')
        .update({ priority_index: update.priority_index })
        .eq('id', update.id);
    }

    setState(prev => ({
      ...prev,
      pbis: prev.pbis.map(p => {
        const updated = pbis.find(pbi => pbi.id === p.id);
        return updated || p;
      }),
    }));
  };

  const addSprint = async (sprint: Omit<Sprint, 'id'>) => {
    const { data, error } = await supabase
      .from('sprints')
      .insert([{
        project_id: sprint.projectId,
        sprint_number: sprint.sprintNumber,
        sprint_goal: sprint.sprintGoal,
        team_capacity: sprint.teamCapacity,
        committed_sp: sprint.committedSp,
        completed_sp: sprint.completedSp,
        start_date: sprint.startDate,
        end_date: sprint.endDate,
        status: sprint.status,
      }])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setState(prev => ({
        ...prev,
        sprints: [...prev.sprints, data],
      }));
    }
  };

  const updateSprint = async (id: string, updates: Partial<Sprint>) => {
    const dbUpdates: any = {};
    if (updates.sprintGoal !== undefined) dbUpdates.sprint_goal = updates.sprintGoal;
    if (updates.teamCapacity !== undefined) dbUpdates.team_capacity = updates.teamCapacity;
    if (updates.committedSp !== undefined) dbUpdates.committed_sp = updates.committedSp;
    if (updates.completedSp !== undefined) dbUpdates.completed_sp = updates.completedSp;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('sprints')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

    setState(prev => ({
      ...prev,
      sprints: prev.sprints.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        task_id: task.taskId,
        sprint_id: task.sprintId,
        pbi_id: task.pbiId || null,
        description: task.description,
        status: task.status,
        owner: task.owner,
        time_estimate_hours: task.timeEstimateHours,
      }])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, data],
      }));
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: any = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.owner !== undefined) dbUpdates.owner = updates.owner;
    if (updates.timeEstimateHours !== undefined) dbUpdates.time_estimate_hours = updates.timeEstimateHours;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const addRetrospective = async (retro: Omit<Retrospective, 'id'>) => {
    const { data, error } = await supabase
      .from('retrospectives')
      .insert([{
        sprint_id: retro.sprintId,
        went_well: retro.wentWell,
        to_improve: retro.toImprove,
        action_item: retro.actionItem,
      }])
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setState(prev => ({
        ...prev,
        retrospectives: [...prev.retrospectives, data],
      }));
    }
  };

  const updateRetrospective = async (id: string, updates: Partial<Retrospective>) => {
    const dbUpdates: any = {};
    if (updates.wentWell !== undefined) dbUpdates.went_well = updates.wentWell;
    if (updates.toImprove !== undefined) dbUpdates.to_improve = updates.toImprove;
    if (updates.actionItem !== undefined) dbUpdates.action_item = updates.actionItem;

    const { error } = await supabase
      .from('retrospectives')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

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

  const signOut = async () => {
    await supabase.auth.signOut();
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
    signOut,
    refreshData,
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
