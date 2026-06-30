// Domain model for TaskFlow.
// These mirror the relational shape from the spec:
// User -> Project -> Task -> Comment / Activity

export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW'  | 'MEDIUM'      | 'HIGH'      | 'URGENT';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ProjectRole   = 'OWNER'  | 'MEMBER';

export interface User {
  id:           string;
  name:         string;
  email:        string;
  passwordHash: string; // never surfaced to UI
  createdAt:    string;
  updatedAt:    string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface Project {
  id:          string;
  name:        string;
  description?: string;
  status:      ProjectStatus;
  dueDate?:    string;
  ownerId:     string;
  memberIds:   string[];
  createdAt:   string;
  updatedAt:   string;
}

export interface Task {
  id:          string;
  title:       string;
  description?: string;
  status:      TaskStatus;
  priority:    TaskPriority;
  dueDate?:    string;
  labels:      string[];
  commentCount: number;
  projectId:   string;
  assigneeId?: string;
  createdById: string;
  createdAt:   string;
  updatedAt:   string;
}

export interface Comment {
  id:        string;
  text:      string;
  taskId:    string;
  userId:    string;
  createdAt: string;
}

export type ActivityAction =
  | 'task_created'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'comment_added';

export interface Activity {
  id:        string;
  action:    ActivityAction;
  meta?:     Record<string, unknown>;
  taskId:    string;
  userId:    string;
  createdAt: string;
}


export const TASK_STATUSES: TaskStatus[] = [
  'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE',
];

export const TASK_PRIORITIES: TaskPriority[] = [
  'LOW', 'MEDIUM', 'HIGH', 'URGENT',
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
  URGENT: 'Urgent',
};
