// create new library to the user id, with the given library name through request body
import {defineEventHandler, readBody} from 'h3';
import { verifyUser } from '~/server/utils';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {

  const {name: library_name} = await readBody(event);

  const isVerified = await verifyUser(event);

  if (!isVerified) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
  const user_id = event.context.session.user.id;

  try{
  await prisma.library.delete({
    where:{
        userId_name:{
            userId: user_id,
            name: library_name
        }
    }
  });
}catch(e){
    return createError({
        statusCode: 402,
        statusMessage: `unable to delete ${e}`,
      });
}

  return {
    statusCode: 200,
    statusMessage: 'Library deleted successfully',
  };
});
