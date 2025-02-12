import { defineEventHandler, getQuery } from "h3";
import { PrismaClient } from "~/prisma/generated/client2/index.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const verified = await verifyUser(event);
  if (!verified) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const commentId = event.context.params.id;
  const { id: userId } = event.context.session.user;

  // Remove the vote and update the counts
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.vote.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (!existing) {
      throw createError({ statusCode: 404, message: "Vote not found" });
    }

    const decrementField = existing.type === "UPVOTE" ? "upvotes" : "downvotes";

    // Delete the vote and update the comment's vote counts
    await tx.vote.delete({ where: { id: existing.id } });

    await tx.comment.update({
      where: { id: commentId },
      data: {
        [decrementField]: {
          decrement: 1,
        },
      },
    });

    return { action: "removed", voteType: existing.type };
  });
});
