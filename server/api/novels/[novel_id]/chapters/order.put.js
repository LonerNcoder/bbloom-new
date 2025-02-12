import { defineEventHandler, readBody, createError } from 'h3';
import { PrismaClient } from '@prisma/client';
import { verifyUser, getUserRole } from '~/server/utils';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { novel_id } = event.context.params;
  const { query } = getQuery(event);
  const isVerified = await verifyUser(event);

  if (!isVerified) {
    return createError({
      statusCode: 401,
      message: "You are not logged in to use this feature",
    });
  }

  const userId = event.context.session.user.id;
  const userRole = await getUserRole(userId, novel_id);
  if (userRole !== 'writer' && userRole !== 'uploader') {
    return createError({
      statusCode: 403,
      message: 'Forbidden: You are not authorized to update chapter order.',
    });
  }

  const body = await readBody(event);
  if (!Array.isArray(body)) {
    return createError({
      statusCode: 400,
      message: 'Invalid request body. Expected an array of objects with id and chapterNumber.',
    });
  }

  try {
    // Iterate over the list and update each chapter's chapterNumber
    for (const { id, chapterNumber } of body) {
      if (typeof id === 'number' && typeof chapterNumber === 'number') {
        await prisma.unPublishedChapter.update({
          where: { id },
          data: { chapterNumber : chapterNumber },
        });
      }
    }

    return {
      statusCode: 200,
      message: 'Chapter order updated successfully',
    };
  } catch (error) {
    return createError({
      statusCode: 500,
      message: 'An error occurred while updating the chapter order.',
    });
  } finally {
    await prisma.$disconnect();
  }
});