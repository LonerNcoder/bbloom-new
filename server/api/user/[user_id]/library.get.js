import { createError, defineEventHandler, getQuery } from 'h3';
import prisma from "~/prisma/middleware/savedInLibrary.js";
import { verifyUser } from "~/server/utils";

export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event);

    if (!isVerified || !event.context.session) {
        return createError({ statusCode: 401, message: "Unauthorized - Please login" });
    }

    const user = event.context.session.user;
    const query = getQuery(event);
    const libraryName = query.name; // Extract query parameter

    try {
        let libraryFilter = { userId: user.id };
        if (libraryName) {
            libraryFilter = { ...libraryFilter, name: libraryName };
        }

        let libraries = await prisma.library.findMany({
            where: libraryFilter,
            include: {
                libraryNovels: {
                    include: {
                        novel: true
                    },
                    orderBy: { addedAt: 'desc' }
                }
            }
        });

        // If no libraries exist, create a default one when no query is used
        if (libraries.length === 0 && !libraryName) {
            const library = await prisma.library.create({
                data: {
                    userId: user.id,
                    name: "default",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                include: {
                    libraryNovels: {
                        include: { novel: true },
                        orderBy: { addedAt: 'desc' }
                    }
                }
            });
            libraries.push(library);
        }

        // Extract all novelIds from the user's libraries
        const novelIds = libraries.flatMap(library => library.libraryNovels.map(ln => ln.novelId));

        if (novelIds.length === 0) {
            return { statusCode: 200, libraries: [] };
        }

        // Fetch reading history for those novelIds
        const readingHistory = await prisma.readingHistory.findMany({
            where: {
                userId: user.id,
                novelId: { in: novelIds }
            }
        });

        // Fetch bookmarks for those novelIds
        const bookmarks = await prisma.novelBookmark.findMany({
            where: {
                userId: user.id,
                novelId: { in: novelIds }
            }
        });

        // Format library novels with bookmarks and reading history
        const formattedLibraries = libraries.map(library => ({
            ...library,
            libraryNovels: library.libraryNovels.map(ln => ({
                ...ln,
                bookmarks: bookmarks.filter(b => b.novelId === ln.novelId),
                readingHistory: readingHistory.filter(rh => rh.novelId === ln.novelId)
            }))
        }));

        return { 
            statusCode: 200, 
            libraries: formattedLibraries 
        };

    } catch (e) {
        return createError({ 
            statusCode: 500, 
            message: `Server error: ${e.message}` 
        });
    }
});
