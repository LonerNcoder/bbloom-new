<template>
  <div class="novel-card" :class="{ 'is-expanded': isExpanded && !isSmallScreen }">
    <div class="card-content" :class="randomBgColor" @click="cardAnim">
      <template v-if="isSmallScreen && isExpanded">
        <!-- Swapped Content for Small Screens -->
        <div class="novel-summary">
          <h4>Summary</h4>
          <p>{{ novel.summary }}</p>
          <NuxtLink :to="chapterLink" class="read-button">
            {{ name }}
            <svg class="arrow-icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </NuxtLink>
          </div>
        </template>

      <template v-else>
        <!-- Default Layout -->
        <div class="card-main">
          <div class="image-container">
            <img :src="defaultImage" :alt="novel.title" class="novel-image">
            <span v-if="inLibrary" class="library-icon">
              <Library size="20" />
            </span>
          </div>
          <div class="novel-details novel-details-font">
            <h3>{{ novel.title }}</h3>
            <div class="novel-info">
              <span class="views">Views: {{ novel.views }}</span>
              <span class="rating">Rating: {{ novel.rating }}</span>
            </div>
          </div>
        </div>

              <transition name="fade">
                        <div v-show="isExpanded" class="novel-summary">
                          <h4>Summary</h4>
                          <p>{{ novel.summary }}</p>
                          <NuxtLink :to="chapterLink" class="read-button">
                            {{ name }}
                            <svg class="arrow-icon" viewBox="0 0 24 24" width="24" height="24">
                                      <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                                    </svg>
                                  </NuxtLink>
                        </div>
              </transition>
            </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, onBeforeUnmount } from 'vue';
import { Library } from 'lucide-vue-next';

const props = defineProps({
  novel: { type: Object, required: true },
  to: { type: String, default: "" },
  name: { type: String, default: 'Start Reading' },
  bgcolor: { type: Number, default: 2 },
  webMode: { type: String, default: 'safe' },
  lastReadChapter: { type: Number, default: 1 },
  inLibrary: { type: Boolean, default: false },
});


const defaultImage = ref('');
const isExpanded = ref(false);
const isSmallScreen = ref(window.innerWidth < 600);

const cardAnim = () => {
  isExpanded.value = !isExpanded.value;
};

const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 600;
};

const chapterLink = computed(() => {
  //if to is empty, return the last read chapter  
  if (props.to === "") {
    return `/novel/${props.novel.id}/chapter/${props.lastReadChapter}`;
  }
  return props.to;
});

onMounted(() => {
  defaultImage.value = props.novel.coverImage || 'https://ik.imagekit.io/escbl5qkx/default_novel_cover_75.png';
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const getContentClass = (i) => `card-content-${i}`;
const randomBgColor = getContentClass(props.bgcolor);
</script>



<style scoped>
.novel-card {
  width: var(--novel-card-width);
  height: var(--novel-card-height);
  background: var(--write-card-bg-color);
  border-radius: var(--novel-card-border-radius);
  overflow: var(--novel-card-overflow);
  box-shadow: var(--novel-card-box-shadow);
  transition: var(--novel-card-transition);
  position: var(--novel-card-position);
}

.novel-card.is-expanded {
  width: var(--novel-card-expanded-width);
  box-shadow: var(--novel-card-expanded-box-shadow);
  grid-column-end: var(--novel-card-expanded-grid-column-end);
}

.background-blur {
  position: var(--background-blur-position);
  top: var(--background-blur-top);
  left: var(--background-blur-left);
  width: var(--background-blur-width);
  height: var(--background-blur-height);
  background-size: var(--background-blur-size);
  background-position: var(--background-blur-position-cover);
  filter: var(--background-blur-filter);
  opacity: var(--background-blur-opacity);
  transition: var(--background-blur-transition);
}

.is-expanded .background-blur {
  opacity: var(--background-blur-expanded-opacity);
}

.card-content {
  position: var(--card-content-position);
  display: var(--card-content-display);
  /* background: var(--write-card-bg-color); */
  height: var(--card-content-height);
}

.card-main {
  width: var(--card-main-width);
  flex-shrink: var(--card-main-flex-shrink);
  display: var(--card-main-display);
  flex-direction: var(--card-main-flex-direction);
}

.novel-image {
  width: var(--novel-image-width);
  height: var(--novel-image-height);
  object-fit: var(--novel-image-object-fit);
  display: var(--novel-image-display);
}

.novel-details {
  padding: var(--novel-details-padding);
  display: var(--novel-details-display);
  flex-direction: var(--novel-details-flex-direction);
  justify-content: var(--novel-details-justify-content);
  flex-grow: var(--novel-details-flex-grow);
  position: var(--novel-details-position);
}

.novel-details h3 {
  margin: var(--novel-details-h3-margin);
  color: var(--card-text-color);
  overflow: var(--novel-details-h3-overflow);
  text-overflow: var(--novel-details-h3-text-overflow);
  white-space: var(--novel-details-h3-white-space);
  max-height: var(--novel-details-h3-max-height);
}

.novel-info {
  display: var(--novel-info-display);
  justify-content: var(--novel-info-justify-content);
  font-size: var(--novel-info-font-size);
  color: var(--card-text-color);
  position: var(--novel-info-position);
  bottom: var(--novel-info-bottom);
  left: var(--novel-info-left);
  right: var(--novel-info-right);
}

.novel-summary {
  width: var(--novel-summary-width);
  padding: var(--novel-summary-padding);
  display: var(--novel-summary-display);
  flex-direction: var(--novel-summary-flex-direction);
  justify-content: var(--novel-summary-justify-content);
}

.novel-summary h4 {
  margin: var(--novel-summary-h4-margin);
  font-size: var(--novel-summary-h4-font-size);
  color: var(--card-text-color);
}

.novel-summary p {
  margin: var(--novel-summary-p-margin);
  font-size: var(--novel-summary-p-font-size);
  line-height: var(--novel-summary-p-line-height);
  color: var(--card-text-color);
  overflow: var(--novel-summary-p-overflow);
  display: var(--novel-summary-p-display);
  -webkit-line-clamp: var(--novel-summary-p-webkit-line-clamp);
  -webkit-box-orient: var(--novel-summary-p-webkit-box-orient);
  white-space: var(--novel-summary-p-white-space);
}

.read-button {
  display: var(--read-button-display);
  align-items: var(--read-button-align-items);
  gap: var(--read-button-gap);
  background: var(--btn-color-4);
  color: var(--btn-text-color);
  text-decoration: var(--read-button-text-decoration);
  padding: var(--read-button-padding);
  border-radius: var(--read-button-border-radius);
  font-weight: var(--read-button-font-weight);
  transition: var(--read-button-transition);
}

.read-button:hover {
  background: var(--btn-color-2);
  transform: var(--read-button-hover-transform);
}

.read-button .arrow-icon {
  transition: var(--arrow-icon-transition);
}

.read-button:hover .arrow-icon {
  transform: var(--arrow-icon-hover-transform);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: var(--fade-transition);
}

.fade-enter-from,
.fade-leave-to {
  opacity: var(--fade-opacity);
}

.card-content-1{
  background-color:var(--card-bg-color-1)
}
.card-content-2{
  background-color:var(--card-bg-color-2)
}
.card-content-3{
  background-color:var(--card-bg-color-3)
}
.card-content-4{
  background-color:var(--card-bg-color-4)
}
.card-content-5{
  background-color:var(--card-bg-color-5)
}

.image-container {
  position: relative;
  width: 100%;
}

.library-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px;
  border-radius: 4px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>