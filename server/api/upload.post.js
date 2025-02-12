/**
 * Extracts book metadata from an XML string.
 *
 * @param {string} xml - The XML string containing the book metadata.
 * @returns {Object} An object containing the extracted title, author, language, summary, and subjects.
 */
function extract(xml) {
  // Extract book title
  const titleMatch = xml.match(/<dc:title[^>]*>(.*?)<\/dc:title>/);
  const title = titleMatch ? titleMatch[1] : null;
  
  // Extract author
  const authorMatch = xml.match(/<dc:creator[^>]*>(.*?)<\/dc:creator>/);
  const author = authorMatch ? authorMatch[1] : null;

  const languageMatch = xml.match(/<dc:language[^>]*>(.*?)<\/dc:language>/);
  const language =  languageMatch ? languageMatch[1] : "en-US";
  
  // Extract summary
  const summaryMatch = xml.match(/<dc:description[^>]*>(.*?)<\/dc:description>/);
  const summary = summaryMatch ? summaryMatch[1] : "no summary available";
  
  // Extract subjects
  const subjectMatches = xml.match(/<dc:subject[^>]*>(.*?)<\/dc:subject>/g);
  const subjects = subjectMatches ? subjectMatches.map(match => match.replace(/<[^>]+>/g, '')) : [];

  return { title, author, language, summary, subjects };
}


import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, readMultipartFormData } from 'h3';
import { promises as fs } from 'fs';
import path from 'path';
import { EPub } from 'epub2';
import {verifyUser} from "~/server/utils";


import unzipper from 'unzipper';


const prisma = new PrismaClient();


import juice from 'juice';

const tempDir = path.join(process.cwd(), 'temp');

/**
 * Combines CSS files into a single string.
 * 
 * @param {string[]} cssFiles - List of CSS file paths.
 * @returns {Promise<string>} - Combined CSS content.
 */
async function combineCSS(cssFiles) {
  return (await Promise.all(
    cssFiles.map(async (cssFile) => await fs.readFile(cssFile, 'utf-8'))
  )).join('\n');
}

/**
 * Converts an HTML file with external CSS files to a single HTML file.
 * 
 * @param {string} html - HTML content.
 * @param {string} cssContent - Combined CSS content.
 * @returns {string} - HTML with inline styles.
 */
function inlineStyles(html, cssContent) {
  return juice.inlineContent(html, cssContent);
}

