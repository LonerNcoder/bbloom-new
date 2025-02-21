import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, readBody } from 'h3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);

    // Validate user credentials (this is just an example, implement your own logic)
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!user || passwordMatch === false) {
      return createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
    }

    const sessionToken = uuidv4();
    const accessToken = generateApiKey();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    const apiKey = generateApiKey();

    await prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    });
    
    await prisma.apiKey.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Save sessionToken and apiKey to the database (example)
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken : sessionToken,
        accessToken : accessToken,
        expiresAt: expiresAt,
      },
    });
    await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: apiKey,
        expiresAt: expiresAt,
      },
    });

    return {
      statusCode: 200,
      body: {
        user: {
          id: user.id,
          username: user.username,
          image: user.image || "default_profile.jpg",
        },
        sessionToken: sessionToken,
        accessToken: accessToken,
        apiKey : apiKey,
      },
    };
  } catch (error) {
    // console.error('Error logging in:', error);
    return createError({ statusCode: 500, statusMessage: 'Failed to login user' });
  } finally {
    await prisma.$disconnect();
  } 
});

const generateApiKey = () => {
  return uuidv4();
};