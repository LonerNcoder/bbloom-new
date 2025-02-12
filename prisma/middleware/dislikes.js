import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    dislike: {
      async create({ args, query }) {
        const { data } = args;
        const { novelId } = data;

        await prisma.novel.update({
            where: { id: novelId },
            data: { dislikes: { increment: 1 } },
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
            data:{
                dislikes: { decrement: 1 }
            }
        })

        return query(args);
      },
    },
  },
});

export default prisma;