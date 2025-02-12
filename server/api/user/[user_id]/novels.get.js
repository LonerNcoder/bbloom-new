// server api novel.get.js. it returns one novwl where query id matches with the id of the novel.
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getQuery } from 'h3';
import {verifyUser} from "~/server/utils";

const prisma = new PrismaClient();

/**
 * Handles GET requests to retrieve novels with optional filtering, pagination, and search.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ novel: Novel, totalCount: number, currentPage: number, totalPages: number }>}
 *   - An object containing the novels, total count, and pagination metadata.
 * @throws {H3Error} - Throws an H3Error if there's an issue fetching novels.
 */
export default defineEventHandler(async (event) => {
  try {
    const {user_id} = event.context.params
    // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID',
      });
    }
    const id = user_id
    // Fetch novels and total count
    const novels = await prisma.novel.findMany({
      where:{
        OR: [
          {uploaderId: id},
          {authorId: id},
          ]
        },
    });

    if (!novels || novels.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No novels found',
      });
    }

    return { novels };
  } catch (error) {
    console.error('Error fetching novels:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch novels' });
  } finally {
    await prisma.$disconnect();
  }
});
