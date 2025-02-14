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
    const { chapter } = await readBody(event)
    const { note } = await readBody(event)
    let bookmark = null
    try{
        bookmark = await prisma.bookmark.create({
            data: {
                userId: event.context.session.user.id,
                novelId: novel_id,
                chapter: chapter,
                note: note
            }
        })
    }catch{
        return createError({
            statusCode: 500,
            statusMessage: "You have already bookmarked this chapter"
        })
    }
    return {
        statusCode: 200,
        statusMessage: "Bookmark created successfully",
        bookmark: bookmark
    }
})
