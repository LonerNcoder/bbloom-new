import { PrismaClient } from '@prisma/client';
import { createError, defineEventHandler } from 'h3';
import { verifyUser } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { novel_id, chapter_num } = event.context.params;
  // Validate novel_id and chapter_num
  if (isNaN(novel_id) || isNaN(chapter_num)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid novel_id or chapter_num' });
  }
  const prisma = new PrismaClient();

  //validate user. if user is logged in and valid then update bookmark at each chapter fetch 
  const verified = await verifyUser(event);
  const parsed_novel_id = parseInt(novel_id)
  const parsed_chapter_num = parseInt(chapter_num);

  const chapter = await prisma.chapter.findFirst({
    where: {
      novelId: parsed_novel_id,
      chapterNumber: parsed_chapter_num,
    },
  });

  if (verified && event.context.session?.user) {
    const user = event.context.session.user;
    const userId = user.id;

    // Check if novel exists in user's library
    const libraryNovel = await prisma.libraryNovel.findFirst({
      where: {
        libraryId: user.library.id,
        novelId: parsed_novel_id,
      },
    });

    // if (libraryNovel) {
    //   // Update library entry
    //   await prisma.libraryNovel.update({
    //     where: { id: libraryNovel.id },
    //     data: {
    //       lastReadChapter: parsed_chapter_num ,
    //       lastVisitedAt: new Date(),
    //     },
    //   });
    // } else {
      
    //   // Update or create bookmark entry
    //   await prisma.userBookmark.upsert({
    //     where: {
    //       userId_novelId: {
    //         userId,
    //         novelId: parsed_chapter_num,
    //       },
    //     },
    //     update: {
    //       lastReadChapter: parsed_chapter_num ,
    //       bookmarkedChapter: parsed_chapter_num ,
    //       lastVisitedAt: new Date(),
    //     },
    //     create: {
    //       userId,
    //       novelId: parsed_novel_id,
    //       lastReadChapter: parsed_chapter_num ,
    //       bookmarkedChapter: parsed_chapter_num ,
    //     },
    //   });
    // }

    if (libraryNovel) {
      await prisma.$executeRaw`
        UPDATE "LibraryNovel"
        SET 
          bookmarked_chapter = ${parsed_chapter_num},
          last_read_chapter = ${parsed_chapter_num},
          max_chapter_read = GREATEST(max_chapter_read, ${parsed_chapter_num}),
          last_visited_at = NOW()
        WHERE id = ${parsed_novel_id}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO "UserBookmark" 
          (user_id, novel_id, bookmarked_chapter, last_read_chapter, max_chapter_read)
        VALUES (${userId}, ${parsed_novel_id}, ${parsed_chapter_num}, ${parsed_chapter_num})
        ON CONFLICT (user_id, novel_id)
        DO UPDATE SET
          bookmarked_chapter = EXCLUDED.bookmarked_chapter,
          last_read_chapter = EXCLUDED.last_read_chapter,
          max_chapter_read = GREATEST(UserBookmark.max_chapter_read, EXCLUDED.max_chapter_read),
          last_visited_at = NOW()
      `;
    }
  }
  prisma.$disconnect()

  if (!chapter) {
    return createError({ statusCode: 404, message: 'Chapter not found' });
  }

  return {statusCode:200, body: chapter};
});