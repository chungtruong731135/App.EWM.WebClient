import React, { useContext, useEffect, useMemo, useState } from 'react';
import { HolderOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table } from 'antd';
const RowContext = React.createContext({});
const DragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{
        cursor: 'move',
      }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const Row = props => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });
  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 9999,
        }
      : {}),
  };
  const contextValue = useMemo(
    () => ({
      setActivatorNodeRef,
      listeners,
    }),
    [setActivatorNodeRef, listeners]
  );
  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};
const App = ({ dataQuestion, setDataQuestion }) => {
  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setDataQuestion(prevState => {
        const activeIndex = prevState.findIndex(record => record.id === active?.id);
        const overIndex = prevState.findIndex(record => record.id === over?.id);
        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
  };

  const handleButton = async (type, item) => {
    switch (type) {
      case 'delete':
        var dataSourseDeleted = dataQuestion.filter(i => i.id !== item.id);
        setDataQuestion(dataSourseDeleted);
        break;

      default:
        break;
    }
  };

  const columns = [
    {
      key: 'sort',
      align: 'center',
      width: 80,
      render: () => <DragHandle />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-danger btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xoá câu hỏi khỏi danh sách"
              onClick={() => {
                handleButton(`delete`, record);
              }}
            >
              <i className="fa fa-times"></i>
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={dataQuestion.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <Table
          rowKey="id"
          components={{
            body: {
              row: Row,
            },
          }}
          columns={columns}
          dataSource={dataQuestion}
        />
      </SortableContext>
    </DndContext>
  );
};
export default App;
