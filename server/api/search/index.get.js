import { defineEventHandler, createError, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';
import { verifyUser } from '~/server/utils';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const query = await getQuery(event);
    const {
      mode = "Safe",
      search = "",
      genres = "",
      page = 1,
      limit = 20,
      sort = 'views',
      order = 'desc',
      status = "all",
      tags = "",
      type = "or"  // Important:  "or" or "and" for genre/tag matching
    } = query;

    // ... (Your validation code for limit, page, sort, order - remains the same) ...
        // Validate numeric parameters
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedPage = parseInt(page) || 1;

    if (isNaN(parsedLimit) || parsedLimit < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid limit' });
    }
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid page' });
    }

    // Validate sort parameter
    const validSortFields = ['views', 'chapters', 'readers', 'rating', 'likes', 'dislikes', "date"];
    const validSortFieldMap = {
      views: 'totalViews',
      chapters: 'chapters',
      readers: 'totalReads',
      likes: 'totalLikes',
      dislikes: 'totalDislikes',
      date: 'uploadedAt',
      rating: 'rating'

    };
    const validStatusFieldMap = {
      ongoing : "Ongoing",
      hiatus : "Hiatus",
      completed: "Completed"
    }

    if (!validSortFields.includes(sort)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid sort field' });
    }

    // Validate order parameter
    const validOrders = ['asc', 'desc'];
    if (!validOrders.includes(order)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid order' });
    }
    const parsedOffset = (parsedPage - 1) * parsedLimit;


    // --- Build the WHERE clause ---
    const where = {
      AND: [{ isPrivate: false }], // Always start with isPrivate: false
    };

    // 1. Search Condition (if provided)
    if (typeof search === 'string' && search.trim() !== '') {
      where.AND.push({
        OR: [
          { title: { contains: search } }, 
          { author: { contains: search } }, 
          { summary: { contains: search } } 
        ]
      });
    }

    // 2. Genre Condition (if provided)
   if (genres.trim() !== "") {
      const queriedGenres = genres.split(",").map(decodeURIComponent);
      if (type === "or") {
        where.AND.push({ genres: { some: { name: { in: queriedGenres } } } }); // At least one genre
      } else if (type === "and") {
          where.AND.push({
              AND: queriedGenres.map(genre => ({
                  genres: { some: { name: { equals: genre } } } // Changed this line
              }))
          });
      }
    }

    // 3. Tag Condition (if provided)
    if (tags.trim() !== "") {
      const queriedTags = tags.split(",").map(decodeURIComponent);
      if (type === "or") {
        where.AND.push({ tags: { some: { name: { in: queriedTags } } } }); // At least one tag
      } else if (type === "and") {
         where.AND.push({
              AND: queriedTags.map(tag => ({
                  tags: { some: { name: { equals: tag} } } // Changed this line
              }))
          });
      }
    }

    // 4. Status Condition (if provided)
    if (typeof status === 'string' && status.trim() !== '' && status.toLowerCase() !== 'all') {
      where.AND.push({ status: { equals: validStatusFieldMap[status] } }); // Corrected typo: satatus -> status
    }


    // ... (Rest of your code - Prisma query, library/bookmark logic, etc.) ...
    // Main query for novels
    const [novels, totalCount] = await Promise.all([
      prisma.novel.findMany({
        where,
        take: parsedLimit,
        skip: parsedOffset,
        orderBy: { [validSortFieldMap[sort]]: order }, // Map sort to database column
        include: {
          tags: true,
          genres: true,
          language: true
        }
      }),
      prisma.novel.count({ where })
    ]);

    if (!novels.length) {
      return { novels: [], totalCount: 0, currentPage: 1, totalPages: 0 };
    }



    // Get library data AND bookmarks for authenticated users
    let libraryMap = {};
    let userBookmarkMap = {}; // New: For non-library bookmarks

    const isVerified = await verifyUser(event);


    if (isVerified && event.context.session?.user) {
      const userId = event.context.session.user.id;
      const library = event.context.session.user.library;


      // // Get both library novels AND user bookmarks in parallel
      const [libraryNovels, userBookmarks] = await Promise.all([
        // Existing library query
        prisma.libraryNovel.findMany({
          where: {
            libraryId: library.id,
            novelId: { in: novels.map(n => n.id) }
          }
        }),

        // NEW: Get bookmarks for novels not in library
        prisma.userBookmark.findMany({
          where: {
            userId,
            novelId: { in: novels.map(n => n.id) }
          }
        })
      ]);
 

      // Create lookup maps
      libraryMap = libraryNovels.reduce((acc, ln) => ({
        ...acc,
        [ln.novelId]: ln
      }), {});

      userBookmarkMap = userBookmarks.reduce((acc, ub) => ({
        ...acc,
        [ub.NovelId]: ub
      }), {});
    }

    // Enhance novels with both library and bookmark data
    const enhancedNovels = novels.map(novel => {
      const libraryData = libraryMap[novel.id];
      const bookmarkData = userBookmarkMap[novel.id];

      return {
        ...novel,
        inLibrary: !!libraryData,
        bookmark: (libraryData || bookmarkData) ? {
          // Prefer library data if exists, else use bookmark data
          bookmarkedChapter: libraryData?.bookmarkedChapter ?? bookmarkData?.lastReadChapter,
          lastReadChapter: libraryData?.lastReadChapter ?? bookmarkData?.lastReadChapter,
          maxChapterRead: libraryData?.maxChapterRead ?? bookmarkData?.maxChapterRead,
          progressPercent: ((libraryData?.maxChapterRead ?? bookmarkData?.maxChapterRead ?? 0) / novel.chapters * 100).toFixed(1),
          lastVisited: libraryData?.lastVisitedAt ?? bookmarkData?.lastVisitedAt
        } : null
      };
    });

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