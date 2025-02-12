import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getQuery } from 'h3';
import { verifyUser } from "~/server/utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log('Event Context:', event.context);
  console.log('Query Params:', getQuery(event));

  try {
    const { novel_id } = event.context.params;
    const { page = 1, limit = 20 } = await getQuery(event); // Default page 1, limit 20

    const isVerified = await verifyUser(event);

    // Validate novel id
    if (!novel_id || isNaN(novel_id)) {
      return createError({ statusCode: 402, statusMessage: 'Invalid novel id' });
    }

    if (isVerified) {
      // Check if the user is the owner or uploader of the novel
      const userId = event.context.session.userId;
      const id = parseInt(novel_id);
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageSize;

      const chapters = await prisma.chapter.findMany({
        where: {
          novelId: id,
        },
        orderBy: {
              chapterNumber: 'asc',
        },
        skip: skip, // Skip the chapters for previous pages
        take: pageSize, // Limit to pageSize
      });

      if (chapters) {
        // Count total chapters for pagination metadata
        const totalChapters = chapters.length

        return {
          statusCode: 200,
          body: {
            chapters,
            pagination: {
              totalItems: totalChapters,
              totalPages: Math.ceil(totalChapters / pageSize),
              currentPage: pageNumber,
              pageSize,
            },
          },
        };
      } else {
        return createError({
          statusCode: 403,
          statusMessage: "error",
        });
      }
    } else {
      return createError({ statusCode: 401, statusMessage: event.context.error });
    }
  } catch (error) {
    console.error('Error fetching novel:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch novel' });
  } 
});
