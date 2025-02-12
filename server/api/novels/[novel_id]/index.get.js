import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getQuery } from 'h3';
import { verifyUser } from "~/server/utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const query = await getQuery(event);
    let { novel_id } = event.context.params;
    const {
      search,
      genre,
      page = 1,
      limit = 20,
      sort = 'chapterNumber',
      order = 'asc',
      type = 'pub'
    } = query;

    // Validate numeric parameters
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = parseInt(page) || 1;

    novel_id = parseInt(novel_id);

    // Validate novel id
    if (!novel_id || isNaN(novel_id)) {
      return createError({ statusCode: 402, statusMessage: 'Invalid novel id' });
    }
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid limit' });
    }
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid page number' });
    }

    // Calculate offset based on page number
    const parsedOffset = (parsedPage - 1) * parsedLimit;

    // Skip verification for "pub" query
    let isVerified = true;
    if (type !== 'pub') {
      isVerified = await verifyUser(event);
    }

    if (isVerified) {
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageSize;

      let chapters = null;

      // Check for the query parameter and fetch chapters accordingly
      if (type === 'pub') {
        chapters = await prisma.chapter.findMany({
          where: { novelId: novel_id },
          orderBy: { [sort]: order },
          skip: parsedOffset,
          take: parsedLimit,
        });
      } else if (type === 'unpub') {
        chapters = await prisma.unPublishedChapter.findMany({
          where: { novelId: novel_id },
          orderBy: { [sort]: order },
          skip: parsedOffset,
          take: parsedLimit,
        });
      } else if (type === 'draft') {
        chapters = await prisma.drafts.findMany({
          where: { novelId: novel_id },
          orderBy: { updatedAt: order },
          skip: skip,
          take: pageSize,
        });
      } else {
        return createError({
          statusCode: 400,
          statusMessage: 'Invalid query parameter',
        });
      }

      if (chapters) {
        // Count total chapters for pagination metadata
        const totalChapters = await prisma.chapter.count({
          where: { novelId: novel_id },
        });

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
          statusMessage: "No chapters found",
        });
      }
    } else {
      return createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error fetching novel:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch novel' });
  }
});
