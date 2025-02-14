import { defineEventHandler,readBody } from "h3"
import { verifyUser } from "~/server/utils"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const isVerified = await verifyUser(event)
  if (!isVerified) {
    throw createError({
      statusCode: 401,
      statusMessage: "You are not Authorized!"
    })
  }

  // Assume isVerified returns an object containing a userId
  const userId = event.context.sessions.user.id
  const readingHistories = await prisma.readingHistory.findMany({
    where: {
      userId: userId
    },
    include: {
      id: true,
      novelId: true,
      lastReadChapter: true,
      maxChapterRead: true,
      lastVisitedAt: true
    }
  })
  return {statusCode: 200, readingHistories}
})
