import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import OpenAI from 'openai';

interface Message {
    sender: "user" | "bot";
    text: string;
    timestamp: number;
}

interface Chat {
    id: number;
    name: string;
    messages: Message[];
    lastUpdated: number;
    isEditing?: boolean; //Consider making a separate class or type for managing the UI State of the chat.
    tempName?: string;
    systemInstruction?: string;
}


// Base ChatUtils class
class ChatUtils {
    apiKey: string;
    systemInstruction: string;
    maxRetries: number;
    timeout: number;
    model: any = null; //  Keep this generic

    constructor({
        apiKey,
        systemInstruction = "",
        maxRetries = 3,
        timeout = 30000
    }: {apiKey:string; systemInstruction?: string; maxRetries?:number, timeout?: number}) {
        this.apiKey = apiKey;
        this.systemInstruction = systemInstruction;
        this.maxRetries = maxRetries;
        this.timeout = timeout;
    }

    async generateBotResponse(chatHistory: Message[]): Promise<Message> {  // Add types
        throw new Error('generateBotResponse must be implemented by subclasses');
    }

    //  Only update the *model's* system instruction.  The context is part of the instruction itself.
    updateSystemInstruction(newSystemInstruction: string) {
        this.systemInstruction = newSystemInstruction;
    }

    formatBotResponse(text: string): string { // Add type
        if (!text) return '';

        try {
            // Check for code blocks and apply syntax highlighting
            const hasCodeBlocks = text.includes('```');
            if (hasCodeBlocks) {
                text = text.replace(/```(\w+)?\n([\s\S]+?)\n```/g, (_, lang, code) => {
                    try {
                        const highlighted = lang
                            ? hljs.highlight(code, { language: lang }).value
                            : hljs.highlightAuto(code).value;
                        return `<pre><code class="hljs ${lang || ''}">${highlighted}</code></pre>`;
                    } catch {
                        return `<pre><code>${DOMPurify.sanitize(code)}</code></pre>`;
                    }
                });
            }

            // Convert markdown to HTML
            const html = marked(text, {
                gfm: true,
                breaks: true,
                sanitize: false,
            });

            return html;
        } catch (error) {
            console.error('Error formatting response:', error);
            return DOMPurify.sanitize(text);
        }
    }
}

// GeminiChatUtils class
class GeminiChatUtils extends ChatUtils {
    modelName: string; // Add type

    constructor(config: ChatUtilsConfig) {
        super(config);
        this.modelName = config.modelName;
        this.initializeModel();
    }

    initializeModel() {
        if (this.model) return;

        try {
            this.model = new GoogleGenerativeAI(this.apiKey).getGenerativeModel({
                model: this.modelName,
                // systemInstruction is not a valid config option for gemini.  It's set via the history.
                generationConfig: {
                    temperature: this.additional?.temperature ?? 0.9,  // Use defaults from config
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
            });
        } catch (error) {
            throw new Error(`Failed to initialize Gemini model: ${error.message}`);
        }
    }

    transformChatHistory(chatHistory: Message[]): {role: string; parts: {text: string}[]}[] { // Add type
        const transformed = chatHistory.map(message => ({
            role: message.sender === "user" ? "user" : "model",
            parts: [{ text: message.text }],
        }));

        return transformed;
    }


   async generateBotResponse(chatHistory: Message[]): Promise<Message> {
        this.initializeModel();

        // Construct the history, including the system instruction as the FIRST message.
        const history = [];
        if (this.systemInstruction) {
          history.push({
            role: "user",  //  System instructions are sent as "user" messages to Gemini.
            parts: [{ text: this.systemInstruction }],
          });
          history.push({
            role: "model", // Gemini requires a model response after system instruction.
            parts: [{text: "OK"}],
          });
        }

        // Add the rest of the chat history
        history.push(...this.transformChatHistory(chatHistory.slice(0, -1))); // All except last message

        try {
            const chat = this.model.startChat({
                history: history,  // Use the constructed history
            });

            const response = await chat.sendMessage(chatHistory[chatHistory.length - 1].text);
            return {
                sender: "bot",
                text: this.formatBotResponse(response.response.text()),
                timestamp: Date.now(),
            };
        } catch (error) {
            throw new Error(`Failed to generate Gemini response: ${error.message}`);
        }
    }
}

// OpenAIChatUtils class
class OpenAIChatUtils extends ChatUtils {
    modelName: string; // Add type

