import { defineEventHandler } from "h3";
import { PrismaClient } from "~/prisma/generated/client2/index.js";
import { verifyUser } from "~/server/utils";

const prisma = new PrismaClient();

/**
 * Dynamically build the nested include structure up to a specific depth.
 */
const buildNestedInclude = (depth) => {
  if (depth === 0) return {};
  return {
    include: {
      children: buildNestedInclude(depth - 1),
    },
  };
};

/**
 * Recursively builds the comment tree, including hasVoted and voteType.
 */
const buildCommentTree = (comment, currentUserId, userVotes) => {
  if (!comment) return null;


  const userVote = userVotes.find((vote) => vote.commentId === comment.id);

  // console.log("Building comment tree for comment ID:", comment.userId, "Current User ID:", currentUserId);
  try{
  return {
    id: comment.id,
    userId: comment.userId,
    username: comment.username,
    content: comment.content,
    attachments: comment.attachments,
    isOwner: currentUserId === comment.userId,
    createdAt: comment.createdAt,
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    hasVoted: !!userVote, // Check if the user has voted
    voteType: userVote?.type || null, // Get the vote type (UPVOTE/DOWNVOTE) if available
    children: comment.children.map((child) =>
      buildCommentTree(child, currentUserId, userVotes)
    ),
  };
}catch(e){
  console.log(e)
}
};

export default defineEventHandler(async (event) => {
  const { instanceId } = event.context.params;
  await verifyUser(event);
  const currentUserId = event.context.session?.user?.id;

  // Fetch the review instance with up to 10 levels of nested comments
  const reviewInstance = await prisma.reviewInstance.findUnique({
    where: { instanceId },
    include: {
      reviews: {
        include: {
          rootComment: {
            ...buildNestedInclude(10), // Include 10 levels of nested children
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!reviewInstance) {
    throw createError({ statusCode: 404, message: "Review instance not found" });
  }

  // Fetch the user's votes for comments in this review instance
  const userVotes = await prisma.vote.findMany({
    where: {
      userId: currentUserId,
      commentId: {
        in: reviewInstance.reviews.flatMap((review) => [
          review.rootComment?.id,
          ...(review.rootComment?.children?.map((child) => child.id) || []),
          ...(review.rootComment?.children?.flatMap((child) =>
            child.children.map((grandchild) => grandchild.id)
          ) || []),
        ]),
      },
    },
  });

  // Format the reviews with the comment tree
  const formattedReviews = reviewInstance.reviews.map((review) => ({
    id: review.id,
    instanceId: reviewInstance.id,
    rating: review.rating,
    createdAt: review.createdAt,
    rootComment: review.rootComment
      ? buildCommentTree(review.rootComment, currentUserId, userVotes)
      : null,
  }));

  return {
    reviewInstance: {
      id: reviewInstance.id,
      instanceId: reviewInstance.instanceId,
      createdAt: reviewInstance.createdAt,
      reviews: formattedReviews,
    },
  };
});
