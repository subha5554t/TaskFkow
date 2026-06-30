import { ApiError } from '../utils/ApiError';

jest.mock('../config/db');

import prisma from '../config/db';
import * as projectService from '../modules/projects/project.service';

const prismaMock = prisma as jest.Mocked<typeof prisma>;

const fakeOwner = { id: 1, name: 'Alice', email: 'alice@example.com' };

const fakeProject = {
  id:          1,
  name:        'My Project',
  description: null,
  status:      'ACTIVE',
  dueDate:     null,
  ownerId:     1,
  createdAt:   new Date(),
  updatedAt:   new Date(),
  owner:       fakeOwner,
  members:     [{ userId: 1, role: 'OWNER', projectId: 1, joinedAt: new Date() }],
  _count:      { tasks: 0, members: 1 },
};

describe('project.service — getProject', () => {
  it('returns the project when user is a member', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue(fakeProject);

    const result = await projectService.getProject(1, 1);
    expect(result.id).toBe(1);
    expect(result.name).toBe('My Project');
  });

  it('throws 403 when user is not a member', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue({
      ...fakeProject,
      members: [{ userId: 2, role: 'MEMBER', projectId: 1, joinedAt: new Date() }],
    });

    await expect(projectService.getProject(1, 99)).rejects.toThrow(
      new ApiError(403, 'You are not a member of this project'),
    );
  });

  it('throws 404 when project does not exist', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(projectService.getProject(999, 1)).rejects.toThrow(
      new ApiError(404, 'Project not found'),
    );
  });
});

describe('project.service — createProject', () => {
  it('creates and returns the new project', async () => {
    (prismaMock.project.create as jest.Mock).mockResolvedValue(fakeProject);

    const result = await projectService.createProject(1, { name: 'My Project' });
    expect(result.name).toBe('My Project');
    expect(prismaMock.project.create).toHaveBeenCalledTimes(1);
  });
});

describe('project.service — updateProject', () => {
  it('updates and returns the project when called by owner', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue(fakeProject);
    (prismaMock.project.update    as jest.Mock).mockResolvedValue({ ...fakeProject, name: 'Renamed' });

    const result = await projectService.updateProject(1, 1, { name: 'Renamed' });
    expect(result.name).toBe('Renamed');
  });

  it('throws 403 when a non-owner tries to update', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue(fakeProject);

    await expect(projectService.updateProject(1, 99, { name: 'Hack' })).rejects.toThrow(
      new ApiError(403, 'Only the project owner can do this'),
    );
  });
});

describe('project.service — archiveProject', () => {
  it('throws 403 when a non-owner tries to archive', async () => {
    (prismaMock.project.findUnique as jest.Mock).mockResolvedValue(fakeProject);

    await expect(projectService.archiveProject(1, 99)).rejects.toThrow(
      new ApiError(403, 'Only the project owner can do this'),
    );
  });
});
