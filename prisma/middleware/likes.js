import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    like: {
      async create({ args, query }) {
        const { data } = args;
        const { novelId } = data;

        await prisma.novel.update({
            where: { id: novelId },
            data: {
              totalLikes: { increment: 1 },
              dailyLikes: { increment: 1 },
              weeklyLikes: { increment: 1 },
              monthlyLikes: { increment: 1 }
            }
        });

        return query(args);
      },
      async delete({ args, query }) {
        const { where } = args;
        const {novelId} = where;

        await prisma.novel.update({
            where: {
                id: novelId,
            },
            data: {
              totalLikes:   { decrement: 1 },
              dailyLikes:   { decrement: 1 },
              weeklyLikes:  { decrement: 1 },
              monthlyLikes: { decrement: 1 }
            }
        })

        return query(args);
      },
    },
  },
});

export default prisma;
