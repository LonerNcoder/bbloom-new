<template>
    <div 
      :class="['chatbot-container', { fullscreen, 'dark-mode': isDarkMode }]"
      :style="!fullscreen ? positionStyle : {}"
      ref="chatbotRef"
    >
    <div class="drag-handle">
        <div 
          v-if="!fullscreen"
          style="cursor: move;"
          @mousedown="startDragging"
          @touchstart="startDragging"
        >
        <UTooltip text="Drag to move">
          <Grip size="16" class="drag-icon" />
        </UTooltip>
        </div>
      
        <!-- <div 
          v-if="!fullscreen"
          style="cursor: pointer;"
          @click="$emit('close')"
        >
        <UTooltip text="Close">
          <X size="16" class="drag-icon" />
        </UTooltip>
        </div> -->
      </div>

      <!-- Left Panel (Visible in Fullscreen) -->
      <div v-if="fullscreen && isSidebarOpen" class="left-panel">

      <h3>Conversations</h3>
      <div v-for="(group, label) in groupedChats" :key="label" class="chat-group">
        <div v-if="group.length > 0">
        <div class="group-label">{{ label }}</div>
        <div class="ul chat-list">
          <div class="li"
            v-for="chat in group"
            :key="chat.id"
            @click="selectChat(chat.id)"
            :class="{ active: currentChatIndex === chat.id }"
          >
            <!-- <div class="chat-info">
              <span class="chat-name">{{ chat.name }}</span>
              <span class="chat-date">{{ formatTime(chat.lastUpdated) }}</span>
            </div> -->
            <div class="chat-info">
                <!-- Inline Editing: Show Input when Editing, Otherwise Show Name -->
                <span v-if="!chat.isEditing" class="chat-name">{{ chat.name }}</span>
                <input 
                v-else 
                v-model="chat.tempName" 
                ref="editInput" 
                @blur="saveNewName(chat)" 
                @keyup.enter="saveNewName(chat)" 
                class="rename-input"
                autofocus
                />
                <span class="chat-date">{{ formatTime(chat.lastUpdated) }}</span>
            </div>
            <div v-if="!isSmallScreen" class="chat-actions">
              <input
                v-if="chat.isEditing"
                v-model="chat.tempName"
                @blur="saveNewName(chat)"
                @keyup.enter="saveNewName(chat)"
                ref="editInput"
                class="rename-input"
              />
              <button 
                v-else 
                @click.stop="startEditing(chat)"
                class="action-btn"
              >
              <UTooltip text="Rename Chat"> 

                <Edit2 size="16" />
              </UTooltip>
              </button>
            
              <button 
                @click.stop="deleteChat(chat.id)" 
                class="action-btn"
                
              >
              <UTooltip text="Delete Chat">
                <Trash size="16" />
              </UTooltip>
              </button>
            </div>
        </div>
    </div>
      </div>
      </div>
      <button @click="startNewChat" class="new-chat-btn">
        <Plus size="20" />
        New Chat
      </button>
    </div>
      <!-- Main Chat Area -->
      <div class="main-chat-area" :class="{ 'compact': !fullscreen }">
        <!-- Header -->
        <div class="chat-header">
        <button 
            v-if="fullscreen"
            @click="isSidebarOpen = !isSidebarOpen" 
            class="relative z-50 bg-gray-800 text-white rounded-lg lg:hidden">
            <Grip /> <!-- Use Lucide's Grip icon for menu -->
         </button>
          <h3>{{ getCurrentChatName }}</h3>
          <div class="header-actions">
            <!-- Theme Toggle Button -->
          <UTooltip :text="isDarkMode ? 'Light Mode' : 'Dark Mode'">
            <button 
              @click="toggleTheme" 
              class="action-btn"
            >
              <Sun v-if="isDarkMode" size="16" />
              <Moon v-else size="16" />
            </button>
          </UTooltip>
            <!-- ... rest of header buttons ... -->
             <UTooltip :text="fullscreen ? 'Minimize' : 'Expand'">
            <button 
              @click="toggleFullScreen" 
              class="action-btn"
            >
              <Maximize v-if="!fullscreen" size="16" />
              <Minimize v-else size="16" />
            </button>
          </UTooltip>
          <UTooltip text="Settings">
            <button 
              @click="openModal" 
              class="action-btn"
            >
              <Settings size="16" />
            </button>
          </UTooltip>
          <UTooltip text="Close">
            <button 
              @click="$emit('close')" 
              class="action-btn"
            >
              <X size="16" />
            </button>
          </UTooltip>
          </div>
        </div>
        <!-- ... rest of template ... -->

                <!-- Chat Window -->
          <div class="chat-window-container">
            <div class="chat-window" ref="chatWindow">
              <div v-for="(message, index) in messages" :key="index" class="message-wrapper">
                <div :class="['message', message.sender]">
                  <div class="message-content" ref="messageContent" v-html="message.text" ></div>
                  <div class="message-actions">
                    
                    <button 
                      v-if="message.sender === 'bot'"
                      @click="regenerateResponse(index)"
                      class="action-btn"
                    
                    ><UTooltip text="Regenerate Response">
                      <RefreshCw size="14" />
                    </UTooltip>
                    </button>
                  
                    <button 
                        v-if="message.sender === 'bot'"
                      @click="copyMessage(index)"
                      class="action-btn"
                      
                    >
                    <UTooltip text="Copy Response">
                      <Copy size="14" />
                    </UTooltip>
                    </button>
                  

                  </div>
                </div>
                <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
              </div>
              <div v-if="isTyping" class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div class="mt-8"></div>
            </div>
      
            <!-- Input Area -->
            <div class="input-area">
              <textarea
                v-model="userInput"
                @keydown.enter.prevent="sendMessage"
                placeholder="Type your message..."
                :style="{
                    minHeight: fullscreen && !isSmallScreen ? '80px' : '40px',
                    maxHeight: fullscreen && !isSmallScreen ? '120px' : '90px',
                    height: fullscreen && !isSmallScreen ? '90px' : '45px'
                  }"
                rows="1"
                ref="inputRef"
              ></textarea>
              <UTooltip text='Send Message'> 
              <button 
                @click="sendMessage" 
                class="send-btn"
                :disabled="!userInput.trim()"
                
              >
                <Send size="18" />
              </button>
            </UTooltip>
            </div>
          </div>
      </div>
  
      <!-- Settings Modal -->
      <Modal v-if="isModalOpen" @close="closeModal">
        <template #header>
          <h3 class="text-label">Settings</h3>
        </template>
        
        <template #body>
          <div class="settings-section">
            <h4 class="text-label">API Settings</h4>
            <label class="text-label">
              API Key:
              <input 
                type="password" 
                v-model="apiKey"
                placeholder="Enter API Key" 
                class="settings-input"
              />
            </label>
            <label class="text-label">
              Model:
              <select v-model="selectedModel" class="settings-input">
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b</option>
                <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </label>
            <label class="text-label">
              Temperature:
              <div class="temperature-control">
                <input 
                  type="range" 
                  v-model="temperature" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  class="temperature-slider"
                />
                <span class="temperature-value">{{ temperature }}</span>
              </div>
            </label>
          </div>
  
          <div class="settings-section">
    <h4>Manage Chats</h4>
    <div class="chats-list">
        <div v-for="chat in sortedChats" :key="chat.id" class="chat-item">
        <div class="chat-details">
            <input
            v-if="chat.isEditing"
            v-model="chat.tempName"
            @blur="saveNewName(chat)"
            @keyup.enter="saveNewName(chat)"
            class="rename-input"
            />
            <span v-else>{{ chat.name }}</span>
            <span class="chat-date">{{ formatDate(chat.lastUpdated) }}</span>
        </div>
        <div class="chat-actions">
            <button 
            @click="startEditing(chat)"
            class="action-btn"
           
            >
            <UTooltip text="Rename Chat">
            <Edit2 size="16" />
          </UTooltip>
            </button>
            <button 
            @click="deleteChat(chat.id)"
            class="action-btn"
            
            >
            <UTooltip text='Delete Chat'>
            <Trash size="16" />
          </UTooltip>
            </button>
        </div>
        </div>
    </div>
            </div>
        </template>
  
        <template #footer>
          <button @click="closeModal" class="primary-btn">Save & Close</button>
        </template>
      </Modal>
      </div>
  </template>
