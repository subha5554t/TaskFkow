import { ApiError } from '../utils/ApiError';

jest.mock('../config/db');

import prisma from '../config/db';
import * as taskService from '../modules/tasks/task.service';

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const fakeUser   = { id: 1, name: 'Alice', email: 'alice@example.com' };
const fakeMember = { userId: 1, role: 'MEMBER', projectId: 10, joinedAt: new Date() };

const fakeProject = {
  id:      10,
  status:  'ACTIVE',
  ownerId: 1,
  members: [fakeMember],
};

const fakeTask = {
  id:           100,
  title:        'Test task',
  description:  null,
  status:       'TODO',
  priority:     'MEDIUM',
  dueDate:      null,
  labels:       [],
  commentCount: 0,
  projectId:    10,
  assigneeId:   null,
  createdById:  1,
  createdAt:    new Date(),
  updatedAt:    new Date(),
  project:      { ...fakeProject },
  assignee:     null,
  createdBy:    fakeUser,
};

describe('task.service — listTasks', () => {
  it('throws 403 when user is not a project member', async () => {
    (prismaMock.projectMember.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(taskService.listTasks(10, 99, {})).rejects.toThrow(
      new ApiError(403, 'You are not a member of this project'),
    );
  });
});

describe('task.service — createTask', () => {
  it('returns the created task when user is a member', async () => {
    (prismaMock.project.findUnique  as jest.Mock).mockResolvedValue(fakeProject);
    (prismaMock.$transaction        as jest.Mock).mockImplementation((fn: (tx: typeof prisma) => Promise<unknown>) => fn(prismaMock));
    (prismaMock.task.create         as jest.Mock).mockResolvedValue(fakeTask);
    (prismaMock.activity.create     as jest.Mock).mockResolvedValue({});

    const result = await taskService.createTask(1, { title: 'Test task', projectId: 10 });
    expect(result.title).toBe('Test task');
    expect(prismaMock.task.create).toHaveBeenCalledTimes(1);
  });

  it('throws 403 when user is not a project member', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue({
      ...fakeProject,
      members: [{ userId: 2, role: 'MEMBER', projectId: 10, joinedAt: new Date() }],
    });

    await expect(
      taskService.createTask(99, { title: 'Hack', projectId: 10 }),
    ).rejects.toThrow(new ApiError(403, 'You are not a member of this project'));
  });

  it('throws 400 when project is archived', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue({
      ...fakeProject,
      status: 'ARCHIVED',
    });

    await expect(
      taskService.createTask(1, { title: 'New task', projectId: 10 }),
    ).rejects.toThrow(new ApiError(400, 'Cannot create tasks in an archived project'));
  });
});

describe('task.service — deleteTask', () => {
  it('throws 404 when task does not exist', async () => {
    (prismaMock.task.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(taskService.deleteTask(999, 1)).rejects.toThrow(
      new ApiError(404, 'Task not found'),
    );
  });

  it('throws 403 when user is not a project member', async () => {
    (prismaMock.task.findUnique as jest.Mock).mockResolvedValue({
      ...fakeTask,
      project: {
        ...fakeProject,
        members: [{ userId: 2, role: 'MEMBER', projectId: 10, joinedAt: new Date() }],
      },
    });

    await expect(taskService.deleteTask(100, 99)).rejects.toThrow(
      new ApiError(403, 'You are not a member of this project'),
    );
  });
});
