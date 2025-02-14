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
  const { novel_ids, bookmarks } = await readBody(event)

  // Array of validations to run in parallel.
  const validations = [
    // Ensure novel_ids is an array.
    () => {
      if (!Array.isArray(novel_ids)) {
        throw createError({
          statusCode: 400,
          statusMessage: "novel_ids must be an array"
        })
      }
    },
    // Ensure bookmarks is an array.
    () => {
      if (!Array.isArray(bookmarks)) {
        throw createError({
          statusCode: 400,
          statusMessage: "bookmarks must be an array"
        })
      }
    },
    // Ensure both arrays have the same length.
    () => {
      if (novel_ids.length !== bookmarks.length) {
        throw createError({
          statusCode: 400,
          statusMessage: "novel_ids and bookmarks must have the same length"
        })
      }
    },
    // Validate novel_ids: they must be positive integers.
    () => {
      if (novel_ids.some(id => typeof id !== "number" || !Number.isInteger(id) || id <= 0)) {
        throw createError({
          statusCode: 400,
          statusMessage: "novel_ids must be an array of positive integers"
        })
      }
    },
    // Validate each bookmark object.
    () => {
      bookmarks.forEach((bm, index) => {
        if (typeof bm !== "object" || bm === null) {
          throw createError({
            statusCode: 400,
            statusMessage: `bookmark at index ${index} must be an object`
          })
        }
        if (typeof bm.chapter !== "number" || !Number.isInteger(bm.chapter) || bm.chapter <= 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `bookmark at index ${index} has an invalid chapter`
          })
        }
        const date = new Date(bm.addedAt)
        if (isNaN(date.getTime())) {
          throw createError({
            statusCode: 400,
            statusMessage: `bookmark at index ${index} has an invalid addedAt date`
          })
        }
      })
    }
  ]

  // Run all validations concurrently.
  await Promise.all(validations.map(fn => Promise.resolve().then(fn)))

  // Build an array of upsert promises – one per novel/bookmark pair.
  const upsertPromises = novel_ids.map((novelId, i) => {
    const bookmark = bookmarks[i]
    return prisma.novelBookmark.upsert({
      where: {
        userId_novelId_chapter: {
          userId: userId,
          novelId: novelId,
          chapter: bookmark.chapter
        }
      },
      update: {},
      create: {
        userId: userId,
        novelId: novelId,
        chapter: bookmark.chapter,
        addedAt: new Date(bookmark.addedAt)
      }
    })
  })

  // Execute all upserts in parallel.
  await Promise.all(upsertPromises)

  return {
    status: "success",
    message: "Bookmarks added/updated successfully"
  }
})
