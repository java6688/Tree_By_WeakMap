import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Input, message, ConfigProvider } from 'antd';
import AntdTree from './components/AntdTree';
import { useTree } from './hooks/useTree';
import zhCN from 'antd/locale/zh_CN';
import './App.css';

export interface TreeItem {
  id: string | number;
  name: string;
  children?: TreeItem[];
}

function App() {
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [treeKey, setTreeKey] = useState(0);
  const { initTree, addChild, getParentLabels, getParentValues, getParents } = useTree<TreeItem>({
    treeNodeProp: {
      value: 'id',
      label: 'name',
      children: 'children',
    }
  });

  // 初始化数据
  useEffect(() => {
    const initialData: TreeItem[] = [
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
    setTreeData(initialData);
    initTree(initialData);
  }, [initTree]);

  // 辅助函数：显示输入对话框
  const showPrompt = (title: string, defaultValue: string = '') => {
    return new Promise<string>((resolve, reject) => {
      let inputValue = defaultValue;
      const modal = Modal.confirm({
        title,
        content: (
          <Input
            defaultValue={defaultValue}
            onChange={(e) => { inputValue = e.target.value; }}
            onPressEnter={() => {
              if (!inputValue.trim()) {
                message.error('名称不能为空');
                return;
              }
              resolve(inputValue);
              modal.destroy();
            }}
            placeholder="请输入名称"
            autoFocus
          />
        ),
        onOk: () => {
          if (!inputValue.trim()) {
            message.error('名称不能为空');
            return Promise.reject();
          }
          resolve(inputValue);
        },
        onCancel: () => reject(),
      });
    });
  };

  const handleAddRootNode = async () => {
    try {
      const name = await showPrompt('添加根节点');
      const newNode = {
        id: Date.now().toString(),
        name,
        children: [],
      };

      const newData = [...treeData];
      addChild(newData, newNode);
      setTreeData(newData);
      initTree(newData);
      setTreeKey(prev => prev + 1);
      message.success('根节点添加成功');
    } catch (e) {
      // 用户取消
    }
  };

  const handleAddNode = async (parentItem: TreeItem) => {
    try {
      const name = await showPrompt(`添加 [${parentItem.name}] 的子节点`);
      const newNode: TreeItem = {
        id: Date.now().toString(),
        name,
        children: [],
      };

      // 注意：由于 React 的不可变性，我们需要深拷贝或特殊处理
      // 这里为了简单，我们直接修改副本并触发重新渲染
      const newData: TreeItem[] = JSON.parse(JSON.stringify(treeData));

      // 在新数据中找到对应的父节点
      const findAndAdd = (list: TreeItem[]) => {
        for (let item of list) {
          if (item.id === parentItem.id) {
            if (!item.children) item.children = [];
            item.children.push(newNode);
            return true;
          }
          if (item.children && findAndAdd(item.children)) return true;
        }
        return false;
      };

      findAndAdd(newData);
      setTreeData(newData);
      initTree(newData);
      setTreeKey(prev => prev + 1);
      message.success('添加成功');
    } catch (e) {
      // 用户取消
    }
  };

  const handleRenameNode = async (item: TreeItem) => {
    try {
      const name = await showPrompt('重命名', item.name);
      const newData: TreeItem[] = JSON.parse(JSON.stringify(treeData));

      const findAndRename = (list: TreeItem[]) => {
        for (let node of list) {
          if (node.id === item.id) {
            node.name = name;
            return true;
          }
          if (node.children && findAndRename(node.children)) return true;
        }
        return false;
      };

      findAndRename(newData);
      setTreeData(newData);
      initTree(newData);
      message.success('修改成功');
    } catch (e) {
      // 用户取消
    }
  };

  const handleDeleteNode = (item: TreeItem) => {
    Modal.confirm({
      title: '警告',
      content: `确定要删除节点 "${item.name}" 及其子节点吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const newData: TreeItem[] = JSON.parse(JSON.stringify(treeData));

        const findAndDelete = (list: TreeItem[]) => {
          for (let i = 0; i < list.length; i++) {
            if (list[i].id === item.id) {
              list.splice(i, 1);
              return true;
            }
            if (list[i].children && findAndDelete(list[i].children!)) return true;
          }
          return false;
        };

        findAndDelete(newData);
        setTreeData(newData);
        initTree(newData);
        setTreeKey(prev => prev + 1);
        message.success('删除成功');
      },
    });
  };

  const handleClickLeaf = useCallback((item: TreeItem) => {
    const parentList = getParents(item);
    console.log("路径数组", [item, ...parentList]);
    console.log("value路径数组", [item.id, ...getParentValues(item)]);
    console.log("label路径数组", [item.name, ...getParentLabels(item)]);
  }, [getParents, getParentValues, getParentLabels]);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="tree-page-container">
        <div className="tree-card">
          <h2>树形组件 (React + Ant Design)</h2>
          <div className="tree-header">
            <Button type="primary" onClick={handleAddRootNode}>
              添加根节点
            </Button>
          </div>
          <AntdTree
            data={treeData}
            treeKey={treeKey}
            onAddNode={handleAddNode}
            onRenameNode={handleRenameNode}
            onDeleteNode={handleDeleteNode}
            onClickLeaf={handleClickLeaf}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
