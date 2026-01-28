import React from 'react';
import { Tree, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { type TreeItem } from '../App';
import './AntdTree.css';

export interface AntdTreeProps {
  data: TreeItem[];
  treeKey: number;
  onAddNode: (node: TreeItem) => void;
  onRenameNode: (node: TreeItem) => void;
  onDeleteNode: (node: TreeItem) => void;
  onClickLeaf: (node: TreeItem) => void;
}

const AntdTree: React.FC<AntdTreeProps> = ({
  data,
  treeKey,
  onAddNode,
  onRenameNode,
  onDeleteNode,
  onClickLeaf,
}) => {
  // 将原始数据转换为 antd Tree 格式
  // antd 需要 key, title 属性，或者通过 fieldNames 指定
  const renderTitle = (nodeData: any) => {
    const item = nodeData as TreeItem;
    return (
      <div className="custom-tree-node">
        <span className="node-name" onClick={() => onClickLeaf(item)}>
          {item.name}
        </span>
        <Space className="node-actions" size={4}>
          <Tooltip title="添加子节点">
            <PlusCircleOutlined
              className="action-btn add"
              onClick={(e) => {
                e.stopPropagation();
                onAddNode(item);
              }}
            />
          </Tooltip>
          <Tooltip title="重命名">
            <EditOutlined
              className="action-btn rename"
              onClick={(e) => {
                e.stopPropagation();
                onRenameNode(item);
              }}
            />
          </Tooltip>
          <Tooltip title="删除节点">
            <MinusCircleOutlined
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(item);
              }}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };

  return (
    <div className="antd-tree-container">
      <Tree
        key={`${treeKey}-${data.length > 0 ? 'loaded' : 'empty'}`}
        treeData={data}
        fieldNames={{
          title: 'name',
          key: 'id',
          children: 'children',
        }}
        blockNode
        defaultExpandAll
        titleRender={renderTitle}
        className="custom-antd-tree"
      />
    </div>
  );
};

export default AntdTree;
