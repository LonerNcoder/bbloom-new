// /server/api/reviews/comment/[commentId]/reply.post.js
import { defineEventHandler, getQuery, readBody } from "h3";
import { verifyUser } from "~/server/utils";
import { PrismaClient } from "~/prisma/generated/client2/index.js";
import DOMPurify from "isomorphic-dompurify";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const verified = await verifyUser(event);
  if (!verified) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const { id: parentCommentId } = event.context.params;
  const body = await readBody(event);
  const { id:userId, username } = event.context.session.user;

  // Validate parent comment exists and get review ID
  const parentComment = await prisma.comment.findUnique({
    where: { id: parentCommentId },
    select: { id: true }
  });

  if (!parentComment) {
    throw createError({ statusCode: 404, message: 'Parent comment not found' });
  }

  // Validate and sanitize content
  if (!body.content || typeof body.content !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid comment content' });
  }

  const cleanContent = DOMPurify.sanitize(body.content, {
    ALLOWED_TAGS: [], // No HTML allowed
    KEEP_CONTENT: true
  }).substring(0, 2000); // Limit to 2000 characters

  // Create the reply
  const reply = await prisma.comment.create({
    data: {
      parentId: parentComment.id,
      userId,
      username,
      content: cleanContent
    }
  });

  // Return with voting structure and ownership
  return {
    ...reply,
    upvotes: 0,
    downvotes: 0,
    userVote: null,
    isOwner: true,
    replies: []
  };
});