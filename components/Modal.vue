<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <slot name="header"></slot>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </template>
<script setup></script>
<style scoped>

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
  background-color: var(--modal-bg);
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  box-shadow: var(--surface-elevation);
  border: 1px solid var(--border-color);
}
.modal-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.modal-body {
  padding: 16px;
  color: var(--text-primary);
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  border-radius: 0 0 12px 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>