import { defineEventHandler } from 'h3';
import { verifyUser, getUserRole } from '~/server/utils';
import prisma from "~/prisma/middleware/index.js"

export default defineEventHandler(async (event) => {
  const { novel_id, id } = event.context.params;
  const { query } = await getQuery(event);
  const isVerified = await verifyUser(event);

  if (!isVerified){
      return createError({statusCode: 401, message: "you are not logged in to use this feature"})
  }

  const userId = event.context.session.user.id;

  try {
    // Verify if the user is the writer or uploader of the novel
    const userRole = await getUserRole(userId, novel_id);
    if (userRole !== 'writer' && userRole !== 'uploader') {
      return {
        statusCode: 403,
        message: 'Forbidden: You are not authorized to delete this chapter.' 
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

    const deletedChapter = await targetCollection.delete({
        where: {
            novelId: parseInt(novel_id),
            id: parseInt(id),
        }
    })

    return {
      statusCode: 200,
      message: 'Chapter deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return {
      statusCode: 500,
      message: 'Internal server error.',
    };
  }
});