import { EPub } from 'epub2';


// const epubPath = './utils/pg2641-images-3.epub'; // Replace with your EPUB file pathnovelwtr\utils\pg2641-images-3.epub

async function extractEPUBData(epubPath) {
    const epub = new EPub(epubPath);

    // Parse the EPUB file
    epub.parse();

    // Metadata, cover, and content extraction
    epub.on('end', () => {
        // Book metadata
        console.log('Book Title:', epub.metadata.title);
        console.log('Author:', epub.metadata.creator);
        console.log('Summary:', epub.metadata.description || 'No summary available');

        // Cover image
        if (epub.metadata.cover) {
            epub.getImage(epub.metadata.cover, (err, data, mimeType) => {
                if (err) {
                    console.error('Error retrieving cover image:', err);
                } else {
                    console.log('Cover Image Mime Type:', mimeType);
                    console.log('Cover Image Data (Base64):', data.toString('base64'));
                }
            });
        } else {
            console.log('No cover image available.');
        }

        // Chapters and contents
        const chapters = epub.flow.map((chapter, index) => ({
            title: chapter.title,
            id: chapter.id,
        }));

        console.log('Table of Contents:', chapters);

        // chapters.forEach((chapter, index) => {
        //     epub.getChapter(chapter.id, (err, text) => {
        //         if (err) {
        //             console.error(`Error retrieving content for chapter ${index + 1}:`, err);
        //         } else {
        //             console.log(`Content of Chapter ${index + 1} (${chapter.title}):`);
        //             console.log(text.substring(0, 500)); // Display first 500 characters
        //         }
        //     });
        // });
    });

    // Handle errors
    epub.on('error', (error) => {
        console.error('Error reading EPUB:', error);
    });
}


export {extractEPUBData};