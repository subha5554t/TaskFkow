import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import prisma from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import {
  CreateTaskInput,
  UpdateTaskInput,
  BulkUpdateInput,
  ListTasksQuery,
} from './task.validator';


async function getTaskOrThrow(taskId: number, userId: number) {
  const task = await prisma.task.findUnique({
    where:   { id: taskId },
    include: {
      project: { include: { members: true } },
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!task) throw new ApiError(404, 'Task not found');

  const isMember = task.project.members.some((m) => m.userId === userId);
  if (!isMember) throw new ApiError(403, 'You are not a member of this project');

  return task;
}


async function assertProjectMember(projectId: number, userId: number) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) throw new ApiError(403, 'You are not a member of this project');
}


async function assertAssigneeIsMember(projectId: number, assigneeId: number) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
  });
  if (!member) throw new ApiError(400, 'Assignee must be a member of the project');
}


async function logTaskChanges(
  tx: Prisma.TransactionClient,
  taskId: number,
  userId: number,
  before: { status: TaskStatus; priority: TaskPriority; assigneeId: number | null },
  after:  UpdateTaskInput,
) {
  const entries: Prisma.ActivityCreateManyInput[] = [];

  if (after.status && after.status !== before.status) {
    entries.push({ taskId, userId, action: 'status_changed',   meta: { from: before.status,   to: after.status } });
  }
  if (after.priority && after.priority !== before.priority) {
    entries.push({ taskId, userId, action: 'priority_changed', meta: { from: before.priority, to: after.priority } });
  }
  if ('assigneeId' in after && after.assigneeId !== before.assigneeId) {
    entries.push({ taskId, userId, action: 'assignee_changed', meta: { from: before.assigneeId, to: after.assigneeId } });
  }

  if (entries.length > 0) {
    await tx.activity.createMany({ data: entries });
  }
}

export async function listTasks(projectId: number, userId: number, query: ListTasksQuery) {
  await assertProjectMember(projectId, userId);

  const page        = Math.max(1, Number(query.page)  || 1);
  const limit       = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip        = (page - 1) * limit;
  const sortBy      = query.sortBy  || 'createdAt';
  const order       = query.order   || 'desc';

  const where: Prisma.TaskWhereInput = { projectId };

  if (query.status)     where.status     = query.status as TaskStatus;
  if (query.priority)   where.priority   = query.priority as TaskPriority;
  if (query.assigneeId) where.assigneeId = Number(query.assigneeId);

  if (query.search) {
    where.OR = [
      { title:       { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput = { [sortBy]: order };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take:    limit,
      orderBy,
      include: {
        assignee:  { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function createTask(userId: number, input: CreateTaskInput) {
  const project = await prisma.project.findUnique({
    where:   { id: input.projectId },
    include: { members: true },
  });
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.members.some((m) => m.userId === userId);
  if (!isMember) throw new ApiError(403, 'You are not a member of this project');

  if (project.status === 'ARCHIVED') {
    throw new ApiError(400, 'Cannot create tasks in an archived project');
  }

  if (input.assigneeId) {
    await assertAssigneeIsMember(input.projectId, input.assigneeId);
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title:       input.title,
        description: input.description,
        status:      input.status      as TaskStatus   | undefined,
        priority:    input.priority    as TaskPriority | undefined,
        dueDate:     input.dueDate     ? new Date(input.dueDate) : undefined,
        labels:      input.labels      ?? [],
        projectId:   input.projectId,
        assigneeId:  input.assigneeId,
        createdById: userId,
      },
      include: {
        assignee:  { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.activity.create({
      data: { taskId: task.id, userId, action: 'task_created', meta: {} },
    });

    return task;
  });
}

export async function getTask(taskId: number, userId: number) {
  return getTaskOrThrow(taskId, userId);
}

export async function updateTask(taskId: number, userId: number, input: UpdateTaskInput) {
  const existing = await getTaskOrThrow(taskId, userId);

  if (existing.project.status === 'ARCHIVED') {
    throw new ApiError(400, 'Cannot modify tasks in an archived project');
  }

  if (input.assigneeId) {
    await assertAssigneeIsMember(existing.projectId, input.assigneeId);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data:  {
        ...input,
        dueDate:    input.dueDate    === null ? null : input.dueDate    ? new Date(input.dueDate) : undefined,
        assigneeId: input.assigneeId === null ? null : input.assigneeId ?? undefined,
        status:     input.status     as TaskStatus   | undefined,
        priority:   input.priority   as TaskPriority | undefined,
      },
      include: {
        assignee:  { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await logTaskChanges(tx, taskId, userId, existing, input);

    return updated;
  });
}

export async function deleteTask(taskId: number, userId: number) {
  await getTaskOrThrow(taskId, userId);

  await prisma.task.delete({ where: { id: taskId } });
}

export async function bulkUpdateTasks(userId: number, input: BulkUpdateInput) {
  const tasks = await prisma.task.findMany({
    where:   { id: { in: input.ids } },
    include: { project: { include: { members: true } } },
  });

  for (const task of tasks) {
    const isMember = task.project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ApiError(403, `You are not a member of the project for task #${task.id}`);
    }
  }

  const result = await prisma.task.updateMany({
    where: { id: { in: input.ids } },
    data:  { status: input.status as TaskStatus },
  });

  return { count: result.count };
}

export async function listComments(taskId: number, userId: number) {
  await getTaskOrThrow(taskId, userId);

  return prisma.comment.findMany({
    where:   { taskId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function addComment(taskId: number, userId: number, text: string) {
  const task = await getTaskOrThrow(taskId, userId);

  if (task.project.status === 'ARCHIVED') {
    throw new ApiError(400, 'Cannot comment on tasks in an archived project');
  }

  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: { text, taskId, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await tx.task.update({
      where: { id: taskId },
      data:  { commentCount: { increment: 1 } },
    });

    await tx.activity.create({
      data: { taskId, userId, action: 'comment_added', meta: {} },
    });

    return comment;
  });
}

export async function listActivity(taskId: number, userId: number) {
  await getTaskOrThrow(taskId, userId);

  return prisma.activity.findMany({
    where:   { taskId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
