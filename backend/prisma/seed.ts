import { PrismaClient, TaskStatus, TaskPriority, ProjectRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data (order matters — children before parents)
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Demo user — password is "password123"
  const passwordHash = await bcrypt.hash('password123', 10);
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@taskflow.dev',
      passwordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@taskflow.dev',
      passwordHash,
    },
  });

  // Project 1
  const project1 = await prisma.project.create({
    data: {
      name: 'TaskFlow MVP',
      description: 'Build and ship the TaskFlow product MVP',
      status: 'ACTIVE',
      dueDate: new Date('2026-07-31'),
      ownerId: alice.id,
    },
  });

  // Add both users as members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: alice.id, role: ProjectRole.OWNER },
      { projectId: project1.id, userId: bob.id,   role: ProjectRole.MEMBER },
    ],
  });

  // Project 2
  const project2 = await prisma.project.create({
    data: {
      name: 'Design System',
      description: 'Shared component library and design tokens',
      status: 'ACTIVE',
      ownerId: alice.id,
    },
  });

  await prisma.projectMember.create({
    data: { projectId: project2.id, userId: alice.id, role: ProjectRole.OWNER },
  });

  // Tasks for Project 1
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Set up authentication flow',
        description: 'Implement register, login, and JWT-based session management',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        createdById: alice.id,
        assigneeId: alice.id,
        dueDate: new Date('2026-06-20'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build Kanban board',
        description: 'Drag-and-drop board with status columns — TODO, In Progress, In Review, Done',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        createdById: alice.id,
        assigneeId: bob.id,
        dueDate: new Date('2026-06-25'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Backend REST API',
        description: 'Express + Prisma API covering all frontend data needs',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        projectId: project1.id,
        createdById: alice.id,
        assigneeId: alice.id,
        dueDate: new Date('2026-07-05'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Dashboard aggregations',
        description: 'Build the summary endpoint with Postgres-side groupBy and date bucketing',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project1.id,
        createdById: bob.id,
        dueDate: new Date('2026-07-10'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write test suite',
        description: 'Jest + Supertest: auth flow, CRUD auth checks, transaction behavior',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project1.id,
        createdById: alice.id,
        dueDate: new Date('2026-07-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write README and submission docs',
        description: 'Setup guide, architecture overview, known limitations section',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        projectId: project1.id,
        createdById: alice.id,
        dueDate: new Date('2026-07-20'),
      },
    }),
  ]);

  // Add a comment to the backend task
  const backendTask = tasks[2];
  const comment = await prisma.comment.create({
    data: {
      text: 'Starting with the auth module — register and login endpoints first, then layering in the rest.',
      taskId: backendTask.id,
      userId: alice.id,
    },
  });

  // Update comment count on the task
  await prisma.task.update({
    where: { id: backendTask.id },
    data:  { commentCount: 1 },
  });

  // Seed some activity entries
  await prisma.activity.createMany({
    data: [
      {
        action: 'task_created',
        meta:   { title: tasks[0].title },
        taskId: tasks[0].id,
        userId: alice.id,
      },
      {
        action: 'status_changed',
        meta:   { from: 'TODO', to: 'DONE' },
        taskId: tasks[0].id,
        userId: alice.id,
      },
      {
        action: 'task_created',
        meta:   { title: backendTask.title },
        taskId: backendTask.id,
        userId: alice.id,
      },
      {
        action: 'comment_added',
        meta:   {},
        taskId: backendTask.id,
        userId: alice.id,
      },
    ],
  });

  console.log(`Seeded:`);
  console.log(`  2 users    (alice@taskflow.dev / bob@taskflow.dev — password: password123)`);
  console.log(`  2 projects`);
  console.log(`  6 tasks`);
  console.log(`  1 comment`);
  console.log(`  4 activity entries`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
