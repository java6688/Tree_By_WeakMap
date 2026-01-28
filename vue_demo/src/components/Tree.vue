<template>
  <div class="tree-container tree">
    <Branch :data="item" v-for="(item) in data" :key="item.id"></Branch>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, readonly } from "vue";
import Branch from "./Branch.vue";

defineProps<{
  data: any[]
}>()

const emits = defineEmits<{
  (e: "clickLeaf", item: any): void;
  (e: "addNode", item: any): void;
  (e: "deleteNode", item: any): void;
  (e: "renameNode", item: any): void;
}>();

const selectedId = ref<string | null>(null);

const setSelectedId = (id: string) => {
  selectedId.value = id;
};

provide("emits", emits);
provide("selectedId", readonly(selectedId));
provide("setSelectedId", setSelectedId);

</script>

<style scoped>
.tree-container {
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 移除第一层级的 margin-left */
:deep(> .branch) {
  margin-left: 0;
}
</style>
