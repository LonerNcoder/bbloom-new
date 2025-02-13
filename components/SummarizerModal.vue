<template>

<!-- Extra Large Modal -->
<div id="extralarge-modal" tabindex="-1" class="fixed top-0 left-0 right-0 z-50  w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative w-full  max-h-full">
        <!-- Modal content -->
        <div class="relative bg-[--modal-bg-color] rounded-lg shadow-sm">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t  border-[--modal-border-color]">
                <h3 class="text-xl font-medium text-[--modal-text-color]">
                    {{ title }}
                </h3>
                    <button @click="close" type="button" class="text-[--modal-button-text-color] bg-transparent hover:bg-[--modal-button-hover-bg-color] hover:text-[--modal-button-hover-text-color] rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="extralarge-modal">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class=" sr-only">Close</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class=" p-4 md:p-5 space-y-4">
                <div v-html="description"></div>
            </div>
            <!-- Modal footer -->
            <div class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-[--modal-button-footer-border-color] rounded-b">
                <button @click="accept" v-if="acceptButtonText" data-modal-hide="extralarge-modal" type="button" class="text-[--modal-button-1-text-color] bg-[--modal-button-1-bg-color] hover:bg-[--modal-button-1-hover-bg-color] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-[--modal-button-footer-bg-color] dark:hover:bg-[--modal-button-1-hover-bg-color] dark:focus:ring-[--modal-button-1-focus-color]">I accept</button>
                <button @click="close" data-modal-hide="extralarge-modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-[--modal-button-2-text-color] focus:outline-none bg-[--modal-button-2-bg-color] rounded-lg border border-[--modal-button-2-border-color] hover:bg-[--modal-button-2-hover-bg-color] focus:z-10 focus:ring-4 focus:ring-[--modal-button-2-focus-color] dark:bg-[--modal-button-footer-bg-color] dark:text-gray-400 dark:border-[--modal-button-2-border-color] dark:hover:text-[--modal-button-2-hover-text-color] dark:hover:bg-[--modal-button-2-hover-bg-color]">{{ declineButtonText }}</button>
            </div>
        </div>
    </div>
</div>

</template>

<script setup>

console.log("SummarizerModal");

const props = defineProps({
    title: {
        type: String,
        default: "Summarizer"
    },
    description: {
        type: String,
        required: true
    },
    acceptButtonText: {
        type: String,
    },
    declineButtonText: {
        type: String,
        default: "Close"
    }
})

const emit = defineEmits(['accept', 'close']);

const accept = () => {
    emit('accept');
}

const close = () => {
    emit('close');
}   

</script>
