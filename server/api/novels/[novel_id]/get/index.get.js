import { defineEventHandler } from 'h3';
import { verifyUser, getUserRole } from '~/server/utils';

import { PrismaClient } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const { novel_id } = event.context.params;
  const { query } = await getQuery(event);
  const isVerified = await verifyUser(event);

  if (!isVerified){
      return createError({statusCode: 401, message: "you are not logged in to use this feature"})
  }

  const userId = event.context.session.user.id;
  const prisma = new PrismaClient()

  try {
    // Verify if the user is the writer or uploader of the novel
    const userRole = await getUserRole(userId, novel_id);
    if (userRole !== 'writer' && userRole !== 'uploader') {
      return {
        statusCode: 403,
        message: 'Forbidden: You are not authorized' 
      };
    }


    // Determine the target collection based on the query
    let targetCollection;
    switch (query) {
      case 'draft':
        targetCollection = prisma.drafts;
        break;
      case 'unpub':
        targetCollection = prisma.unPublishedChapter;
        break;
      case 'pub':
        targetCollection = prisma.chapter;
        break;
      default:
        return {
          statusCode: 400,
          message: 'Invalid query parameter.' ,
        };
    }

    const chapters = await targetCollection.findMany({
        where: {
            novelId: parseInt(novel_id),
        },
        orderBy: query === 'pub' || query === 'unpub' ? { chapterNumber: 'asc' } : { updatedAt: 'asc' },
    })

    if (!chapters) {
      return {
        statusCode: 404,
        message: `${query} chapters not found.`,
      };
    }

    return {
      statusCode: 200,
      body: chapters,
    };
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error.' },
    };
  }finally{
    prisma.$disconnect()
  }
});