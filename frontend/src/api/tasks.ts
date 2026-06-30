
import api from './client';
import type { Activity, Comment, Task, TaskStatus } from '@/lib/types';
import type { CommentInput, TaskInput } from '@/lib/validators';

interface TaskResponse    { success: boolean; data: any }
interface TaskListResponse {
  success:    boolean;
  data:       any[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// Map database models to UI types.
function normaliseTask(raw: any): Task {
  return {
    id:           String(raw.id),
    title:        raw.title,
    description:  raw.description  ?? undefined,
    status:       raw.status,
    priority:     raw.priority,
    dueDate:      raw.dueDate      ?? undefined,
    labels:       raw.labels       ?? [],
    commentCount: raw.commentCount ?? 0,
    projectId:    String(raw.projectId),
    assigneeId:   raw.assigneeId   ? String(raw.assigneeId)   : undefined,
    createdById:  raw.createdById  ? String(raw.createdById)  : String(raw.createdBy?.id ?? ''),
    createdAt:    raw.createdAt,
    updatedAt:    raw.updatedAt,
  };
}

function normaliseComment(raw: any): Comment {
  return {
    id:        String(raw.id),
    text:      raw.text,
    taskId:    String(raw.taskId),
    userId:    String(raw.userId ?? raw.user?.id),
    createdAt: raw.createdAt,
  };
}

function normaliseActivity(raw: any): Activity {
  return {
    id:        String(raw.id),
    action:    raw.action,
    meta:      raw.meta ?? undefined,
    taskId:    String(raw.taskId),
    userId:    String(raw.userId ?? raw.user?.id),
    createdAt: raw.createdAt,
  };
}

export async function listTasks(
  projectId: string,
  filters?: {
    status?:     TaskStatus;
    priority?:   string;
    search?:     string;
    assigneeId?: string;
    sortBy?:     'dueDate' | 'priority' | 'createdAt';
  },
): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (filters?.status)     params.status     = filters.status;
  if (filters?.priority)   params.priority   = filters.priority;
  if (filters?.search)     params.search     = filters.search;
  if (filters?.assigneeId) params.assigneeId = filters.assigneeId;
  if (filters?.sortBy)     params.sortBy     = filters.sortBy;

  const res = await api.get<TaskListResponse>(
    `/tasks/projects/${projectId}/tasks`,
    { params },
  );
  return res.data.data.map(normaliseTask);
}

export async function getTask(id: string): Promise<Task> {
  const res = await api.get<TaskResponse>(`/tasks/${id}`);
  return normaliseTask(res.data.data);
}

export async function createTask(
  input: TaskInput & { projectId: string },
): Promise<Task> {
  const res = await api.post<TaskResponse>('/tasks', {
    title:       input.title,
    projectId:   Number(input.projectId),
    description: input.description || undefined,
    status:      input.status,
    priority:    input.priority,
    dueDate:     input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
    assigneeId:  input.assigneeId  ? Number(input.assigneeId) : undefined,
  });
  return normaliseTask(res.data.data);
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput>,
): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (input.title       !== undefined) payload.title       = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.status      !== undefined) payload.status      = input.status;
  if (input.priority    !== undefined) payload.priority    = input.priority;
  
  if (input.dueDate === '') {
    payload.dueDate = null;
  } else if (input.dueDate) {
    payload.dueDate = new Date(input.dueDate).toISOString();
  }

  if ('assigneeId' in input)           payload.assigneeId  = input.assigneeId
                                                              ? Number(input.assigneeId)
                                                              : null;

  const res = await api.patch<TaskResponse>(`/tasks/${id}`, payload);
  return normaliseTask(res.data.data);
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function bulkUpdateStatus(ids: string[], status: TaskStatus): Promise<void> {
  await api.patch('/tasks/bulk', {
    ids:    ids.map(Number),
    status,
  });
}


export async function listComments(taskId: string): Promise<Comment[]> {
  const res = await api.get<{ success: boolean; data: any[] }>(`/tasks/${taskId}/comments`);
  return res.data.data.map(normaliseComment);
}

export async function addComment(taskId: string, input: CommentInput): Promise<Comment> {
  const res = await api.post<{ success: boolean; data: any }>(
    `/tasks/${taskId}/comments`,
    { text: input.text },
  );
  return normaliseComment(res.data.data);
}


export async function listActivity(taskId: string): Promise<Activity[]> {
  const res = await api.get<{ success: boolean; data: any[] }>(`/tasks/${taskId}/activity`);
  return res.data.data.map(normaliseActivity);
}
