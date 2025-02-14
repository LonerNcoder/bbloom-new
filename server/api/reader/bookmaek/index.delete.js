import prisma from "@prisma/client"
export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event)
    if(!isVerified){
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const { bookmark_id } = await readBody(event)
    let bookmark = null
    try{
        bookmark = await prisma.bookmark.delete({
            where: {
                id: parseInt(bookmark_id),
                userId: event.context.session.user.id
            }
        })
    }catch{
        return createError({
            statusCode: 500,
            statusMessage: "Error deleting bookmark"
        })
    }
    return {
        statusCode: 200,
        statusMessage: "Bookmark deleted successfully",
        bookmark: bookmark
    }
})
