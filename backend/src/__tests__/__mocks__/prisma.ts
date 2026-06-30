const prisma = {
  user: {
    findUnique: jest.fn() as jest.Mock,
    create:     jest.fn() as jest.Mock,
    update:     jest.fn() as jest.Mock,
  },
  project: {
    findUnique: jest.fn() as jest.Mock,
    findMany:   jest.fn() as jest.Mock,
    create:     jest.fn() as jest.Mock,
    update:     jest.fn() as jest.Mock,
    count:      jest.fn() as jest.Mock,
  },
  task: {
    findUnique: jest.fn() as jest.Mock,
    findMany:   jest.fn() as jest.Mock,
    create:     jest.fn() as jest.Mock,
    update:     jest.fn() as jest.Mock,
    updateMany: jest.fn() as jest.Mock,
    delete:     jest.fn() as jest.Mock,
    count:      jest.fn() as jest.Mock,
    groupBy:    jest.fn() as jest.Mock,
  },
  projectMember: {
    findUnique: jest.fn() as jest.Mock,
    findMany:   jest.fn() as jest.Mock,
  },
  comment: {
    findMany: jest.fn() as jest.Mock,
    create:   jest.fn() as jest.Mock,
  },
  activity: {
    findMany:   jest.fn() as jest.Mock,
    createMany: jest.fn() as jest.Mock,
    create:     jest.fn() as jest.Mock,
  },
  $transaction: jest.fn() as jest.Mock,
  $queryRaw:    jest.fn() as jest.Mock,
};

export default prisma;
