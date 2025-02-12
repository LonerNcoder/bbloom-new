import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { novel_id } = event.context.params;
  // Validate novel_id and chapter_num
  if (isNaN(novel_id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid novel_id' });
  }

  // Fetch chapter
  const {chapters} = await prisma.novel.findFirst({
    where: {
      id: parseInt(novel_id),
    },
    select:{
        chapters:true
    }
  });

  if (!chapters) {
    throw createError({ statusCode: 404, statusMessage: 'Novel not found' });
  }

  return {chapters};
});