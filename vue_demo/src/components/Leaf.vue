<template>
  <div class="leaf-content">
    <slot></slot>
    <span class="name">{{ data.name }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any
}>()
</script>

<style scoped>
.leaf-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px; /* 字体调大点 */
  color: inherit; /* 继承父组件颜色，如 .leaf-clicked 的颜色 */
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
</style>