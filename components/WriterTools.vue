<template>
  <v-app>
    <v-card :class="fabPosition === 'absolute' ? 'demo-panel-relative' : 'demo-panel-static'" border flat>
      <v-fab
        :key="fabPosition"
        :absolute="fabPosition === 'absolute'"
        :app="fabPosition === 'fixed'"
        :color="open ? '' : 'primary'"
        :location="fabLocation"
        :size="size"
        icon
      >
        <v-icon>{{ open ? 'mdi-close' : 'mdi-assistant' }}</v-icon>
        <v-speed-dial v-model="open" :location="menuLocation" :transition="transition" activator="parent">
          

            <v-btn v-tooltip="'Toggle Chapters'" @click="$emit('toggleChapterPanel')" key="1" color="success" icon>
                <MenuSquare class="w-5 h-5" />
              </v-btn>
            
            <v-btn v-tooltip="'Ask AI'" key="2" color="info" @click="$emit('toggleAI')" icon>
                <BotMessageSquare class="w-5 h-5" />
            </v-btn>

            <v-btn  v-tooltip="'Check Grammar'" @click="$emit('toggleGrammarPanel')" key="3" color="info" icon>
                <v-icon size="30">mdi-alpha-g</v-icon>
            </v-btn>
        </v-speed-dial>
      </v-fab>
    </v-card>
  </v-app>
</template>

<script setup>
import { shallowRef, watch, onMounted, onUnmounted, ref } from 'vue';
import { MenuSquare, BotMessageSquare } from 'lucide-vue-next';

const open = shallowRef(false);
const fabPosition = shallowRef('fixed');
const menuLocation = shallowRef('top center');
const fabLocation = shallowRef('right bottom');
const transition = shallowRef('slide-y-reverse-transition');
const size = ref(48); // Use ref instead of shallowRef for reactivity


const emit = defineEmits(['toggleChapterPanel', 'toggleAI', 'toggleGrammarPanel']);

function reopen() {
  open.value = false;
  setTimeout(() => open.value = true, 400);
}

function updateSize() {
  if (window.innerWidth < 768) {
    size.value = 32;
  } else {
    size.value = 48;
  }
}

// Use onMounted and onUnmounted for window event listeners
onMounted(() => {
  updateSize(); // Initial size
  window.addEventListener('resize', updateSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSize);
});

watch(menuLocation, reopen);
watch(transition, reopen);
watch(fabLocation, () => open.value = false);
watch(fabPosition, () => open.value = false);
// Removed the direct watch on window.innerWidth, as it's unreliable.  Window resizing is now handled through events.

</script>

<style scoped>

</style>