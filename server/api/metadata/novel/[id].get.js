import { defineEventHandler, createError, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';
import { verifyUser } from '~/server/utils';

const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    const novel_id = parseInt(id);

    if (!novel_id || isNaN(novel_id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid novel ID' });
    }

    // Fetch novel with required relations
    const novel = await prisma.novel.findUnique({
      where: { id: novel_id },
      include: {
        tags: true,
        genres: true,
        language: true
      }
    });

    if (!novel) {
      throw createError({ statusCode: 404, statusMessage: 'Novel not found' });
    }

    let libraryData = null;
    const isVerified = await verifyUser(event);
    
    if (isVerified && event.context.session) {
      const userId = event.context.session.user.id;
      
      // Get or create user's library
      const library = await prisma.library.upsert({
        where: { userId },
        create: { userId },
        update: {}
      });

      // Check if novel exists in library
      libraryData = await prisma.libraryNovel.findFirst({
        where: {
          libraryId: library.id,
          novelId: novel_id
        }
      });
    }

    // Format response with library info
    const response = {
      novel: novel,
      inLibrary: !!libraryData,
      bookmark: libraryData ? {
        bookmarkedChapter: libraryData.bookmarkedChapter,
        lastReadChapter: libraryData.lastReadChapter,
        maxChapterRead: libraryData.maxChapterRead,
        progressPercent: libraryData.maxChapterRead > 0 
          ? ((libraryData.maxChapterRead / novel.chapters) * 100).toFixed(1)
          : '0.0',
        lastVisited: libraryData.lastVisitedAt
      } : null,
    };

    return { 
      statusCode: 200, 
      body: response 
    };

  } catch (error) {
    return createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Internal server error' 
    });
  }
});