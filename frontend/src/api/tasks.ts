// Tasks API — mock localStorage-backed implementation

import { getDb, commit, sessionStore, uid, delay, now } from '@/lib/store';
import { ApiError } from '@/lib/apiError';
import type { Activity, Comment, Task, TaskStatus } from '@/lib/types';
import type { CommentInput, TaskInput } from '@/lib/validators';

function requireUser(): string {
  const id = sessionStore.getUserId();
  if (!id) throw new ApiError(401, 'Not authenticated');
  return id;
}

export async function listTasks(
  projectId: string,
  filters?: {
    status?: TaskStatus;
    priority?: string;
    search?: string;
    assigneeId?: string;
    sortBy?: 'dueDate' | 'priority' | 'createdAt';
  },
): Promise<Task[]> {
  requireUser();
  const db = getDb();
  await delay(null);

  let tasks = Object.values(db.tasks).filter(t => t.projectId === projectId);

  if (filters?.status)     tasks = tasks.filter(t => t.status === filters.status);
  if (filters?.priority)   tasks = tasks.filter(t => t.priority === filters.priority);
  if (filters?.assigneeId) tasks = tasks.filter(t => t.assigneeId === filters.assigneeId);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    tasks = tasks.filter(
      t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
    );
  }

  if (filters?.sortBy === 'dueDate') {
    tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    });
  } else if (filters?.sortBy === 'priority') {
    const ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    tasks.sort((a, b) => (ORDER[a.priority] ?? 9) - (ORDER[b.priority] ?? 9));
  } else {
    tasks.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  return tasks;
}

export async function getTask(id: string): Promise<Task> {
  requireUser();
  const db   = getDb();
  const task = db.tasks[id];
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
}

export async function createTask(input: TaskInput & { projectId: string }): Promise<Task> {
  const userId = requireUser();
  await delay(null, 300);
  const id = uid('task');
  const task: Task = {
    id,
    title:       input.title,
    description: input.description ?? undefined,
    status:      input.status,
    priority:    input.priority,
    dueDate:     input.dueDate ?? undefined,
    assigneeId:  input.assigneeId ?? undefined,
    labels:      [],
    commentCount: 0,
    projectId:   input.projectId,
    createdById: userId,
    createdAt:   now(),
    updatedAt:   now(),
  };

  commit(db => {
    db.tasks[id] = task;
    // log activity
    const actId = uid('act');
    db.activities[actId] = {
      id: actId, action: 'task_created', meta: { title: task.title },
      taskId: id, userId, createdAt: now(),
    };
  });
  return task;
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput>,
): Promise<Task> {
  const userId = requireUser();
  const db     = getDb();
  await delay(null, 200);
  const task = db.tasks[id];
  if (!task) throw new ApiError(404, 'Task not found');

  // Build activity logs for changed fields
  const activities: Activity[] = [];

  if (input.status && input.status !== task.status) {
    activities.push({
      id: uid('act'), action: 'status_changed',
      meta: { from: task.status, to: input.status },
      taskId: id, userId, createdAt: now(),
    });
  }
  if (input.priority && input.priority !== task.priority) {
    activities.push({
      id: uid('act'), action: 'priority_changed',
      meta: { from: task.priority, to: input.priority },
      taskId: id, userId, createdAt: now(),
    });
  }
  if ('assigneeId' in input && input.assigneeId !== task.assigneeId) {
    const db2 = getDb();
    const assigneeName = input.assigneeId ? db2.users[input.assigneeId]?.name : null;
    activities.push({
      id: uid('act'), action: 'assignee_changed',
      meta: { to: assigneeName },
      taskId: id, userId, createdAt: now(),
    });
  }

  const updated: Task = { ...task, ...input, updatedAt: now() };
  commit(db => {
    db.tasks[id] = updated;
    activities.forEach(a => { db.activities[a.id] = a; });
  });
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  requireUser();
  const db = getDb();
  if (!db.tasks[id]) throw new ApiError(404, 'Task not found');
  commit(db => {
    delete db.tasks[id];
    // cascade delete comments and activities
    Object.keys(db.comments).forEach(k => { if (db.comments[k].taskId === id) delete db.comments[k]; });
    Object.keys(db.activities).forEach(k => { if (db.activities[k].taskId === id) delete db.activities[k]; });
  });
}

export async function bulkUpdateStatus(ids: string[], status: TaskStatus): Promise<void> {
  requireUser();
  await delay(null, 200);
  commit(db => {
    ids.forEach(id => {
      if (db.tasks[id]) db.tasks[id] = { ...db.tasks[id], status, updatedAt: now() };
    });
  });
}

// ── Comments ───────────────────────────────────────────────

export async function listComments(taskId: string): Promise<Comment[]> {
  requireUser();
  const db = getDb();
  return Object.values(db.comments)
    .filter(c => c.taskId === taskId)
    .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1);
}

export async function addComment(taskId: string, input: CommentInput): Promise<Comment> {
  const userId = requireUser();
  await delay(null, 200);
  const id = uid('cmt');
  const comment: Comment = { id, text: input.text, taskId, userId, createdAt: now() };

  commit(db => {
    db.comments[id] = comment;
    if (db.tasks[taskId]) {
      db.tasks[taskId] = { ...db.tasks[taskId], commentCount: db.tasks[taskId].commentCount + 1, updatedAt: now() };
    }
    const actId = uid('act');
    db.activities[actId] = {
      id: actId, action: 'comment_added', meta: {},
      taskId, userId, createdAt: now(),
    };
  });
  return comment;
}

// ── Activity ───────────────────────────────────────────────

export async function listActivity(taskId: string): Promise<Activity[]> {
  requireUser();
  const db = getDb();
  return Object.values(db.activities)
    .filter(a => a.taskId === taskId)
    .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1);
}
