import prisma from "@prisma/client"
export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event)
    if(!isVerified){
        return createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const { reading_history_id } = await readBody(event)
    let readingHistory = null   
    try{
        readingHistory = await prisma.readingHistory.delete({
            where: {
                userId: event.context.session.user.id,
                id: parseInt(reading_history_id)
            }
        })
    }catch{
        return createError({
            statusCode: 500,
            statusMessage: "Error deleting reading history"
        })
    }
    return {
        statusCode: 200,
        statusMessage: "Reading history deleted successfully",
        readingHistory: readingHistory
    }
})
