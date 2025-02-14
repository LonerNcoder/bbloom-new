import { createError, defineEventHandler, readBody } from 'h3';
import prisma from "~/prisma/middleware/savedInLibrary.js";
import { verifyUser } from "~/server/utils";

export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event);
    const metadata = await readBody(event);
    const novel_id = parseInt(metadata.novel_id);
    const library_id = metadata.library_id;
    const library_name = metadata.library_name;

    if (!isVerified || !event.context.session) {
        return createError({ statusCode: 401, message: "Unauthorized - Please login" });
    }
    const user = event.context.session.user;
    const libraries = user.libraries;
    //get the dafault library
    const defaultLibrary = libraries.find(library => library.name === "default");
    // add novel to the user's library, if library_id is passed in the body, add novel to the library, if not, add novel to the default library
    let libraryToAddTo;
    if (library_id) {
        libraryToAddTo = library_id;
    } else {
        libraryToAddTo = defaultLibrary.id;
    }
    try {
        let ln = await prisma.libraryNovel.create({
            data: {
                libraryId: libraryToAddTo,
            novelId: novel_id,
            addedAt: new Date()
            }
        });
    } catch {
       {
        return createError({ statusCode: 400, message: "novel already in library" });
       }
    }
    //return the user's all libraries, the variable libraries, with the novel added to the library the edge cases where library_id be null and use default library
    //[nuxt] [request error] [unhandled] [500] library.libraryNovels is not iterable
    // let updatedLibraries = libraries.map(library => {
    //     if (library.id === libraryToAddTo) {
    //         return { ...library, libraryNovels: library.libraryNovels.push(ln) };
    //     }
    //     return library;
    // });

    let allLibraries = await prisma.library.findMany({
        where: {
            userId: user.id
        }
    });

    return {
        statusCode: 200,
        body: {
            novelId: parseInt(novel_id),
            inLibrary: true
        },
        libraries: allLibraries 
    }
})