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
      
      // user has multiple libraries. we need to get all of them and then check if novel is in any of them  
      const libraries = await prisma.library.findMany({
        where: { userId }
      });

      // Check if novel exists in any of the libraries
      const library = libraries.find(lib => lib.libraryNovels.some(ln => ln.novelId === novel_id));

      // Check if novel exists in library
      libraryData = await prisma.libraryNovel.findFirst({
        where: {
          libraryId: library.id,
          novelId: novel_id
        }
      });

      //get user bookmarks from user.bookmarks with this novel id
      const bookmark = await prisma.novelBookmark.findMany({
        where: { userId, novelId: novel_id },
        include: {
          chapter: true,
          note: true,
          addedAt: true
        }
      });
    //get user reading history with this novel id
    const readingHistory = await prisma.readingHistory.findUnique({
      where: { userId, novelId: novel_id },
      include: {
        lastReadChapter: true,
        maxChapterRead: true,
        lastVisitedAt: true
      }
    });
      //check if novel is bookmarked
    }

    // Format response with library info
    const response = {
      novel: novel,
      inLibrary: !!libraryData,
      bookmarks: bookmark,
      readingHistory: readingHistory
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