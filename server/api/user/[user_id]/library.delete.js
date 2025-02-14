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
    const libraries = await prisma.library.findMany({
        where: {
            userId: user.id
        },
        include: {
            libraryNovels: true
        }
    });
    //find the library that contains the novel_id
    const library = libraries.find(library => library.libraryNovels.some(novel => novel.novelId === novel_id));
    //if the library is not found, return an error
    if (!library) {
        return createError({ statusCode: 404, message: "Library not found" });
    }
    //delete the novel from the library
    await prisma.libraryNovel.delete({
        where: {
            libraryId_novelId: {
                libraryId: library.id,
                novelId: novel_id
            }
        }
    });

    //return the user's all libraries removing the deleted novel , use previous variable libraries
    const updatedLibraries = libraries.filter(library => library.libraryNovels.some(novel => novel.novelId !== novel_id));
    
    return {
        statusCode: 200,
        body: {
            novelId: parseInt(novel_id),
            inLibrary: false
        },
        libraries: updatedLibraries
    }
});