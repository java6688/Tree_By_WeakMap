# Tree to Flat with WeakMap: 非侵入式树形结构管理方案

本项目旨在展示一种高效、现代且无副作用的树形数据管理模式。通过 JavaScript 的 `WeakMap` 特性，我们在内存中构建了一套“节点到父级”的扁平化索引系统，解决了树结构中最为棘手的“由子寻父”和“局部状态更新”问题。

---

## 🧠 抽象原理：为什么是 WeakMap？

在传统的树结构处理中，如果需要获取某个节点的父级或祖先路径，通常有两种方案：
1. **递归搜索**：每次查找都遍历整棵树，时间复杂度为 $O(N)$。
2. **手动挂载 `parent` 属性**：在原始数据上强行注入父节点引用。

**这两种方案都有明显的缺陷：** 递归效率低下，而手动挂载属性会导致对象循环引用（无法被 `JSON.stringify` 序列化），且污染了原始业务数据。

### 核心方案：建立“影子索引”
我们利用 `WeakMap` 的特性，在原始树数据之外维护一张“影子索引表”：
- **$O(1)$ 查找**：通过节点引用直接获取其父节点。
- **非侵入性**：原始数据对象保持纯净，没有任何多余属性。
- **内存安全**：`WeakMap` 对键是弱引用。如果原始树中的节点被删除且没有其他引用，垃圾回收器会自动清理索引表中的对应项。

---

## 🛠️ useTree API 详细参考与示例

以下示例均基于以下示例数据：
```javascript
const treeData = [
  { id: '1', name: '部门A', children: [
    { id: '1-1', name: '小组A-1', children: [
      { id: '1-1-1', name: '成员X' }
    ]}
  ]}
];
```

### 1. Hook 初始化

```typescript
const { ...methods } = useTree({
  treeNodeProp: { value: 'id', label: 'name', children: 'children' }
});
```

---

### 2. 方法详解与输出示例

#### **`initTree(list, parent?)`**
初始化树形结构的影子索引。
- **示例**:
  ```javascript
  initTree(treeData);
  console.log('索引构建完成');
  ```

#### **`getParent(node)`**
获取当前节点的直接父级。
- **示例**:
  ```javascript
  const target = treeData[0].children[0].children[0]; // 成员X
  const parent = getParent(target);
  console.log(parent.name);
  // 输出: "小组A-1"

  const rootParent = getParent(treeData[0]);
  console.log(Array.isArray(rootParent));
  // 输出: true (根节点的父级是原始数组本身)
  ```

#### **`getParents(item, parentList?, key?)`**
获取当前节点的所有祖先路径。
- **示例**:
  ```javascript
  const target = treeData[0].children[0].children[0]; // 成员X

  // 1. 获取对象路径
  const parents = getParents(target);
  console.log(parents.map(p => p.name));
  // 输出: ["小组A-1", "部门A"]

  // 2. 获取特定字段路径
  const ids = getParents(target, [], 'id');
  console.log(ids);
  // 输出: ["1-1", "1"]
  ```

#### **`getParentLabels(item)`**
快捷获取所有祖先节点的名称路径。
- **示例**:
  ```javascript
  const target = treeData[0].children[0].children[0]; // 成员X
  const labels = getParentLabels(target);
  console.log(labels);
  // 输出: ["小组A-1", "部门A"]
  ```

#### **`getParentValues(item)`**
快捷获取所有祖先节点的 ID 路径。
- **示例**:
  ```javascript
  const target = treeData[0].children[0].children[0]; // 成员X
  const values = getParentValues(target);
  console.log(values);
  // 输出: ["1-1", "1"]
  ```

#### **`addChild(node, child)`**
向指定节点添加子节点。
- **示例**:
  ```javascript
  const parentNode = treeData[0]; // 部门A
  const newNode = { id: '1-2', name: '小组A-2' };

  addChild(parentNode, newNode);

  console.log(parentNode.children.length); // 输出: 2
  console.log(getParent(newNode).name);   // 输出: "部门A" (索引已同步)
  ```

#### **`removeChild(node)`**
删除指定节点。
- **示例**:
  ```javascript
  const target = treeData[0].children[0]; // 小组A-1

  removeChild(target);

  console.log(treeData[0].children.length); // 输出: 1 (仅剩小组A-2)
  console.log(getParent(target));           // 输出: undefined (索引已清理)
  ```

---

## 🔍 项目深度拆解

### 1. 原生 HTML/JS 实现
- **核心逻辑**: 通过 `_treeWeakMap` 存储 `Node -> Parent`，通过 `_domDataMap` 存储 `HTMLElement -> NodeData`。
- **源码参考**: [tree.js](file:///html/tree.js)

### 2. React + Ant Design
- **核心逻辑**: 使用 `useRef` 持久化 `WeakMap`，结合 `useCallback` 优化性能。
- **源码参考**: [useTree.ts (React)](file:///react_demo/src/hooks/useTree.ts) | [App.tsx (React)](file:///react_demo/src/App.tsx)

### 3. Vue 3 + Element Plus
- **核心逻辑**: 在 Composition API 中封装，通过递归处理 `getParents`。
- **源码参考**: [useTree.ts (Vue)](file:///vue_demo/src/hooks/useTree.ts) | [App.vue (Vue)](file:///vue_demo/src/App.vue)

---

## 📊 性能对比分析

| 特性 | 传统递归方案 | 手动挂载 parent | **WeakMap 方案 (本项目)** |
| :--- | :--- | :--- | :--- |
| **查找效率** | $O(N)$ | $O(1)$ | **$O(1)$** |
| **数据序列化** | 完美支持 | 不支持 (循环引用) | **完美支持 (数据纯净)** |
| **开发侵入性** | 无 | 高 (修改原始对象) | **无 (完全隔离)** |
| **内存管理** | 自动 | 需手动置空防泄漏 | **自动 (弱引用特性)** |

## 🚀 运行指南

1. **HTML 版**: 直接浏览器打开 `html/index.html`。
2. **React 版**: `cd react_demo && pnpm i && pnpm dev`。
3. **Vue 版**: `cd vue_demo && pnpm i && pnpm dev`。

---
© 2026 Tree to Flat Project - 探索更优雅的数据结构管理。