async function ensureTempDir() {
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create temp directory: ${error.message}`);
    throw error;
  }
}

import { v4 as uuidv4 } from 'uuid'; // Install uuid package for generating unique IDs

export default defineEventHandler(async (event) => {
  let filePath = "";
  let uniqueDirPath = "";
  var isFinished = "";

  const isVerified = await verifyUser(event)

  if (!isVerified){
      return createError({statusCode:401, statusMessage: event.context.error})
  }else{
      try {
        // Ensure the temporary directory exists
        await ensureTempDir();

        const form = await readMultipartFormData(event);
        console.log(form)

        if (!form || form.length === 0) {
          return createError({ statusCode: 400, statusMessage: 'No file uploaded' });
        }

        const file = form[0];

        // Generate a unique directory path using UUID or timestamp
        const uniqueDirName = uuidv4(); // Or use Date.now() for timestamp-based dirs
        uniqueDirPath = path.join(tempDir, uniqueDirName);

        // Create the unique directory if it doesn't exist
        await fs.mkdir(uniqueDirPath, { recursive: true });

        // Define the path for the uploaded file inside the unique directory
        filePath = path.join(uniqueDirPath, file.filename);

        // Write the uploaded file to the unique directory
        await fs.writeFile(filePath, file.data);
    
        const id = await processEpub(filePath, uniqueDirPath, event.context.session.userId);

        return { statusCode: 200, body: {id: id,  message: 'File uploaded and processed successfully' } };
      } catch (error) {
        console.error('Error handling file upload:', error);
        return createError({ statusCode: 500, statusMessage: 'Failed to handle file upload' });
      } finally {

        try {
          if (filePath) await fs.unlink(filePath);
          if (uniqueDirPath) await fs.rm(uniqueDirPath, { recursive: true });
        } catch (err) {
          console.error('Error during cleanup:', err);
        }

      }
    
  }

});

async function processEpub(filePath, uniqueDirPath, userId) {
  const directory = await unzipper.Open.file(filePath);
  await Promise.all(directory.files.map(async (file) => {
    if (file.type === 'Directory') return;
    const outputPath = path.join(uniqueDirPath, file.path);
    if (!outputPath.startsWith(uniqueDirPath)) throw new Error('Illegal file path');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, await file.buffer());
  }));

  const cssFiles = directory.files.filter((file) => file.path.endsWith('.css'));
  const opfFile = directory.files.find((file) => file.path.endsWith('.opf'));
  const imageFiles = directory.files.filter((file) => /\.(svg|png|jpeg|jpg|webp|gif|bmp|tiff)$/i.test(file.path));
  const imagePaths = imageFiles.map((file) => path.join(uniqueDirPath, file.path));

  // const coverImage = imagePaths.find((imagePath) => /\\cover\.[a-z0-9]+$/i.test(imagePath));

  const coverImage = imagePaths.find((imagePath) => 
    /(?:[\/\\]|^)[^\/\\]*?(?:[-_])?cover\.[a-z0-9]+$/i.test(imagePath)
  );

  const coverImageUrl = coverImage ? await uploadImage(coverImage, path.basename(coverImage)) : process.env.DEFAULT_COVER_IMAGE_URL;

  const cssFilePaths = cssFiles.map((file) => path.join(uniqueDirPath, file.path));
  const combinedCSS = await combineCSS(cssFilePaths);
  const opfContent = await fs.readFile(path.join(uniqueDirPath, opfFile.path), 'utf-8');
  const metadata = extract(opfContent);
  const { title, author, language, summary, subjects } = metadata;

  var novelId = null;

  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);
    
    epub.on('end', async () => {
      try {
        const chapters = Object.keys(epub.flow).sort((a, b) => parseInt(a) - parseInt(b));
        const newNovel = await prisma.novel.create({
          data: {
            title,
            author,
            genre: subjects[0] || "no genre",
            summary: summary,
            chapters: chapters.length,
            coverImage: coverImageUrl,
            uploadedBy: {
              connect: { id: userId },
            },
            authorId: userId,
            uploaderId: userId,
            tags: {
              connectOrCreate: subjects.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
            language: {
              connectOrCreate: {
                where: { name: language },
                create: { name: language },
              },
            },
          },
        });

        novelId = newNovel.id;

        await Promise.all(chapters.map((chapterId, index) => 
          new Promise((resolveChapter, rejectChapter) => {
            const chapter = epub.flow[chapterId];
            epub.getChapter(chapter.id, async (err, content) => {
              if (err) {
                rejectChapter(err);
                return;
              }
              try {
                // Base path for resolving relative image paths
                const chapterPath = path.join(uniqueDirPath, chapter.href);
                var xhtmlContent = await fs.readFile(chapterPath, 'utf-8');
                const chapterBasePath = path.dirname(chapterPath);
                console.log(`Chapter base path: ${chapterBasePath}`);
                var chapterContent = xhtmlContent;
              
                // Replace image src attributes in chapter content
                // const imgTagRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
                const imgTagRegex = /<(?:img[^>]+src|image[^>]+xlink:href)="([^"]+)"[^>]*>/g;
                let match;
                while ((match = imgTagRegex.exec(chapterContent)) !== null) {
                  const relativeSrc = match[1];

                  const resolvedSrcPath = path.resolve(chapterBasePath, relativeSrc);

              
                  // Find a match in the image paths
                  const matchedImagePath = imagePaths.find((imagePath) =>
                    path.normalize(imagePath) === path.normalize(resolvedSrcPath)
                  );

              
                  if (matchedImagePath) {
                    const newSrc = await uploadImage(matchedImagePath, path.basename(matchedImagePath));
                    chapterContent = chapterContent.replace(relativeSrc, newSrc);
                    console.log(`Updated image src in chapter: ${relativeSrc} -> ${newSrc}`);
                  }
                }
              
                // Inline CSS and extract chapter title
                const inlinedHTML = inlineStyles(chapterContent, combinedCSS);
              
                const titleMatch = inlinedHTML.match(/<title[^>]*>(.*?)<\/title>/);
                const title = titleMatch ? titleMatch[1] : `Chapter ${index + 1}`;
              
                // Check for <hgroup> and extract content
                const hgroupMatch = inlinedHTML.match(/<hgroup[^>]*>(.*?)<\/hgroup>/s);
                let chapterTitle = title; // Default to the title
              
                if (hgroupMatch) {
                  const h1Match = hgroupMatch[0].match(/<h1[^>]*>(.*?)<\/h1>/);
                  const h2Match = hgroupMatch[0].match(/<h2[^>]*>(.*?)<\/h2>/);
                  const pMatch = hgroupMatch[0].match(/<p[^>]*>(.*?)<\/p>/);
              
                  const h1Content = h1Match ? h1Match[1].replace(/<[^>]+>/g, '') : '';
                  const h2Content = h2Match ? h2Match[1].replace(/<[^>]+>/g, '') : '';
                  const pContent = pMatch ? pMatch[1].replace(/<[^>]+>/g, '') : '';
              
                  chapterTitle = `${h1Content} ${h2Content} ${pContent}`.trim();
                } else {
                  const hTags = inlinedHTML.match(/<h\d[^>]*>(.*?)<\/h\d>/g);
                  chapterTitle = hTags
                    ? hTags.map((tag) => tag.replace(/<[^>]+>/g, '')).join(' ')
                    : title;
                }
              
                const finalTitle = title !== chapterTitle ? chapterTitle : title;
                await prisma.chapter.create({
                  data: {
                    novel: { connect: { id: newNovel.id } },
                    title: finalTitle,
                    content: inlinedHTML,
                    chapterNumber: index + 1,
                  },
                });
                resolveChapter();
              } catch (error) {
                rejectChapter(error);
              }
            });
          })
        ));

        await prisma.$disconnect();
        resolve(novelId);
      } catch (error) {
        await prisma.$disconnect();
        reject(error);
      }
    });

    epub.on('error', (err) => reject(err));
    epub.parse();
  });
}

import ImageKit from 'imagekit';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp'; // For image compression


/**
 * Uploads an image to the server after detecting its type, converting SVGs to JPG, and compressing it.
 *
 * @param {string} imagePath - Path to the image file.
 * @param {string} fileName - Name of the image file.
 * @returns {Promise<string>} - URL of the uploaded image.
 */
async function uploadImage(imagePath, fileName) {
  // Detect the file type
  const fileType = await fileTypeFromFile(imagePath);
  if (!fileType) {
    throw new Error(`Unable to determine file type for: ${imagePath}`);
  }


  let imageBuffer;
  // config for quality percentage for image extensions
  const config = {
    jpeg: { quality: 70 },
    webp: { quality: 50 },
    png: { quality: 50 },
    tiff: { quality: 70 },
    bmp: { quality: 70 },
    gif: { quality: 70 },
    jpg: { quality: 70 },
  }



  imageBuffer = await fs.readFile(imagePath);
  // Compress the image if it's larger than 300 KB
  if (imageBuffer.length > 200 * 1024) { // 300 KB
    console.log('Compressing image...');
    imageBuffer = await sharp(imageBuffer)
    const meta = await imageBuffer.metadata()
    const format  = meta.format
    if (format==="svg"){
      imageBuffer = await imageBuffer.toFormat("png", config["png"]).toBuffer()
    }else{
      imageBuffer = await imageBuffer.toFormat(format, config[format]).toBuffer()
    }

  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  const imagekit = new ImageKit({
    publicKey: publicKey,
    privateKey: privateKey,
    urlEndpoint: urlEndpoint,
  });

  const res = await imagekit.upload({
    file: imageBuffer, // Upload the processed buffer
    fileName: fileName,
    useUniqueFileName: true,
  });

  return res.url;
}
