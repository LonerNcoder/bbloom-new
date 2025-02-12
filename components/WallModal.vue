<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'radix-vue';
import { Icon } from '@iconify/vue';
import { ref, watch, onMounted, computed } from 'vue';

const props = defineProps({
  triggerText: {
    type: String,
    default: 'Open Modal',
  },
  title: {
    type: String,
    default: 'Modal Title',
  },
  description: {
    type: String,
    default: 'Modal Description',
  },
  showCloseIcon: {
    type: Boolean,
    default: true
  },
  triggerClass: { // Custom class for the trigger button
    type: String,
    default: ''
  },
  contentClass:{
    type: String,
    default: ''
  },
  overlayClass:{
    type: String,
    default: ''
  },
  closeButtonClass:{
    type: String,
    default: ''
  },
  modalOpen: { // Prop to control modal open state externally
    type: Boolean,
    default: false
  },
  closeIcon:{
    type: String,
    default: 'lucide:x'
  }
});

const emit = defineEmits(['update:modalOpen', 'close', 'open']); // Emit events for external control

const isOpen = ref(false);

// Watch the external modalOpen prop and update the internal state
watch(() => props.modalOpen, (newVal) => {
  isOpen.value = newVal;
});

// Watch the internal isOpen state and emit updates
watch(isOpen, (newVal) => {
  emit('update:modalOpen', newVal);
  if (newVal) {
    emit('open'); // Emit 'open' event when modal opens
  } else {
    emit('close'); // Emit 'close' event when modal closes
  }
});


</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <!-- <DialogTrigger
      :class="[
        'text-grass11 font-semibold shadow-blackA7 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none',
        props.triggerClass, // Apply custom trigger class
      ]"
    > -->
      <!-- <slot name="trigger">
        {{ triggerText }}
      </slot> -->
    <!-- </DialogTrigger> -->
    <DialogPortal>
      <DialogOverlay :class="['bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30', props.overlayClass]" />
      <DialogContent
        :class="[
          'data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]',
          props.contentClass,
        ]"
      >
        <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
          {{ title }}
        </DialogTitle>
        <DialogDescription v-if="description" class="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
          {{ description }}
        </DialogDescription>

        <slot /> 

        <DialogClose
          v-if="showCloseIcon"
          :class="[
            'text-grass11 hover:bg-green4 focus:shadow-green7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none',
            props.closeButtonClass
          ]"
          aria-label="Close"
        >
          <Icon :icon="props.closeIcon" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>