    constructor(config: ChatUtilsConfig) {
        super(config);
        this.modelName = config.modelName;
        this.initializeModel();
    }

    initializeModel() {
        if (this.model) return;

        try {
            this.model = new OpenAI({
                apiKey: this.apiKey,
                timeout: this.timeout,
                maxRetries: this.maxRetries,
            });
        } catch (error) {
            throw new Error(`Failed to initialize OpenAI model: ${error.message}`);
        }
    }

    transformChatHistory(chatHistory: Message[]): { role: string; content: string; }[] {  // Add type
        return chatHistory.map(message => ({
            role: message.sender === "user" ? "user" : "assistant",
            content: message.text,
        }));
    }

   async generateBotResponse(chatHistory: Message[]): Promise<Message> {
        this.initializeModel();

        // Transform chat history for the model
        const transformedHistory = this.transformChatHistory(chatHistory);

        try {
            const messages = this.systemInstruction
                ? [{ role: "system", content: this.systemInstruction }, ...transformedHistory]
                : transformedHistory;

            const completion = await this.model.chat.completions.create({
                model: this.modelName,
                messages,
                temperature: this.systemInstruction ? 0.7 : 0.9,
                max_tokens: 2048,
            });

            return {
                sender: "bot",
                text: this.formatBotResponse(completion.choices[0].message.content!), // Add non-null assertion
                timestamp: Date.now(),
            };
        } catch (error) {
            throw new Error(`Failed to generate OpenAI response: ${error.message}`);
        }
    }
}



interface ChatUtilsConfig {
    modelName: string;
    apiKey: string;
    systemInstruction?: string; // Optional, as it might not always be needed
    additional?: {
        temperature?: number;  // Make temperature optional as well, for flexibility
        maxRetries?:number;
        timeout?: number
    };
}


// ChatUtilsFactory class
class ChatUtilsFactory {
    static defaultConfig: Partial<ChatUtilsConfig> = { // Use Partial for defaults
        maxRetries: 3,
        timeout: 30000,
        systemInstruction: "You are a helpful AI Book Assistant. Help me understand the chapter and help me write or modify or improve it better.", // Add a default system instruction
    };

    /**
     * Creates a chat utility instance based on the model name
     * @param {ChatUtilsConfig} config Configuration object
     * @returns {ChatUtils} An instance of the appropriate chat utility
     */
    static create(config: ChatUtilsConfig): ChatUtils {
        if (!config.modelName) {
            throw new Error("Model name is required");
        }

        if (!config.apiKey) {
            throw new Error("API key is required");
        }

        // Merge user-provided config with defaults
        const mergedConfig: ChatUtilsConfig = {
            ...this.defaultConfig,
            ...config,
            additional: {
                ...this.defaultConfig.additional,
                ...config.additional,
            }
        };


        if (config.modelName.startsWith("gemini")) {
            return new GeminiChatUtils(mergedConfig);
        } else if (config.modelName.startsWith("gpt")) {
            return new OpenAIChatUtils(mergedConfig);
        } else {
            throw new Error(`Unsupported model: ${config.modelName}`);
        }
    }
}


class ChatManager {
    private chatList: Chat[] = [];
    private currentChatId: number | null = null;
    private storageKey: string;

    constructor(storageKey: string = 'chats', chatUtils: ChatUtils) {
        this.storageKey = storageKey;
        this.loadChats(chatUtils);  // Load immediately
    }

    public getChats(): Chat[] {
        return this.chatList;
    }

    public getCurrentChatId(): number | null {
        return this.currentChatId;
    }

    public getChatById(chatId: number): Chat | undefined {
        return this.chatList.find(chat => chat.id === chatId);
    }

     public loadChats(chatUtils: ChatUtils): void {
        try {
            const storedChats = localStorage.getItem(this.storageKey);
            if (storedChats) {
                this.chatList = JSON.parse(storedChats);

                // Sort chats by lastUpdated in descending order (latest first)
                this.chatList.sort((a, b) => b.lastUpdated - a.lastUpdated);

                // Select the *first* chat (most recent) after loading.
                if (this.chatList.length > 0) {
                   const latestChat = this.chatList[0];
                    this.selectChat(latestChat.id);
                    // Update the model's system instruction with the chat's system instruction
                    if (latestChat.systemInstruction) {
                        chatUtils.updateSystemInstruction(latestChat.systemInstruction);
                    }

                }
            } else {
                this.startNewChat(chatUtils); //  If no chats, start a new one.
            }
        } catch (error) {
            console.error("Error loading chats:", error);
            this.chatList = [];
            this.startNewChat(chatUtils); //  If error, start a new one.
        }
    }

