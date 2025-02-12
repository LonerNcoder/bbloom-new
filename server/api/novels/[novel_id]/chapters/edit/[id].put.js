import { defineEventHandler, getQuery, readBody } from 'h3';
import { verifyUser, getUserRole } from '~/server/utils';
// import prisma from  "~/prisma/middleware/index.js"
import { PrismaClient } from '@prisma/client';



export default defineEventHandler(async (event) => {
  const { novel_id, id } = event.context.params;
  const { query } = await getQuery(event);
  const { title, content } = await readBody(event);
  const isVerified = await verifyUser(event);

  if (!isVerified){
      return createError({statusCode: 401, message: "you are ot logged in to use this feature"})
  }
  
  const userId = event.context.session.user.id;
  const prisma = new PrismaClient();

  try {
    // Verify if the user is the writer or uploader of the novel
    const userRole = await getUserRole(userId, novel_id);
    if (userRole !== 'writer' && userRole !== 'uploader') {
      return {
        statusCode: 403,
        message: 'Forbidden: You are not authorized to edit this novel.' 
      };
    }

    // Create the updateData object based on the request body
    const updateData = {};
    if (typeof title === 'string' && title.trim() !== '') {
        updateData.title = title.trim();
    }
    if (typeof content === 'string' && content.trim() !== '') {
        updateData.content = content.trim();
    }
    
    // Check if there is any data to update
    if (Object.keys(updateData).length === 0) {
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



    const newChapter = await targetCollection.update({
        where: {
            novelId: parseInt(novel_id),
            id: parseInt(id),
        },
        data:updateData
    })

    return {
      statusCode: 200,
      body: newChapter,
    };
  } catch (error) {
    console.error('Error updating chapter:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error.' },
    };
  }finally{
    prisma.$disconnect()
  }
});