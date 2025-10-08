export type RefinementStatus = 'vague' | 'ready';
export type SprintStatus = 'active' | 'closed';
export type TaskStatus = 'to_do' | 'in_progress' | 'testing' | 'done';

export interface Project {
  id: string;
  name: string;
  productGoal: string;
  currentVelocity: number;
  createdAt: string;
}

export interface PBI {
  id: string;
  projectId: string;
  pbiNumber: number;
  title: string;
  storyPoints: 1 | 2 | 3 | 5 | 8 | 13;
  priorityIndex: number;
  refinementStatus: RefinementStatus;
  sprintId?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  sprintNumber: number;
  sprintGoal: string;
  teamCapacity: number;
  committedSp: number;
  completedSp: number;
  startDate: string;
  endDate: string;
  status: SprintStatus;
}

export interface Task {
  id: string;
  taskId: string;
  sprintId: string;
  pbiId?: string;
  description: string;
  status: TaskStatus;
  owner: string;
  timeEstimateHours: number;
}

export interface Retrospective {
  id: string;
  sprintId: string;
  wentWell: string;
  toImprove: string;
  actionItem: string;
}
