import { PrismaClient } from '@prisma/client';
import prismaRandom from 'prisma-extension-random';

const randomPrisma = new PrismaClient().$extends(prismaRandom());

export default randomPrisma;
