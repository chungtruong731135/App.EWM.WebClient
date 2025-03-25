import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import * as actionsModal from '@/setup/redux/modal/Actions';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';

import { requestPOST_NEW, requestGET, requestPUT_NEW } from '@/utils/baseAPI';
import { Genders } from '@/app/data/datas';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/leads/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
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
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      setButtonLoading(true);

      const formData = form.getFieldsValue(true);
      var body = { ...formData };
      if (id) {
        body.id = id;
      } else {
        body.type = 1;
      }

      const res = id ? await requestPUT_NEW(`api/v1/leads/${id}`, body) : await requestPOST_NEW(`api/v1/leads`, body);
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
        let messagearrs = [];
        const messages = Object.values(res?.data?.messages ?? {});
        messages.forEach(item => {
          messagearrs = _.concat(messagearrs, item);
        });

        console.log(messagearrs);
        toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' ') + messagearrs.join(' '));
      }
    } catch (errorInfo) {
      toast.error('Thất bại, vui lòng thử lại! ');
    }
    setButtonLoading(false);
  };
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
  };
  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Thêm khách hàng</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" disabled={id ? true : false} onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row ">
                <div className="col-xl-6">
                  <FormItem label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="Họ và tên" />
                  </FormItem>
                </div>
                <div className="col-xl-6">
                  <FormItem label="Giới tính" name="gender">
                    <Select placeholder="Chọn giới tính" style={{ width: '100%' }} allowClear options={Genders} />
                  </FormItem>
                </div>
                <div className="col-xl-6">
                  <FormItem
                    label="Số điện thoại liên hệ"
                    name="phoneNumber"
                    rules={[
                      {
                        pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
                        message: 'Chưa đúng định dạng của số điện thoại! Vui lòng kiểm tra lại!',
                      },
                    ]}
                  >
                    <Input placeholder="Số điện thoại" />
                  </FormItem>
                </div>
                <div className="col-xl-6">
                  <FormItem
                    label="Email liên hệ"
                    name="email"
                    rules={[
                      {
                        pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Chưa đúng định dạng email! Vui lòng kiểm tra lại!',
                      },
                    ]}
                  >
                    <Input placeholder="Email" />
                  </FormItem>
                </div>

                <div className="col-xl-6">
                  <FormItem label="Địa chỉ" name="address">
                    <Input placeholder="Địa chỉ" />
                  </FormItem>
                </div>
                <div className="col-xl-6">
                  <FormItem label="Nguồn" name="source">
                    <Input placeholder="Nguồn" />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú" name="note">
                    <Input.TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {id ? (
          <></>
        ) : (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={handleSubmit} disabled={buttonLoading}>
              <i className="fa fa-save"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        )}
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa fa-times"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
