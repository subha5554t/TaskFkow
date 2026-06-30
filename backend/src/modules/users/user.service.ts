import prisma from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { UpdateProfileInput } from './user.validator';

// Strip passwordHash to prevent accidental leaks to the client.
const safeUserSelect = {
  id:        true,
  name:      true,
  email:     true,
  createdAt: true,
  updatedAt: true,
} as const;


export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: safeUserSelect,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}


export async function updateProfile(userId: number, input: UpdateProfileInput) {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== userId) {
      throw new ApiError(409, 'Email is already taken');
    }
  }

  const updated = await prisma.user.update({
    where:  { id: userId },
    data:   input,
    select: safeUserSelect,
  });
  return updated;
}

export async function getProjectMembers(projectId: number, requesterId: number) {
  // Confirm requester is a member before revealing who else is on the project
  const isMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: requesterId } },
  });
  if (!isMember) throw new ApiError(403, 'You are not a member of this project');

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: safeUserSelect },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members.map((m) => ({
    id:       m.user.id,
    name:     m.user.name,
    email:    m.user.email,
    role:     m.role,
    joinedAt: m.joinedAt,
  }));
}
