import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { DatePicker, Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestPOST_NEW } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import dayjs from 'dayjs';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      let formData = form.getFieldsValue(true);
      if (dataModal?.id) {
        formData.userPaperId = dataModal?.id;
      }
      console.log(formData);

      const res = await requestPOST_NEW(`api/v1/userpapers/chuyen-xu-ly`, formData);

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
    <Modal show={modalVisible} onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel} fullscreen={'lg-down'} size="xl">
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chuyển xử lý</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Người xử lý" name="user" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/users/search`, {
                          pageNumber: 1,
                          pageSize: 20,
                          types: [0, 4, 5],
                          isActive: true,
                          keyword: keyword,
                        });
                        var _data = res?.data ?? [];
                        return _data?.map(item => ({
                          ...item,
                          label: `${item.fullName} (${item?.userName})`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('nguoiXuLyId', current?.id);
                        } else {
                          form.setFieldValue('nguoiXuLyId', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày hết hạn" name="hanXuLyDen">
                    <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} disabledDate={d => d.isBefore(dayjs().format('YYYY-MM-DD'))} />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú" name="noiDungTraoDoi">
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
            <i className="fa fa-save me-2"></i>
            {'Lưu'}
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
