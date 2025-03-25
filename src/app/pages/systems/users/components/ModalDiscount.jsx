import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Spin, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW } from '@/utils/baseAPI';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  useEffect(() => {
    if (dataModal?.discountConfig) {
      try {
        form.setFieldValue('data', JSON.parse(dataModal?.discountConfig ?? '[]'));
      } catch (error) {}
    }

    return () => {};
  }, [dataModal]);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const values = await form.validateFields();
      const formData = form.getFieldsValue(true);
      if (formData?.data?.length > 0) {
        var body = {
          id: dataModal?.id,
          discountConfig: JSON.stringify(formData?.data),
        };
        const res = await requestPOST_NEW(`api/users/${dataModal?.id}/discountconfig`, body);
        if (res.status === 200) {
          toast.success('Thao thành công!');
          dispatch(actionsModal.setRandom());
          handleCancel();
        } else {
          toast.error('Thất bại, vui lòng thử lại!');
        }
      } else {
        handleCancel();
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
        <Modal.Title className="text-white">Cấu hình chiết khấu</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-12">
                  <Form.List name="data">
                    {(fields, { add, remove }) => (
                      <>
                        <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                          <thead>
                            <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                              <th>Từ</th>
                              <th>Đến</th>
                              <th>Giá trị</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="w-30">
                                  <Form.Item {...restField} name={[name, 'from']} noStyle>
                                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                  </Form.Item>
                                </td>

                                <td className="w-30">
                                  <FormItem name={[name, 'to']}>
                                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                  </FormItem>
                                </td>
                                <td className="w-30">
                                  <FormItem
                                    name={[name, 'value']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Không được để trống!',
                                      },
                                    ]}
                                  >
                                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} suffix={'%'} />
                                  </FormItem>
                                </td>
                                <td className="w-10 text-center">
                                  <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                                    <i className="fas fa-minus-circle fs-3"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <Form.Item>
                          <button
                            type="button"
                            className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                            data-kt-stepper-action="next"
                            onClick={() => {
                              if (fields?.length == 0) {
                                add({
                                  from: 0,
                                });
                              } else {
                                add({
                                  from: form.getFieldValue(['data', fields.length - 1, 'to']) + 1,
                                });
                              }
                            }}
                          >
                            Thêm
                            <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                              <span className="path1" />
                              <span className="path2" />
                            </i>{' '}
                          </button>
                        </Form.Item>
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
