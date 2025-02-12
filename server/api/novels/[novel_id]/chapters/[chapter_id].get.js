import { PrismaClient } from '@prisma/client';
import { verifyUser } from '~/server/utils';
import { defineEventHandler, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const { novel_id, chapter_id } = event.context.params;
  const {mode} = await getQuery(event);
  const isVerified = await verifyUser(event);

  // Validate novel_id and chapter_num
  if (isNaN(novel_id) || isNaN(chapter_id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid novel_id or chapter_num' });
  }

  if(!isVerified){
    return createError({statusCode:403, message: event.context.error});
  }

  const prisma = new PrismaClient();
  let targetCollection;

  switch(mode){
    case "pub":
      targetCollection = prisma.chapter
      break;
    case "unpub":
      targetCollection = prisma.unPublishedChapter
      break;
    case "draft":
      targetCollection = prisma.drafts
      break;
    default:
      return createError({statusCode:402, message: "invalid query mode, make sure it's one of [pub,unpub,draft]"})
  }

  // Fetch chapter
  const chapter = await targetCollection.findFirst({
    where: {
      novelId: parseInt(novel_id),
      id: parseInt(chapter_id),
    },
  });
  prisma.$disconnect()

  if (!chapter) {
    return createError({ statusCode: 404, message: 'Chapter not found' });
  }

  return {statusCode:200, body: chapter};
});