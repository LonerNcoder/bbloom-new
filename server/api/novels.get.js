import { defineEventHandler, createError, getQuery } from 'h3';
import prisma from "~/prisma/middleware/savedInLibrary.js";
import { verifyUser } from '~/server/utils';


export default defineEventHandler(async (event) => {
  try {
    const query = await getQuery(event);
    const {
      search,
      genre,
      page=1,
      limit = 20,
      offset = 0,
      sort = 'updatedAt',
      order = 'desc'
    } = query;

    // Validate numeric parameters
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = parseInt(page) || 1;
    const parsedOffset = (parsedPage - 1) * parsedLimit;


    if (isNaN(parsedLimit) || parsedLimit < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid limit' });
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid offset' });
    }

    // Build where clause
    const where = {
      AND: [
        {isPrivate: false}
      ]
    };

    if (typeof search === 'string' && search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // if (typeof genre === 'string' && genre) {
    //   where.AND.push({ genre: { equals: genre } });
    // }

    // Main query for novels
    const [novels, totalCount] = await Promise.all([
      prisma.novel.findMany({
        where,
        take: parsedLimit,
        skip: parsedOffset,
        orderBy: { [sort]: order },
        include: {
          tags: true,
          language: true
        }
      }),
      prisma.novel.count({ where })
    ]);

    if (!novels.length) {
      return { novels: [], totalCount: 0, currentPage: 1, totalPages: 0 };
    }

    // Get library data for authenticated users
    let libraryMap = {};
    const isVerified = await verifyUser(event);
    
    if (isVerified && event.context.session?.user) {
      const userId = event.context.session.user.id;

      // Get user's library
      const libraries = event.context.session.user.libraries

      // Get library novels for these novels
      const libraryNovels = await prisma.libraryNovel.findMany({
        where: {
          libraryId: { in: libraries.map(l => l.id) },
          novelId: { in: novels.map(n => n.id) }
        },
        select: {
          id: true,
          novelId: true,
        }
      });


      // Create lookup map
      libraryMap = libraryNovels.reduce((acc, ln) => ({
        ...acc,
        [ln.novelId]: ln
      }), {});


    }

    // Enhance novels with library data
    const enhancedNovels = novels.map(novel => ({
      ...novel,
      inLibrary: !!libraryMap[novel.id],
    }));

    // Pagination calculations
    const currentPage = parsedPage;
    const totalPages = Math.ceil(totalCount / parsedLimit);

    return {
      novels: enhancedNovels,
      totalCount,
      currentPage,
      totalPages
    };

  } catch (error) {
    console.error('Error fetching novels:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch novels'
    });
  }
});