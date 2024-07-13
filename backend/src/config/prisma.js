import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: ['query', 'warn', 'error']
});

export default db;
