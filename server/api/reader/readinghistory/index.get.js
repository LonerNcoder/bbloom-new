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
    let readingHistory = null
    try{
        readingHistory = await prisma.readingHistory.findMany({
            where: {
                userId: event.context.session.user.id,
                novelId: parseInt(novel_id)
            }
        })
    }catch{
        return createError({
            statusCode: 500,
            statusMessage: "Error fetching reading history"
        })
    }
    return {
        statusCode: 200,
        statusMessage: "Reading history fetched successfully",
        readingHistory: readingHistory
    }
})
