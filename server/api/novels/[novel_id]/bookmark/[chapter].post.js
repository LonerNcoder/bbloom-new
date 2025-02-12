import {createError , defineEventHandler, eventHandler} from 'h3'
import {verifyUser} from "~/server/utils"
import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {

    var chapter = parseInt(event.context.params.chapter)
    var novelId = parseInt(event.context.params.novel_id)

    const isVerified = await verifyUser()

    if (isVerified){
        const userId = event.context.session.user.id;
        const libraryId = event.context.session.user.library.id;

        try {
            // Check if the novel exists in the user's library
            const libraryNovel = await prisma.libraryNovel.findFirst({
              where: {
                libraryId: parseInt(libraryId),
                novelId: parseInt(novelId),
              },
            });
        
            if (libraryNovel) {
              // Update the bookmark in the LibraryNovel table
              const updatedLibraryNovel = await prisma.libraryNovel.update({
                where: {
                  id: libraryNovel.id,
                },
                data: {
                  bookmark: {
                    upsert: {
                      create: { chapterNumber: chapter },
                      update: { chapterNumber: chapter },
                    },
                  },
                },
                include: {
                  bookmark: true,
                },
              });
        
              return { statusCode: 200,  message: "Bookmarked" };

            } else {
                // Add the bookmark to the NonLibraryBookmark table
                const nonLibraryBookmark = await prisma.nonLibraryBookmark.upsert({
                  where: {
                    userId_novelId: {
                      userId: userId,
                      novelId: novelId,
                    },
                  },
                  update: {
                    chapter: chapter,
                  },
                  create: {
                    userId: userId,
                    novelId: novelId,
                    chapter: chapter,
                  },
                });
          
                return { statusCode: 200, message: "Bookmarked" };
              }
            } catch (error) {
            
                return createError({ statusCode: 500, message: "Error adding bookmark" });
            } finally {
                await prisma.$disconnect();
            }
    }else{
        return createError({statusCode: 401, message: event.context.error})
    }
})