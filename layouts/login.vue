<template>
    <div>
            <header>
                <div class="header-container">
                <div class="logo">BookBloom</div>
                <nav class="header-nav">
                    <NuxtLink to="/" class="nav-link">{{ 'home' }}</NuxtLink>
                    <NuxtLink to="/write" class="nav-link">{{ 'write' }}</NuxtLink>
                    <NuxtLink to="/library" class="nav-link">{{ 'library' }}</NuxtLink>
                    <NuxtLink to="/series" class="nav-link">{{ 'series' }}</NuxtLink>
                    <NuxtLink to="/ranking" class="nav-link">{{ 'ranking' }}</NuxtLink>
                </nav>
                </div>
            </header>

            <slot/>
        
            <footer class="main-footer">
                <p>&copy; 2025 BookBloom. All rights reserved.</p>
            </footer>

    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { openDB } from 'idb';
  export default {
    setup() {
    },
};
  </script>
  
  <style scoped>
    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: #f0f0f0;
    }
    .header-nav {
        display: flex;
        gap: 20px; /* Adjust spacing as needed */
    }

    .mode-toggle {
        margin-right: 20px; /* Add some spacing */
    }
    .write-novel-button-container {
        position: fixed; /* Stick to the bottom */
        bottom: 20px; /* Adjust distance from bottom */
        left: 50%;
        transform: translateX(-50%); /* Center horizontally */
        z-index: 100; /* Ensure it's on top of other content */
    }

    .write-novel-button {
        background-color: #007bff; /* Example color */
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 1.2em;
        cursor: pointer;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); /* Add a subtle shadow */
        transition: background-color 0.3s;
    }

    .write-novel-button:hover {
        background-color: #0056b3;
    }

    .nav-link {
        text-decoration: none;
        color: #333; /* Or your preferred color */
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 5px; /* Optional: Add rounded corners */
        transition: background-color 0.3s; /* Smooth hover effect */
    }

    .nav-link:hover {
        background-color: #ddd; /* Change background on hover */
    }
  .main-content {
      min-height: 100vh;
      padding: 20px;
      display: flex;
      gap: 20px;
  }
  .main-footer{
      background-color: #333;
      color: white;
      text-align: center;
      padding: 10px 0;
      margin-top: auto;
  }
  </style>