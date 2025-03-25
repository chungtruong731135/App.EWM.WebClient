import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';
const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();

  const modalExamVariationState = useSelector(state => state.modal.modalExamVariationState);
  const modalVisible = modalExamVariationState?.modalVisible ?? false;
  const modalData = modalExamVariationState?.modalData ?? null;
  const examId = modalData?.examId ?? null;

  console.log(modalData);

  const [form] = Form.useForm();
  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (modalData && modalData.id) {
      form.setFieldsValue(modalData);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalData]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalExamVariationState({ modalVisible: false, modalData: null }));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };
      if (!modalData?.id) {
        body.examId = examId;
      }
      const res = modalData?.id ? await requestPUT_NEW(`api/v1/examvariations/${modalData?.id}`, body) : await requestPOST_NEW(`api/v1/examvariations`, body);
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
        <Modal.Title className="text-white">{modalData?.id ? 'Chi tiết' : 'Thêm mới mã đề'}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12">
                  <FormItem label="Mã đề" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" onChange={e => {}} />
                  </FormItem>
                </div>

                <div className="col-xl-12">
                  <FormItem label="" name="isScoreQuestion" valuePropName="checked">
                    <Checkbox>Tính điểm theo từng câu</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="" name="isDefault" valuePropName="checked">
                    <Checkbox>Đề mặc định</Checkbox>
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
            <i className="fa fa-save me-2"></i>
            {modalData ? 'Lưu' : 'Tạo mới'}
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
