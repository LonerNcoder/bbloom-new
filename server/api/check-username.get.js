// server/api/check-username.js
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getQuery } from 'h3';

const prisma = new PrismaClient();

/**
 * Checks if a username is already taken.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ isTaken: boolean }>} - An object indicating if the username is taken.
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const username = query.username;

    if (typeof username !== 'string' || !username) {
        return { isTaken: false }; // Handle empty or non-string input
    }

    const user = await prisma.user.findUnique({
      where: { username: username }, // Use findUnique for checking uniqueness
    });

    const isTaken = !!user; // Convert the result to a boolean

    return { "available": !isTaken };
  } catch (error) {
    console.error('Error checking username:', error);
    return createError({ statusCode: 500, statusMessage: 'Failed to check username' }); // More appropriate message
  } finally {
    await prisma.$disconnect();
  }
});