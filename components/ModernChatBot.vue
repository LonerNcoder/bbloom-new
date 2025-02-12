<template>
    <div 
      :class="['chatbot-container', { fullscreen }]"
      :style="!fullscreen ? positionStyle : {}"
      ref="chatbotRef"
    >
      <div 
        v-if="!fullscreen"
        class="drag-handle"
        @mousedown="startDragging"
        @touchstart="startDragging"
      >
        <Grip size="16" class="drag-icon" />
      </div>
  
      <!-- Left Panel (Visible in Fullscreen) -->
      <div v-if="fullscreen" class="left-panel">
      <h3>Conversations</h3>
      <div v-for="(group, label) in groupedChats" :key="label" class="chat-group">
        <div v-if="group.length > 0">
        <div class="group-label">{{ label }}</div>
        <ul class="chat-list">
          <li
            v-for="chat in group"
            :key="chat.id"
            @click="selectChat(chat.id)"
            :class="{ active: currentChatIndex === chat.id }"
          >
            <div class="chat-info">
              <span class="chat-name">{{ chat.name }}</span>
              <span class="chat-date">{{ formatTime(chat.lastUpdated) }}</span>
            </div>
            <div class="chat-actions">
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
                v-tooltip="'Rename Chat'"
              >
                <Edit2 size="16" />
              </button>
              <button 
                @click.stop="deleteChat(chat.id)" 
                class="action-btn"
                v-tooltip="'Delete Chat'"
              >
                <Trash size="16" />
              </button>
            </div>
          </li>
        </ul>
      </div>
      </div>
      <button @click="startNewChat" class="new-chat-btn">
        <Plus size="16" />
        New Chat
      </button>
    </div>
  
      <!-- Main Chat Area -->
      <div class="main-chat-area" :class="{ 'compact': !fullscreen }">
        <!-- Header -->
        <div class="chat-header">
          <h3>{{ getCurrentChatName }}</h3>
          <div class="header-actions">
            <button 
              @click="toggleFullScreen" 
              class="action-btn"
              v-tooltip="fullscreen ? 'Minimize' : 'Expand'"
            >
              <Maximize v-if="!fullscreen" size="16" />
              <Minimize v-else size="16" />
            </button>
            <button 
              @click="openModal" 
              class="action-btn"
              v-tooltip="'Settings'"
            >
              <Settings size="16" />
            </button>
          </div>
        </div>
  
        <!-- Chat Window -->
        <div class="chat-window" ref="chatWindow">
          <div v-for="(message, index) in messages" :key="index" class="message-wrapper">
            <div :class="['message', message.sender]">
              <div class="message-content">{{ message.text }}</div>
              <div class="message-actions">
                <button 
                  v-if="message.sender === 'bot'"
                  @click="regenerateResponse(index)"
                  class="action-btn"
                  v-tooltip="'Regenerate'"
                >
                  <RefreshCw size="14" />
                </button>
                <button 
                    v-if="message.sender === 'bot'"
                  @click="copyMessage(message.text)"
                  class="action-btn"
                  v-tooltip="'Copy'"
                >
                  <Copy size="14" />
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
        </div>
  
        <!-- Input Area -->
        <div class="input-area">
          <textarea
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            placeholder="Type your message..."
            rows="1"
            ref="inputRef"
          ></textarea>
          <button 
            @click="sendMessage" 
            class="send-btn"
            :disabled="!userInput.trim()"
            v-tooltip="'Send Message'"
          >
            <Send size="18" />
          </button>
        </div>
      </div>
  
      <!-- Settings Modal -->
      <Modal v-if="isModalOpen" @close="closeModal">
        <template #header>
          <h3>Settings</h3>
        </template>
        
        <template #body>
          <div class="settings-section">
            <h4>API Settings</h4>
            <label>
              API Key:
              <input 
                type="password" 
                v-model="apiKey" 
                placeholder="Enter API Key" 
                class="settings-input"
              />
            </label>
            <label>
              Model:
              <select v-model="selectedModel" class="settings-input">
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </label>
            <label>
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
  
          <!-- <div class="settings-section">
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
                    v-tooltip="'Rename Chat'"
                  >
                    <Edit2 size="16" />
                  </button>
                  <button 
                    @click="deleteChat(chat.id)"
                    class="action-btn"
                    v-tooltip="'Delete Chat'"
                  >
                    <Trash size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div> -->
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
            v-tooltip="'Rename Chat'"
            >
            <Edit2 size="16" />
            </button>
            <button 
            @click="deleteChat(chat.id)"
            class="action-btn"
            v-tooltip="'Delete Chat'"
            >
            <Trash size="16" />
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
  
  <script>
  import { ref, computed, onMounted, nextTick, watch } from 'vue';
  import { 
    Maximize, 
    Minimize, 
    Settings,
    Trash,
    Edit2,
    Send,
    Plus,
    Copy,
    RefreshCw,
    Grip
  } from 'lucide-vue-next';
  import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
  
  export default {
    name: "ChatbotInterface",
    components: {
      Maximize,
      Minimize,
      Settings,
      Trash,
      Edit2,
      Send,
      Plus,
      Copy,
      RefreshCw,
      Grip
    },
  
    setup() {
      const chatbotRef = ref(null);
      const chatWindow = ref(null);
      const inputRef = ref(null);
      const position = ref({ x: 20, y: 20 });
      const isDragging = ref(false);
      const dragOffset = ref({ x: 0, y: 0 });
      const messages = ref([]);
      const userInput = ref("");
      const fullscreen = ref(false);
      const isModalOpen = ref(false);
      const isTyping = ref(false);
      const apiKey = ref("");
      const selectedModel = ref("gpt-3.5-turbo");
      const temperature = ref(0.7);
      const currentChatIndex = ref(null);
      const chatList = ref([]);
  
      // Load position from localStorage
      onMounted(() => {
        const savedPosition = localStorage.getItem('chatbotPosition');
        if (savedPosition) {
          position.value = JSON.parse(savedPosition);
        }
        loadChats();
        adjustInputHeight();
      });
  
      // Watch for position changes and save to localStorage
      watch(position, (newPosition) => {
        localStorage.setItem('chatbotPosition', JSON.stringify(newPosition));
      });
  
      // Computed position style
      const positionStyle = computed(() => ({
        position: 'fixed',
        left: `${position.value.x}px`,
        top: `${position.value.y}px`
      }));
  
      // Dragging functions
      const startDragging = (event) => {
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
  
      const handleDrag = (event) => {
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
  
      // Chat management functions
      const loadChats = async () => {
        try {
          const storedChats = localStorage.getItem('chats');
          if (storedChats) {
            chatList.value = JSON.parse(storedChats);
            if (chatList.value.length > 0) {
              selectChat(chatList.value[0].id);
            }
          } else {
            startNewChat();
          }
        } catch (error) {
          console.error("Error loading chats:", error);
        }
      };
  
      const saveChats = () => {
        localStorage.setItem('chats', JSON.stringify(chatList.value));
      };
  
      const startNewChat = () => {
        const newChat = {
          id: Date.now(),
          name: `Chat ${chatList.value.length + 1}`,
          messages: [],
          lastUpdated: Date.now(),
          isEditing: false,
          tempName: ''
        };
        chatList.value.push(newChat);
        selectChat(newChat.id);
        saveChats();
      };
  
      const selectChat = (chatId) => {
        currentChatIndex.value = chatId;
        const chat = chatList.value.find(c => c.id === chatId);
        if (chat) {
          messages.value = chat.messages;
        }
      };
  
      // Message handling
      const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  const currentChat = chatList.value.find((c) => c.id === currentChatIndex.value);
  if (!currentChat) return;

  const userMessage = {
    sender: "user",
    text: userInput.value,
    timestamp: Date.now(),
  };

  // Add user message to the chat
  messages.value.push(userMessage);
  currentChat.messages = messages.value;
  currentChat.lastUpdated = Date.now();
  userInput.value = "";
  adjustInputHeight();

  // Wait for the DOM to update
  await nextTick();
  scrollToBottom(); // Scroll to the bottom after the user message is added

  // Show typing indicator
  isTyping.value = true;

  // Wait for the DOM to update again (to ensure the typing indicator is rendered)
  await nextTick();
  scrollToBottom(); // Scroll to the bottom to show the typing indicator

  // Simulate bot response
  setTimeout(async () => {
    const botMessage = {
      sender: "bot",
      text: getBotResponse(userMessage.text),
      timestamp: Date.now(),
    };
    messages.value.push(botMessage);
    currentChat.messages = messages.value;
    currentChat.lastUpdated = Date.now();
    isTyping.value = false;

    // Wait for the DOM to update again
    await nextTick();
    scrollToBottom(); // Scroll to the bottom after the bot response is added
  }, 1000);
};
        
      const regenerateResponse = async (messageIndex) => {
        const currentChat = chatList.value.find(c => c.id === currentChatIndex.value);
        if (!currentChat) return;
  
        isTyping.value = true;
        
        // Remove the old response
        messages.value.splice(messageIndex, 1);
        
        // Generate new response
        setTimeout(() => {
          const newResponse = {
            sender: "bot",
            text: getBotResponse(messages.value[messageIndex - 1].text),
            timestamp: Date.now()
          };
          messages.value.splice(messageIndex, 0, newResponse);
          currentChat.messages = messages.value;
          currentChat.lastUpdated = Date.now();
          isTyping.value = false;
          saveChats();
        }, 1000);
      };
  
      const copyMessage = (text) => {
        navigator.clipboard.writeText(text);
      };
  
      // Utility functions
      const adjustInputHeight = () => {
        if (!inputRef.value) return;
        
        inputRef.value.style.height = 'auto';
        if(fullscreen.value){
            inputRef.value.style.height = `${Math.max(inputRef.value.scrollHeight,90)}px`;
        }else{
            inputRef.value.style.height = `${Math.max(inputRef.value.scrollHeight,60)}px`;

        }
      };
  
      const scrollToBottom = () => {
        if (chatWindow.value) {
            // Use `scrollHeight` to get the total height of the chat window content
            const scrollHeight = chatWindow.value.scrollHeight;

            // Smoothly scroll to the bottom
            chatWindow.value.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
            });
        }
        };
  
      // Computed properties
      const getCurrentChatName = computed(() => {
        const currentChat = chatList.value.find(c => c.id === currentChatIndex.value);
        return currentChat ? currentChat.name : 'New Chat';
      });
  
      // Rest of the implementation remains the same...
      // (groupedChats, sortedChats, formatting functions
      // Computed properties for chat organization
    // const groupedChats = computed(() => {
    //   const groups = {
    //     'Today': [],
    //     'Yesterday': [],
    //     'Older': []
    //   };

    //   chatList.value.forEach(chat => {
    //     const date = new Date(chat.lastUpdated);
    //     if (isToday(date)) {
    //       groups['Today'].push(chat);
    //     } else if (isYesterday(date)) {
    //       groups['Yesterday'].push(chat);
    //     } else {
    //       groups['Older'].push(chat);
    //     }
    //   });

    //   // Sort chats within each group by lastUpdated
    //   Object.keys(groups).forEach(key => {
    //     groups[key].sort((a, b) => b.lastUpdated - a.lastUpdated);
    //   });

    //   return groups;
    // });

    const groupedChats = computed(() => {
  const groups = {
    'Today': [],
    'Yesterday': [],
    'Older': []
  };

  chatList.value.forEach(chat => {
    // Ensure lastUpdated is a valid date
    const lastUpdatedDate = new Date(chat.lastUpdated);
    if (isNaN(lastUpdatedDate.getTime())) {
      console.error(`Invalid date for chat ${chat.id}: ${chat.lastUpdated}`);
      return;
    }

    // Debugging: Log the date and grouping logic
    console.log(`Chat ${chat.id}:`, {
      name: chat.name,
      lastUpdated: chat.lastUpdated,
      date: lastUpdatedDate,
      isToday: isToday(lastUpdatedDate),
      isYesterday: isYesterday(lastUpdatedDate)
    });

    // Group chats
    if (isToday(lastUpdatedDate)) {
      groups['Today'].push(chat);
    } else if (isYesterday(lastUpdatedDate)) {
      groups['Yesterday'].push(chat);
    } else {
      groups['Older'].push(chat);
    }
  });

  // Debugging: Log the final groups
  console.log('Grouped Chats:', groups);

  // Sort chats within each group by lastUpdated (newest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => b.lastUpdated - a.lastUpdated);
  });

  return groups;
});

    const sortedChats = computed(() => {
      return [...chatList.value].sort((a, b) => b.lastUpdated - a.lastUpdated);
    });

    // Formatting functions
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

    // Chat management functions
    const deleteChat = (chatId) => {
      if (chatList.value.length === 1) {
        alert("You cannot delete the last chat.");
        return;
      }

      const index = chatList.value.findIndex(c => c.id === chatId);
      chatList.value.splice(index, 1);
      
      if (currentChatIndex.value === chatId) {
        selectChat(chatList.value[0].id);
      }
      saveChats();
    };

    const startEditing = (chat) => {
      chat.isEditing = true;
      chat.tempName = chat.name;
      nextTick(() => {
        const input = document.querySelector('.rename-input');
        if (input) input.focus();
      });
    };

    const saveNewName = (chat) => {
      if (chat.tempName.trim()) {
        chat.name = chat.tempName.trim();
      }
      chat.isEditing = false;
      saveChats();
    };

    // Bot response function
    const getBotResponse = (userMessage) => {
      const responses = [
        "I understand what you're saying. Could you tell me more?",
        "That's interesting! Let me help you with that.",
        "I see what you mean. Here's what I think...",
        "Thanks for sharing that. Would you like to explore this further?",
        "I appreciate your perspective. Let me offer a suggestion..."
      ];
      
      // Simple matching for common phrases
      const lowerCaseMessage = userMessage.toLowerCase();
      
      if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
        return "Hello! How can I assist you today?";
      } else if (lowerCaseMessage.includes("help")) {
        return "I'd be happy to help! What specific assistance do you need?";
      } else if (lowerCaseMessage.includes("bye") || lowerCaseMessage.includes("goodbye")) {
        return "Goodbye! Feel free to return if you need anything else.";
      } else if (lowerCaseMessage.includes("thank")) {
        return "You're welcome! Is there anything else you'd like to know?";
      } else {
        // Return a random response for other messages
        return responses[Math.floor(Math.random() * responses.length)];
      }
    };

    // Modal management
    const openModal = () => {
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    // Toggle fullscreen
    const toggleFullScreen = () => {
      fullscreen.value = !fullscreen.value;
      if (!fullscreen.value) {
        // Reset position when minimizing
        position.value = { x: 20, y: 20 };
      }
    };

    // Watch for input changes to adjust height
    watch(userInput, () => {
      adjustInputHeight();
    });

    return {
      chatbotRef,
      chatWindow,
      inputRef,
      messages,
      userInput,
      fullscreen,
      isModalOpen,
      isTyping,
      apiKey,
      selectedModel,
      temperature,
      currentChatIndex,
      chatList,
      position,
      positionStyle,
      isDragging,
      groupedChats,
      sortedChats,
      getCurrentChatName,
      sendMessage,
      regenerateResponse,
      copyMessage,
      toggleFullScreen,
      openModal,
      closeModal,
      selectChat,
      startNewChat,
      deleteChat,
      startEditing,
      saveNewName,
      startDragging,
      formatDate,
      formatTime,
      formatMessageTime
    };
  }
};
</script>

