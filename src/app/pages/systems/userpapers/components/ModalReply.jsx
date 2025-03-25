import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW } from '@/utils/baseAPI';
import dayjs from 'dayjs';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);
  const parentId = dataModal?.parentId ?? null;
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/comments/${id}`);
      var _data = res?.data ?? null;
      if (_data) {
        _data.createdOn = _data?.createdOn ? dayjs(_data?.createdOn).format('DD/MM/YYYY HH:mm') : null;
        form.setFieldsValue(_data);
      }
      setLoading(false);
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
      const formData = await form.getFieldsValue(true);

      var body = {
        parentId: dataModal?.parentId,
        content: formData?.content,
        status: formData?.status,
        orderStatus: formData?.orderStatus,
      };

      const res = await requestPOST_NEW(`api/v1/userpapers/update-note`, body);

      if (res.status === 200) {
        toast.success('Thao tác thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
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
        <Modal.Title className="text-white">Nội dung trao đổi - tư vấn</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <div className="row">
                {dataModal?.advisedNote ? (
                  <>
                    <div className="col-xl-6 col-lg-12">
                      <FormItem label="Người tư vấn" name="advisedByFullName">
                        <Input disabled placeholder="" />
                      </FormItem>
                    </div>
                    <div className="col-xl-6 col-lg-12">
                      <FormItem label="Thời gian tư vấn" name="advisedDate">
                        <Input disabled placeholder="" />
                      </FormItem>
                    </div>
                  </>
                ) : (
                  <></>
                )}
                <div className="col-12">
                  <FormItem label="Nội dung trao đổi" name="content">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>

                <div className="col-xl-6">
                  <FormItem label="Trạng thái" name="status">
                    <Select
                      allowClear
                      placeholder="Chọn"
                      style={{ width: '100%' }}
                      options={[
                          {
                          value: 1,
                          label: 'Đã tư vấn',
                        },
                        {
                          value: 2,
                          label: 'Đang tư vấn',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Trạng thái mua hàng" name="orderStatus">
                    <Select
                      allowClear
                      placeholder="Chọn"
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Khách mua hàng',
                        },
                        {
                          value: 1,
                          label: 'Khách không mua hàng',
                        },
                        {
                          value: 2,
                          label: 'Đang phân vân',
                        },
                      ]}
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
