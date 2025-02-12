import { defineEventHandler, getQuery, readBody } from 'h3';
import { verifyUser, getUserRole } from '~/server/utils';
import prisma from '~/prisma/middleware/index.js';

export default defineEventHandler(async (event) => {
  const { novel_id } = event.context.params;
  console.log(novel_id)
  const { query } = await getQuery(event);
  const { title, content } = await readBody(event);
  const isVerified = await verifyUser(event);

  if (!isVerified) {
    return createError({
      statusCode: 401,
      message: "You are not logged in to use this feature",
    });
  }

  const userId = event.context.session.user.id;

  try {
    // Verify if the user is the writer or uploader of the novel
    const userRole = await getUserRole(userId, novel_id);
    if (userRole !== 'writer' && userRole !== 'uploader') {
      return {
        statusCode: 403,
        message: 'Forbidden: You are not authorized to edit this novel.',
      };
    }

    // Determine the target model based on the query
    let newChapter;
    switch (query) {
      case 'draft':
        newChapter = await prisma.drafts.create({
          data: {
            novelId: parseInt(novel_id),
            title,
            content,
          },
        });
        break;

      case 'unpub':
        newChapter = await prisma.unPublishedChapter.create({
          data: {
            novelId: parseInt(novel_id),
            title,
            content,
          },
        });
        break;

      case 'pub':
        newChapter = await prisma.chapter.create({
          data: {
            novelId: parseInt(novel_id),
            title,
            content,
          },
        });
        break;

      default:
        return {
          statusCode: 400,
          message: 'Invalid query parameter.',
        };
    }

    return {
      statusCode: 200,
      body: newChapter,
    };
  } catch (error) {
    console.error('Error adding new chapter:', JSON.stringify(error));
    return {
      statusCode: 500,
      message: 'Internal server error.',
    };
  }
});
