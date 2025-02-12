import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, readBody } from 'h3';
import { verifyUser } from '~/server/utils';

let prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const isVerified = await verifyUser(event);
    const session = event.context.session;
    const metadata = await readBody(event);
    const coverImage = metadata.coverImage;
    const title = metadata.title;
    const genres = metadata.genres;
    const summary = metadata.summary;
    const author = metadata.author;
    const tags = metadata.tags;
    const status = metadata.status;

    const allowedStatuses = ["Ongoing", "Hiatus", "Completed"];

    if (isVerified) {
      const novel_id = parseInt(event.context.params.novel_id);
      const user_id = session.user.id;
      const isOwner = await prisma.novel.findFirst({
        where: {
          id: novel_id,
          OR: [
            { authorId: user_id },
            { uploaderId: user_id }
          ]
        },
        include: {
          tags: true,
          genres: true,
        }
      });

      if (isOwner) {
        const updateData = {};

        const isValid = (value) => value !== undefined && value !== null && value !== "";

        if (isValid(coverImage)) updateData.coverImage = coverImage;
        if (isValid(title)) updateData.title = title;
        if (isValid(summary)) updateData.summary = summary;
        if (isValid(author)) updateData.author = author;
        if (isValid(status)) {
          if (allowedStatuses.includes(status)) {
            updateData.status = status;
          } else {
            return createError({ statusCode: 400, message: "Status value can only be one of [Ongoing, Hiatus, Completed]" });
          }
        }

        if (tags !== undefined) {
          if (Array.isArray(tags)) {
            if (tags.length === 0) {
              updateData.tags = {
                disconnect: isOwner.tags.map(tag => ({ id: tag.id })),
                connectOrCreate: [{
                  where: { name: 'no-tag' },
                  create: { name: 'no-tag' },
                }]
              };
            } else {
              let tagNames = tags.map(tag => tag.name?.toLowerCase()).filter(name => name && name !== 'no-tag');
              
              if (tagNames.length === 0) {
                updateData.tags = {
                  disconnect: isOwner.tags.map(tag => ({ id: tag.id })),
                  connectOrCreate: [{
                    where: { name: 'no-tag' },
                    create: { name: 'no-tag' },
                  }]
                };
              } else {
                const existingTags = isOwner.tags;
                const tagsToDisconnect = existingTags.filter(tag => 
                  !tagNames.includes(tag.name.toLowerCase()) || tag.name === 'no-tag'
                );

                updateData.tags = {
                  connectOrCreate: tagNames.map(tagName => ({
                    where: { name: tagName },
                    create: { name: tagName },
                  })),
                  disconnect: tagsToDisconnect.map(tag => ({ id: tag.id })),
                };
              }
            }
          }
        }

        if (genres !== undefined) {
          if (Array.isArray(genres)) {
            if (genres.length === 0) {
              updateData.genres = {
                disconnect: isOwner.genres.map(genre => ({ id: genre.id })),
                connectOrCreate: [{
                  where: { name: 'no-genre' },
                  create: { name: 'no-genre' },
                }]
              };
            } else {
              let genreNames = genres.map(genre => genre.name?.toLowerCase()).filter(name => name && name !== 'no-genre');
              
              if (genreNames.length === 0) {
                updateData.genres = {
                  disconnect: isOwner.genres.map(genre => ({ id: genre.id })),
                  connectOrCreate: [{
                    where: { name: 'no-genre' },
                    create: { name: 'no-genre' },
                  }]
                };
              } else {
                const existingGenres = isOwner.genres;
                const genresToDisconnect = existingGenres.filter(genre => 
                  !genreNames.includes(genre.name.toLowerCase()) || genre.name === 'no-genre'
                );

                updateData.genres = {
                  connectOrCreate: genreNames.map(genreName => ({
                    where: { name: genreName },
                    create: { name: genreName },
                  })),
                  disconnect: genresToDisconnect.map(genre => ({ id: genre.id })),
                };
              }
            }
          }
        }

        prisma = new PrismaClient();

        const novel = await prisma.novel.update({
          where: { id: novel_id },
          data: updateData
        });

        if (novel) {
          const response = await prisma.novel.findFirst({
            where: { id: novel.id },
            include: {
              chapterList: {
                select: {
                  id: true,
                  title: true,
                  chapterNumber: true,
                  uploadedAt: true,
                },
                orderBy: { chapterNumber: 'asc' },
              },
              tags: true,
              genres: true,
            }
          });

          return {
            statusCode: 200,
            body: response,
          };
        } else {
          return createError({ statusCode: 400, message: "Failed to update novel" });
        }
      } else {
        return createError({ statusCode: 403, message: "You are not authorized to update this novel" });
      }
    } else {
      return createError({ statusCode: 401, message: "Unauthorized" });
    }
  } catch (error) {
    return createError({ statusCode: 500, message: error.message });
  } finally {
    await prisma.$disconnect();
  }
});