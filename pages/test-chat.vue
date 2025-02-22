<template>
    <!-- <ChatBox
      :fullscreen.sync="isChatFullscreen"
      :initialApiKey="myApiKey"
      initialModel="gemini-2.0-flash-exp"
      :generateResponseFn="myCustomResponseFunction"
       leftPanelClass="my-custom-left-panel"
      :chatWindowContainerClass="'bg-red-100'"
    >
      <template #trigger>
        <span class="material-symbols-outlined"> chat </span>
      </template>
      <template #leftPanel="{ groupedChats, selectChat, currentChatIndex, startNewChat }">
         <div>Custom Left Panel</div>
        <div v-for="(group, label) in groupedChats" :key="label">
             <h4>{{label}}</h4>
          <div v-for="chat in group" :key="chat.id" @click="selectChat(chat.id)" :class="{active: currentChatIndex == chat.id}">
            {{ chat.name }} - {{chat.id}}
          </div>
        </div>
        <button @click="startNewChat">Start New Chat + </button>
      </template>
        <template #header="{ getCurrentChatName, toggleFullScreen, isSidebarOpen, toggleSidebar, closeChat }">
        <div class="my-custom-header">
           <button v-if="isSidebarOpen" @click="toggleSidebar">
            Toggle Sidebar
          </button>
          <h3>{{ getCurrentChatName }}</h3>
          <button @click="toggleFullScreen">Toggle Fullscreen</button>
            <button @click="closeChat">Close</button>
  
        </div>
      </template>
  
      <template #chatWindow="{ messages, isTyping, regenerateResponse, copyMessage, formatMessageTime }">
        <div v-for="(message, index) in messages" :key="index" class="custom-message">
          <p v-html="message.text"></p>
           <p>{{formatMessageTime(message.timestamp)}}</p>
          <button v-if="message.sender === 'bot'" @click="regenerateResponse(index)">Regenerate</button>
          <button v-if="message.sender === 'bot'" @click="copyMessage(message.text)">Copy</button>
        </div>
        <div v-if="isTyping">Typing...</div>
      </template>
  
       <template #inputArea="{userInput, sendMessage}">
          <input type="text" v-model="userInputVal" @keyup.enter="sendMessageWrapper">
          <button @click="sendMessageWrapper" :disabled="!userInputVal.trim()">
              Send
          </button>
       </template>
  
       <template #modalBody="{ apiKey, selectedModel, temperature, sortedChats, startEditing, saveNewName, deleteChat, formatDate }">
          <div>Custom Modal Body</div>
          <div>API Key: <input type="text" v-model="apiKey"></div>
          <div>Model: <select v-model="selectedModel">
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b</option>
                <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
          </select></div>
          <div>
              <h4>Chats</h4>
              <div v-for="chat in sortedChats" :key="chat.id">
                  <div v-if="!chat.isEditing">
                      <span>{{chat.name}}</span>
                      <span>{{formatDate(chat.lastUpdated)}}</span>
                  </div>
                   <input
                    v-else
                    v-model="chat.tempName"
                    @blur="saveNewName(chat)"
                    @keyup.enter="saveNewName(chat)"
                    class="rename-input"
                  />
                   <button @click="startEditing(chat)" >
                    Edit
                  </button>
                  <button @click="deleteChat(chat.id)">
                    Delete
                  </button>
              </div>
          </div>
       </template>
       <template #modalFooter>
          <button @click="closeModal">Custom Close</button>
       </template>
    </ChatBox> -->
    <ModernChatBotStylish />
  </template>
  
