import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    novelRead: {
      async create({ args, query }) {
        const { data } = args;
        const { novelId, userId } = data;

        // Check if the user has already read the novel
        const existingRead = await prisma.novelRead.findUnique({
          where: {
            userId_novelId: {
              userId,
              novelId,
            },
          },
        });

        if (!existingRead) {
          // If not, increment the read count and create a new record
          await prisma.novel.update({
            where: { id: novelId },
            data: {
              totalReads: { increment: 1 },
              dailyReads: { increment: 1 },
              weeklyReads: { increment: 1 },
              monthlyReads: { increment: 1 }
            }
          });

          return query(args);  // Proceed to create the read record
        }

        return null;  // Do not create a new record if already exists
      },
    },

    novelView: {
      async create({ args, query }) {
        const { where } = args;
        const { novelId, userId } = where;

        // Check if the user has already viewed the novel
        const existingView = await prisma.novelView.findUnique({
          where: {
            userId_novelId: {
              userId,
              novelId,
            },
          },
        });

        if (!existingView) {
          // If not, increment the view count and create a new record
          await prisma.novel.update({
            where: { id: novelId },
            data: {
              totalViews: { increment: 1 },
              dailyViews: { increment: 1 },
              weeklyViews: { increment: 1 },
              monthlyViews: { increment: 1 }
            }
          });

          return query(args);  // Proceed to create the view record
        }

        return null;  // Do not create a new record if already exists
      },
    },
  },
});

export default prisma;
