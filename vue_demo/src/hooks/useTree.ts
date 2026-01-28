
type Props = {
  // 树形数据字段名映射类型
  treeNodeProp: TreeNodeProp
}

// 树节点属性映射类型
type TreeNodeProp = {
  value: string;
  label: string;
  children: string;
}

// 数节点
type TreeNode = any

/**
 * 树结构索引数据
 * key为节点本身，value为父节点或根节点数组(即整棵树)
 * 如果value为Array，代表根节点数组
 * 如果value为Object，代表子节点
 */
const _treeWeakMap = new WeakMap<TreeNode, TreeNode | TreeNode[]>();

// 使用weakmap构建树形数据数据索引
export const useTree = (
  props: Props = {
    treeNodeProp: {
      value: 'value',
      label: 'label',
      children: 'children',
    }
  }
) => {
  const { treeNodeProp } = props;

  // 设置节点的父节点映射。为防止用户错误使用，不向外暴露，内部使用
  function _setParent(node: TreeNode, parent: TreeNode | TreeNode[]) {
    _treeWeakMap.set(node, parent);
  }

  // 判断是否根节点
  function _isRootNode(node: TreeNode | TreeNode[]) {
    return Array.isArray(node);
  }

  // 初始化树结构索引
  function initTree(list: TreeNode[], parent?: TreeNode) {
    list.forEach((item) => {
      // 根节点的父级为完整的树数据，在删除根节点时需要通过完整的数组删除
      _treeWeakMap.set(item, parent || list);
      if (item[treeNodeProp.children]) {
        // 删除子节点只需要通过对应子节点的children数组删除
        initTree(item[treeNodeProp.children], item);
      }
    });
  }

  // 添加子节点或根节点，节点不存在.children时，代表添加到根节点数组
  function addChild(node: TreeNode, child: TreeNode) {
    if(_isRootNode(node)) {
      // 根节点数组直接添加
      const i = node.push(child) - 1;
      /**
       * 为新增加的子节点构建一个WeakMap索引，指向父节点
       * 注意：注册为key的引用地址是经过proxy处理后的节点
       */
      node[i] && _setParent(node[i], node);
    } else {
      // 非根节点，添加到children数组
      if (!node[treeNodeProp.children]) {
        node[treeNodeProp.children] = [];
      }
      const i = node[treeNodeProp.children].push(child) - 1;
      // 和上面设置根节点同理
      node.children[i] && _setParent(node.children[i], node);
    }
  }

  // 删除指定子节点
  function removeChild(node: TreeNode) {
    // 找到父节点，通过父节点删除
    const parent = getParent(node);
    if(!parent) {
      // 没有找到父级节点，抛出错误
      throw new Error('没有找到父级节点！');
    }
    if(_isRootNode(parent)) {
      // 删除根节点
      const index = parent.findIndex((item: TreeNode) => item === node);
      if(index >= 0) {
        parent.splice(index, 1);
      } else {
        // 没有找到要删除的根节点，抛出错误
        throw new Error('没有找到要删除的根节点！');
      }
    } else {
      // 通过找到父级删除自己
      parent.children = parent.children.filter((item: TreeNode) => item !== node);
    }
  }

  // 获取节点的父节点
  function getParent(node: TreeNode) {
    return _treeWeakMap.get(node);
  }

  // 获取节点的所有父节点
  function getParents(item: TreeNode, parentList: (TreeNode | string)[] = [], key?: string): (TreeNode | string)[] {
    const parent = _treeWeakMap.get(item);
    // 递归到根节点数组时停止
    if (parent && !_isRootNode(parent)) {
      parentList.push(key ? parent[key] : parent);
      getParents(parent, parentList, key);
    }
    return parentList;
  }

  // 获取节点的所有父节点label数组
  function getParentLabels(item: TreeNode, labelList: string[] = []): string[] {
    return getParents(item, labelList, treeNodeProp.label) as string[];
  }

  // 获取节点的所有父节点value数组
  function getParentValues(item: TreeNode, valueList: string[] = []): string[] {
    return getParents(item, valueList, treeNodeProp.value) as string[];
  }

  return {
    getParents,
    getParentLabels,
    getParentValues,
    getParent,
    initTree,
    addChild,
    removeChild,
  };
};
