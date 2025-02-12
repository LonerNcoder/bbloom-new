import prisma from "~/prisma/middleware/index.js";
import { defineEventHandler, createError, readBody } from 'h3';


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { novelId, chapterIds } = body;

    // Validate novelId and chapterIds
    if (!novelId || !Array.isArray(chapterIds) || chapterIds.length === 0) {
      return createError({ statusCode: 400, statusMessage: 'Invalid input data' });
    }

    // Parse chapterIds as integers
    const parsedChapterIds = chapterIds.map(id => parseInt(id, 10));

    // Check if chapterIds are valid integers
    if (parsedChapterIds.some(id => isNaN(id))) {
      return createError({ statusCode: 400, statusMessage: 'Invalid chapter IDs' });
    }

    // Fetch unpublished chapters based on chapterIds, ordered by chapterNumber
    const unpublishedChapters = await prisma.unPublishedChapter.findMany({
      where: {
        novelId: parseInt(novelId),
        id: { in: parsedChapterIds }, // Use parsed chapter IDs
      },
      orderBy: {
        chapterNumber: 'asc',
      },
    });

    // Check if we have the correct chapters
    if (unpublishedChapters.length === 0) {
      return createError({
        statusCode: 404,
        message: 'No unpublished chapters found for migration',
      });
    }

    // Migrate the unpublished chapters to the published chapters table
    const chaptersToPublish = unpublishedChapters.map(chapter => ({
      novelId: chapter.novelId,
      title: chapter.title,
      content: chapter.content,
      // Add other necessary fields from unpublishedChapter
    }));

    // Bulk create the chapters in the chapter table
    await prisma.chapter.createMany({
      data: chaptersToPublish,
    });

    // Optionally delete the unpublished chapters after migration (if required)
    await prisma.unPublishedChapter.deleteMany({
      where: {
        id: { in: parsedChapterIds },
      },
    });

    return {
      statusCode: 200,
      body: { message: 'Chapters successfully Published' },
    };
  } catch (error) {
    console.error('Error migrating chapters:', error);
    return createError({ statusCode: 500, message: 'Failed to migrate chapters' });
  }
});
