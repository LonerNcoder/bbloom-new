import prisma from "@prisma/client"
export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event)
    if(!isVerified){
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const { novel_id } = await readBody(event)
    const { last_read_chapter } = await readBody(event)
    const { max_chapter_read } = await readBody(event)
    let readingHistory = null
    try{
        readingHistory = await prisma.readingHistory.upsert({
            where: {
                userId: event.context.session.user.id,
                novelId: parseInt(novel_id) 
            },
            update: {
                lastReadChapter: parseInt(last_read_chapter),
                maxChapterRead: max_chapter_read?parseInt(max_chapter_read):parseInt(last_read_chapter) 
            },
            create: {
                userId: event.context.session.user.id,
                novelId: parseInt(novel_id),
                lastReadChapter: parseInt(last_read_chapter),
                maxChapterRead: max_chapter_read?parseInt(max_chapter_read):parseInt(last_read_chapter)
            }
        })
    }catch{
        return createError({
            statusCode: 500,
            statusMessage: "Error adding reading history"
        })
    }
    return {
        statusCode: 200,
        statusMessage: "Reading history added successfully",
        readingHistory: readingHistory
    }
})
