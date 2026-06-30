
import api from './client';
import type { Project } from '@/lib/types';
import type { ProjectInput } from '@/lib/validators';

interface ProjectResponse    { success: boolean; data: Project }
interface ProjectListResponse {
  success:    boolean;
  data:       any[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// Map database models to UI types.
function normaliseProject(raw: any): Project {
  return {
    id:          String(raw.id),
    name:        raw.name,
    description: raw.description ?? undefined,
    status:      raw.status,
    dueDate:     raw.dueDate ?? undefined,
    ownerId:     String(raw.ownerId ?? raw.owner?.id),
    // Extract user IDs from the membership rows
    memberIds:   (raw.members ?? []).map((m: any) => String(m.userId ?? m.id)),
    createdAt:   raw.createdAt,
    updatedAt:   raw.updatedAt,
  };
}

export async function listProjects(): Promise<Project[]> {
  const res = await api.get<ProjectListResponse>('/projects');
  return res.data.data.map(normaliseProject);
}

export async function getProject(id: string): Promise<Project> {
  const res = await api.get<ProjectResponse>(`/projects/${id}`);
  return normaliseProject(res.data.data);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const res = await api.post<ProjectResponse>('/projects', {
    name:        input.name,
    description: input.description || undefined,
    dueDate:     input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
  });
  return normaliseProject(res.data.data);
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput>,
): Promise<Project> {
  const payload: Record<string, any> = { ...input };
  
  if (input.dueDate === '') {
    payload.dueDate = null;
  } else if (input.dueDate) {
    payload.dueDate = new Date(input.dueDate).toISOString();
  } else if (input.dueDate === undefined) {
    delete payload.dueDate;
  }

  const res = await api.put<ProjectResponse>(`/projects/${id}`, payload);
  return normaliseProject(res.data.data);
}

export async function deleteProject(id: string): Promise<void> {
  // Soft-delete returns 204 no content.
  await api.delete(`/projects/${id}`);
}

export async function getProjectMembers(projectId: string): Promise<{
  id: string; name: string; email: string; role: string; joinedAt: string;
}[]> {
  const res = await api.get(`/users/projects/${projectId}/members`);
  return res.data.data.map((m: any) => ({
    id:       String(m.id),
    name:     m.name,
    email:    m.email,
    role:     m.role,
    joinedAt: m.joinedAt,
  }));
}
