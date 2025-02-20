// store.ts
import { openDB  } from 'idb';
import type {IDBPDatabase, DBSchema } from 'idb';

interface AccountSettingsDB extends DBSchema {
    accountSettings: {
        key: string;
        value: any;
    };
}

interface NovelDetailsCacheDB extends DBSchema { // Keep this for other novel-specific data
    novelDetailsCache: {
        key: string;
        value: any;
    };
}


class Store {
    private accountSettingsDB!: IDBPDatabase<AccountSettingsDB>;
    private novelDetailsCacheDB!: IDBPDatabase<NovelDetailsCacheDB>;


    constructor() {
        if (process.client) {
            this.initDB();
        }
    }

    async initDB() {
        if (!process.client) return;

        this.accountSettingsDB = await openDB<AccountSettingsDB>('accountSettingsDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('accountSettings')) {
                    db.createObjectStore('accountSettings');
                }
            },
        });
        this.novelDetailsCacheDB = await openDB<NovelDetailsCacheDB>('novelDetailsCacheDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('novelDetailsCache')) {
                    db.createObjectStore('novelDetailsCache');
                }
            },
        });
    }

    async getAccountSettingsStore() {
        if (!process.client) return null;
        if (!this.accountSettingsDB) {
            await this.initDB();
        }
        return this.accountSettingsDB.transaction('accountSettings', 'readwrite').store;
    }

    async getNovelDetailsCacheStore() { // Keep this for other novel data
        if (!process.client) return null;
        if (!this.novelDetailsCacheDB) {
            await this.initDB();
        }
        return this.novelDetailsCacheDB.transaction('novelDetailsCache', 'readwrite').store;
    }

    // --- Reader Settings (Global) ---

    async getReaderSettings(): Promise<any> {
        if (!process.client) return null;
        const store = await this.getAccountSettingsStore(); // Use accountSettingsDB
        if (!store) return null;

        let settings = await store.get("readerSettings"); // Simple key
        settings = settings?JSON.parse(settings):settings

        return settings || {
            backgroundColor: 'var(--chapter-body-bg-color)',
            fontSize: 16,
            brightness: 100,
            isBookmarked: false,
            gestureEnabled: false,
            isButtonVisible: true,
            fontColor: 'var(--chapter-body-text-color)',
          };
    }

    async setReaderSettings(settings: any): Promise<void> {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore(); // Use accountSettingsDB
        if (!store) return;
  
        await store.put(JSON.stringify(settings), "readerSettings"); // Simple key
    }


    // --- Highlights (Keep per-chapter/novel) ---
    // ... (getHighlights, setHighlights, addHighlight, removeHighlight, clearAllHighlights remain the same) ...
     async getHighlights(novelId: number, chapterNum: number): Promise<any[]> {
        if (!process.client) return []; // Return empty array if not client
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return [];

        const key = `highlight_${novelId}_${chapterNum}`;
        let highlights = await store.get(key);
        return highlights || [];  // Return empty array if not found
    }

    async setHighlights(novelId: number, chapterNum: number, highlights: any[]): Promise<void> {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;
        const key = `highlight_${novelId}_${chapterNum}`;
        console.log(highlights)
        await store.put(highlights, key);
    }

    async addHighlight(novelId: number, chapterNum: number, highlight: any): Promise<void> {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;

        const key = `highlight_${novelId}_${chapterNum}`;
        let highlights: any[] = await store.get(key) || [];
        highlights.push(highlight);
        await store.put(highlights, key);
    }

    async removeHighlight(novelId: number, chapterNum: number, highlightText: string): Promise<void> {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;

        const key = `highlight_${novelId}_${chapterNum}`;
        let highlights: any[] = await store.get(key) || [];
        highlights = highlights.filter((h: any) => h.text !== highlightText);
        await store.put(highlights, key);
    }
    async clearAllHighlights(novelId: number, chapterNum: number): Promise<void> {
        if (!process.client) return;
      const store = await this.getNovelDetailsCacheStore();
        if (!store) return;

        const key = `highlight_${novelId}_${chapterNum}`;
        await store.delete(key);  // Much simpler with idb
    }

    // ... (all other methods like getUserData, getWebMode, etc. are unchanged) ...
     /**
     * Get the webMode setting.
     * @returns {Promise<string|null>} The webMode setting.
     */
    async getWebMode() {
        if (!process.client) return null;
        const store = await this.getAccountSettingsStore();
        if (!store) return null; // Handle case where store is not available (server)

        let webMode = await store.get("webMode");
        if (!webMode) {
            webMode = "safe";
            await this.setWebMode(webMode);
        }
        return webMode;
    }

    /**
     * Set the webMode setting.
     * @param {string} webMode - The webMode to set.
     * @returns {Promise<void>}
     */
    async setWebMode(webMode: String) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.put(webMode, "webMode"); // Corrected put - value, key
    }

    /**
     * Get the user data.
     * @returns {Promise<Object|null>} The user data.
     */
    async getUserData() {
        if (!process.client) return null;
        const store = await this.getAccountSettingsStore();
        if (!store) return null;

        let userData = await store.get("userData");
        if (!userData) {
            userData = {
                id: "",
                username: "anon",
                image: "",
                sessionToken: "",
                accessToken: "",
                apiKey: "",
                loggedIn: false
            };
            await this.setUserData(userData);
        }
        return userData;
    }

    /**
     * Set the user data.
     * @param {Object} userData - The user data to set.
     * @returns {Promise<void>}
     */
    async setUserData(userData: Object) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.put(userData, "userData"); // Corrected put - value, key
    }

    /**
     * Get the login status.
     * @returns {Promise<boolean|null>} The login status.
     */
    async getLoginStatus() {
        if (!process.client) return null;

        let status = await this.getUserData();
        console.log(status)
        // status = status?JSON.parse(status):status
        console.log(status)
        if (typeof status.loggedIn === 'string') {
            return status.loggedIn.toLowerCase() === 'true';
        }
        return status.loggedIn;
    }

    /**
     * Set the login status.
     * @param {boolean} status - The login status to set.
     * @returns {Promise<void>}
     */
    async setLoginStatus(status: boolean) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        const userData = await this.getUserData();  
        if (!store) return;
        userData.loggedIn = status;
        await this.setUserData(userData);
    }

    /**
     * Get the number of chapters for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @returns {Promise<number|null>} The number of chapters.
     */
    async getNumberOfChapters(novel_id: number){
        if (!process.client) return null;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return null;

        const chapters = await store.get(`novel_n_chapters_${novel_id}`);
        return chapters !== undefined ? chapters : 0;
    }

    /**
     * Set the number of chapters for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @param {number} chapters_num - The number of chapters to set.
     * @returns {Promise<void>}
     */
    async setNumberOfChapters(novel_id:number, chapters_num: number) {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;
        await store.put(chapters_num, `novel_n_chapters_${novel_id}`); // Corrected put - value, key
    }

    reviveTypes(data: any): any {
        if (data && data.uploadedAt) {
            return {
                ...data,
                uploadedAt: new Date(data.uploadedAt),
            };
        }
        return data;
    }
    /**
     * Get the chapters for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @param {boolean} revive_types - revive the types before storing the data object. default = true
     * @param {String} mode - [pub, unpub, drafts] mode
     * @returns {Promise<Array<any>|null>} The list of chapters.
     */
    async getChapters(novel_id: number, revive_types = false, mode = "pub") {
        if (!process.client) return null;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return null;

        const validModes = ['pub', 'unpub', 'draft'];
        if (!validModes.includes(mode)) {
            throw new Error(`Invalid mode: ${mode}`);
        }

        let serializedChapters = await store.get(`novel_chapters_${mode}_${novel_id}`);

        if (serializedChapters && revive_types) {
            serializedChapters = this.reviveTypes(serializedChapters);
        }

        try {
            return serializedChapters ? JSON.parse(serializedChapters) : [];
        } catch (error) {
            console.error("Failed to parse chapters data:", error);
            return [];
        }
    }
    /**
     * Set the chapters for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @param {Array} listofObj - The list of chapters to set.
     * @param {String} mode - [pub, unpub, drafts] mode
     * @returns {Promise<void>}
     */
    async setChapters(novelId: number, listofObj: Chapter[], mode = "pub"): Promise<void> {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;

        try {
            const cleanData = JSON.stringify(listofObj);
            const validModes = ['pub', 'unpub', 'draft'];
            if (!validModes.includes(mode)) {
                throw new Error(`Invalid mode: ${mode}`);
            }
            await store.put(cleanData, `novel_chapters_${mode}_${novelId}`); // Corrected put - value, key
        } catch (error) {
            console.error("Failed to store chapters data:", error);
        }
    }


    /**
     * Remove the chapters for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @param {string} mode - [pub, unpub, drafts] mode
     * @returns {Promise<void>}
     */
    async removeChapters(novel_id: number, mode: string) {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;

        try {
            const validModes = ['pub', 'unpub', 'draft'];
            if (!validModes.includes(mode)) {
                throw new Error(`Invalid mode: ${mode}`);
            }
            await store.delete(`novel_chapters_${mode}_${novel_id}`);
            console.log(`Chapters for novel_id ${novel_id} in mode ${mode} removed successfully.`);
        } catch (error) {
            console.error("Failed to remove chapters data:", error);
        }
    }

    /**
     * Get a specific chapter by its ID.
     * @param {number} novel_id - The ID of the novel.
     * @param {number} chapter_id - The ID of the chapter.
     * @param {string} mode - [pub, unpub, drafts] mode
     * @returns {Promise<Object|null>} The chapter object or null if not found.
     */
    async getChapterById(novel_id: number, chapter_id: number, mode: string) {
        if (!process.client) return null;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return null;

        try {
            const validModes = ['pub', 'unpub', 'draft'];
            if (!validModes.includes(mode)) {
                throw new Error(`Invalid mode: ${mode}`);
            }
            const serializedChapters = await store.get(`novel_chapters_${mode}_${novel_id}`);
            if (!serializedChapters) {
                return null;
            }
            const chapters = JSON.parse(serializedChapters);
            interface Chapter {
                id: number;
                [key: string]: any;
            }
            const chaptersTyped: Chapter[] = JSON.parse(serializedChapters);
            const chapter: Chapter | undefined = chaptersTyped.find(ch => ch.id === chapter_id);
            return chapter || null;
        } catch (error) {
            console.error("Failed to get chapter by ID:", error);
            return null;
        }
    }

    /**
     * Get the last read chapter for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @returns {Promise<number|null>} The last read chapter number.
     */
    async getLastReadChapter(novel_id: number) {
        if (!process.client) return null;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return null;

        const lastReadChapter = await store.get(`last_read_chapter_${novel_id}`);
        return lastReadChapter !== undefined ? lastReadChapter : 1;
    }

    /**
     * Set the last read chapter for a novel.
     * @param {number} novel_id - The ID of the novel.
     * @param {number} lastReadChapter - The last read chapter number to set.
     * @returns {Promise<void>}
     */
    async setLastReadChapter(novel_id: number, lastReadChapter: number) {
        if (!process.client) return;
        const store = await this.getNovelDetailsCacheStore();
        if (!store) return;
        await store.put(lastReadChapter, `last_read_chapter_${novel_id}`); // Corrected put - value, key
    }

    /**
 * Get the bookmarks for a novel.
 * Returns an array of bookmark objects.
 */
