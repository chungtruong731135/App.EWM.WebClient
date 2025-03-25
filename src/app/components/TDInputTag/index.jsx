import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
const tagInputStyle = {
  height: 32,
  marginInlineEnd: 8,
  verticalAlign: 'center',
};
const TDInputTag = props => {
  const { value, onChange } = props;
  console.log('value', value);
  const [tags, setTags] = useState([]);
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
  const handleClose = removedTag => {
    const newTags = value.filter(tag => tag !== removedTag);
    onChange(newTags);
  };
  const showInput = () => {
    setInputVisible(true);
  };
  const handleInputChange = e => {
    setInputValue(e.target.value);
  };
  const handleInputConfirm = () => {
    if (inputValue && !value?.includes(inputValue)) {
      onChange([...value, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };
  const handleEditInputChange = e => {
    setEditInputValue(e.target.value);
  };
  const handleEditInputConfirm = () => {
    const newTags = [...value];
    newTags[editInputIndex] = editInputValue;
    onChange(newTags);
    setEditInputIndex(-1);
    setEditInputValue('');
  };
  const tagPlusStyle = {
    padding: 5,
  };
  return (
    <Flex gap="5px 5px" wrap="wrap">
      {value?.map((tag, index) => {
        if (editInputIndex === index) {
          return <Input ref={editInputRef} key={tag} size="small" style={tagInputStyle} value={editInputValue} onChange={handleEditInputChange} onBlur={handleEditInputConfirm} onPressEnter={handleEditInputConfirm} />;
        }
        const tagElem = (
          <Tag
            key={tag}
            closable={true}
            style={{
              userSelect: 'none',
              padding: 5,
            }}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={e => {
                setEditInputIndex(index);
                setEditInputValue(tag);
                e.preventDefault();
              }}
            >
              {tag}
            </span>
          </Tag>
        );
        return tagElem;
      })}
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
