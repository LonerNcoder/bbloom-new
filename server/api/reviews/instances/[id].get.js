import { defineEventHandler,getQuery } from "h3";
import { verifyUser } from "~/server/utils/index.js";
import { PrismaClient } from "~/prisma/generated/client2/index.js";

const prisma  = new PrismaClient();
export default defineEventHandler(async (event) => {
    const {id: instanceId} = await getQuery(event);
    
    const instance = await prisma.reviewInstance.findUnique({
      where: { instanceId },
      select: {
        id: true,
        instanceId: true,
        createdAt: true,
        _count: { select: { reviews: true } }
      }
    });
  
    if (!instance) {
      throw createError({ statusCode: 404, message: 'Instance not found' });
    }
    return {instance};
  });