import React, { useState, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber, DatePicker } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';

import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import dayjs from 'dayjs';
import TDEditorNew from '@/app/components/TDEditorNew';
import { ContestScoreboardVisibilities, ContestStatuses } from '@/app/data/datas';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/contests/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.startDate = _data?.startDate ? dayjs(_data?.startDate) : null;
        _data.endDate = _data?.endDate ? dayjs(_data?.endDate) : null;

        form.setFieldsValue({ ..._data });
        setImage(handleImage(_data?.imageUrl ?? '', FILE_URL));
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
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    setBtnLoading(true);
    try {
      let arrImage = [];
      image.forEach(i => {
        if (i.response) {
          arrImage.push(i.response.data[0].url);
        } else {
          arrImage.push(i.path);
        }
      });

      form.setFieldsValue({ imageUrl: arrImage.join('##') });

      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/contests/${id}`, formData) : await requestPOST_NEW(`api/v1/contests`, formData);

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
                  <FormItem label="Tên cuộc thi" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mã cuộc thi" name="code">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Chế độ hiển thị bảng điểm" name="scoreboardVisibility" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={1}>
                    <Select
                      style={{ width: '100%' }}
                      options={ContestScoreboardVisibilities}
                      onChange={() => {
                        form.setFieldValue('config', []);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thời gian bắt đầu" name="startDate">
                    <DatePicker showTime={true} format={'DD/MM/YYYY HH:mm'} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thời gian kết thúc" name="endDate">
                    <DatePicker showTime={true} format={'DD/MM/YYYY HH:mm'} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Trạng thái" name="status" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={1}>
                    <Select
                      style={{ width: '100%' }}
                      options={ContestStatuses}
                      onChange={() => {
                        form.setFieldValue('config', []);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số lượng tài khoản đăng ký tối đa" name="maxParticipant">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ảnh đại diện">
                    <ImageUpload
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={image}
                      onChange={e => setImage(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thứ tự" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isPrivate" valuePropName="checked">
                    <Checkbox>Kỳ thi riêng tư cho 1 số thành viên</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="allowNotifications" valuePropName="checked">
                    <Checkbox>Cho phép đăng thông báo</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="allowComments" valuePropName="checked">
                    <Checkbox>Cho phép bình luận</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Nội dung cuộc thi" name="content" valuePropName="checked">
                    <TDEditorNew
                      data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                      onChange={value => {
                        form.setFieldValue('content', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
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
