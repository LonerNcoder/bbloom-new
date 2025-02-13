import { openDB } from 'idb';
import ImageKit from 'imagekit';


const dbName = 'client-db';
const storeName = 'account-settings';

/**
 * Opens the IndexedDB and retrieves the user data.
 * @returns {Promise<Object>} The user data from the IndexedDB.
 */
async function getUserData() {
  const db = await openDB(dbName, 1);
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const user = await store.get("user");
  await tx.done;
  return user;
}

/**
 * Retrieves the session token from the user data in IndexedDB.
 * @returns {Promise<String>} The session token.
 */
export async function getSessionToken() {
  const user = await getUserData();
  return user?.value.sessionToken;
}

/**
 * Retrieves the API key from the user data in IndexedDB.
 * @returns {Promise<String>} The API key.
 */
export async function getApiKey() {
  const user = await getUserData();
  return user?.value.apiKey;
}

/**
 * Retrieves log in status from the user data in IndexedDB.
 * @returns {Promise<boolean>} The log in status.
 */
export async function isLoggedIn() {
  const user = await getUserData();
  return user?.value.loggedIn;
}
/**
 * Retrieves the user ID from the user data in IndexedDB.
 * @returns {Promise<String>} The user ID.
 */
export async function getUserId() {
  const user = await getUserData();
  return user?.value.id;
}
/**
 * Retrieves the username from the user data in IndexedDB.
 * @returns {Promise<String>} The username.
 */
export async function getUsername(){
  const user = await getUserData();
  return user?.value.username
}

export async function getHeaders(){
  const sessionToken = await getSessionToken()
  const apiKey = await getApiKey()
  const headers = {
    'Authorization': `Bearer ${sessionToken}`,
    'X-API-KEY': apiKey
  }
  return headers
}



export const getAllBookmarks = () => {
  const bookmarks = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Check if the key is a bookmark key
    if (key.startsWith('bookmark_')) {
      var novelId = key.replace('bookmark_', ''); // Extract the novel_id
      var newChapter = localStorage.getItem(key); // Get the corresponding value
      var novelId = parseInt(novelId);
      var newChapter = parseInt(newChapter);
      bookmarks.push({ novelId, newChapter });
    }
  }
  return bookmarks; // Return all bookmarks
};

/**
 * Uploads image to cdn
 * @returns {Promise<String>} The url of the image.
 */

export async function uploadImage(file){
  const publicKey = await process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = await process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = await process.env.IMAGEKIT_URL_ENDPOINT;
 
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