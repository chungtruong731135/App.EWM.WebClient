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

const commonStyle = {
  cursor: 'move',
  transition: 'unset',
  paddingInline: 10, paddingBlock: 5,
  fontSize: '1.15rem'
};
const DraggableTag = (props) => {
  const { tag, tagIndex } = props;
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
    <Tag style={style} ref={setNodeRef} {...listeners}>
      {tag.content}
    </Tag>
  );
};

const TDInputDragTag = props => {
  const { value, onChange } = props;
  const [items, setItems] = useState([]);
  useEffect(() => {
    const shuffledItems = _.shuffle(value);

    // Cập nhật lại sortOrder
    const updatedItems = shuffledItems.map((item, index) => ({
      ...item,
      sortOrder: index, // Gán index mới làm sortOrder
    }));
    setItems(updatedItems)
  }, [value]);
  useEffect(() => {
    onChange(items)
  }, [items]);

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index, // Gán lại sortOrder theo thứ tự mới
      }));

      setItems(reorderedItems);

    }
  }
  return (
    <div className='border border-dashed border-gray p-2 rounder'>
      {
        items?.length > 0 ?
          <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={items} strategy={horizontalListSortingStrategy}>
              <Flex gap="5px 5px" wrap>
                {items.map((item, index) => (
                  <DraggableTag tag={item} key={index} tagIndex={index} />
                ))}
              </Flex>

            </SortableContext>
          </DndContext> :
          <span className='text-muted'>Vui lòng thêm đáp án</span>
      }
    </div>
  );
};
export default TDInputDragTag;
