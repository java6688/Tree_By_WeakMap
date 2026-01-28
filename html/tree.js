(function() {
  // --- 树数据状态 ---
  let treeData = [
    {
      id: "1",
      name: "1",
      children: [
        {
          id: "1-1",
          name: "1-1",
          children: [
            { id: "1-1-1", name: "1-1-1", children: [] },
          ],
        },
        { id: "1-2", name: "1-2", children: [] },
        { id: "1-3", name: "1-3", children: [] },
      ],
    },
    {
      id: "2",
      name: "2",
      children: [
        { id: "2-1", name: "2-1", children: [] },
        { id: "2-2", name: "2-2", children: [] },
      ],
    },
  ];

  // 配置项
  const treeNodeProp = {
    value: 'id',
    label: 'name',
    children: 'children'
  };

  // --- WeakMap 索引逻辑 ---
  const _treeWeakMap = new WeakMap();
  const _domDataMap = new WeakMap(); // DOM 元素 -> 节点数据

  function _isRootNode(node) {
    return Array.isArray(node);
  }

  function initTree(list, parent = null) {
    list.forEach((item) => {
      // 存储 node -> parent 映射
      _treeWeakMap.set(item, parent || list);
      if (item[treeNodeProp.children] && item[treeNodeProp.children].length > 0) {
        initTree(item[treeNodeProp.children], item);
      }
    });
  }

  function getParent(node) {
    return _treeWeakMap.get(node);
  }

  function getParents(item, parentList = [], key) {
    let current = item;
    const result = [...parentList];
    while (true) {
      const parent = _treeWeakMap.get(current);
      // 递归到根节点数组时停止
      if (parent && !_isRootNode(parent)) {
        result.push(key ? parent[key] : parent);
        current = parent;
      } else {
        break;
      }
    }
    return result;
  }

  function getParentLabels(item) {
    return getParents(item, [], treeNodeProp.label);
  }

  function getParentValues(item) {
    return getParents(item, [], treeNodeProp.value);
  }

  // --- 渲染逻辑 ---
  const container = document.getElementById('tree-container');

  function render() {
    container.innerHTML = '';
    initTree(treeData);
    const treeElement = createTreeList(treeData);
    if (treeElement) {
      container.appendChild(treeElement);
    }
  }

  function createTreeList(data) {
    if (!data || data.length === 0) return null;
    const ul = document.createElement('ul');
    data.forEach(node => {
      const li = document.createElement('li');
      li.appendChild(createNodeElement(node));

      const childUl = createTreeList(node[treeNodeProp.children]);
      if (childUl) {
        const childMenu = document.createElement('div');
        childMenu.className = 'child-menu show';
        childMenu.appendChild(childUl);
        li.appendChild(childMenu);
      }
      ul.appendChild(li);
    });
    return ul;
  }

  function createNodeElement(node) {
    const div = document.createElement('div');
    div.className = 'tree-node-container';
    _domDataMap.set(div, node);

    const hasChildren = node[treeNodeProp.children] && node[treeNodeProp.children].length > 0;

    // 内容部分
    const content = document.createElement('div');
    content.className = 'node-content';

    // 图标
    const icon = document.createElement('span');
    if (hasChildren) {
      icon.className = 'arrow-icon is-active';
      icon.innerHTML = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M340.8 98.4l507.2 413.6-507.2 413.6z" fill="currentColor"></path></svg>';
    } else {
      icon.className = 'leaf-icon';
      icon.textContent = '•';
    }
    content.appendChild(icon);

    // 名称
    const nameSpan = document.createElement('span');
    nameSpan.className = 'node-name';
    nameSpan.textContent = node[treeNodeProp.label];
    content.appendChild(nameSpan);

    div.appendChild(content);

    // 操作按钮
    const actions = document.createElement('div');
    actions.className = 'node-actions';

    actions.innerHTML = `
      <button class="action-btn add" title="添加子节点" data-action="add">
        <svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m192 472h-168v168h-48v-168H320v-48h168V320h48v168h168v48z" fill="currentColor"></path></svg>
      </button>
      <button class="action-btn rename" title="重命名" data-action="rename">
        <svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M880 836H144c-17.7 0-32 14.3-32 32s14.3 32 32 32h736c17.7 0 32-14.3 32-32s-14.3-32-32-32zM160 724.8V768h43.2l411.2-411.2-43.2-43.2L160 724.8zM804.8 245.9L746.1 187.2c-12.5-12.5-32.8-12.5-45.3 0l-55.5 55.5 103.8 103.8 55.5-55.5c12.7-12.5 12.7-32.8 0.2-45.1z" fill="currentColor"></path></svg>
      </button>
      <button class="action-btn delete" title="删除节点" data-action="delete">
        <svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m165.4 548.2c4.7 4.7 4.7 12.3 0 17l-33.9 33.9c-4.7 4.7-12.3 4.7-17 0L512 548.5l-114.5 114.6c-4.7 4.7-12.3 4.7-17 0l-33.9-33.9c-4.7-4.7-4.7-12.3 0-17l114.6-114.5-114.6-114.5c-4.7-4.7-4.7-12.3 0-17l33.9-33.9c4.7-4.7 12.3-4.7 17 0l114.5 114.6 114.5-114.6c4.7-4.7 12.3-4.7 17 0l33.9 33.9c4.7 4.7 4.7 12.3 0 17L545.9 512l111.5 111.5-111.5-111.5z" fill="currentColor"></path></svg>
      </button>
    `;

    div.appendChild(actions);

    return div;
  }

  // --- 事件处理 ---
  container.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.action-btn');
    const nodeContainer = e.target.closest('.tree-node-container');

    if (actionBtn) {
      e.stopPropagation();
      const action = actionBtn.dataset.action;
      const node = _domDataMap.get(nodeContainer);
      handleAction(action, node);
      return;
    }

    if (nodeContainer) {
      const node = _domDataMap.get(nodeContainer);
      const hasChildren = node[treeNodeProp.children] && node[treeNodeProp.children].length > 0;

      // 处理展开/折叠
      if (hasChildren) {
        const arrow = nodeContainer.querySelector('.arrow-icon');
        const childMenu = nodeContainer.nextElementSibling;
        if (childMenu && childMenu.classList.contains('child-menu')) {
          arrow.classList.toggle('is-active');
          childMenu.classList.toggle('show');
        }
      }

      // 处理点击效果
      document.querySelectorAll('.tree-node-container').forEach(el => el.classList.remove('leaf-clicked'));
      nodeContainer.classList.add('leaf-clicked');

      // 打印路径
      const parentList = getParents(node);
      console.log("路径数组", [node, ...parentList]);
      console.log("value路径数组", [node[treeNodeProp.value], ...getParentValues(node)]);
      console.log("label路径数组", [node[treeNodeProp.label], ...getParentLabels(node)]);
    }
  });

  function handleAction(action, node) {
    if (action === 'add') {
      const name = prompt(`添加 [${node[treeNodeProp.label]}] 的子节点名称:`);
      if (name && name.trim()) {
        if (!node[treeNodeProp.children]) node[treeNodeProp.children] = [];
        const newNode = {
          id: Date.now().toString(),
          name: name.trim(),
          children: []
        };
        node[treeNodeProp.children].push(newNode);
        render();
      }
    } else if (action === 'rename') {
      const name = prompt('重命名节点:', node[treeNodeProp.label]);
      if (name && name.trim()) {
        node[treeNodeProp.label] = name.trim();
        render();
      }
    } else if (action === 'delete') {
      if (confirm(`确定要删除节点 "${node[treeNodeProp.label]}" 及其子节点吗？`)) {
        const parent = getParent(node);
        if (_isRootNode(parent)) {
          const index = parent.findIndex(item => item === node);
          parent.splice(index, 1);
        } else {
          parent[treeNodeProp.children] = parent[treeNodeProp.children].filter(item => item !== node);
        }
        render();
      }
    }
  }

  document.getElementById('add-root-btn').addEventListener('click', () => {
    const name = prompt('请输入根节点名称:');
    if (name && name.trim()) {
      treeData.push({
        id: Date.now().toString(),
        name: name.trim(),
        children: []
      });
      render();
    }
  });

  // 初始渲染
  render();
})();
