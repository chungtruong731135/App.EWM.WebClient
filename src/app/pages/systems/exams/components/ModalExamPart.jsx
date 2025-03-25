import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { Form, Input, Spin, InputNumber, Radio } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL, requestGET } from '@/utils/baseAPI';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import { handleImage } from '@/utils/utils';
import FileUpload from '@/app/components/FileUpload';
const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const modalExamPartState = useSelector(state => state.modal.modalExamPartState);
  const dataModal = modalExamPartState?.modalData;
  const modalVisible = modalExamPartState?.modalVisible ?? false;

  const [form] = Form.useForm();
  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [typeVideo, setTypeVideo] = useState(0);
  const [videoList, setVideoList] = useState([]);

  const skillId = dataModal?.skillId ?? null;
  const id = dataModal?.id ?? null;

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/examskillparts/part/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        setVideoList(handleImage(dataModal?.attachmentAudio ?? '', FILE_URL));

        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    } else {
      form.setFieldsValue({ skillId: skillId });
    }
    return () => {};
  }, [id, skillId]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalExamPartState({ modalVisible: false, modalData: null }));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };

      const res = dataModal?.id ? await requestPUT_NEW(`api/v1/examskillparts/part/${dataModal?.id}`, body) : await requestPOST_NEW(`api/v1/examskillparts/part`, body);
      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        handleCancel();
        dispatch(actionsModal.setRefreshPart(Math.random()));
      } else {
        toast.error('Thất bại, vui lòng thử lại!');
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
        <Modal.Title className="text-white">Nhóm câu hỏi</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12">
                  <FormItem label="Tên" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                  <FormItem label="Số thứ tự" name="sortOrder">
                    <InputNumber placeholder="" min={0} />
                  </FormItem>
                  <div className="col-xl-12">
                    <Form.Item label="Link bài nghe(mp3)">
                      <Radio.Group onChange={e => setTypeVideo(e.target.value)} value={typeVideo}>
                        <Radio value={0}>Đính kèm</Radio>
                        <Radio value={1}>Đường dẫn</Radio>
                      </Radio.Group>
                    </Form.Item>
                    {typeVideo == 0 ? (
                      <Form.Item>
                        <FileUpload
                          maxCount={1}
                          accept="audio/*"
                          URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/audio`}
                          fileList={videoList}
                          onChange={e => {
                            if (e?.file?.status === 'error') {
                              toast.warning('Dung lượng quá lớn');
                            }
                            setVideoList(e.fileList);
                          }}
                          headers={{
                            Authorization: `Bearer ${token}`,
                          }}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item name="attachmentAudio">
                        <Input placeholder="" />
                      </Form.Item>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save me-2"></i>
            Lưu
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times me-2"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
