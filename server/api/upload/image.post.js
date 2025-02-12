import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, readMultipartFormData } from 'h3';
import { verifyUser } from '~/server/utils';
import fs from 'fs';
import path from 'path';
import ImageKit from 'imagekit';



export default defineEventHandler(async (event) => {
  const isVerified = await verifyUser(event);
  console.log(isVerified)

  if (!isVerified) {
    return createError({ statusCode: 401, message: "User not verified" });
  }

  const form = await readMultipartFormData(event);

  if (!form || form.length === 0) {
    return createError({ statusCode: 400, message: "No file uploaded" });
  }

  const file = form.find((item) => item.name === 'image');

  if (!file) {
    return createError({ statusCode: 400, message: "No image file uploaded" });
  }

  // Verify if the uploaded file is an image
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
    'application/xml', 'text/xml', 'application/xhtml+xml',
    'font/ttf', 'font/otf', 'font/woff', 'font/woff2'
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    return createError({ statusCode: 400, message: "Invalid file type. Allowed types are images, XML, SVG, TTF, etc." });
  }

//   Save the file to the server or cloud storage
  try {
    const url = await uploadImage(file);
    return {
      statusCode: 200,
      url,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return createError({ statusCode: 500, message: "Error saving file" });
  }
});



async function uploadImage(file){

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  
    const imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey,
      urlEndpoint: urlEndpoint,
    });


    const res = await imagekit.upload({
      file: file.data, // Upload the processed buffer
      fileName: file.filename || "default_novel_chapter_image.png",
      useUniqueFileName: true,
    });
  
    return res.url;
}
