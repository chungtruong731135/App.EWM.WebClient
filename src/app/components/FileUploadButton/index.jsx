import React, { useState, useEffect } from 'react';
import { Upload, Modal, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
const { Dragger } = Upload;

const FileUpload = props => {
  const { URL, fileList, onChange, headers, multiple, disabled, accept, maxCount, customRequest } = props;

  const handlePreview = async file => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <>
      <Upload
        accept={accept ? accept : null}
        maxCount={maxCount ? maxCount : null}
        multiple={multiple}
        name="files"
        action={`${URL}`}
        fileList={fileList}
        onChange={onChange}
        headers={headers}
        disabled={disabled}
        customRequest={customRequest}
      >
        {
          disabled ? <></> : <Button icon={<UploadOutlined />}>Đính kèm</Button>
        }

      </Upload>
    </>
  );
};

export default FileUpload;
