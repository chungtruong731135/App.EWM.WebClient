import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import FileUpload from '@/app/components/FileUpload';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fileReply, setFileReply] = useState([]);

  useEffect(() => {
    if (dataModal) {
      setFileReply(handleImage(dataModal?.teacherFiles ?? '', FILE_URL));
      form.setFieldsValue({ ...dataModal });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataModal]);

  const handleCancel = () => {
    form.resetFields();

    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      let arrFile = [];
      fileReply.forEach(i => {
        if (i?.response) {
          arrFile.push(i?.response?.data[0]?.url);
        } else {
          arrFile.push(i?.path);
        }
      });
      var body = {
        userExamId: dataModal?.testId,
        comment: formData?.comment ?? '',
        score: formData?.score ?? 0,
        teacherFiles: arrFile?.join('##'),
      };
      const res = await requestPOST_NEW(`api/v1/classsessiontests/nhan-xet-bai-cua-hoc-sinh`, body);

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
        <Modal.Title className="text-white">Nhận xét</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12">
                  <FormItem label="Điểm" name="score">
                    <InputNumber min={0} placeholder="" />
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
                    {/*  <TDEditorNew
                      data={form.getFieldValue('comment') ? form.getFieldValue('comment') : ''}
                      onChange={value => {
                        form.setFieldValue('comment', value);
                      }}
                    /> */}
                    <Input.TextArea rows={4} placeholder="" />
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
