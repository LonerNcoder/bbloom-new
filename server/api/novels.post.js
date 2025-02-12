import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, readBody, getRequestHeader } from 'h3';
import {verifyUser} from "~/server/utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {

    const verified = await verifyUser(event);
    const session = event.context.session;

    if (verified) {
        // Extract body data
        const { title, genre } = await readBody(event);
        // Create a new novel
        const newNovel = await prisma.novel.create({
          data: {
            title,
            genre,
            author: session.user.username,
            coverImage: process.env.DEFAULT_COVER_IMAGE_URL,
            summary: "A novel by " + session.user.username,
            status: "Ongoing",
            writtenBy: {
              connect: { id: session.userId },
            },
            chapters: 0,
          },
        });

        return {
          statusCode: 200,
          body: newNovel,
        };
      } else {
          return createError({ statusCode: 401, statusMessage: event.context.error, });
      }
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: error.message, });
  } finally {
    await prisma.$disconnect();
  }
});
