import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClient2 } from '~/prisma/generated/client2/index.js';

import { defineEventHandler, createError, readBody } from 'h3';
import { verifyUser } from '~/server/utils';

const prisma = new PrismaClient();
const prisma2 = new PrismaClient2()

export default defineEventHandler(async (event) => {
  try {
    const isVerified = await verifyUser(event);
    const session = event.context.session;

    if (isVerified) {
      // Extract body data
      const novel_id = parseInt(event.context.params.novel_id);
      const user_id = session.user.id;
      const isOwner = await prisma.novel.findFirst({
        where: {
          id: novel_id,
          OR: [
            {
              authorId: user_id
            },
            {
              uploaderId: user_id
            }
          ]
        }
      })
      if (isOwner) {
        const novel = await prisma.novel.delete({
          where: {
            id: novel_id
          }
        });
        const instanceId = `Novel_${novel_id}`;
        await prisma2.reviewInstance.delete({
          where: {
            instanceId : instanceId
          }
        })
        return {
          statusCode: 200,
          message: "Novel deleted successfully",
        };
      }else{
        return createError({ statusCode: 401, message: "You are not the owner of this novel", });
      }
      } else {
          return createError({ statusCode: 401, message: event.context.error, });
      }
  } catch (error) {
    return createError({ statusCode: 500, message: error.message, });
  } finally {
    await prisma.$disconnect();
  }
});
