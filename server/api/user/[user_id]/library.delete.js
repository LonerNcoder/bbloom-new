import { createError, defineEventHandler, readBody } from 'h3';
import prisma from "~/prisma/middleware/savedInLibrary.js";
import { verifyUser } from "~/server/utils";

export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event);
    const metadata = await readBody(event);
    const novel_id = metadata.novel_id;

    if (!isVerified || !event.context.session) {
        return createError({ statusCode: 401, message: "Unauthorized - Please login" });
    }

    const user = event.context.session.user;
    
    try {
        // 1. Ensure user has a library
        const library = await prisma.library.findUnique({
            where: { userId: user.id }
        });
        var delete_flag=0

        if (!library) {
            return createError({ 
                statusCode: 404, 
                message: "Library not found" 
            });
        }

        // 2. Check for existing library entry
        const existingEntry = await prisma.libraryNovel.findFirst({
            where: {
                libraryId: library.id,
                novelId: parseInt(novel_id)
            }
        });

        if (!existingEntry) {
            return createError({ 
                statusCode: 404, 
                message: "Novel not found in library" 
            });
        }

        // 3. Create user bookmark and delete library entry in transaction
        const userBookmark = await prisma.$transaction(async (tx) => {
            // Create user bookmark with library data
            const newBookmark = await tx.userBookmark.upsert({
                where: {
                    userId_novelId: {
                        userId: user.id,
                        novelId: parseInt(novel_id),
                    },
                },
                create: {
                    userId: user.id,
                    novelId: parseInt(novel_id),
                    lastReadChapter: existingEntry.lastReadChapter,
                    maxChapterRead: existingEntry.maxChapterRead,
                    bookmarkedChapter: existingEntry.bookmarkedChapter, // Add bookmarkedChapter
                    lastVisitedAt: new Date(),
                },
                update: {
                    lastReadChapter: existingEntry.lastReadChapter,
                    maxChapterRead: existingEntry.maxChapterRead,
                    bookmarkedChapter: existingEntry.bookmarkedChapter, // Add bookmarkedChapter
                    lastVisitedAt: new Date(),
                },
            });

            delete_flag=1

            return newBookmark;
        }, { timeout: 10000 }); // Set transaction timeout to 10 seconds

        if(delete_flag){
          // Delete library entry
          await prisma.libraryNovel.delete({
            where: {
              id: existingEntry.id,
              novelId: existingEntry.novelId,
            },
          });
        }


        return {
            statusCode: 200,
            body: {
                novelId: parseInt(novel_id),
                bookmark: userBookmark,
                inLibrary: false
            }
        };

    } catch (e) {
        return createError({ 
            statusCode: 500, 
            message: `Server error: ${e.message}` 
        });
    }
});