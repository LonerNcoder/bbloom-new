import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getQuery } from 'h3';
import { verifyUser } from '~/server/utils';

const prisma = new PrismaClient();


export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const search = typeof query.search === 'string' ? query.search : undefined;
    const genre = typeof query.genre === 'string' ? query.genre : undefined;
    const limit = parseInt(query.limit) || 20;
    const offset = parseInt(query.offset) || 0;

    // Validate input
    if (isNaN(limit) || limit < 0 || isNaN(offset) || offset < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid pagination parameters' });
    }

    // Build base query conditions
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ]
      }),
      ...(genre && { genre: { equals: genre } })
    };

    // Get user's library novels in single query
    let libraryNovels = [];
    const isVerified = await verifyUser(event);
    
    if (isVerified) {
      try {
        const session = event.context.session;
        libraryNovels = await prisma.libraryNovel.findMany({
          where: { library: { userId: session.user.id } },
          select: {
            novelId: true,
            bookmarkedChapter: true,
            lastReadChapter: true,
            chaptersRead: true,
            lastVisitedAt: true
          }
        });
      } catch (e) {
        console.error('Library fetch error:', e);
      }
    }

    // Fetch novels and total count in parallel
    const [novels, totalCount] = await Promise.all([
      prisma.novel.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          tags: { select: { name: true } },
          chapterList: {
            select: {
              id: true,
              title: true,
              chapterNumber: true,
              uploadedAt: true
            },
            orderBy: { chapterNumber: 'asc' }
          }
        }
      }),
      prisma.novel.count({ where })
    ]);

    if (!novels.length) {
      return createError({ statusCode: 404, statusMessage: 'No novels found' });
    }

    // Map library status and progress
    const enhancedNovels = novels.map(novel => {
      const libraryEntry = libraryNovels.find(ln => ln.novelId === novel.id);
      
      return {
        ...novel,
        inLibrary: !!libraryEntry,
        progress: {
          bookmarkedChapter: libraryEntry?.bookmarkedChapter || null,
          lastReadChapter: libraryEntry?.lastReadChapter || null,
          maxChapterRead: libraryEntry?.maxChapterRead || 0,
          progressPercent: libraryEntry 
            ? (libraryEntry.maxChapterRead / novel.chapters * 100).toFixed(1)
            : 0,
          lastVisited: libraryEntry?.lastVisitedAt || null
        }
      };
    });

    return {
      novels: enhancedNovels,
      totalCount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalCount / limit)
    };

  } catch (error) {
    console.error('Novel fetch error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: event.context.error || 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
});