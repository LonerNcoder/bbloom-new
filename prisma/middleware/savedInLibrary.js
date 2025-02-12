import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    libraryNovel: {
      async create({ args, query }) {
        const { data } = args;
        const { novelId } = data;
        try{
        await prisma.novel.update({
            where: { id: novelId },
            data: {
              totalSaves: { increment: 1 },
              dailySaves: { increment: 1 },
              weeklySaves: { increment: 1 },
              monthlySaves: { increment: 1 }
            }
          });
        }catch(e){
            console.log(e)
        }

        return await query(args);
      },
      async delete({ args, query }) {
        const { where } = args;
        const {novelId} = where;

        
        try{
          await prisma.novel.update({
              where: { id: novelId },
              data: {
                totalSaves: { decrement: 1 },
                dailySaves: { decrement: 1 },
                weeklySaves: { decrement: 1 },
                monthlySaves: { decrement: 1 }
              }
            });
          }catch(e){
              console.log(e)
          }

        return await query(args);
      },


    
    },
  },
});

export default prisma;
