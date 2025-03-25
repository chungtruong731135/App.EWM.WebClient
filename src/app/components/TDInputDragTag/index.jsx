import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import _ from 'lodash';
import { create_UUID } from '@/utils/utils';
const tagInputStyle = {
  height: 32,
  marginInlineEnd: 8,
  verticalAlign: 'center',
};
const commonStyle = {
  cursor: 'move',
  transition: 'unset',
  paddingInline: 10, paddingBlock: 5,
  fontSize: '1.15rem'
};
const DraggableTag = (props) => {
  const { tag, tagIndex, handleClose, setEditInputIndex, setEditInputValue } = props;
  const { listeners, transform, transition, isDragging, setNodeRef } = useSortable({
    id: tag?.id,
  });
  const style = transform
    ? {
      ...commonStyle,
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
    }
    : commonStyle;
  return (

    <Tag
      key={tag?.id}
      closable={true}
      onClose={() => handleClose(tag?.id)}
      style={style}
      ref={setNodeRef}
    >
      <span
        {...listeners}
        onDoubleClick={e => {
          setEditInputIndex(tagIndex);
          setEditInputValue(tag?.content);
          e.preventDefault();
        }}
      >
        {tag?.content}
      </span>
    </Tag>
  );
};
const TDInputTag = props => {
  const { value, onChange } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);
  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputValue]);
  const handleClose = removedIndex => {
    const newTags = [...value].splice(removedIndex, 1)
    onChange(newTags);
  };
  const showInput = () => {
    setInputVisible(true);
  };
  const handleInputChange = e => {
    setInputValue(e.target.value);
  };
  const handleInputConfirm = () => {
    if (inputValue && !value.some((tag) => tag.content === inputValue)) {
      const newTag = {
        id: create_UUID(),
        content: inputValue,
        correctPosition: value.length,
        sortOrder: value.length,
      };
      onChange([...value, newTag]);
    }
    setInputVisible(false);
    setInputValue('');
  };
  const handleEditInputChange = e => {
    setEditInputValue(e.target.value);
  };
  const handleEditInputConfirm = () => {
    const newTags = [...value];
    newTags[editInputIndex].content = editInputValue;
    onChange(newTags);
    setEditInputIndex(-1);
    setEditInputValue('');
  };
  const tagPlusStyle = {
    padding: 5,
  };
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      const oldIndex = value.findIndex((item) => item.id === active.id);
      const newIndex = value.findIndex((item) => item.id === over.id);
      console.log(oldIndex, newIndex)
      const reorderedItems = arrayMove(value, oldIndex, newIndex).map((item, index) => ({
        ...item,
        correctPosition: index, // Gán lại sortOrder theo thứ tự mới
      }));
      onChange(reorderedItems)
    }
  }
  return (
    <Flex gap="5px 5px" wrap="wrap">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={value} strategy={horizontalListSortingStrategy}>

          {value?.map((tag, index) => {
            if (editInputIndex === index) {
              return <Input ref={editInputRef} key={tag} size="small" style={tagInputStyle} value={editInputValue} onChange={handleEditInputChange} onBlur={handleEditInputConfirm} onPressEnter={handleEditInputConfirm} />;
            }
            const tagElem = (
              <DraggableTag tag={tag} key={index} tagIndex={index} handleClose={handleClose} setEditInputIndex={setEditInputIndex} setEditInputValue={setEditInputValue} />
            )
            return tagElem;
          })}
        </SortableContext>
      </DndContext>
      {inputVisible ? (
        <Input ref={inputRef} type="text" size="small" style={tagInputStyle} value={inputValue} onChange={handleInputChange} onBlur={handleInputConfirm} onPressEnter={handleInputConfirm} />
      ) : (
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
          Thêm đáp án
        </Tag>
      )}
    </Flex>
  );
};
export default TDInputTag;
