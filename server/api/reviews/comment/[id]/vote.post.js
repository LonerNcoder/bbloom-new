import { defineEventHandler, readBody } from "h3";
import { PrismaClient } from "~/prisma/generated/client2/index.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const verified = await verifyUser(event);
  if (!verified) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const commentId = event.context.params.id;
  const { type } = await readBody(event); // type can be "UPVOTE" or "DOWNVOTE"
  const { id: userId } = event.context.session.user;

  // Transaction for creating or updating a vote and updating counts
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.vote.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      if (existing.type === type) {
        return { action: "no_change", message: "Vote type is the same" };
      }

      // Update vote type and adjust counts
      const incrementField = type === "UPVOTE" ? "upvotes" : "downvotes";
      const decrementField = existing.type === "UPVOTE" ? "upvotes" : "downvotes";

      await tx.vote.update({
        where: { id: existing.id },
        data: { type },
      });

      await tx.comment.update({
        where: { id: commentId },
        data: {
          [incrementField]: { increment: 1 },
          [decrementField]: { decrement: 1 },
        },
      });

      return { action: "updated", newType: type };
    }

    // Create a new vote and increment the appropriate count
    const incrementField = type === "UPVOTE" ? "upvotes" : "downvotes";

    await tx.vote.create({
      data: {
        userId,
        commentId,
        type,
      },
    });

    await tx.comment.update({
      where: { id: commentId },
      data: {
        [incrementField]: { increment: 1 },
      },
    });

    return { action: "created", type };
  });
});
