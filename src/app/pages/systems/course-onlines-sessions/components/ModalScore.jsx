import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import FileUpload from '@/app/components/FileUpload';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fileReply, setFileReply] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/classsessionassignments/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        setFileReply(handleImage(_data?.teacherFiles ?? '', FILE_URL));
        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = () => {
    form.resetFields();

    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id && (formData?.score || formData?.comment)) {
        let arrFile = [];
        fileReply.forEach(i => {
          if (i?.response) {
            arrFile.push(i?.response?.data[0]?.url);
          } else {
            arrFile.push(i?.path);
          }
        });
        var body = {
          id: id,
          score: formData?.score,
          comment: formData?.comment ?? '',
          teacherFiles: arrFile?.join('##'),
        };
        const res = await requestPUT_NEW(`api/v1/classsessionassignments/teachers/${id}`, body);

        if (res.status === 200) {
          toast.success('Cập nhật thành công!');
          dispatch(actionsModal.setRandom());
          handleCancel();
        } else {
          const errors = Object.values(res?.data?.errors ?? {});
          let final_arr = [];
          errors.forEach(item => {
            final_arr = _.concat(final_arr, item);
          });
          toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
        }
      } else {
        toast.success('Cập nhật thành công!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setBtnLoading(false);
  };
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
  };
  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="lg" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chấm điểm</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12">
                  <FormItem label="Điểm" name="score" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Đính kèm">
                    <FileUpload
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={fileReply}
                      onChange={e => setFileReply(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Nhận xét" name="comment">
                    <TDEditorNew
                      data={form.getFieldValue('comment') ? form.getFieldValue('comment') : ''}
                      onChange={value => {
                        form.setFieldValue('comment', value);
                      }}
                    />
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save"></i>
            {'Lưu'}
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
