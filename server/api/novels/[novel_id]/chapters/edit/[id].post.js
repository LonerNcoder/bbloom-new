import { defineEventHandler, readBody } from 'h3';
import { verifyUser, getUserRole } from '~/server/utils';
import prisma from "~/prisma/middleware/index.js"



export default defineEventHandler(async (event) => {
  const { novel_id } = event.context.params;
  const { query } = getQuery(event);
  const { title, content } = await readBody(event);
  const isVerified = verifyUser(event);

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
        message: 'Forbidden: You are not authorized to add a chapter to this novel.' 
      };
    }

    // Create the newChapter object based on the request body
    const newChapter = {};
    if (typeof title === 'string' && title.trim() !== '') {
        newChapter.title = title.trim();
    }
    if (typeof content === 'string' && content.trim() !== '') {
        newChapter.content = content.trim();
    }
    
    // Check if there is any data to add
    if (Object.keys(newChapter).length === 0) {
        return {
            statusCode: 400,
            body: { message: 'Invalid request: No valid title or content provided.' },
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

    const createdChapter = await targetCollection.create({
        data: {
            novelId: parseInt(novel_id),
            ...newChapter
        }
    })

    return {
      statusCode: 200,
      body: createdChapter,
    };
  } catch (error) {
    console.error('Error adding new chapter:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error.' },
    };
  }finally {
    await prisma.$disconnect();
  }
});