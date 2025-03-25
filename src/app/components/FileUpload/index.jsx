import React, { useState, useEffect } from 'react';
import { Upload, Modal } from 'antd';

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
      <Dragger
        accept={accept ? accept : null}
        maxCount={maxCount ? maxCount : null}
        multiple={multiple}
        name="files"
        action={URL ? `${URL}` : null}
        listType="picture"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={onChange}
        headers={headers}
        disabled={disabled}
        customRequest={customRequest}
      >
        {disabled ? (
          <></>
        ) : (
          <div>
            <p className="ant-upload-text">Thả tệp tin hoặc nhấp chuột để tải lên</p>
            <p className="ant-upload-hint">Đính kèm</p>
          </div>
        )}
      </Dragger>
    </>
  );
};

export default FileUpload;
