import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, InputNumber, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import TDSelect from '@/app/components/TDSelect';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPOST } from '@/utils/baseAPI';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();

  const modalVisible = useSelector(state => state.modal.modalVisible);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

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
      const formData = form.getFieldsValue(true);

      const res = await requestPOST_NEW(`api/v1/usercourses`, formData);

      if (res?.status === 200) {
        toast.success('Thao tác thành công!');
        dispatch(actionsModal.setRandom());
        handleCancel();
      } else {
        toast.error(res?.data?.exception ?? 'Thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setBtnLoading(false);
  };

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="lg" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Thêm mới</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" initialValues={{ isTrial: false }}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Học sinh" name="user" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/users/search`, {
                          pageNumber: 1,
                          pageSize: 20,
                          advancedSearch: {
                            fields: ['name'],
                            keyword: keyword || null,
                          },
                          keyword: keyword,
                          type: 1,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item?.fullName} (${item?.userName})`,
                          value: item?.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('userId', current?.id);
                        } else {
                          form.setFieldValue('userId', null);
                        }
                      }}
                      optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Khoá học" name="course" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/courses/search`, {
                          pageNumber: 1,
                          pageSize: 100,
                          type: 0,
                          isActive: true,
                          keyword: keyword,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item.title}`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('courseId', current?.id);
                        } else {
                          form.setFieldValue('courseId', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="" name="isTrial" valuePropName="checked">
                    <Checkbox>Đăng ký dùng thử</Checkbox>
                  </FormItem>
                </div>
                <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isTrial !== currentValues.isTrial}>
                  {({ getFieldValue }) =>
                    getFieldValue('isTrial') == false ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Giá tiền" name="amount">
                            <InputNumber min={0} placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                          </FormItem>
                        </div>
                        {/* <div className="col-xl-6 col-lg-6">
                          <FormItem label="Thời gian" name="timeConfirmAll" initialValue={dayjs()}>
                            <DatePicker showTime locale={locale} format={'DD/MM/YYYY HH:mm'} style={{ width: '100%' }} />
                          </FormItem>
                        </div> */}
                        <div className="col-xl-12">
                          <FormItem label="Ghi chú" name="description">
                            <TextArea rows={4} />
                          </FormItem>
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </FormItem>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={onFinish} disabled={btnLoading}>
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
