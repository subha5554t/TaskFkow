const prisma = {
  user: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    updateMany: jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
    groupBy:    jest.fn(),
  },
  projectMember: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
    create:   jest.fn(),
  },
  activity: {
    findMany:   jest.fn(),
    createMany: jest.fn(),
    create:     jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw:    jest.fn(),
};

export default prisma;
