<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- Close Button (Top Right) -->
      <button class="modal-close" @click="$emit('close')"><X/></button>

      <!-- Modal Header -->
      <div class="modal-header">
        <slot name="header"></slot>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <slot name="body"></slot>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import {X} from "lucide-vue-next"
</script>

<style scoped>
/* Overlay */
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

/* Modal Box */
.modal {
  background-color: var(--modal-bg, #fff);
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  box-shadow: var(--surface-elevation, 0 4px 10px rgba(0, 0, 0, 0.2));
  border: 1px solid var(--border-color, #ddd);
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
}



/* Close Button */
.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary, #555);
  cursor: pointer;
}

.modal-close:hover {
  color: var(--text-primary, #000);
}

/* Header */
.modal-header {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary, #222);
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border-color, #ddd);
}

/* Body */
.modal-body {
  flex-grow: 1;
  color: var(--text-primary, #444);
  padding: 10px 0;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
  border-top: 1px solid var(--border-color, #ddd);
  padding-top: 10px;
}

/* Buttons */
.btn-cancel {
  background-color: var(--cancel-btn-bg-color);
  color: var(--cancel-btn-text-color);
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #bbb;
}



</style>
