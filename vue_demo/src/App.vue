<template>
  <div class="tree-page-container">
    <div class="tree-card">
      <h2>树形组件 (Vue + Element Plus)</h2>
      <div class="tree-header">
        <el-button type="primary" @click="onAddRootNode">添加根节点</el-button>
      </div>
      <Tree
        :data="list"
        @clickLeaf="onClickLeaf"
        @addNode="onAddNode"
        @deleteNode="onDeleteNode"
        @renameNode="onRenameNode"
      ></Tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tree from "./components/Tree.vue";
import { onMounted, ref } from "vue";
import { useTree } from "./hooks/useTree";
import { ElMessageBox, ElMessage, ElButton } from 'element-plus';

const { initTree, addChild, removeChild, getParents, getParentValues, getParentLabels } = useTree({
  treeNodeProp: {
    value: 'id',
    label: 'name',
    children: 'children',
  }
});

type MenuItem = {
  id: string;
  name: string;
  children?: MenuItem[];
}

const list = ref<MenuItem[]>([]);

const onClickLeaf = (item: MenuItem) => {
  const parentList = getParents(item);
  console.log("父节点数组", [item, ...parentList]);
  console.log("父节点value数组", [item.id, ...getParentValues(item)]);
  console.log("父节点label数组", [item.name, ...getParentLabels(item)]);
};

// 添加根节点
const onAddRootNode = async () => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入根节点名称', '添加根节点', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    });

    const newNode = {
      id: Date.now().toString(),
      name: name,
      children: []
    };

    addChild(list.value, newNode);
    ElMessage.success('根节点添加成功');
  } catch (error) {
    // 用户取消
  }
};

// 添加子节点
const onAddNode = async (item: MenuItem) => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入子节点名称', `添加[${item.name}]的子节点`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    });

    const newNode = {
      id: Date.now(),
      name: name,
      children: []
    };
    addChild(item, newNode);
    ElMessage.success('添加成功');
  } catch (error) {
    // 用户取消
  }
};

// 删除节点
const onDeleteNode = async (item: MenuItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除节点 "${item.name}" 及其子节点吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    removeChild(item)
    ElMessage.success('删除成功');
  } catch (error) {
    // 用户取消
  }
};

// 重命名节点
const onRenameNode = async (item: MenuItem) => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.name,
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    });

    item.name = name;
    ElMessage.success('修改成功');
  } catch (error) {
    // 用户取消
  }
};

const getList = async () => {
  setTimeout(() => {
    list.value = [
    {
      id: "1",
      name: "1",
      children: [
        {
          id: "1-1",
          name: "1-1",
          children: [
            {
              id: "1-1-1",
              name: "1-1-1",
            },
          ],
        },
        {
          id: "1-2",
          name: "1-2",
        },
        {
          id: "1-3",
          name: "1-3",
        },
      ],
    },
    {
      id: "2",
      name: "2",
      children: [
        {
          id: "2-1",
          name: "2-1",
        },
        {
          id: "2-2",
          name: "2-2",
        },
      ],
    },
  ];
  initTree(list.value);
  }, 200)
}

onMounted(() => {
  getList();
})
</script>

<style scoped>
.tree-page-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 40px 20px;
}

.tree-card {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  color: #333;
}

.tree-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}
</style>
