<template>
    <div class="music-player">
      <!-- Top Navigation -->
      <div class="top-navigation">
        <div class="tabs">
          <TabsRoot :defaultValue="music">
            <TabsList class="tabs-list">
              <TabsTrigger value="music" class="tabs-trigger">Music</TabsTrigger>
              <TabsTrigger value="podcasts" class="tabs-trigger">Podcasts</TabsTrigger>
              <TabsTrigger value="live" class="tabs-trigger">Live</TabsTrigger>
            </TabsList>
          </TabsRoot>
        </div>
        <div class="add-music">
          <button class="add-music-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add music
          </button>
        </div>
      </div>
  
      <!-- Listen Now Section -->
      <section class="listen-now-section">
        <SectionTitle title="Listen Now" subtitle="Top picks for you. Updated daily." />
        <MusicItemList :items="listenNowItems" />
      </section>
  
      <!-- Made For You Section -->
      <section class="made-for-you-section">
        <SectionTitle title="Made for You" subtitle="Your personal playlists. Updated daily." />
        <MusicItemList :items="madeForYouItems" />
      </section>
    </div>
  </template>
  
  <script setup>
  // import { TabsRoot, TabsList, TabsTrigger } from 'radix-vue'
  import { ref } from 'vue'
  
  const music = ref('music')
  
  const listenNowItems = ref([
    {
      imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=300&q=60',
      title: 'React Rendezvous',
      subtitle: 'Ethan Byte',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1586822748659-c682a2bda729?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fA&auto=format&fit=crop&w=300&q=60',
      title: 'Async Awakenings',
      subtitle: 'Nina Netcode',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1523995462472-41b7a93eadf2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fG11c2ljfGVufDB8fDB8fA&auto=format&fit=crop&w=300&q=60',
      title: 'The Art of Reusability',
      subtitle: 'Lena Logic',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1556976497-74c9002c9f58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fG11c2ljfGVufDB8fDB8fA&auto=format&fit=crop&w=300&q=60',
      title: 'Stateful Symphony',
      subtitle: 'Beth Binary',
    },
  ])
  
  const madeForYouItems = ref([
      {
      imageUrl: 'https://images.unsplash.com/photo-1604448486469-44519312121f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fG11c2ljfGVufDB8fDB8fA&auto=format&fit=crop&w=300&q=60',
      title: 'Chill Beats',
      subtitle: 'Relax & Unwind',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1599528892198-5a9a66251417?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fG11c2ljfGVufDB8fDB8fA&auto=format&fit=crop&w=300&q=60',
      title: 'Coding Vibes',
      subtitle: 'Focus & Code',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=300&q=60',
      title: 'Morning Motivation',
      subtitle: 'Start your day right',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1586822748659-c682a2bda729?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fA&auto=format&fit=crop&w=300&q=60',
      title: 'Evening Chill',
      subtitle: 'Wind down after work',
    },
  ])
  </script>
  
  <style scoped>
  .music-player {
    font-family: sans-serif;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* Top Navigation */
  .top-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .tabs-list {
    display: flex;
    padding: 4px;
    border-radius: 9999px;
    background-color: #f0f0f0; /* Adjust background color */
  }
  
  .tabs-trigger {
    all: unset;
    padding: 10px 15px;
    border-radius: 9999px;
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: #333; /* Adjust text color */
    cursor: pointer;
    position: relative;
    user-select: none;
  }
  .tabs-trigger[data-state='active'] {
    background-color: #fff; /* Active tab background */
    color: #000; /* Active tab text color */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12); /* Optional: add shadow for active state */
  }
  .tabs-trigger:focus {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2); /* Optional: focus ring */
  }
  
  .add-music-button {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 15px;
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    border-radius: 9999px;
    background-color: #000; /* button background color */
    color: #fff; /* button text color */
    cursor: pointer;
    gap: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); /* Optional: button shadow */
  }
  .add-music-button:hover {
    background-color: #222; /* Hover background color */
  }
  .add-music-button:focus {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2); /* Optional: focus ring */
  }
  .add-music-button svg {
    width: 16px;
    height: 16px;
  }
  
  
  /* Section Titles */
  /* Styling is in SectionTitle.vue */
  
  /* Music Item List & Item */
  /* Styling is in MusicItemList.vue and MusicItem.vue */
  
  /* Sections Spacing */
  .listen-now-section, .made-for-you-section {
    margin-bottom: 40px;
  }
  </style>