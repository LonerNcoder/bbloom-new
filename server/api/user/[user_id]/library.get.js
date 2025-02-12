import { createError, defineEventHandler } from 'h3';
import prisma from "~/prisma/middleware/savedInLibrary.js";
import { verifyUser } from "~/server/utils";

export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event);

    if (!isVerified || !event.context.session) {
        return createError({ statusCode: 401, message: "Unauthorized - Please login" });
    }

    const user = event.context.session.user;
    
    try {
        const library = await prisma.library.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            update: {},
            include: {
                libraryNovels: {
                    include: {
                        novel: true
                    },
                    orderBy: { addedAt: 'desc' }
                }
            }
        });

        const formattedLibraryNovels = library.libraryNovels.map(ln => ({
            id: ln.id,
            ...ln.novel, // Spread novel properties
            bookmark: {
                bookmarkedChapter: ln.bookmarkedChapter,
                lastReadChapter: ln.lastReadChapter,
                chaptersRead: ln.chaptersRead,
                progressPercent: ln.novel.chapters > 0 
                    ? ((ln.chaptersRead / ln.novel.chapters) * 100).toFixed(1)
                    : '0.0',
                lastVisited: ln.lastVisitedAt
            }
        }));

        return { 
            statusCode: 200, 
            body: {
                libraryNovels: formattedLibraryNovels
            }
        };

    } catch (e) {
        return createError({ 
            statusCode: 500, 
            message: `Server error: ${e.message}` 
        });
    }
});