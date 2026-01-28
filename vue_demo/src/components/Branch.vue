<template>
  <div class="branch">
    <div
      class="tree-node"
      :class="{
        'has-children': data.children && data.children.length > 0,
        'open': !isCollapsed,
        'leaf-clicked': selectedId === data.id
      }"
      @click="onClickLeaf(data)"
    >
      <Leaf :data="data">
        <div
          v-if="data.children && data.children.length > 0"
          class="arrow-icon"
          :class="{ 'is-active': !isCollapsed }"
        >
          <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path d="M340.8 98.4l507.2 413.6-507.2 413.6z" fill="currentColor"></path>
          </svg>
        </div>
        <div v-else class="empty-icon-leaf"></div>
      </Leaf>
      <div class="node-actions" @click.stop>
        <button class="action-btn add" title="添加子节点" @click="onAddNode(data)">
          <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m192 472h-168v168h-48v-168H320v-48h168V320h48v168h168v48z" fill="currentColor"></path>
          </svg>
        </button>
        <button class="action-btn rename" title="重命名" @click="onRenameNode(data)">
          <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path d="M880 836H144c-17.7 0-32 14.3-32 32s14.3 32 32 32h736c17.7 0 32-14.3 32-32s-14.3-32-32-32zM160 724.8V768h43.2l411.2-411.2-43.2-43.2L160 724.8zM804.8 245.9L746.1 187.2c-12.5-12.5-32.8-12.5-45.3 0l-55.5 55.5 103.8 103.8 55.5-55.5c12.7-12.5 12.7-32.8 0.2-45.1z" fill="currentColor"></path>
          </svg>
        </button>
        <button class="action-btn delete" title="删除节点" @click="onDeleteNode(data)">
          <svg viewBox="0 0 1024 1024" width="14" height="14">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m165.4 548.2c4.7 4.7 4.7 12.3 0 17l-33.9 33.9c-4.7 4.7-12.3 4.7-17 0L512 548.5l-114.5 114.6c-4.7 4.7-12.3 4.7-17 0l-33.9-33.9c-4.7-4.7-4.7-12.3 0-17l114.6-114.5-114.6-114.5c-4.7-4.7-4.7-12.3 0-17l33.9-33.9c4.7-4.7 12.3-4.7 17 0l114.5 114.6 114.5-114.6c4.7-4.7 12.3-4.7 17 0l33.9 33.9c4.7 4.7 4.7 12.3 0 17L545.9 512l111.5 111.5-111.5-111.5z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    </div>
    <Transition name="slide">
      <div
        v-if="!isCollapsed && data.children"
        class="branch-wrap child-menu"
        :class="{ 'show': !isCollapsed }"
      >
        <Branch
          :data="item"
          v-for="item in data.children"
          :key="item.id"
        ></Branch>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Leaf from "./Leaf.vue";
import { inject, ref, type Ref } from "vue";

defineOptions({ name: "Branch" });

defineProps<{
  data: any;
}>();

const treeEmits = inject<any>("emits");
const selectedId = inject<Ref<string | null>>("selectedId");
const setSelectedId = inject<(id: string) => void>("setSelectedId");

const isCollapsed = ref(false);

const onClickLeaf = (item: any) => {
  if (item.children && item.children.length > 0) {
    isCollapsed.value = !isCollapsed.value;
  }
  if (setSelectedId) {
    setSelectedId(item.id);
  }
  treeEmits("clickLeaf", item);
};

const onAddNode = (item: any) => {
  treeEmits("addNode", item);
};

const onDeleteNode = (item: any) => {
  treeEmits("deleteNode", item);
};

const onRenameNode = (item: any) => {
  treeEmits("renameNode", item);
};
</script>

<style scoped>
.branch {
  margin-left: 20px;
}

.tree-node {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 确保操作按钮在右侧 */
  transition: all 0.2s;
  user-select: none;
}

.tree-node:hover {
  background-color: #f0f0f0;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.action-btn {
  border: none;
  background: transparent;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e4e7ed;
}

.action-btn.add:hover {
  color: #67c23a;
}

.action-btn.rename:hover {
  color: #409eff;
}

.action-btn.delete:hover {
  color: #f56c6c;
}

.leaf-clicked {
  background-color: #e3f2fd;
  color: #1976d2;
}

.arrow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
  color: #666;
}

.arrow-icon.is-active {
  transform: rotate(90deg);
}

.empty-icon-leaf {
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-leaf::before {
  content: "•";
  font-size: 14px;
  color: #999;
}

.branch-wrap {
  overflow: hidden;
}

.child-menu {
  display: none;
}

.child-menu.show {
  display: block;
}

/* Vue Transition 的动画类 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
