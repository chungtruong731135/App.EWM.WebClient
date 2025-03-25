import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';

import { requestPOST_NEW, requestPOST } from '@/utils/baseAPI';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const questions = dataModal?.questions ?? [];

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestPOST(`api/v1/surveys/get-users`, { id: id });

      var _data = res?.data ?? null;
      if (_data) {
        form.setFieldsValue({ ..._data });
      }

      var _questions = questions.map(question => {
        const tmp = (_data?.surveyAnswers ?? []).find(gv => gv.surveyQuestionOrderId === question.surveyQuestionOrderId);
        return {
          ...question,
          surveyQuestionOptionId: tmp?.surveyQuestionOptionId ?? null,
          answer: tmp?.answer ?? null,
        };
      });

      _questions.sort((a, b) => a.order - b.order);

      form.setFieldValue('questions', _questions);

      setLoadding(false);
    };
    if (id) {
      fetchData();
    } else if (questions) {
      form.setFieldValue('questions', questions);
    }
    return () => {};
  }, [id, questions]);

  const handleCancel = () => {
    form.resetFields();
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      await form.validateFields();

      const formData = form.getFieldsValue(true);

      var body = {};

      if (id) {
        formData.id = id;
        body.surveyUserId = id;
      }

      formData.questions?.map(i => {
        i.surveyQuestionId = i.id;
      });

      body.answers = formData.questions;
      body.status = formData.status;

      const res = await requestPOST_NEW(`api/v1/surveys/create-or-update-answers`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        //toast.error('Thất bại, vui lòng thử lại!');
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

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Họ và tên" name="fullName">
                    <Input placeholder="" disabled />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tài khoản" name="userName">
                    <Input placeholder="" disabled />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số điện thoại" name="phoneNumber">
                    <Input placeholder="" disabled />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Trạng thái khảo sát" name="status">
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Đang thực hiện',
                        },
                        {
                          value: 1,
                          label: 'Kết thúc',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.List name="questions">
                    {fields => (
                      <>
                        {fields.map(field => (
                          <>
                            {form.getFieldValue(['questions', field.name, 'type']) == 1 ? (
                              <div className="col-xl-12 col-lg-12">
                                <FormItem label={form.getFieldValue(['questions', field.name, 'content'])} name={[field.name, 'surveyQuestionOptionId']}>
                                  <Select style={{ width: '100%' }} options={(form.getFieldValue(['questions', field.name, 'options']) ?? []).map(i => ({ label: i.content, value: i.id }))} />
                                </FormItem>
                              </div>
                            ) : (
                              <FormItem label={form.getFieldValue(['questions', field.name, 'content'])} name={[field.name, 'answer']}>
                                <TextArea rows={4} placeholder="" />
                              </FormItem>
                            )}
                          </>
                        ))}
                      </>
                    )}
                  </Form.List>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={onFinish} disabled={btnLoading}>
            <i className="fa fa-save me-2"></i>
            {id ? 'Lưu' : 'Tạo mới'}
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
