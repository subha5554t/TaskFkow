import prisma from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { CreateProjectInput, UpdateProjectInput } from './project.validator';


async function getProjectOrThrow(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where:   { id: projectId },
    include: { members: true, owner: { select: { id: true, name: true, email: true } } },
  });
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.members.some((m) => m.userId === userId);
  if (!isMember) throw new ApiError(403, 'You are not a member of this project');

  return project;
}

async function assertOwner(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.ownerId !== userId) throw new ApiError(403, 'Only the project owner can do this');
  return project;
}


export async function listProjects(userId: number, page: number, limit: number) {
  const clampedPage  = Math.max(1, page);
  const clampedLimit = Math.min(100, Math.max(1, limit));
  const skip = (clampedPage - 1) * clampedLimit;

  const where = {
    members: { some: { userId } },
    status:  { not: 'ARCHIVED' as const },
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take:    clampedLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner:   { select: { id: true, name: true, email: true } },
        _count:  { select: { tasks: true, members: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page:       clampedPage,
      limit:      clampedLimit,
      totalPages: Math.ceil(total / clampedLimit),
    },
  };
}

export async function createProject(userId: number, input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: {
      name:        input.name,
      description: input.description,
      dueDate:     input.dueDate ? new Date(input.dueDate) : undefined,
      ownerId:     userId,
      members: {
        create: { userId, role: 'OWNER' },
      },
    },
    include: {
      owner:   { select: { id: true, name: true, email: true } },
      _count:  { select: { tasks: true, members: true } },
    },
  });
  return project;
}

export async function getProject(projectId: number, userId: number) {
  const project = await getProjectOrThrow(projectId, userId);
  return project;
}

export async function updateProject(
  projectId: number,
  userId: number,
  input: UpdateProjectInput,
) {
  await assertOwner(projectId, userId);

  const updated = await prisma.project.update({
    where: { id: projectId },
    data:  {
      ...input,
      dueDate: input.dueDate === null
        ? null
        : input.dueDate
          ? new Date(input.dueDate)
          : undefined,
    },
    include: {
      owner:  { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
  return updated;
}

export async function archiveProject(projectId: number, userId: number) {
  await assertOwner(projectId, userId);

  await prisma.project.update({
    where: { id: projectId },
    data:  { status: 'ARCHIVED' },
  });
}
