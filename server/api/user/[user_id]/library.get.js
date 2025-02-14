import { createError, defineEventHandler } from 'h3';
import prisma from "~/prisma/middleware/savedInLibrary.js";
import { verifyUser } from "~/server/utils";

export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event);

    if (!isVerified || !event.context.session) {
        return createError({ statusCode: 401, message: "Unauthorized - Please login" });
    }

    const user = event.context.session.user;
    //get user libraries, if not exist create one and return everything
    let libraries = [];
    try {
        libraries = await prisma.library.findMany({
            where: { userId: user.id },
            include: {
                libraryNovels: {
                    include: {
                        novel: true
                    },
                    orderBy: { addedAt: 'desc' }
                }
            }
        });
        // if libraries is empty, create one
        if (libraries.length === 0) {
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
            libraries.push(library);
        }

        // get reading history with the novels in libraries and bookmarks
        const readingHistory = await prisma.readingHistory.findMany({
            where: {
                userId: user.id,
                novelId: { in: libraries.map(l => l.id) }
            }
        }); 
        
        // get bookmarks with the novels in libraries
        const bookmarks = await prisma.novelBookmark.findMany({
            where: {
                userId: user.id,
                novelId: { in: libraries.map(l => l.id) }
            }
        }); 
        let formattedLibraryNovels = [];
        libraries.forEach(library => {
            library.libraryNovels.forEach(ln => {
                formattedLibraryNovels.push({
                    ...ln,
                    bookmarks: bookmarks.filter(b => b.novelId === ln.novelId),
                    readingHistory: readingHistory.filter(rh => rh.novelId === ln.novelId)  
                });
            });
        });

        return { 
            statusCode: 200, 
            libraries: formattedLibraryNovels
        };

    } catch (e) {
        return createError({ 
            statusCode: 500, 
            message: `Server error: ${e.message}` 
        });
    }
});