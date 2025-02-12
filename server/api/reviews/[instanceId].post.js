import { defineEventHandler } from "h3";
import { PrismaClient } from "~/prisma/generated/client2/index.js";
import { verifyUser } from "~/server/utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const verified = await verifyUser(event);
    if (!verified) {
      throw createError({ statusCode: 401, message: 'Unauthorized' });
    }
  
    const { instanceId } = event.context.params;
    const body = await readBody(event);
    const { id: userId, username } = event.context.session.user;
  
    // Validate input
    if (body.rating < 1 || body.rating > 5) {
      throw createError({ statusCode: 400, message: 'Rating must be between 1-5' });
    }
    if (!body.content) {
      throw createError({ statusCode: 400, message: 'Content is required' });
    }

    const review = await prisma.review.create({
      data: {
        instance: { connect: { instanceId } },
        rating: body.rating,
        rootComment: {
          create: {
            userId,
            username,
            content: body.content,
            attachments: body.attachments,
          }
        }
      },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        rootComment: {
          select: {
            id: true,
            content: true,
            attachments: true,
            createdAt: true,
            votes: true,
            children: {
              select: {
                id: true,
                userId: true,
                username: true,
                content: true,
                parentId: true,
                createdAt: true,
                votes: {
                  select: {
                    type: true,
                    userId: true
                  }
                }
              }
            }
          }
        }
      },
    });

    // Format response to match GET endpoint structure
    const formattedReview = {
      ...review,
      content: review.rootComment.content,
      attachments: review.rootComment.attachments,
      comments: review.rootComment.children
    };

    return formattedReview;
});