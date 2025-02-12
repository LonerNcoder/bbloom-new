import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getQuery } from 'h3';
import { verifyUser } from '~/server/utils';

const prisma = new PrismaClient();

// Cache frequently accessed novels (optional, use with TTL)
// const novelCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

export default defineEventHandler(async (event) => {
  try {
    const id = getQuery(evet).id
    const novelId = parseInt(id);
    if (!novelId || isNaN(novelId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid novel ID' });
    }

    // Check cache first if implemented
    // const cached = novelCache.get(`novel:${novelId}`);
    // if (cached) return cached;

    const [novel, libraryData] = await Promise.all([
      prisma.novel.findUnique({
        where: { id: novelId },
        select: {
          id: true,
          title: true,
          author: true,
          genre: true,
          coverImage: true,
          summary: true,
          chapters: true,
          status: true,
          chapterList: {
            select: {
              id: true,
              title: true,
              chapterNumber: true,
              uploadedAt: true,
            },
            orderBy: { chapterNumber: 'asc' },
          },
          tags: { select: { name: true } },
        },
        cacheStrategy: { ttl: 300 }, // If using Prisma Accelerate
      }),
      (async () => {
        if (!(await verifyUser(event))) return null;
        const session = event.context.session;
        
        return prisma.libraryNovel.findFirst({
          where: {
            library: { userId: session.user.id },
            novelId: novelId,
          },
          select: {
            bookmarkedChapter: true,
            lastReadChapter: true,
            chaptersRead: true,
            lastVisitedAt: true,
          },
        });
      })()
    ]);

    if (!novel) {
      throw createError({ statusCode: 404, statusMessage: 'Novel not found' });
    }

    const response = {
      ...novel,
      inLibrary: !!libraryData,
      progress: libraryData ? {
        bookmarkedChapter: libraryData.bookmarkedChapter,
        lastReadChapter: libraryData.lastReadChapter,
        maxChapterRead: libraryData.maxChapterRead,
        progressPercent: (libraryData.maxChapterRead / novel.chapters * 100).toFixed(1),
        lastVisited: libraryData.lastVisitedAt,
      } : null
    };

    // Cache the response if implemented
    // novelCache.set(`novel:${novelId}`, response);

    return response;

  } catch (error) {
    console.error('Novel fetch error:', error);
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
});