<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch, watchEffect, onUnmounted } from 'vue';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ChatManager, ChatUtilsFactory, type Message, type Chat } from '~/utils/chatUtils'; // Updated import
import {
    Moon,
    Sun,
    Maximize,
    Minimize,
    Settings,
    Trash,
    Edit2,
    Send,
    Plus,
    Copy,
    RefreshCw,
    Grip,
    X,
} from 'lucide-vue-next';

const props = defineProps({
    isDarkMode: {
        type: Boolean,
        default: false
    },
    context: {
        type: String,
        default: ""
    }
});

const emit = defineEmits(['close']);

const chatbotRef = ref(null);
const chatWindow = ref(null);
const inputRef = ref(null);
const position = ref({ x: 20, y: 20 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const messages = ref<Message[]>([]); // Explicit type
const userInput = ref("");
const fullscreen = ref(false);
const isModalOpen = ref(false);
const isTyping = ref(false);
const apiKey = ref(useRuntimeConfig().public.defaultKey);
const selectedModel = ref("gemini-1.5-flash");
const temperature = ref(0.9);
const chatList = ref<Chat[]>([]); // Explicit type
const isSidebarOpen = ref(true);
const isSmallScreen = ref(window.innerWidth < 500);
const messageContent = ref(null); // Type is missing, but difficult to infer without more context
const chatManager = ref<ChatManager | null>(null); // Initialize as null
const currentChatIndex = computed(() => chatManager.value?.getCurrentChatId());

const isDarkMode = ref(props.isDarkMode);  // Reactive dark mode

const chatUtilsConfig = computed(() => ({
    modelName: selectedModel.value,
    apiKey: apiKey.value,
    systemInstruction: "You are a helpful AI assistant. Your job is to help user write books without censorships", // Add if needed
    additional: {
        temperature: temperature.value
    }
}));

const chatUtils = ref(ChatUtilsFactory.create(chatUtilsConfig.value));

watchEffect(() => {
    chatUtils.value = ChatUtilsFactory.create(chatUtilsConfig.value);
});

const checkScreenSize = () => {
    isSmallScreen.value = window.innerWidth < 500;
    if (isSmallScreen.value) {
        isSidebarOpen.value = false;
    } else {
        isSidebarOpen.value = true;
    }
};

// No need for a newChat ref if you are managing chats within chatManager
// const newChat = ref(null);
const startNewChat = () => {
    let newChat = null;
    if (chatManager.value) { // Check for null before accessing
        newChat = chatManager.value.startNewChat(chatUtils.value);
        messages.value = []; // Clear existing messages
    } else {
      newChat = {id:0}
    }

    return newChat;
};

onMounted(async () => {
    const savedTheme = localStorage.getItem('chatbotTheme');
    if (savedTheme !== null) {
        isDarkMode.value = savedTheme === 'dark';
    }
    const savedPosition = localStorage.getItem('chatbotPosition');
    if (savedPosition) {
        position.value = JSON.parse(savedPosition);
    }
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);


    chatManager.value = new ChatManager('chats', chatUtils.value);
    if (props.context.trim() !== "") {
        let newChat = startNewChat()
        chatManager.value.updateSystemInstruction(newChat.id, "You are a helpful AI Book Assistant. Help me understand the chapter and help me write or modify or improve it better.", props.context, chatUtils.value );
        await nextTick();
    } else {
         loadChats();  // Load chats after initialization
    }
    adjustInputHeight();
});

watch(position, (newPosition) => {
    localStorage.setItem('chatbotPosition', JSON.stringify(newPosition));
});

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('chatbotTheme', isDarkMode.value ? 'dark' : 'light');
};

