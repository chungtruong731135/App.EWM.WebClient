import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Spin, Checkbox, InputNumber, DatePicker, Upload } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL, requestPOST, requestUploadFile } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import TDEditorNew from '@/app/components/TDEditorNew';
import FileUpload from '@/app/components/FileUpload';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Dragger } = Upload;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const { isModalImport, setIsModalImport } = props;
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loadding, setLoadding] = useState(false);
  const fileInputRef = useRef(null);

  const handleCancel = () => {
    form.resetFields();
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    //dispatch(actionsModal.setModalVisible(false));
    setIsModalImport(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    if (!files || files.length === 0) {
      toast.error('Vui lòng chọn file trước khi tải lên!');
      return;
    }
    setLoadding(true);
    const formData = new FormData();
    console.log(typeof files[0]);

    formData.append('file', files[0]);
    formData.append('bookId', id);
    const res = await requestUploadFile('api/v1/bookpages/pdf', formData);
    if (res?.data) {
      toast.success('Thao tác thành công');
      dispatch(actionsModal.setRandom());
      setLoadding(false);

      handleCancel();
      return;
    }
    toast.error('Không thành công');
    setLoadding(false);
  };

  const uploads = {
    onRemove: file => {
      const index = files.indexOf(file);
      const newFileList = files.slice();
      newFileList.splice(index, 1);
      setFiles(newFileList);
    },
    beforeUpload: file => {
      setFiles([file]);
      return false;
    },
    name: 'file',
    multiple: false,
    fileList: files,
    accept: '.pdf',
    maxCount: 1,
  };

  return (
    <Modal show={isModalImport} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Nhập sách </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          <>
            <div className="col-xl-12">
              <Form.Item>
                <Form.Item label="File đính kèm">
                  <Dragger {...uploads} maxCount={1}>
                    <p className="ant-upload-text">Thả tệp tin hoặc nhấp chuột để tải lên</p>
                  </Dragger>
                </Form.Item>
              </Form.Item>
            </div>
          </>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={onFinish} disabled={loadding}>
            <i className="fa fa-save"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
