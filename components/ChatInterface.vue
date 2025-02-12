<template>
    <div :class="['chatbot-container', { fullscreen }]">
      <!-- Left Panel (Visible in Fullscreen) -->
      <div v-if="fullscreen" class="left-panel">
        <h3>Chats</h3>
        <div class="chat-group">
          <h4>Today</h4>
          <ul>
            <li
              v-for="(chat, index) in todayChats"
              :key="index"
              @click="selectChat(index)"
              :class="{ active: currentChatIndex === index }"
            >
              {{ chat.name }}
              <button @click.stop="deleteChat(index)" class="delete-btn" title="Delete Chat">
                <Trash />
              </button>
              <button @click.stop="renameChat(index)" class="rename-btn" title="Rename Chat">
                <Edit />
              </button>
            </li>
          </ul>
        </div>
        <div class="chat-group">
          <h4>Yesterday</h4>
          <ul>
            <li
              v-for="(chat, index) in yesterdayChats"
              :key="index"
              @click="selectChat(index)"
              :class="{ active: currentChatIndex === index }"
            >
              {{ chat.name }}
              <button @click.stop="deleteChat(index)" class="delete-btn" title="Delete Chat">
                <Trash />
              </button>
              <button @click.stop="renameChat(index)" class="rename-btn" title="Rename Chat">
                <Edit />
              </button>
            </li>
          </ul>
        </div>
        <div class="chat-group">
          <h4>Older</h4>
          <ul>
            <li
              v-for="(chat, index) in olderChats"
              :key="index"
              @click="selectChat(index)"
              :class="{ active: currentChatIndex === index }"
            >
              {{ chat.name }}
              <button @click.stop="deleteChat(index)" class="delete-btn" title="Delete Chat">
                <Trash />
              </button>
              <button @click.stop="renameChat(index)" class="rename-btn" title="Rename Chat">
                <Edit />
              </button>
            </li>
          </ul>
        </div>
        <button @click="startNewChat" class="new-chat-btn">+ New Chat</button>
      </div>
  
      <!-- Main Chat Area -->
      <div class="main-chat-area">
        <!-- Chat Window -->
        <div class="chat-window">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender]">
            {{ message.text }}
          </div>
        </div>
  
        <!-- Floating Input Area -->
        <div class="floating-input-area">
          <input
            v-model="userInput"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
          />
          <div class="action-buttons">
            <button @click="toggleFullScreen" class="icon-btn" title="Toggle Fullscreen">
              <Maximize v-if="!fullscreen" />
              <Minimize v-else />
            </button>
            <button @click="openModal" class="icon-btn" title="Settings">
              <Settings />
            </button>
            <button @click="sendMessage" class="send-btn" title="Send Message">
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal for Custom Settings -->
      <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal">
          <h3>Custom Settings</h3>
          <label>
            API Key:
            <input type="text" v-model="apiKey" placeholder="Enter API Key" />
          </label>
          <label>
            Model:
            <select v-model="selectedModel">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="custom">Custom Model</option>
            </select>
          </label>
          <label>
            Temperature:
            <input type="range" v-model="temperature" min="0" max="1" step="0.1" />
            {{ temperature }}
          </label>
          <h4>Manage Chats</h4>
          <div class="chat-list">
            <ul>
              <li v-for="(chat, index) in chatList" :key="index">
                <input
                  type="text"
                  v-model="chat.name"
                  @blur="saveChatName(index)"
                  @keyup.enter="saveChatName(index)"
                />
                <span>{{ formatDate(chat.date) }}</span>
                <button @click="deleteChatFromModal(index)" class="delete-btn" title="Delete Chat">
                  <Trash />
                </button>
              </li>
            </ul>
          </div>
          <button @click="closeModal">Save & Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import localforage from 'localforage';
  import {
   Maximize,
   Minimize,
   Settings,
   Trash,
   Edit,
   ArrowRight,
  } from 'lucide-vue-next';
  
  export default {
    name: "ChatbotInterface",
    components: {
     Maximize,
     Minimize,
     Settings,
     Trash,
     Edit,
     ArrowRight,
    },
    setup() {
      const messages = ref([]);
      const userInput = ref("");
      const fullscreen = ref(false);
      const isModalOpen = ref(false);
      const apiKey = ref("");
      const selectedModel = ref("gpt-3.5-turbo");
      const temperature = ref(0.7);
      const chatList = ref([]); // List of chats
      const currentChatIndex = ref(0);
  
      // Load chats from IndexedDB on mount
      onMounted(async () => {
        try {
          const storedChats = await localforage.getItem('chats');
          if (storedChats) {
            chatList.value = storedChats;
            if (chatList.value.length > 0) {
              selectChat(0);
            }
          } else {
            chatList.value.push({ name: "Chat 1", date: new Date(), messages: [] });
          }
        } catch (error) {
          console.error("Error loading chats:", error);
        }
      });
  
      // Function to handle sending messages
      const sendMessage = () => {
        if (userInput.value.trim() === "") return;
  
        // Add user message to the chat
        messages.value.push({ sender: "user", text: userInput.value });
  
        // Update chat date
        chatList.value[currentChatIndex.value].date = new Date();
  
        // Simulate bot response
        setTimeout(() => {
          const botResponse = getBotResponse(userInput.value);
          messages.value.push({ sender: "bot", text: botResponse });
          saveChats();
        }, 500);
  
        // Clear input field
        userInput.value = "";
      };
  
      // Function to generate bot responses
      const getBotResponse = (userMessage) => {
        const lowerCaseMessage = userMessage.toLowerCase();
  
        if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
          return "Hello! How can I assist you today?";
        } else if (lowerCaseMessage.includes("help")) {
          return "Sure! What do you need help with?";
        } else if (lowerCaseMessage.includes("bye")) {
          return "Goodbye! Have a great day!";
        } else {
          return "I'm not sure how to respond to that. Can you clarify?";
        }
      };
  
      // Toggle Fullscreen Mode
      const toggleFullScreen = () => {
        fullscreen.value = !fullscreen.value;
      };
  
      // Open Modal
      const openModal = () => {
        isModalOpen.value = true;
      };
  
      // Close Modal
      const closeModal = () => {
        isModalOpen.value = false;
      };
  
      // Select Chat
      const selectChat = (index) => {
        currentChatIndex.value = index;
        messages.value = chatList.value[index].messages;
      };
  
      // Start New Chat
      const startNewChat = () => {
        chatList.value.push({ name: `Chat ${chatList.value.length + 1}`, date: new Date(), messages: [] });
        currentChatIndex.value = chatList.value.length - 1;
        messages.value = [];
        saveChats();
      };
  
      // Delete Chat
      const deleteChat = (index) => {
        if (chatList.value.length === 1) {
          alert("You cannot delete the last chat.");
          return;
        }
  
        chatList.value.splice(index, 1);
        if (currentChatIndex.value === index) {
          currentChatIndex.value = Math.max(0, index - 1);
          messages.value = chatList.value[currentChatIndex.value]?.messages || [];
        }
        saveChats();
      };
  
      // Delete Chat from Modal
      const deleteChatFromModal = (index) => {
        deleteChat(index);
        closeModal();
      };
  
      // Rename Chat
      const renameChat = (index) => {
        const newName = prompt("Enter a new name for the chat:", chatList.value[index].name);
        if (newName && newName.trim()) {
          chatList.value[index].name = newName.trim();
          saveChats();
        }
      };
  
      // Save Chat Name
      const saveChatName = (index) => {
        saveChats();
      };
  
      // Save Chats to IndexedDB
      const saveChats = async () => {
        try {
          await localforage.setItem('chats', chatList.value);
        } catch (error) {
          console.error("Error saving chats:", error);
        }
      };
  
      // Format Date
      const formatDate = (date) => {
        const now = new Date();
        const diffTime = Math.abs(now - new Date(date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
      };
  
      // Computed Properties for Sorted Chats
      const todayChats = computed(() =>
        chatList.value.filter((chat) => formatDate(chat.date) === "Today")
      );
      const yesterdayChats = computed(() =>
        chatList.value.filter((chat) => formatDate(chat.date) === "Yesterday")
      );
      const olderChats = computed(() =>
        chatList.value.filter((chat) => formatDate(chat.date).includes("days ago"))
      );
  
      return {
        messages,
        userInput,
        fullscreen,
        isModalOpen,
        apiKey,
        selectedModel,
        temperature,
        chatList,
        currentChatIndex,
        sendMessage,
        toggleFullScreen,
        openModal,
        closeModal,
        selectChat,
        startNewChat,
        deleteChat,
        deleteChatFromModal,
        renameChat,
        saveChatName,
        formatDate,
        todayChats,
        yesterdayChats,
        olderChats,
      };
    },
  };
  </script>
  
  <style scoped>
  .chatbot-container {
    display: flex;
    flex-direction: column;
    width: 400px;
    height: 600px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    position: relative;
    background-color: #f9f9f9;
  }
  
  .chatbot-container.fullscreen {
    width: 100%;
    height: 100vh;
    border: none;
    border-radius: 0;
    box-shadow: none;
    flex-direction: row;
  }
  
  .left-panel {
    width: 250px;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .left-panel h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #ecf0f1;
  }
  
  .chat-group {
    margin-bottom: 10px;
  }
  
  .chat-group h4 {
    margin: 0 0 5px;
    font-size: 14px;
    color: #bdc3c7;
  }
  
  .left-panel ul {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    overflow-y: auto;
  }
  
  .left-panel li {
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s ease;
  }
  
  .left-panel li.active {
    background-color: #34495e;
  }
  
  .left-panel li:hover {
    background-color: #34495e;
  }
  
  .delete-btn,
  .rename-btn {
    background: none;
    border: none;
    color: #ecf0f1;
    cursor: pointer;
    font-size: 16px;
  }
  
  .new-chat-btn {
    padding: 10px;
    background-color: #1abc9c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s ease;
  }
  
  .new-chat-btn:hover {
    background-color: #16a085;
  }
  
  .main-chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
  }
  
  .chat-window {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: #f9f9f9;
    border-bottom: 1px solid #ddd;
  }
  
  .message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    max-width: 80%;
  }
  
  .message.user {
    align-self: flex-end;
    background-color: #1abc9c;
    color: white;
  }
  
  .message.bot {
    align-self: flex-start;
    background-color: #ecf0f1;
    color: #2c3e50;
  }
  
  .floating-input-area {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #ffffff;
    border-top: 1px solid #ddd;
    box-shadow: inset 0 -4px 6px -4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin: 0 10px;
    position: relative;
    bottom: 10px;
  }
  
  .floating-input-area input {
    flex: 1;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    height: 40px;
  }
  
  .action-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 10px;
  }
  
  .icon-btn {
    background: none;
    border: none;
    color: #2c3e50;
    cursor: pointer;
    font-size: 20px;
    transition: color 0.2s ease;
  }
  
  .icon-btn:hover {
    color: #1abc9c;
  }
  
  .send-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #1abc9c;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }
  
  .send-btn:hover {
    background-color: #16a085;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .modal label {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .modal input[type="range"] {
    width: 100%;
  }
  
  .chat-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .chat-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .chat-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }
  
  .chat-list input {
    flex: 1;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>