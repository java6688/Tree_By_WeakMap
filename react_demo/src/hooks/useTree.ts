import { useCallback, useRef } from 'react';

export type TreeNodeProp<T> = {
  value: keyof T;
  label: keyof T;
  children: keyof T;
};

export type Props<T> = {
  treeNodeProp?: TreeNodeProp<T>;
};

/**
 * 树结构索引数据 Hook
 * 使用 WeakMap 存储节点与其父节点的映射关系
 */
export const useTree = <T extends Record<string, any>>(props: Props<T> = {
  treeNodeProp: {
    value: 'id' as keyof T,
    label: 'name' as keyof T,
    children: 'children' as keyof T,
  }
}) => {
  const treeNodeProp = props.treeNodeProp!;
  // 使用 useRef 确保 WeakMap 在重渲染间持久化
  const treeWeakMap = useRef(new WeakMap<T, T | T[]>());

  // 设置节点的父节点映射
  const setParent = useCallback((node: T, parent: T | T[]) => {
    treeWeakMap.current.set(node, parent);
  }, []);

  // 判断是否为根节点数组
  const isRootNode = useCallback((node: T | T[]): node is T[] => {
    return Array.isArray(node);
  }, []);

  // 初始化树结构索引
  const initTree = useCallback((list: T[], parent?: T) => {
    const recursiveInit = (innerList: T[], innerParent?: T) => {
      innerList.forEach((item) => {
        // 根节点的父级为完整的树数据，在删除根节点时需要通过完整的数组删除
        treeWeakMap.current.set(item, innerParent || innerList);
        const children = item[treeNodeProp.children];
        if (Array.isArray(children)) {
          // 递归处理子节点
          recursiveInit(children as T[], item);
        }
      });
    };
    recursiveInit(list, parent);
  }, [treeNodeProp.children]);

  // 添加子节点
  const addChild = useCallback((node: T | T[], child: T) => {
    if (isRootNode(node)) {
      // 根节点数组直接添加
      node.push(child);
      setParent(child, node);
    } else {
      // 非根节点，添加到children数组
      if (!Array.isArray(node[treeNodeProp.children])) {
        (node as any)[treeNodeProp.children] = [];
      }
      const children = node[treeNodeProp.children] as T[];
      children.push(child);
      setParent(child, node);
    }
  }, [isRootNode, setParent, treeNodeProp.children]);

  // 删除指定节点
  const removeChild = useCallback((node: T) => {
    const parent = treeWeakMap.current.get(node);
    if (!parent) {
      throw new Error('没有找到父级节点！');
    }

    if (isRootNode(parent)) {
      // 删除根节点
      const index = parent.findIndex((item: T) => item === node);
      if (index >= 0) {
        parent.splice(index, 1);
      } else {
        throw new Error('没有找到要删除的根节点！');
      }
    } else {
      // 通过找到父级删除自己
      const children = parent[treeNodeProp.children] as T[];
      if (Array.isArray(children)) {
        (parent as any)[treeNodeProp.children] = children.filter((item: T) => item !== node);
      }
    }
  }, [isRootNode, treeNodeProp.children]);

  // 获取节点的父节点
  const getParent = useCallback((node: T) => {
    return treeWeakMap.current.get(node);
  }, []);

  // 获取节点的所有父节点
  const getParents = useCallback((item: T, parentList: (T | T[keyof T])[] = [], key?: keyof T): (T | T[keyof T])[] => {
    let current = item;
    const result: (T | T[keyof T])[] = [...parentList];
    while (true) {
      const parent = treeWeakMap.current.get(current);
      // 递归到根节点数组时停止
      if (parent && !isRootNode(parent)) {
        result.push(key ? (parent as T)[key] : (parent as T));
        current = parent as T;
      } else {
        break;
      }
    }
    return result;
  }, [isRootNode]);

  // 获取节点的所有父节点 label 数组
  const getParentLabels = useCallback((item: T, labelList: T[keyof T][] = []): T[keyof T][] => {
    return getParents(item, labelList as any[], treeNodeProp.label) as T[keyof T][];
  }, [getParents, treeNodeProp.label]);

  // 获取节点的所有父节点 value 数组
  const getParentValues = useCallback((item: T, valueList: T[keyof T][] = []): T[keyof T][] => {
    return getParents(item, valueList as any[], treeNodeProp.value) as T[keyof T][];
  }, [getParents, treeNodeProp.value]);

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