    // IMPORTANT:  This now uses the *current* system instruction from the ChatUtils instance.
    public startNewChat(chatUtils: ChatUtils): Chat {
        const newChat: Chat = {
            id: Date.now(),
            name: `Chat ${this.chatList.length + 1}`,
            messages: [],
            lastUpdated: Date.now(),
            systemInstruction: chatUtils.systemInstruction, // Use the *current* instruction
        };

        this.chatList.push(newChat);
        this.selectChat(newChat.id);
        this.saveChats();  // Save immediately
        return newChat;
    }

    // Updated to handle context correctly
    public updateSystemInstruction(chatId: number, newSystemInstruction: string, context: string, chatUtils: ChatUtils): void {
        const chat = this.getChatById(chatId);
        if (!chat) {
            throw new Error("Chat not found.");
        }

        // Construct the FULL instruction, including context.
        let fullInstruction = newSystemInstruction;
        if (context.trim() !== "") {
            fullInstruction = `${newSystemInstruction}\n\nContext: ${context}`;
        }

        // 1. Update the *chat's* system instruction.
        chat.systemInstruction = fullInstruction;
        chat.lastUpdated = Date.now();

        // 2. Update the *model's* system instruction.
        chatUtils.updateSystemInstruction(fullInstruction);

        this.saveChats();
    }


    public selectChat(chatId: number): void {
        if (!this.chatList.some((chat) => chat.id == chatId)) {
            throw new Error("Chat not found");
        }
        this.currentChatId = chatId;
    }

    public addMessage(message: Message, chatId?: number): void {
        const targetChatId = chatId ?? this.currentChatId;
        if (targetChatId === null) {
            throw new Error("No chat selected.");
        }
        const chat = this.getChatById(targetChatId);
        if (!chat) {
            throw new Error("Chat not found.");
        }

        chat.messages.push(message);
        chat.lastUpdated = Date.now();
        this.saveChats();
    }

     public async regenerateMessage(messageIndex: number, chatUtils: ChatUtils): Promise<void> {
        if (this.currentChatId === null) {
            throw new Error("No chat selected.");
        }

        const currentChat = this.getChatById(this.currentChatId);
        if (!currentChat) {
            throw new Error("Current chat not found.");
        }

        if (messageIndex < 0 || messageIndex >= currentChat.messages.length) {
            throw new Error("Invalid message index.");
        }
        if (currentChat.messages[messageIndex].sender !== 'bot') {
            throw new Error("Can only regenerate bot messages");
        }

        const newChatHistory = currentChat.messages.slice(0, messageIndex);
        currentChat.messages.splice(messageIndex, 1);
        // Use current chat instruction before regenerating
        chatUtils.updateSystemInstruction(currentChat.systemInstruction!);
        const newResponse = await chatUtils.generateBotResponse(newChatHistory);
        currentChat.messages.splice(messageIndex, 0, newResponse); // Fix: Insert newResponse at the correct index
        currentChat.lastUpdated = Date.now();
        this.saveChats();
    }

    public deleteChat(chatId: number): void {
        const index = this.chatList.findIndex(c => c.id === chatId);
        if (index === -1) {
            throw new Error("Chat not found.");
        }

        if (this.chatList.length === 1) {
            throw new Error("Cannot delete the last chat.");
        }

        this.chatList.splice(index, 1);

        // If deleting the currently selected chat, select another one (if available)
        if (this.currentChatId === chatId) {
            this.currentChatId = this.chatList.length > 0 ? this.chatList[0].id : null;
        }
        this.saveChats();
    }

    public renameChat(chatId: number, newName: string): void {
        const chat = this.getChatById(chatId);
        if (!chat) {
            throw new Error("Chat not found.");
        }
        chat.name = newName.trim();
        chat.lastUpdated = Date.now();
        this.saveChats();
    }

    private saveChats(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.chatList));
    }

    public getCurrentChatMessages(): Message[] {
        if (this.currentChatId === null) {
            return []; // Return an empty array if no chat is selected
        }
        const currentChat = this.getChatById(this.currentChatId);
        return currentChat ? currentChat.messages : [];
    }
}

export { ChatManager, ChatUtilsFactory, ChatUtils, GeminiChatUtils, OpenAIChatUtils, type Message, type Chat, type ChatUtilsConfig };