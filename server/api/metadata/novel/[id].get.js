import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError } from 'h3';



/**
 * Handles GET requests to retrieve a novel with pagination for chapters.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ novels: Novel[] }> | H3Error}
 *   - An object containing the novel metadata with paginated chapters.
 */
export default defineEventHandler(async (event) => {

const prisma = new PrismaClient();
  try {
    const { id } = event.context.params;
    // Validate novel id
    if (!id || isNaN(id)) {
      return createError({ statusCode: 402, statusMessage: 'Invalid novel id' });
    }
      const novel_id = parseInt(id)
      const novel = await prisma.novel.findUnique({
        where: {
          id: novel_id,
        },
        include: {
          tags: true,
          genres: true,
        },
      });

      if (novel) {
        return {
          statusCode: 200,
          body: novel
          }
      }else {
        return createError({
          statusCode: 403,
          statusMessage: "Could not fetch metadata",
        });
      }
    
  } catch (error) {
    console.error('Error fetching novel:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch novel' });
  } finally {
    await prisma.$disconnect();
  }
});
