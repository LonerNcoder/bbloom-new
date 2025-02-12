import { defineEventHandler, getQuery, readBody } from 'h3';
import { verifyUser, getUserRole } from '~/server/utils';
import prisma from '~/prisma/middleware/index.js';

export default defineEventHandler(async (event) => {
  const { novel_id } = event.context.params;
  const { to, from } = await getQuery(event);
  const { id, title, content } = await readBody(event);
  const isVerified = await verifyUser(event);

  if (!isVerified) {
    return createError({
      statusCode: 401,
      message: 'You are not logged in to use this feature.',
    });
  }

  const userId = event.context.session.user.id;

  try {
    // Verify if the user has permission to modify the novel
    const userRole = await getUserRole(userId, novel_id);
    if (userRole !== 'writer' && userRole !== 'uploader') {
      return {
        statusCode: 403,
        message: 'Forbidden: You are not authorized to edit this novel.',
      };
    }

    // Validate the `to` and `from` parameters
    const validCollections = ['draft', 'unpub', 'pub'];
    if (!validCollections.includes(to) || !validCollections.includes(from)) {
      return createError({
        statusCode: 400,
        message: 'Invalid "to" or "from" query parameter.',
      });
    }

    // Define mappings for tables
    const collections = {
      draft: prisma.drafts,
      unpub: prisma.unPublishedChapter,
      pub: prisma.chapter,
    };

    // Get the source and target tables
    const sourceTable = collections[from];
    const targetTable = collections[to];

    if (!sourceTable || !targetTable) {
      return createError({
        statusCode: 400,
        message: 'Invalid source or target table.',
      });
    }

    // Fetch the chapter to move
    const chapter = await sourceTable.findUnique({
      where: { id: parseInt(id) },
    });

    if (!chapter) {
      return createError({
        statusCode: 404,
        message: 'Chapter not found.',
      });
    }

    // Move the chapter to the target table
    const movedChapter = await targetTable.create({
      data: {
        title: title ? title : chapter.title ,
        content: content ? content : chapter.content,
        novelId: parseInt(novel_id), // Ensure the novel ID is retained
      },
    });

    // Delete the chapter from the source table
    await sourceTable.delete({
      where: { id: parseInt(id) },
    });

    return {
      statusCode: 200,
      body: movedChapter,
    };
  } catch (error) {
    console.error('Error moving chapter:', error);
    return createError({
      statusCode: 500,
      message: 'Internal server error.',
    });
  } finally {
    prisma.$disconnect();
  }
});
