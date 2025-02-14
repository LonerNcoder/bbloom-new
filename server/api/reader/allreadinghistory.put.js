import {defineEventHandler, readBody} from "h3"
import {verifyUser} from "~/server/utils"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async(event) =>{
    const isVerified = await verifyUser(event)
    if(!isVerified){
        throw createError({
            statusCode: 401,
            statusMessage: "You are not Authorized!"
        })
    }
    const {novel_ids, chapters, total_chapters} = await readBody(event)
    
    const validations = [
        () => {
          if (!Array.isArray(novel_ids))
            throw createError({ statusCode: 400, statusMessage: "novel_ids must be an array" })
        },
        () => {
          if (!Array.isArray(chapters))
            throw createError({ statusCode: 400, statusMessage: "chapters must be an array" })
        },
        () => {
          if (!Array.isArray(total_chapters))
            throw createError({ statusCode: 400, statusMessage: "total_chapters must be an array" })
        },
        () => {
          if (novel_ids.some(id => typeof id !== 'number'))
            throw createError({ statusCode: 400, statusMessage: "novel_ids must be an array of numbers" })
        },
        () => {
          if (chapters.some(chap => typeof chap !== 'number'))
            throw createError({ statusCode: 400, statusMessage: "chapters must be an array of numbers" })
        },
        () => {
          if (total_chapters.some(tc => typeof tc !== 'number'))
            throw createError({ statusCode: 400, statusMessage: "total_chapters must be an array of numbers" })
        },
        () => {
          if (novel_ids.some(id => id <= 0))
            throw createError({ statusCode: 400, statusMessage: "novel_ids must be an array of positive numbers" })
        },
        () => {
          if (chapters.some(chap => chap <= 0))
            throw createError({ statusCode: 400, statusMessage: "chapters must be an array of positive numbers" })
        },
        () => {
          if (total_chapters.some(tc => tc <= 0))
            throw createError({ statusCode: 400, statusMessage: "total_chapters must be an array of positive numbers" })
        },
        () => {
          if (novel_ids.some(id => !Number.isInteger(id)))
            throw createError({ statusCode: 400, statusMessage: "novel_ids must be an array of integers" })
        },
        () => {
          if (chapters.some(chap => !Number.isInteger(chap)))
            throw createError({ statusCode: 400, statusMessage: "chapters must be an array of integers" })
        },
        () => {
          if (total_chapters.some(tc => !Number.isInteger(tc)))
            throw createError({ statusCode: 400, statusMessage: "total_chapters must be an array of integers" })
        },
        () => {
          if (novel_ids.length !== chapters.length || novel_ids.length !== total_chapters.length)
            throw createError({
              statusCode: 400,
              statusMessage: "novel_ids, chapters and total_chapters must have the same length"
            })
        }
      ]
    
    // Run all validations concurrently.
    await Promise.all(validations.map((fn) => Promise.resolve().then(fn)))

    const userId = event.context.sessions.user.id
    // iterate through the arrays and build an array of upsert promises
    const upsertPromises = novel_ids.map((novel_id, i) => {
        const chapter = chapters[i];
        const max_chapter_read = total_chapters[i];
    
        return prisma.readingHistory.upsert({
        where: {
            userId_novelId: {
            userId: userId,
            novelId: novel_id
            }
        },
        update: {},
        create: {
            userId: userId,
            novelId: novel_id,
            lastReadChapter: chapter,
            maxChapterRead: max_chapter_read
        }
        });
    });
  
    // Execute all upserts concurrently
    await Promise.all(upsertPromises);
  
    return {
        status: "success",
        message: "Reading history added successfully"
    }
})
