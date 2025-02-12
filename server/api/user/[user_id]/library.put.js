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
        const library = await prisma.library.upsert({
            where: { userId: user.id },
            create: { 
                userId: user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            update: {}
        });

        // 2. Check for existing library entry
        const existingEntry = await prisma.libraryNovel.findFirst({
            where: {
                libraryId: library.id,
                novelId: parseInt(novel_id)
            }
        });

        if (existingEntry) {
            return createError({ 
                statusCode: 409, 
                message: "Novel already exists in library" 
            });
        }

        // 3. Check for existing user bookmark
        const userBookmark = await prisma.userBookmark.findUnique({
            where: {
                userId_novelId: {
                    userId: user.id,
                    novelId: parseInt(novel_id),
                },
            },
        });
        console.log("userBookmark",userBookmark)

        // 4. Create library entry and delete bookmark in transaction
        // const libraryNovel = await prisma.$transaction(async (tx) => {
            // Create library entry with bookmark data
            var newEntry = null;
            try{
            if(userBookmark){
                newEntry = await prisma.libraryNovel.create({
                    data: {
                        libraryId: library.id,
                        novelId: parseInt(novel_id),
                        bookmarkedChapter: userBookmark?.lastReadChapter ?? parseInt(metadata.bookmark || 1),
                        lastReadChapter: userBookmark?.lastReadChapter ?? parseInt(metadata.bookmark || 1),
                        maxChapterRead: userBookmark?.maxChapterRead ?? 1,
                        lastVisitedAt: new Date(),
                        addedAt: new Date()
                    },

                });
                 // Delete bookmark if it existed
                await prisma.userBookmark.delete({
                    where: {
                        userId_novelId: {
                            userId: user.id,
                            novelId: parseInt(novel_id),
                        },
                    },
                });
            }else{
                newEntry = await prisma.libraryNovel.create({
                    data: {
                        libraryId: library.id,
                        novelId: parseInt(novel_id),
                        bookmarkedChapter: parseInt(metadata.bookmark || 1),
                        lastReadChapter: parseInt(metadata.bookmark || 1),
                        maxChapterRead:  parseInt(metadata.bookmark || 1),
                        lastVisitedAt: new Date(),
                    },
                    include: {
                        novel: true
                    }

                });
                console.log("newEntry",newEntry)
            }
        }catch(e){
            console.log(e)
        }
        return {
            statusCode: 200,
            body: {
                novelId: parseInt(novel_id),
                bookmark: newEntry,
                inLibrary: true
            }
        };

    } catch (e) {
        return createError({ 
            statusCode: 500, 
            message: `Server error: ${e.message}` 
        });
    }
});