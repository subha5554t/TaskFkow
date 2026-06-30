import type {
  Activity, Comment, Project, Task,
} from '@/lib/types';

export interface Database {
  users:      Record<string, import('@/lib/types').User>;
  projects:   Record<string, Project>;
  tasks:      Record<string, Task>;
  comments:   Record<string, Comment>;
  activities: Record<string, Activity>;
}

const DB_KEY      = 'taskflow:db';
const TOKEN_KEY   = 'taskflow:token';
const SESSION_KEY = 'taskflow:userId';

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export function now(): string {
  return new Date().toISOString();
}

function createSeedData(): Database {
  const userId   = 'user_demo';
  const userId2  = 'user_ava';
  const projId   = 'proj_website';
  const projId2  = 'proj_mobile';

  const taskId1  = 'task_001';
  const taskId2  = 'task_002';
  const taskId3  = 'task_003';
  const taskId4  = 'task_004';
  const taskId5  = 'task_005';
  const taskId6  = 'task_006';

  const actId1 = 'act_001';
  const actId2 = 'act_002';
  const actId3 = 'act_003';

  const today = new Date();
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const nextMonth = new Date(today); nextMonth.setDate(today.getDate() + 25);

  return {
    users: {
      [userId]: {
        id: userId, name: 'Alex Johnson', email: 'alex@taskflow.dev',
        passwordHash: '$2b$10$demo', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
      },
      [userId2]: {
        id: userId2, name: 'Ava Chen', email: 'ava@taskflow.dev',
        passwordHash: '$2b$10$demo', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
      },
    },
    projects: {
      [projId]: {
        id: projId, name: 'Website Redesign', description: 'Complete overhaul of the company website',
        status: 'ACTIVE', dueDate: nextMonth.toISOString(), ownerId: userId,
        memberIds: [userId, userId2], createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z',
      },
      [projId2]: {
        id: projId2, name: 'Mobile App MVP', description: 'Build v1 of the iOS and Android app',
        status: 'ACTIVE', dueDate: nextWeek.toISOString(), ownerId: userId,
        memberIds: [userId], createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z',
      },
    },
    tasks: {
      [taskId1]: {
        id: taskId1, title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity designs for the new homepage.',
        status: 'IN_PROGRESS', priority: 'HIGH', dueDate: nextWeek.toISOString(),
        labels: ['design', 'ui'], commentCount: 2,
        projectId: projId, assigneeId: userId2, createdById: userId,
        createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
      },
      [taskId2]: {
        id: taskId2, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.',
        status: 'TODO', priority: 'MEDIUM', dueDate: nextMonth.toISOString(),
        labels: ['devops'], commentCount: 0,
        projectId: projId, assigneeId: userId, createdById: userId,
        createdAt: '2024-01-16T00:00:00Z', updatedAt: '2024-01-16T00:00:00Z',
      },
      [taskId3]: {
        id: taskId3, title: 'Write API documentation',
        status: 'IN_REVIEW', priority: 'LOW', dueDate: nextWeek.toISOString(),
        labels: ['docs'], commentCount: 1,
        projectId: projId, assigneeId: userId, createdById: userId,
        createdAt: '2024-01-17T00:00:00Z', updatedAt: '2024-01-17T00:00:00Z',
      },
      [taskId4]: {
        id: taskId4, title: 'Launch beta version',
        status: 'DONE', priority: 'URGENT', labels: [], commentCount: 3,
        projectId: projId, createdById: userId,
        createdAt: '2024-01-18T00:00:00Z', updatedAt: '2024-01-18T00:00:00Z',
      },
      [taskId5]: {
        id: taskId5, title: 'Fix login page on mobile', description: 'The login form overflows on small screens.',
        status: 'TODO', priority: 'HIGH', dueDate: yesterday.toISOString(),
        labels: ['bug', 'mobile'], commentCount: 0,
        projectId: projId2, assigneeId: userId, createdById: userId,
        createdAt: '2024-02-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z',
      },
      [taskId6]: {
        id: taskId6, title: 'Implement push notifications',
        status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: nextWeek.toISOString(),
        labels: ['feature'], commentCount: 1,
        projectId: projId2, assigneeId: userId, createdById: userId,
        createdAt: '2024-02-06T00:00:00Z', updatedAt: '2024-02-06T00:00:00Z',
      },
    },
    comments: {
      'cmt_001': {
        id: 'cmt_001', text: 'Looking great! Just a few tweaks needed on the hero section.',
        taskId: taskId1, userId: userId, createdAt: '2024-01-20T10:00:00Z',
      },
      'cmt_002': {
        id: 'cmt_002', text: 'Updated the designs based on feedback.',
        taskId: taskId1, userId: userId2, createdAt: '2024-01-21T09:00:00Z',
      },
    },
    activities: {
      [actId1]: {
        id: actId1, action: 'task_created', meta: { title: 'Design homepage mockup' },
        taskId: taskId1, userId: userId, createdAt: '2024-01-15T00:00:00Z',
      },
      [actId2]: {
        id: actId2, action: 'status_changed', meta: { from: 'TODO', to: 'IN_PROGRESS' },
        taskId: taskId1, userId: userId, createdAt: '2024-01-16T08:00:00Z',
      },
      [actId3]: {
        id: actId3, action: 'comment_added', meta: {},
        taskId: taskId1, userId: userId2, createdAt: '2024-01-20T10:00:00Z',
      },
    },
  };
}

function read(): Database {
  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = createSeedData();
    window.localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as Database;
  } catch {
    const seeded = createSeedData();
    window.localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function write(db: Database): void {
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getDb(): Database { return read(); }

export function commit(mutator: (db: Database) => void): Database {
  const db = read();
  mutator(db);
  write(db);
  return db;
}

export const sessionStore = {
  getToken:  () => window.localStorage.getItem(TOKEN_KEY),
  getUserId: () => window.localStorage.getItem(SESSION_KEY),
  save(token: string, userId: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(SESSION_KEY, userId);
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  },
};
