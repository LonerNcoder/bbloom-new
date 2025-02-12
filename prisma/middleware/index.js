import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    chapter: {
      async create({ args, query }) {
        const { data } = args;
        const { novelId } = data;

        const lastChapter = await prisma.chapter.findFirst({
          where: { novelId },
          orderBy: { chapterNumber: 'desc' },
        });
    

        args.data.chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;
        await prisma.novel.update({
          where : {id: novelId},
          data: {chapters : {increment  :1}}
        })
        return await query(args);
      },

      async createMany({ args, query }) {
        const { data } = args;
        const { novelId } = data[0];

        // Find the last chapter's chapterNumber for this novel
        const lastChapter = await prisma.chapter.findFirst({
          where: { novelId },
          orderBy: { chapterNumber: 'desc' },
        });

        let chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

        // Update the chapterNumber for each chapter in the batch
        const updatedData = data.map((chapter) => {
          return {
            ...chapter,
            chapterNumber: chapterNumber++, // Increment chapterNumber for each entry
          };
        });

        // Perform the bulk create operation
        await prisma.novel.update({
            where : {id: novelId},
            data: {chapters : {increment : data.length}}
        })
    
        return query({ ...args, data: updatedData });
      },
      async delete({ args, query }) {
        const { where } = args;

        // Find the chapter to be deleted
        const deletedChapter = await prisma.chapter.findUnique({
          where,
        });
        console.log(deletedChapter);

        if (!deletedChapter) {
          throw new Error(`Chapter not found for deletion: ${JSON.stringify(where)}`);
        }


        // Reorder remaining chapters with higher chapterNumber
        try{
        await prisma.chapter.updateMany({
          where: {
            novelId: deletedChapter.novelId,
            chapterNumber: { gt: deletedChapter.chapterNumber },
          },
          data: {
            chapterNumber: { decrement: 1 },
          },
        });

        await prisma.novel.update({
          where : {id: deletedChapter.novelId},
          data: {chapters : {decrement : 1}}
        })
      }catch(e){
        console.log(e)
      }

        return query(args);
      },
    },
    unPublishedChapter: {
      async create({ args, query }) {
        const { data } = args;
        const { novelId } = data;

        const lastChapter = await prisma.unPublishedChapter.findFirst({
          where: { novelId: novelId },
          orderBy: { chapterNumber: 'desc' },
        });

        args.data.chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

        return query(args);
      },
      async delete({ args, query }) {
        const { where } = args;

        // Find the chapter to be deleted
        const deletedChapter = await prisma.unPublishedChapter.findUnique({
          where,
        });

        if (!deletedChapter) {
          throw new Error(`Unpublished chapter not found for deletion: ${JSON.stringify(where)}`);
        }

        // Delete the chapter
        const result = await query(args);

        // Reorder remaining unpublished chapters with higher chapterNumber
        await prisma.unPublishedChapter.updateMany({
          where: {
            novelId: deletedChapter.novelId,
            chapterNumber: { gt: deletedChapter.chapterNumber },
          },
          data: {
            chapterNumber: { decrement: 1 },
          },
        });

        return result;
      },
    },
  },
});

export default prisma;
