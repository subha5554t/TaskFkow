// Projects API — mock localStorage-backed implementation

import { getDb, commit, sessionStore, uid, delay, now } from '@/lib/store';
import { ApiError } from '@/lib/apiError';
import type { Project } from '@/lib/types';
import type { ProjectInput } from '@/lib/validators';

function requireUser(): string {
  const id = sessionStore.getUserId();
  if (!id) throw new ApiError(401, 'Not authenticated');
  return id;
}

export async function listProjects(): Promise<Project[]> {
  const userId = requireUser();
  const db     = getDb();
  await delay(null);
  return Object.values(db.projects).filter(
    p => p.ownerId === userId || p.memberIds.includes(userId)
  );
}

export async function getProject(id: string): Promise<Project> {
  const userId = requireUser();
  const db     = getDb();
  await delay(null);
  const proj = db.projects[id];
  if (!proj) throw new ApiError(404, 'Project not found');
  if (proj.ownerId !== userId && !proj.memberIds.includes(userId))
    throw new ApiError(403, 'Access denied');
  return proj;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const userId = requireUser();
  await delay(null, 300);
  const id = uid('proj');
  const project: Project = {
    id, name: input.name,
    description: input.description ?? undefined,
    status: 'ACTIVE',
    dueDate: input.dueDate ?? undefined,
    ownerId: userId,
    memberIds: [userId],
    createdAt: now(), updatedAt: now(),
  };
  commit(db => { db.projects[id] = project; });
  return project;
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput>,
): Promise<Project> {
  const userId = requireUser();
  const db     = getDb();
  await delay(null, 200);
  const proj = db.projects[id];
  if (!proj) throw new ApiError(404, 'Project not found');
  if (proj.ownerId !== userId) throw new ApiError(403, 'Only the owner can edit this project');
  const updated = { ...proj, ...input, updatedAt: now() };
  commit(db => { db.projects[id] = updated; });
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const userId = requireUser();
  const db     = getDb();
  await delay(null, 200);
  const proj = db.projects[id];
  if (!proj) throw new ApiError(404, 'Project not found');
  if (proj.ownerId !== userId) throw new ApiError(403, 'Only the owner can delete this project');
  // Soft delete: set status to ARCHIVED
  commit(db => { db.projects[id] = { ...proj, status: 'ARCHIVED', updatedAt: now() }; });
}
