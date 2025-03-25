import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import TDEditorNew from '@/app/components/TDEditorNew';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';
const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();

  const modalExamSkillState = useSelector(state => state.modal.modalExamSkillState);
  const dataModal = modalExamSkillState?.modalData;
  const examId = dataModal?.examId ?? null;
  const id = dataModal?.id ?? null;
  const modalVisible = modalExamSkillState?.modalVisible;

  const [form] = Form.useForm();
  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/examskillparts/skill/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        form.setFieldsValue({ ..._data });
      }

      setLoadding(false);
    };
    if (id) {
      fetchData();
    } else {
      form.setFieldsValue({ examId: examId });
    }
    return () => {};
  }, [id, examId]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalExamSkillState({ modalVisible: false, modalData: null }));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };
      const res = id ? await requestPUT_NEW(`api/v1/examskillparts/skill/${id}`, body) : await requestPOST_NEW(`api/v1/examskillparts/skill`, body);
      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        handleCancel();
        dispatch(actionsModal.setRefreshSkill(Math.random()));
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
        <Modal.Title className="text-white">Kỹ năng</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12">
                  <FormItem label="Tên kỹ năng" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Số thứ tự" name="sortOrder">
                    <InputNumber placeholder="" min={0} />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    {/* <TextArea rows={4} placeholder="" /> */}
                    <TDEditorNew
                      data={form.getFieldValue('description') ? form.getFieldValue('description') : ''}
                      onChange={value => {
                        form.setFieldValue('description', value);
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
