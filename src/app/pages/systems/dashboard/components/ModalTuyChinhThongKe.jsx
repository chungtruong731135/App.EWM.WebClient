import React, { useState, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';

import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';

const RenderItem = () => {
  return (
    <div className="col-xl-3 col-lg-3 ">
      <div className="border border-gray-300 border-dashed rounded p-3 my-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className={`bg-opacity-25 bg-primary rounded-circle h-35px w-35px d-flex align-items-center justify-content-center me-3 `}>
            <span className={`svg-icon fs-2 text-primary fa fa-clipboard-list`}></span>
          </div>
          <span className="fw-bold text-gray-800">Nhiệm vụ</span>
        </div>
        <div className="d-flex ">
          <button className="btn btn-icon btn-sm btn-active-light-danger">
            <i class="ki-outline ki-burger-menu-3 text-red-500 fs-3"></i>
          </button>
          <button className="btn btn-icon btn-sm btn-active-light-danger">
            <i class="ki-outline ki-minus-circle text-red-500 fs-3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalItem = ({ modalVisible, setModalVisible, handleSubmit }) => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [btnLoading, setBtnLoading] = useState(false);

  const data = [
    {
      id: 'Column1',
      title: 'Column1',
    },
    {
      id: 'Column2',
      title: 'Column2',
    },
  ];

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
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

      form.setFieldsValue({ source: arrImage.join('##') });

      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/banners/${id}`, formData) : await requestPOST_NEW(`api/v1/banners`, formData);

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
      <Modal.Header className="px-4 py-2">
        <Modal.Title className="">Tuỳ chỉnh thống kê</Modal.Title>
        <div className="btn btn-sm btn-icon btn-active-color-primary" onClick={handleCancel}>
          <i className="ki-solid ki-cross fs-1"></i>
        </div>
      </Modal.Header>
      <Modal.Body>
        <span className="fw-bold text-gray-800">Đã chọn:</span>
        <div class="container">
          <div className="row">
            <RenderItem />
            <RenderItem />
            <RenderItem />
            <RenderItem />
            <RenderItem />
            <RenderItem />
          </div>
        </div>
        <span className="fw-bold text-gray-800">Không chọn:</span>
        <div className="row">
          <div className="col-xl-6 col-lg-6"></div>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center d-flex justify-content-between">
        <button type="button" className="btn btn-sm btn-secondary rounded-1 py-2 px-5 ms-2 " onClick={handleSubmit} disabled={btnLoading}>
          <i className="fa fa-refresh me-2"></i>
          {'Đặt lại mặc định'}
        </button>
        <div className="align-items-center d-flex">
          <button type="button" className="btn btn-sm btn-primary rounded-1 py-2 px-5 ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save me-2"></i>
            {'Lưu'}
          </button>
          <button type="button" className="btn btn-sm btn-secondary rounded-1 py-2 px-5 ms-2" onClick={handleCancel}>
            <i className="fa fa-times me-2"></i>Đóng
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