<style scoped>
.chatbot-container {
  display: flex;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  transition: all 0.3s ease;
  z-index: 1000;
}

.chatbot-container:not(.fullscreen) {
  width: 380px;
  height: 600px;
}

.chatbot-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 12px 12px 0 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chatbot-container:not(.fullscreen):hover .drag-handle {
  opacity: 1;
}

.drag-icon {
  color: #94a3b8;
}

.left-panel {
  width: 280px;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-list li {
  padding: 12px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-list li:hover {
  background-color: #f1f5f9;
}

.chat-list li.active {
  background-color: #e2e8f0;
}

.chat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-name {
  font-weight: 500;
  color: #1e293b;
}

.chat-date {
  font-size: 12px;
  color: #64748b;
}

.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.main-chat-area.compact {
  border-radius: 12px;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* .chat-window {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
} */

/* .message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
} */

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot {
  align-self: flex-start;
  background-color: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.message-content {
  line-height: 1.5;
}

/* .message-actions {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
} */

.message-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* .message:hover .message-actions {
  opacity: 1;
} */

.message-wrapper:hover .message-actions {
  opacity: 1;
}
.message-time {
  font-size: 12px;
  color: #64748b;
  align-self: center;
}

/* .typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  margin-bottom: 3rem;
  background-color: #f1f5f9;
  border-radius: 12px;
  align-self: flex-start;
  width: fit-content;
} */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: #f1f5f9;
  border-radius: 12px;
  align-self: flex-start;
  width: fit-content;
  margin: 8px 0; /* Add margin to ensure spacing */
  position: relative; /* Ensure it stays within the chat window */
}

/* Ensure the typing indicator is visible in non-fullscreen mode */
.chat-window {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative; /* Ensure the chat window is a positioning context */
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.input-area {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  min-height: 6rem;
}

textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: none;
  max-height: 120px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

textarea:focus {
  outline: none;
  border-color: #2563eb;
}

.action-btn {
  padding: 8px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #2563eb;
  background-color: #f1f5f9;
}

.send-btn {
  padding: 12px;
  background-color: #2563eb;
  max-height: 3rem;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.send-btn:hover {
  background-color: #1d4ed8;
}

.send-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* Modal styles */
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
  z-index: 1100;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h4 {
  margin: 0 0 16px;
  color: #1e293b;
}

.settings-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-top: 4px;
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


.settings-section {
  margin-bottom: 24px;
}

.settings-section h4 {
  margin: 0 0 16px;
  color: #1e293b;
}

.chats-list {
  max-height: 300px; /* Fixed height */
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

.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  border: 1px solid #e2e8f0; /* Border for inset effect */
  transition: all 0.2s ease;
}

.chat-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Hover shadow */
  transform: translateY(-1px); /* Slight lift on hover */
}

.chat-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-details span {
  font-size: 14px;
  color: #1e293b;
}

.chat-date {
  font-size: 12px;
  color: #64748b;
}

.rename-input {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #2563eb;
  background-color: #f1f5f9;
}
</style>