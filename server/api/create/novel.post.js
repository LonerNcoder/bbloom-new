import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClient2 } from '~/prisma/generated/client2/index.js';
import { defineEventHandler, createError, readBody } from 'h3';
import { verifyUser } from '~/server/utils';

const prisma = new PrismaClient();
const prisma2 = new PrismaClient2();

export default defineEventHandler(async (event) => {
  try {
    const verified = await verifyUser(event);
    const session = event.context.session;

    if (verified) {
      // Extract body data
      const { title } = await readBody(event);
      
      const user_id = session.user.id;
      const username = session.user.username;
      // Create a new novel
      const newNovel = await prisma.novel.create({
        data: {
          title: title,
          author: username,
          coverImage: process.env.DEFAULT_COVER_IMAGE_URL,
          summary: "A novel by " + username,
          status: "Ongoing",
          chapters: 0,
          isPrivate:true,
          writtenBy: {
            connect: { id: user_id },
          },
          uploadedBy: {
            connect: { id: user_id },
          },
          genres:{
            connectOrCreate:{
              where:{
                name: "no-genre"
              },
              create:{
                name: "no-genre"
              }
            }
          },
          tags:{
            connectOrCreate:{
              where:{
                name: "no-tag"
              },
              create:{
                name: "no-tag"
              }
            }
          }

        },
      });
      const reviewInstanceId =  `Novel_${newNovel.id}`

      await prisma2.reviewInstance.create({
        data:{
          instanceId : reviewInstanceId
        }
      })

      return {
          statusCode: 200,
          body: newNovel,
        };
      } else {
          return createError({ statusCode: 401, message: event.context.error, });
      }
  } catch (error) {
    return createError({ statusCode: 500, message: error.message, });
  } finally {
    await prisma.$disconnect();
  }
});
