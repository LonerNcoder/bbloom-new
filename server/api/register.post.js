// server/api/register.post.js
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, readBody } from 'h3';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    // Validate input (including email)
    if (!username || typeof username !== 'string' || username.length < 3 || username.length > 30) {
      return createError({ statusCode: 400, statusMessage: 'Invalid length of username' });
    }
    if (!password || typeof password !== 'string' || password.length < 4) {
      return createError({ statusCode: 400, statusMessage: 'Password needs to be atleast 4 character long' });
    }

    // Check if username or email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
        }
      }, // Use findUnique for checking uniqueness
    });


    if (existingUser) {
      return createError({
        statusCode: 400,
        statusMessage: 'Username is already taken',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 5);

    //user can have multiple libraries, but we need to create a default one, we need user id to create a default library
    const newUser = await prisma.user.create({
      data: {
        username: username,
        image: "default_profile.jpg",
        password: hashedPassword,
      }
    });
    //create a default library for the user
    await prisma.library.create({
      data: {
        userId: newUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return { statusCode: 200, statusMessage: "OK" };
  } catch (error) {
    console.error('Error registering user:', error);
    return createError({ statusCode: 500, statusMessage: 'Failed to register user' });
  } finally {
    await prisma.$disconnect();
  }
});