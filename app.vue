<template>
  <!-- <LoadingAnimation v-show="loading"></LoadingAnimation> -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
// import LoadingAnimation from "~/components/LoadingAnimation.vue";
  import 'primeicons/primeicons.css'

  const nuxtApp = useNuxtApp();
  const loading = ref(true);

  const colors = ["#00A6A6", "#EFCA08", "#F49F0A", "#F08700"];

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const randomColor = getRandomColor();
  document.documentElement.style.setProperty('--write-card-bg-color', randomColor);
  // document.documentElement.style.setProperty('--card-bg-color-1', randomColor);
  // document.documentElement.style.setProperty('--card-bg-color-2', randomColor);
  // document.documentElement.style.setProperty('--card-bg-color-3', randomColor);
  // document.documentElement.style.setProperty('--card-bg-color-4', randomColor);
  // document.documentElement.style.setProperty('--card-bg-color-5', randomColor);


</script>

<style>

#__nuxt{
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  /* background-image: radial-gradient(var(--border-color) 1px, transparent 1px); */
  /* background-size: 16px 16px; */
  transition: background-color 0.3s ease, color 0.3s ease;
  /* opacity: 0.15; */
}
[class*="-card"], .chapter-list-item, button {
  transition: 
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
html {
font-size: 16px; /* Default root font size for desktops */
}
html, body { height: 100%; margin: 0; }
@media (max-width: 768px) {
html {
  font-size: 14px; /* Root font size for tablets */
}
}

@media (max-width: 480px) {
html {
  font-size: 12px; /* Root font size for smartphones */
}


}
.logo-font{
font-size: 1.5em;
}

.novel-details-font{
font-size: 1em;
}
.novel-info-font{
font-size: 0.9em;
}

.layout-font{
font-size: 1.4em;
}

/* Responsive Button Styles */
.responsive-btn1 {
padding: 0.5rem 1rem;
font-size: 0.875rem;
border-radius: 0.375rem; /* Rounded corners */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
/* Smooth transitions */
}
.responsive-btn2 {
padding: 0.5rem 1rem;
font-size: 0.875rem;
border-radius: 0.375rem; /* Rounded corners */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
/* Smooth transitions */
}

.responsive-btn1:hover {
background-color: #f3f4f6; /* Hover background */
}

.responsive-btn1-primary {
background-color: #2563eb; /* Primary color */
color: white;
}

.responsive-btn1-primary:hover {
background-color: #1d4ed8; /* Darker primary on hover */
}

.responsive-btn-danger {
background-color: #dc2626; /* Danger color */
color: white;
}

.responsive-btn-danger:hover {
background-color: #b91c1c; /* Darker danger on hover */
}

/* Media Queries for Responsiveness */
@media (min-width: 768px) {
.responsive-btn {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
}
}

@media (min-width: 1024px) {
.responsive-btn {
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
}
}


:root {
  /* Light Theme - Modern & Airy */
  --logo-color: #1e293b;
  --header-bg-color: #bbdef0;
  /* --background-color: #f8fafc;         */
  /* --background-color: #e4e5f1; */
  --background-color :#EFEFEF;
  --search-bar-bg-color:#FFFFFF;
  --search-bar-text-color:#000000;
  --view-more-btn-bg-color: #F7F7F8;
  --view-more-btn-text-color: #000000;
  --card-bg-color-1:#00A6A6;
  --card-bg-color-2:#EFCA08;
  --card-bg-color-3: #F49F0A;
  --card-bg-color-4: #F08700;
  --card-bg-color-5: #00A6A6;
  --author-name-text-color: #00A6A6;
  --novel-page-section-bg-color: #ffffff;

  --add-group-btn-text-color: #ffffff;
  --add-group-btn-bg-color: #000000;

  --chapter-body-bg-color: #ffffff;
  --chapter-body-text-color: #000000;
  
  --border-color: #e5e7eb; /* modal input bordr color*/
  --modal-bg-color: #ffffff;
  --modal-bg: #ffffff; /* Modal background */
  --input-bg: #ffffff; /* Input field background */
  --shadow-color: rgba(0, 0, 0, 0.05); /* Soft shadows */
  --surface-elevation: 0 8px 32px rgba(0, 0, 0, 0.08); /* Elevation effect */
  --modal-text-color: rgb(17,24,39);
  --modal-border-color: rgb(229, 231, 235);
  --modal-button-bg-color: #000000;
  --modal-button-text-color: rgb(156,163,175);
  --modal-button-hover-bg-color: rgb(229, 231, 235);
  --modal-button-border-color: #000000;
  --modal-button-footer-bg-color: rgb(229, 231, 235);
  --modal-button-footer-border-color: rgb(229, 231, 235);

  --modal-button-1-bg-color: rgb(29, 78, 216);
  --modal-button-1-text-color: rgb(255, 255, 255);
  --modal-button-1-hover-text-color: rgb(255, 255, 255);
  --modal-button-1-focus-color: rgb(147, 197, 253);
  --modal-button-1-hover-bg-color: rgb(229, 231, 235);
  --modal-button-1-border-color: rgb(229, 231 ,235);

  --modal-button-2-bg-color: rgb(255, 255, 255);
  --modal-button-2-text-color: rgb(17, 24, 39 );
  --modal-button-2-hover-text-color: rgb(29, 78, 216);
  --modal-button-2-hover-bg-color: rgb(243, 244, 246 );
  --modal-button-2-border-color: rgb(229, 231, 235);
  --modal-button-2-focus-color: rgb(243, 244, 246);

  --library-card-border: 1px solid black;
  --library-card-border-padding: 10px;
  --library-card-border-radius: 5px;

  --confirm-dialog-bg-color:rgb(255, 255, 255);
  --cancel-btn-bg-color: rgb(100, 100, 100);
  --cancel-btn-text-color: rgb(255, 255, 255);
  --delete-btn-bg-color: red;
  --delete-btn-text-color: rgb(255, 255, 255);


  /* color: var(--search-bar-text-color); */
  --foreground-color: #ffffff;        /* Pure white for contrast */
  --primary-text-color: #1e293b;      
  /* --primary-text-color: #727D73; */
  --secondary-text-color: #64748b;    /* Softer slate blue-gray */
  --tertiary-text-color: #64748b;
  --delete-btn-bg-color: rgb(246, 53, 53);
  --delete-btn-text-color: rgb(255, 255, 255);
  --delete-btn-border-color: rgba(246, 53, 53, 0.51);
  --btn-text-color:#000000;
  --btn-color-1:#00a6a6;
  --btn-color-2: #efca08;
  --btn-color-3: #f08700;
  /* --btn-color-3: #727D73; */
  --btn-color-4: #f49f0a;
  --btn-color-5: rgb(71 85 105);
  --icon-color-4: var(--primary-text-color);
  --write-card-bg-color:#e4e5f1;
  --card-text-color:var(--primary-text-color);
  --border-color: #cbd5e1;            /* Light gray with blue undertone */
  --dark-text-color: #0f172a;         /* Rich dark blue for accents */
  --dark-button-color: #1e293b;       /* Matching primary text color */
  --dark-button-text-color: #f8fafc;  /* Contrast with dark button */
  --placeholder-text:#8b8b8b;
  /* --section-bg-color: #c7c7c7; */
  /* --section-bg-color: #51a77185; */
  --section-bg-color: #ffffff;
  /* --section-bg-color: #AAB99A; */
  --section-bg-color-2: #858585;
  /* --section-bg-color-2: #D0DDD0; */
  --placeholder-text-color:#d2d2d2;
  
  /* Accent Colors - Vibrant but Professional */
  --primary-accent-color: #f9f9f9;    /* Modern indigo */
  --secondary-accent-color: #60a5fa;  /* Softer sky blue */

  /* Button Colors - Gradient Effects */
  --primary-button-bg-color: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --primary-button-text-color: #ffffff;
  --primary-button-bg-color-hover: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  --primary-button-text-color-hover: #ffffff;

  --secondary-button-bg-color: linear-gradient(135deg, #475569 0%, #334155 100%);
  --secondary-button-text-color: #ffffff;
  --secondary-button-bg-color-hover: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  --secondary-button-text-color-hover: #ffffff;

  --tag-bg-color: #e0e7ff;            /* Soft indigo tint */
  --tag-text-color: #4338ca;          /* Deep indigo */

  /* Card Colors - Subtle Depth */
  --card-bg-color: #ffffff;
  --card-shadow-color: rgba(99, 102, 241, 0.05); /* Indigo tint shadow */

  /* Novel Card Enhancements */
  --novel-card-box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
  --novel-card-expanded-box-shadow: 0 8px 16px rgba(99, 102, 241, 0.15);
  /* Novels Grid Class */
  --novels-container-width: 100%;
  --novels-container-height: auto;
  --novels-container-overflow-x: auto;
  --novels-container-overflow-y: hidden;
  --novels-container-white-space: nowrap;
  --novels-container-padding: 16px;
  --novels-container-scrollbar-width: thin;
  --novels-container-ms-overflow-style: none;
  --novels-container-padding-right: 8px;

  --novels-row-display: flex;
  --novels-row-gap: 12px;
  --novels-row-min-width: max-content;
  --novels-row-align-items: flex-start;

  --novels-row-hover-outline: 2px solid var(--primary-accent-color);
  --novels-row-hover-cursor: pointer;

  --novels-row-active-outline: 2px solid var(--primary-accent-color);

  /* Novel Card Styles */

  --novel-card-width: 200px;
  /* --novel-card-height: 380px; */
  --novel-card-height: 40vh;
  --novel-card-background: var(--card-bg-color);
  --novel-card-border-radius: 8px;
  --novel-card-overflow: hidden;
  --novel-card-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  --novel-card-transition: all 0.3s ease;
  --novel-card-position: relative;

  --novel-card-expanded-width: 420px; /*500px prev*/
  --novel-card-expanded-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --novel-card-expanded-grid-column-end: span 3;

  --background-blur-position: absolute;
  --background-blur-top: 0;
  --background-blur-left: 0;
  --background-blur-width: 100%;
  --background-blur-height: 100%;
  --background-blur-size: cover;
  --background-blur-position-cover: center;
  --background-blur-filter: blur(20px);
  --background-blur-opacity: 0;
  --background-blur-transition: opacity 0.3s ease;

  --background-blur-expanded-opacity: 0.15;

  --card-content-position: relative;
  --card-content-display: flex;
  --card-content-background: rgba(255, 255, 255, 0.95);
  --card-content-height: 100%;

  --card-main-width: 200px;
  --card-main-flex-shrink: 0;
  --card-main-display: flex;
  --card-main-flex-direction: column;

  --novel-image-width: 100%;
  --novel-image-height: 28vh;
  --novel-image-object-fit: cover;
  --novel-image-display: block;

  --novel-details-padding: 15px;
  --novel-details-display: flex;
  --novel-details-flex-direction: column;
  --novel-details-justify-content: space-between;
  --novel-details-flex-grow: 1;
  --novel-details-position: relative;

  --novel-details-h3-margin: 0;
  --novel-details-h3-color: #333;
  --novel-details-h3-overflow: hidden;
  --novel-details-h3-text-overflow: ellipsis;
  --novel-details-h3-white-space: break-spaces;
  --novel-details-h3-max-height: 4.5em;

  --novel-info-display: flex;
  --novel-info-justify-content: space-between;
  --novel-info-font-size: 0.9rem;
  --novel-info-color: #666;
  --novel-info-position: absolute;
  --novel-info-bottom: 15px;
  --novel-info-left: 15px;
  --novel-info-right: 15px;

  --novel-summary-width: 300px;
  --novel-summary-padding: 20px;
  --novel-summary-display: flex;
  --novel-summary-flex-direction: column;
  --novel-summary-justify-content: space-between;

  --novel-summary-h4-margin: 0 0 10px 0;
  --novel-summary-h4-font-size: 1.2rem;
  --novel-summary-h4-color: #333;

  --novel-summary-p-margin: 0 0 15px 0;
  --novel-summary-p-font-size: 0.95rem;
  --novel-summary-p-line-height: 1.6;
  --novel-summary-p-color: #444;
  --novel-summary-p-overflow: hidden;
  --novel-summary-p-display: -webkit-box;
  --novel-summary-p-webkit-line-clamp: 6;
  --novel-summary-p-webkit-box-orient: vertical;
  --novel-summary-p-white-space: break-spaces;

  --read-button-display: inline-flex;
  --read-button-align-items: center;
  --read-button-gap: 8px;
  --read-button-background: #4a90e2;
  --read-button-color: white;
  --read-button-text-decoration: none;
  --read-button-padding: 10px 20px;
  --read-button-border-radius: 6px;
  --read-button-font-weight: 400;
  --read-button-transition: all 0.2s ease;

  --read-button-hover-background: #357abd;
  --read-button-hover-transform: translateY(-2px);

  --arrow-icon-transition: transform 0.2s ease;
  --arrow-icon-hover-transform: translateX(4px);

  --fade-transition: opacity 0.3s ease;
  --fade-opacity: 0;


  /* Novel About Page  */
  --novel-about-background-color: var(--background-color);
  --novel-about-secondary-text-color: var(var(--secondary-text-color));
  --novel-about-text-rating-color: yellow;
  --novel-about-text-rating-off-color: grey;
  --novel-about-text-review-color: grey;
}


html[data-theme="dark"] {
  --logo-color: var(--btn-color-1);
  --header-bg-color: #bbdef0;
  /* Dark Theme - Softer & Warmer */
  --background-color: #121212;     /* Zinc-900 */

  --novel-page-section-bg-color: #ffffff;

  --search-bar-bg-color:#FFFFFF;
  --search-bar-text-color:#000000;
  --view-more-btn-bg-color: #F7F7F8;
  --view-more-btn-text-color: #000000;
  --card-bg-color-1:#ffffff;
  --card-bg-color-2:#ffffff;
  --card-bg-color-3: #ffffff;
  --card-bg-color-4: #ffffff;
  --card-bg-color-5: #ffffff;
  --foreground-color: #282828;         /* Zinc-800 */
  --primary-text-color: #f4f4f5;       /* Zinc-100 */
  --secondary-text-color: #a1a1aa;     /* Zinc-400 */
  --tertiary-text-color: #78286f;      /* Zinc-500 */
  --btn-text-color:var(--primary-text-color);
  --add-group-btn-text-color: #000000;
  --add-group-btn-bg-color: #ffffff;
  --btn-color-1:#66005e;
  --btn-color-2: #894480;
  --btn-color-3:#894480;
  --btn-color-4:#9b5e91;
  --btn-color-5:#ac78a3;

  --chapter-body-bg-color: #202020;
  --chapter-body-text-color: #ededed;

  --border-color: #acacac; /* modal input bordr color*/
  --modal-bg-color: rgb(55, 65, 81); 
  --modal-text-color: rgb(255, 255, 255);
  --modal-bg: #111827;
  --input-bg: #161616;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --surface-elevation: 0 8px 32px rgba(0, 0, 0, 0.3);
  --modal-border-color: rgb(75, 85, 99);
  --modal-button-bg-color: #000000;
  --modal-button-text-color: rgb(156,163,175);
  --modal-button-hover-text-color: rgb(255, 255, 255);
  --modal-button-hover-bg-color: rgb(75, 85, 99);
  --modal-button-border-color: #000000;
  --modal-button-footer-bg-color: rgb(75, 85, 99);
  
  --modal-button-1-bg-color: rgb(37, 99, 235);
  --modal-button-1-text-color: rgb(255, 255, 255);
  --modal-button-1-focus-color:  rgb(30, 64, 175);
  --modal-button-1-hover-bg-color: rgb(29, 78, 216);
  --modal-button-1-border-color: #000000;

  --modal-button-2-bg-color: rgb(31, 41, 55);
  --modal-button-2-text-color: rgb(156, 163, 175);
  --modal-button-2-hover-text-color: rgb(255, 255, 255);
  --modal-button-2-border-color:  rgb(229, 231, 235);
  --modal-button-2-hover-bg-color: rgb(55, 65, 81 );
  --modal-button-2-border-color: #000000;
  --modal-button-2-focus-color: rgb(55, 65, 81);

  --library-card-border: 1px solid white;
  --library-card-border-padding: 10px;
  --library-card-border-radius: 5px;

  --confirm-dialog-bg-color:rgb(80, 79, 79);
  --cancel-btn-bg-color: rgb(100, 100, 100);
  --cancel-btn-text-color: rgb(255, 255, 255);
  --delete-btn-bg-color: #1d1d1d;
  --delete-btn-text-color: white;



  --icon-color-4: #9b5e91;
  --border-color: #3f3f46;  

  /* --delete-btn-border-color: rgba(246, 53, 53, 0.51); */
  --border-color: #334155;            /* Dark gray with blue undertone */
  --write-card-bg-color:var(--background-color);  
  /* #00A6A6,#EFCA08,#F49F0A,#F08700 */
  --card-text-color:var(--primary-text-color);
   /* Accent Colors - Muted Pastels */
   --primary-accent-color: var(--btn-color-1);     /* Periwinkle */
  --secondary-accent-color: #67e8f9;   /* Cyan */

  --novel-image-width: 100%;
  --novel-image-heignt: 28vh;

  /* Buttons - Softer Contrast */
  --primary-button-bg-color: linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%);
  --primary-button-bg-color-hover: linear-gradient(135deg, #4f46e5 0%, #7c3aed 30%);

  --secondary-button-bg-color: linear-gradient(135deg, #475569 0%, #334155 100%);
  --secondary-button-bg-color-hover: linear-gradient(135deg, #3b4252 0%, #2d3748 100%);

  --tag-bg-color: rgba(129, 140, 248, 0.15); /* Transparent accent tint */
  --tag-text-color: #a5b4fc;          /* Light periwinkle */

  /* Card Colors - Depth & Dimension */
  --card-bg-color: #1e293b;           /* Matching foreground color */
  --card-shadow-color: rgba(129, 140, 248, 0.1); /* Accent-tinted shadow */

  /* edit book page */
  --section-bg-color: #282828;
  --section-bg-color-2: #3f3f3f;
  --placeholder-text-color:#8b8b8b;


  .novel-summary-card {
    background: var(--section-bg-color);
    border: 1px solid var(--border-color);
  }
  .details-card {
    background: var(--section-bg-color) !important;
    border: 1px solid var(--border-color);
  }
  .chapter-list-item {
    background: var(--foreground-color);
  }
  .chapter-list-item:hover{
      background: #303034;
  }
  .management-button {
    background: var(--foreground-color);
  }
  .management-button:hover{
    background: #323238;
  }
}

input:focus, button:focus {
  outline: 2px solid var(--primary-accent-color);
}


/* .novel-name-author-bg{
  @apply bg-[--novel-page-section-bg-color] rounded-md mt-4
} */
</style>