async getBookmarks(novel_id: number): Promise<any[]> {
    if (!process.client) return [];
    const store = await this.getNovelDetailsCacheStore();
    if (!store) return [];
    const bookmarks = await store.get(`bookmarks_${novel_id}`);
    return bookmarks || [];
  }
  
  /**
   * Set the bookmarks for a novel.
   * Replaces the bookmarks array.
   */
  async setBookmarks(novel_id: number, bookmarks: any[]): Promise<void> {
    if (!process.client) return;
    const store = await this.getNovelDetailsCacheStore();
    if (!store) return;
    await store.put(bookmarks, `bookmarks_${novel_id}`);
  }
  
  /**
 * Add a new bookmark for a novel.
 * Here, the provided bookmark is a chapter number.
 * This function creates a bookmark object with the chapter and addedAt date.
 */
async addBookmark(novel_id: number, chapter: number): Promise<void> {
    if (!process.client) return;
    const store = await this.getNovelDetailsCacheStore();
    if (!store) return;
  
    const key = `bookmarks_${novel_id}`;
    // Retrieve current bookmarks (array of objects)
    let bookmarks: { chapter: number; addedAt: string }[] = await store.get(key) || [];
    
    // Create a new bookmark object
    const newBookmark = {
      chapter,
      addedAt: new Date().toISOString()
    };
  
    bookmarks.push(newBookmark);
    await store.put(bookmarks, key);
  }
  
  /**
   * Remove a bookmark for a novel by chapter number.
   */
  async removeBookmark(novel_id: number, chapter: number): Promise<void> {
    if (!process.client) return;
    const store = await this.getNovelDetailsCacheStore();
    if (!store) return;
  
    const key = `bookmarks_${novel_id}`;
    let bookmarks: { chapter: number; addedAt: string }[] = await store.get(key) || [];
    // Remove bookmarks that have the matching chapter number
    bookmarks = bookmarks.filter(b => b.chapter !== chapter);
    await store.put(bookmarks, key);
  }

    /**
     * Get the user ID.
     * @returns {Promise<string|null>} The user ID.
     */
    async getUserId() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.id : null;
    }

    /**
     * Set the user ID.
     * @param {string} id - The user ID to set.
     * @returns {Promise<void>}
     */
    async setUserId(id: string) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.id = id;
        await this.setUserData(userData);
    }

    /**
     * Get the username.
     * @returns {Promise<string|null>} The username.
     */
    async getUsername() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.username : null;
    }

    /**
     * Set the username.
     * @param {string} username - The username to set.
     * @returns {Promise<void>}
     */
    async setUsername(username: string) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.username = username;
        await this.setUserData(userData);
    }
    /**
     * Set the searchQuery
     * @param {string|null} query -  the search query to set.
     * @returns {Promise<void>}
     */
    async setSearchQuery(query: string | null) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.put(query, "search_query"); // Corrected put - value, key
    }

    /**
     * Set the searchQuery
     * @param {String} query -  the search query to set.
     * @returns {Promise<string|null>}
     */
    async getSearchQuery() {
        if (!process.client) return null;
        const store = await this.getAccountSettingsStore();
        if (!store) return null;

        let res = await store.get("search_query");
        return res || null;
    }

    /**
     * Set the searchQuery
     * @param {String|null} query -  the search query to set.
     * @returns {Promise<void>}
     */
    async clearSearchQuery() {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.put(null, "search_query"); // Corrected put - value, key
    }

    /**
     * Get the user image.
     * @returns {Promise<string|null>} The user image.
     */
    async getUserImage() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.image : null;
    }

    /**
     * Set the user image.
     * @param {string} image - The user image to set.
     * @returns {Promise<void>}
     */
    async setUserImage(image: string) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.image = image;
        await this.setUserData(userData);
    }

    /**
     * Get the session token.
     * @returns {Promise<string|null>} The session token.
     */
    async getSessionToken() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.sessionToken : null;
    }

    /**
     * Set the session token.
     * @param {string} sessionToken - The session token to set.
     * @returns {Promise<void>}
     */
    async setSessionToken(sessionToken: string) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.sessionToken = sessionToken;
        await this.setUserData(userData);
    }

    /**
     * Get the access token.
     * @returns {Promise<string|null>} The access token.
     */
    async getAccessToken() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.accessToken : null;
    }

    /**
     * Set the access token.
     * @param {string} accessToken - The access token to set.
     * @returns {Promise<void>}
     */
    async setAccessToken(accessToken: string) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.accessToken = accessToken;
        await this.setUserData(userData);
    }

    /**
     * Get the API key.
     * @returns {Promise<string|null>} The API key.
     */
    async getApiKey() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.apiKey : null;
    }

    /**
     * Set the API key.
     * @param {string} apiKey - The API key to set.
     * @returns {Promise<void>}
     */
    async setApiKey(apiKey: string) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.apiKey = apiKey;
        await this.setUserData(userData);
    }

    /**
     * Check if the user is logged in.
     * @returns {Promise<boolean|null>} The login status.
     */
    async isLoggedIn() {
        if (!process.client) return null;
        const userData = await this.getUserData();
        return userData ? userData.loggedIn : false;
    }

    /**
     * Set the login status.
     * @param {boolean} loggedIn - The login status to set.
     * @returns {Promise<void>}
     */
    async setLoggedIn(loggedIn: boolean) {
        if (!process.client) return;
        const userData = await this.getUserData() || {};
        userData.loggedIn = loggedIn;
        await this.setUserData(userData);
    }

    /**
     * Get the groups data.
     * Automatically returns an empty array if no groups are stored.
     * @returns {Promise<Array|null>} The groups data.
     */
    async getGroups() {
        if (!process.client) return null;
        const store = await this.getAccountSettingsStore();
        if (!store) return null;

        let groupsData = await store.get("groups");

        if (!groupsData) {
            groupsData = [
                {
                    "id": "characters",
                    "title": "Characters",
                    "shortcut": "c",
                    "icon": "users",
                    "children": [
                        {
                            "id": "char1",
                            "name": "Character 1"
                        },
                        {
                            "id": "char2",
                            "name": "Character 2"
                        }
                    ]
                },
                {
                    "id": "tools",
                    "title": "Tools",
                    "shortcut": "t",
                    "icon": "tool",
                    "children": [
                        {
                            "id": "tool1",
                            "name": "Tool 1"
                        }
                    ]
                },
                {
                    "id": "items",
                    "title": "Items",
                    "shortcut": "i",
                    "icon": "package",
                    "children": [
                        {
                            "id": "item1",
                            "name": "Item 1"
                        }
                    ]
                }
            ];
            await this.setGroups(groupsData);
        }
        try {
            return JSON.parse(groupsData);
        } catch (e) {
            return groupsData || [];
        }
    }
    /**
     * Set the groups data.
     * @param {Array(Object)} groups - The groups data to set.
     * @returns {Promise<void>}
     */
    async setGroups(groups: Group[]) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.put(JSON.stringify(groups), "groups"); // Corrected put - value, key
    }

    async getNormalHeaders() {
        if (!process.client) return null;
        const sessionToken = await this.getSessionToken();
        const apiKey = await this.getApiKey();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
            'X-API-KEY': apiKey
        };
        return headers;
    }
    async getFormHeaders() {
        if (!process.client) return null;
        const sessionToken = await this.getSessionToken();
        const apiKey = await this.getApiKey();
        const headers = {
            'Authorization': `Bearer ${sessionToken}`,
            'X-API-KEY': apiKey
        };
        return headers;
    }


    async setCache(key: string, obj: CacheableObject) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.put(JSON.stringify(obj), key); // Corrected put - value, key
    }
    async getCache(key:string) {
        if (!process.client) return null;
        const store = await this.getAccountSettingsStore();
        if (!store) return null;
        let res = await store.get(key);
        return res ? JSON.parse(res) : null;
    }
    async deleteCache(prefix: string) {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        let cursor = await store.openCursor();
        if (!cursor) return;
      
        while (cursor) {
          if (cursor.key.startsWith(prefix)) {
            await cursor.delete();
          }
          cursor = await cursor.continue();
        }
    }
      
    async logout() {
        if (!process.client) return;
        const store = await this.getAccountSettingsStore();
        if (!store) return;
        await store.clear();
    }   
}

export default defineNuxtPlugin(() => {
    const store = new Store();
    return {
        provide: {
            store: store
        }
    };
});

interface GroupChild {
    id: string;
    name: string;
}

interface Group {
    id: string;
    title: string;
    shortcut: string;
    icon: string;
    children: GroupChild[];
}
interface CacheableObject {
    [key: string]: any;
}
interface Chapter {
    id: number;
    [key: string]: any;
}