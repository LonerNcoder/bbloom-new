// /server/api/instances/[id].delete.ts
import { defineEventHandler } from "h3";
import { verifyUser } from "~/server/utils/index.js";
import { PrismaClient } from "~/prisma/generated/client2/index.js";

const prisma  = new PrismaClient();

export default defineEventHandler(async (event) => {
    const isVerified = await verifyUser(event);
    if (!isVerified || !event.context.session?.user?.isAdmin) {
      throw createError({ statusCode: 403, message: 'Unauthorized' });
    }
  
    const {id: instanceId} = await getQuery(event);

    
    await prisma.reviewInstance.delete({
      where: { instanceId },
    });
  
    return { success: true };
  });