const positionStyle = computed(() => ({
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`
}));

const startDragging = (event: MouseEvent | TouchEvent) => {
    if (fullscreen.value) return;

    isDragging.value = true;
    const mouseEvent = event.type === 'mousedown' ? event : event.touches[0];
    const rect = chatbotRef.value.getBoundingClientRect();

    dragOffset.value = {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', stopDragging);
};

const handleDrag = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;

    const mouseEvent = event.type === 'mousemove' ? event : event.touches[0];

    position.value = {
        x: Math.max(0, Math.min(window.innerWidth - chatbotRef.value.offsetWidth,
            mouseEvent.clientX - dragOffset.value.x)),
        y: Math.max(0, Math.min(window.innerHeight - chatbotRef.value.offsetHeight,
            mouseEvent.clientY - dragOffset.value.y))
    };
};

const stopDragging = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', stopDragging);
};

const loadChats = async () => {
    if (!chatManager.value) {
        console.error("ChatManager is not initialized. Cannot load chats.");
        return;
    }
    try {
        chatManager.value.loadChats(chatUtils.value); // Pass chatUtils to loadChats
        chatList.value = chatManager.value.getChats();
        const currentChatId = chatManager.value.getCurrentChatId();
        if (currentChatId !== null) {
             // Safely get messages only if chat exists
            const currentChat = chatManager.value.getChatById(currentChatId);
            if (currentChat) {
                messages.value = currentChat.messages;
            } else {
                console.warn(`Chat with ID ${currentChatId} not found.`);
                messages.value = []; // Set messages to empty array
            }
        } else {
            messages.value = [];
        }
    } catch (error) {
        console.error("Error loading chats:", error);
        // Optionally, set chatList to an empty array in case of error
        chatList.value = [];
    }
};

// Watch for changes in chatList
watch(() => chatManager.value?.getChats(), (newChats) => {  // Optional chaining
    if (newChats) {
        chatList.value = newChats;
    }
}, { deep: true });

// Watch current chat id change and update messages ref
watch(() => chatManager.value?.getCurrentChatId(), (newId) => { //Optional Chaining
    if (newId !== null && chatManager.value) {
        const currentChat = chatManager.value.getChatById(newId);
        if (currentChat){
             messages.value = currentChat.messages;
        } else {
            messages.value = [];
        }
    } else {
      messages.value = [];
    }
});

const selectChat = (chatId) => {
     if (!chatManager.value) {
        console.error("ChatManager is not initialized. Cannot select chat.");
        return;
    }
    try {
        chatManager.value.selectChat(chatId);
    } catch (error) {
        console.error("Error selecting chat:", error);
    }
};

const sendMessage = async () => {
    if (!userInput.value.trim() || !chatManager.value) return;

    const userMessage: Message = {
        sender: "user",
        text: userInput.value,
        timestamp: Date.now(),
    };

    chatManager.value.addMessage(userMessage); // Add to the currently selected chat
    userInput.value = "";
    isTyping.value = true;
    await nextTick(); // Ensure DOM updates happen before adjusting height

    if (inputRef.value) {
        inputRef.value.style.height = fullscreen.value && !isSmallScreen.value ? '90px' : '45px';
    }
    adjustInputHeight();
    scrollToBottom();

    try {
        const botResponse = await chatUtils.value.generateBotResponse(chatManager.value.getCurrentChatMessages());
        chatManager.value.addMessage(botResponse);
    } catch (error) {
        console.error("Error generating response:", error);
        const errorMessage: Message = {
            sender: "bot",
            text: "Error generating response. Please try again later.",
            timestamp: Date.now(),
        };
        chatManager.value.addMessage(errorMessage); // Consistent error handling
    } finally {
        isTyping.value = false;
        await nextTick();
        scrollToBottom();
    }
};

const regenerateResponse = async (messageIndex: number) => {
    if (!chatManager.value) {
       console.error("ChatManager is not initialized.");
       return;
    }
    isTyping.value = true;
    try {
        await chatManager.value.regenerateMessage(messageIndex, chatUtils.value);
    } catch (error) {
        console.error("Error regenerating response:", error);
        const errorMessage: Message = {
            sender: "bot",
            text: "Error regenerating response. Please try again later.",
            timestamp: Date.now(),
        };
        chatManager.value.addMessage(errorMessage);  // Consistent error handling
    } finally {
        isTyping.value = false;
        await nextTick();
        scrollToBottom();
    }
};

const copyMessage = (index: any) => {
    if(!messageContent.value) return;  // Add a null check
    const msgContent = messageContent.value[index];
    if(!msgContent || !msgContent.textContent) return; // Add a null/undefined check

    const textToCopy = msgContent.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('Message copied to clipboard:', textToCopy);
    }).catch((err) => {
        console.error('Failed to copy message:', err);
    });
};

const adjustInputHeight = () => {
    if (!inputRef.value) return;

    inputRef.value.style.height = 'auto';
    inputRef.value.style.height = `${inputRef.value.scrollHeight}px`;

    if (fullscreen.value && !isSmallScreen.value) {
        inputRef.value.style.height = `${Math.max(inputRef.value.scrollHeight, 90)}px`;
    } else {
        inputRef.value.style.height = `${Math.max(inputRef.value.scrollHeight, 45)}px`;
    }
};

const scrollToBottom = () => {
    if (chatWindow.value) {
        const scrollHeight = chatWindow.value.scrollHeight;
        chatWindow.value.scrollTo({
            top: scrollHeight,
            behavior: "smooth",
        });
    }
};

const getCurrentChatName = computed(() => {
    if (!chatManager.value) {
      return 'New Chat';
    }
    const currentChatId = chatManager.value.getCurrentChatId();
    if (currentChatId === null) {
        return 'New Chat';
    }
    const currentChat = chatManager.value.getChatById(currentChatId);
    return currentChat ? currentChat.name : 'New Chat';
});

const groupedChats = computed(() => {
     if (!chatManager.value) {
        return { 'Today': [], 'Yesterday': [], 'Older': [] }; // Return empty object
    }
    const groups = {
        'Today': [],
        'Yesterday': [],
        'Older': []
    };

    chatList.value.forEach(chat => {
        const lastUpdatedDate = new Date(chat.lastUpdated);
        if (isNaN(lastUpdatedDate.getTime())) {
            console.error(`Invalid date for chat ${chat.id}: ${chat.lastUpdated}`);
            return;
        }
        if (isToday(lastUpdatedDate)) {
            groups['Today'].push(chat);
        } else if (isYesterday(lastUpdatedDate)) {
            groups['Yesterday'].push(chat);
        } else {
            groups['Older'].push(chat);
        }
    });

    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => b.lastUpdated - a.lastUpdated);
    });

    return groups;
});

const sortedChats = computed(() => {
    if (!chatList.value) return [];
    return [...chatList.value].sort((a, b) => b.lastUpdated - a.lastUpdated);
});

const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
        return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
        return 'Yesterday';
    } else {
        const days = differenceInDays(new Date(), date);
        if (days < 7) {
            return `${days} days ago`;
        } else {
            return format(date, 'MMM d');
        }
    }
};

const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
};

const deleteChat = (chatId) => {
    if (!chatManager.value) {
       console.error("ChatManager is not initialized.");
       return;
    }
    try {
        chatManager.value.deleteChat(chatId);
        loadChats(); // Reload chats after deleting
    } catch (error) {
        alert(error.message);
    }
};

const startEditing = (chat) => {
    chat.isEditing = true;
    chat.tempName = chat.name;
};

const saveNewName = (chat) => {
    if (chat.tempName.trim() && chatManager.value) {
        chatManager.value.renameChat(chat.id, chat.tempName);
         chat.isEditing = false;
    }
   
};

const openModal = () => {
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const toggleFullScreen = () => {
    fullscreen.value = !fullscreen.value;
    if (!fullscreen.value) {
        position.value = { x: 20, y: 20 };
    }
};

watchEffect(() => {
    if (window.innerWidth < 480) {
        fullscreen.value = true;
    }
});

onUnmounted(() => {
    window.removeEventListener("resize", checkScreenSize);
});
</script>
<style scoped>
/* Theme Variables */
.chatbot-container {
  /* Light Theme - Comforting Palette */
  --bg-primary: #f9fafb; /* Soft white for main background */
  --bg-secondary: #f3f4f6; /* Slightly darker for panels */
  --text-primary: #1f2937; /* Dark gray for primary text */
  --text-secondary: #4b5563; /* Medium gray for secondary text */
  --border-color: #e5e7eb; /* Light gray for borders */
  --accent-primary: #3b82f6; /* Vibrant blue for accents */
  --chat-instance-color: #3e3e40;
    --chat-instance-color-hover: #3e3e40;
    --accent-primary-hover: #ffffff;
  --accent-hover: #2563eb; /* Darker blue for hover states */
  --message-user-bg: #3b82f6; /* User message bubble */
  --message-bot-bg: #ffffff; /* Bot message bubble */
  --action-btn-hover: rgba(59, 130, 246, 0.1); /* Subtle hover effect */
  --modal-bg: #ffffff; /* Modal background */
  --input-bg: #ffffff; /* Input field background */
  --shadow-color: rgba(0, 0, 0, 0.05); /* Soft shadows */
  --surface-elevation: 0 8px 32px rgba(0, 0, 0, 0.08); /* Elevation effect */
}

.chatbot-container.dark-mode {
  /* Dark Theme - Deep and Modern */
    --bg-primary: #262626;
    --bg-secondary: #0b0d13;
    --text-primary: #f9fafbb8;
    --text-secondary: #a4a4a4;
    --border-color: #acacac;
    --accent-primary: #3e3e40;
    --chat-instance-active-color: #161616;
    --chat-instance-color-hover: #3e3e40;
    --accent-primary-hover: #ffffff;
    --accent-hover: #6366f1;
    --message-user-bg: #494949;
    --message-bot-bg: #181818;
    --action-btn-hover: rgba(129, 140, 248, 0.1);
    --modal-bg: #111827;
    --input-bg: #161616;
    --shadow-color: rgba(0, 0, 0, 0.3);
    --surface-elevation: 0 8px 32px rgba(0, 0, 0, 0.3);
}


/* Base Container Styles */
.chatbot-container {
  display: flex;
  background-color: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--surface-elevation);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  transition: all 0.3s ease;
  z-index: 1000;
}

.chatbot-container:not(.fullscreen) {
  width: 380px;
  height: 600px;
  position: fixed;
}

.chatbot-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height:100vh;
  border-radius: 0;
}

/* Drag Handle */
.drag-handle {
  position: absolute;
  z-index:1000;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: var(--bg-secondary);
  border-radius: 16px 16px 0 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.close-handle {
  position: absolute;
  z-index:1000;
  top: 0;
  right: 0;
}


.chatbot-container:not(.fullscreen):hover .drag-handle {
  opacity: 1;
}
.chatbot-container:not(.fullscreen):hover .close-handle {
  opacity: 1;
}
.drag-icon {
  color: var(--text-secondary);
}

/* Left Panel */
.left-panel {
  width: 280px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px;
  color: var(--text-primary);
  z-index: 1000;
}

.chat-group .group-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 8px 12px;
}

.chat-list {
    padding: 0;
    margin: 0;
    gap: 10px;
    display: flex;
    justify-content: space-between;
    align-items: normal;
    flex-direction: column;
}

.chat-list .li {
    padding: 12px;
    margin: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.chat-list .li:hover() {
    /* border: 1px dashed var(--text-primary); */

}

.chat-list .li.active {
  background-color: var(--chat-instance-active-color);
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
}

.chat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-name {
  font-weight: 500;
  color: inherit;
}

.rename-input{
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border:none;
}

.chat-date {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 
.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
} */

.main-chat-area.compact {
  border-radius: 8px;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Chat Window */
/* .chat-window {
  flex: 1;
  max-height:95vh;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
} */

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  backdrop-filter: blur(4px);
  border: 1px solid var(--border-color);
  box-shadow: var(--surface-elevation);
}

.message.user {
  align-self: flex-end;
  background-color: var(--message-user-bg);
  color: white;
  border-color: transparent;
  border-radius: 12px 12px 4px 12px;
}

.message.bot {
  align-self: flex-start;
  background-color: var(--message-bot-bg);
  color: var(--text-primary);
  border-radius: 12px 12px 12px 4px;
}

.message-content {
  line-height: 1.5;
}

.message-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.message-action-btn {
  padding: 6px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.message-action-btn:hover {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
  align-self: center;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: var(--message-bot-bg);
  border-radius: 12px;
  align-self: flex-start;
  width: fit-content;
  margin: 8px 0;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-primary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

/* Input Area */
/* .input-area {
  position: fixed;
    width: -webkit-fill-available;
    width: -moz-available;
    bottom: 1vh;
    padding: 16px;
    display: flex
;
    gap: 12px;
    align-items: center;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    min-height: 4rem;
} */

textarea {
  flex: 1;
  padding: 8px;
  /* border: 2px solid var(--border-color); */
  border-radius: 8px;
  background-color: var(--input-bg);
  color: var(--text-primary);
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  /* border-color: var(--accent-primary); */
  border-color:#d0d0d0;
  /* box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); */
  box-shadow: 0 0 0 1px rgb(255 255 255 / 77%);
}

/* Buttons */
.action-btn {
  padding: 8px;
  background: none;
  border: 1px solid var(--text-primary);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--accent-primary-hover);
  background-color: var(--action-btn-hover);
}

/* Dark Mode Button Animations */
.chatbot-container.dark-mode .action-btn {
  position: relative;
  overflow: hidden;
}

.chatbot-container.dark-mode .action-btn::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 2px solid var(--text-primary);
  border-radius: 8px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.chatbot-container.dark-mode .action-btn:hover::before {
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  opacity: 1;
}

/* Reset Button Animation */
.chatbot-container.dark-mode .reset-btn:hover {
  animation: spin 0.5s ease;
}
.send-btn{
  padding: 12px;
  background-color: #000000;
  max-height: 3rem;
  border: 1.5px solid white;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.send-btn:hover {
    background-color: #ffffff;
    border: 1.5px solid black;
    color: black;
}

.send-btn:disabled {
    background-color: #4b4b4b;
  cursor: not-allowed;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.new-chat-btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    border-radius: 9px;
    background-color: transparent;
    color: var(--text-primary);
    border: 1px solid var(--text-primary);
    transition: all 0.3s ease;
}
/* New Chat Button Animation */
.chatbot-container.dark-mode .new-chat-btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    border-radius: 9px;
    background-color: transparent;
    color: var(--text-primary);
    border: 1px solid var(--text-primary);
    transition: all 0.3s ease;
}

.chatbot-container.dark-mode .new-chat-btn:hover {
  background-color: var(--text-primary);
  color: var(--bg-primary);
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 4px;
  border: 2px solid var(--bg-secondary);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-hover);
}

/* Gradient Border */
.chatbot-container:not(.fullscreen)::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(45deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Modal styles */

.primary-btn{
  padding: 12px;
  background-color: #000000;
  max-height: 3rem;
  border: 1.5px solid white;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.primary-btn:hover {
    background-color: #ffffff;
    border: 1.5px solid black;
    color: black;
}


.text-label{
    color: var(--text-primary);
    margin-bottom: 10px;
}



/* Settings Section */
.settings-section {
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.settings-section h4 {
  margin: 0 0 16px;
  color: var(--text-primary);
}

.settings-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-top: 4px;
  background-color: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.settings-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.temperature-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temperature-slider {
  flex: 1;
}

.temperature-value {
  min-width: 40px;
  text-align: right;
}
/* Tooltip styles */
[v-tooltip] {
  position: relative;
}

[v-tooltip]:hover::after {
  content: attr(v-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background-color: #1e293b;
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 6px;
}


.chats-list {
  max-height: 200px; /* Fixed height */
  overflow-y: auto; /* Vertical scroll */
  overflow-x: hidden; /* Prevent horizontal overflow */
  padding-right: 8px; /* Space for scrollbar */
}

/* Thin scrollbar styling */
.chats-list::-webkit-scrollbar {
  width: 6px; /* Thin scrollbar */
}

.chats-list::-webkit-scrollbar-track {
  background: #f1f5f9; /* Light track color */
  border-radius: 3px;
}

.chats-list::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* Scrollbar thumb color */
  border-radius: 3px;
}

.chats-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; /* Hover color */
}


.chat-group {
    margin: 2rem 0 2rem 0;
}
.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: var(--input-bg);
  color: var(--text-primary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  border: 1px solid #e2e8f0; /* Border for inset effect */
  transition: all 0.2s ease;
}
.chat-actions {
    display: flex;
    gap: 8px;
    max-height: 30px;
}
.chat-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Hover shadow */
  transform: translateY(-1px); /* Slight lift on hover */
}

/* 
.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  height: 100%; 
  position: relative; 
} */

.main-chat-area.compact {
  border-radius: 8px;
}

/* Chat Window Container */
/* .chat-window-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 65px);
  position: relative;
} */

/* Chat Window */
/* .chat-window {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100% - 80px); 
  margin-bottom: 80px; 
} */

/* Input Area */
/* .input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  min-height: 4rem;
  z-index: 10; 
} */

/* Fullscreen adjustments */
/* .chatbot-container.fullscreen .chat-window {
  height: calc(100vh - 200px); 
} */

/* .chatbot-container.fullscreen .input-area {
  position: fixed;
  bottom: 0;
} */

/* Main Chat Area */
.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  height: 100%;
  position: relative;
  overflow: hidden; /* Prevent content from spilling outside */
}

/* Chat Window Container */
.chat-window-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 65px); /* Subtract header height */
  position: relative;
  overflow: hidden; /* Contain scrolling content */
}

/* Chat Window */
.chat-window {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100% - 80px);
  margin-bottom: 80px;
  padding-bottom: 20px; /* Add padding to prevent content from being hidden behind input */
}

/* Input Area */
.input-area {
  position: absolute; /* Changed from fixed to absolute */
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  min-height: 4rem;
  z-index: 10;
  width: auto; /* Let it fit container width */
}

/* Handle fullscreen mode specifically */
.chatbot-container.fullscreen .chat-window {
  height: calc(100vh - 200px);
}

/* .chatbot-container.fullscreen .input-area {
  width: calc(100% - 280px); 
  right: 0;
  margin-left: auto; 
} */

/* When sidebar is closed in fullscreen */
@media (max-width: 768px) {
  .chatbot-container.fullscreen .input-area {
    width: 100%; /* Take full width when sidebar is hidden */
  }
}

/* Handle small screen sizes */
@media (max-width: 500px) {
  .input-area {
    width: 100%;
  }
}
</style>