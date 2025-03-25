import { useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Form, Select, Spin, InputNumber, DatePicker, Input } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import TDSelect from '@/app/components/TDSelect';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPOST } from '@/utils/baseAPI';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible } = props;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const values = await form.validateFields();
      const formData = form.getFieldsValue(true);
      console.log(formData);
      const res = await requestPOST_NEW(`api/v1/activationcodes`, formData);

      if (res.status === 200) {
        toast.success('Thao thành công!');
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
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Thêm mới mã kích hoạt</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish} initialValues={{ type: 0 }}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Hình thức kích hoạt" name="type" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Trả trước',
                        },
                        {
                          value: 1,
                          label: 'Trả sau',
                        },
                      ]}
                      onChange={(value, current) => {
                        form.setFieldValue('userId', null);
                        form.setFieldValue('user', null);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                    {({ getFieldValue }) => (
                      <FormItem label="Cộng tác viên/Đại lý" name="user" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <TDSelect
                          reload
                          showSearch
                          placeholder=""
                          fetchOptions={async keyword => {
                            const res = await requestPOST(`api/users/search`, {
                              pageNumber: 1,
                              pageSize: 20,
                              advancedSearch: {
                                fields: ['name'],
                                keyword: keyword || null,
                              },
                              keyword: keyword,
                              isActive: true,
                              type: getFieldValue('type') == 0 ? 5 : getFieldValue('type') == 1 ? 4 : null,
                            });
                            return res.data.map(item => ({
                              ...item,
                              label: `${item.fullName} - ${item.userName}`,
                              value: item.id,
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
                    )}
                  </Form.Item>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày hết hạn" name="expireDate">
                    <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} disabledDate={d => d.isBefore(dayjs().format('YYYY-MM-DD'))} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ghi chú" name="description">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <Form.List name="data">
                    {(fields, { add, remove }) => (
                      <>
                        <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                          <thead>
                            <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                              <th>Khoá học</th>
                              <th>Giá tiền</th>
                              <th>Số lượng</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td>
                                  <Form.Item {...restField} name={[name, 'course']} noStyle>
                                    <TDSelect
                                      reload
                                      showSearch
                                      placeholder=""
                                      fetchOptions={async keyword => {
                                        const res = await requestPOST(`api/v1/courses/search`, {
                                          pageNumber: 1,
                                          pageSize: 100,
                                          type: 3,
                                          isActive: true,
                                          keyword: keyword,
                                        });
                                        return res?.data?.map(item => ({
                                          ...item,
                                          label: `${item?.type == 1 ? 'KHOÁ ONLINE - ' : ''}${item.title}`,
                                          value: item.id,
                                        }));
                                      }}
                                      style={{
                                        width: '100%',
                                        height: 'auto',
                                      }}
                                      onChange={(value, current) => {
                                        if (value) {
                                          form.setFieldValue(['data', name, 'courseId'], current?.id);
                                          var type = form.getFieldValue('activeType');
                                          form.setFieldValue(['data', name, 'price'], (type = 0 ? current?.price : type == 1 ? current?.programPrice : current?.examPrice));
                                        } else {
                                          form.setFieldValue(['data', name, 'courseId'], null);
                                          form.setFieldValue(['data', name, 'price'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>

                                <td className="w-xl-250px text-center ">
                                  <FormItem
                                    name={[name, 'price']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Không được để trống!',
                                      },
                                    ]}
                                  >
                                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                                  </FormItem>
                                </td>
                                <td className="w-xl-200px w-lg-150px text-center ">
                                  <FormItem
                                    name={[name, 'quantity']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Không được để trống!',
                                      },
                                    ]}
                                  >
                                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                  </FormItem>
                                </td>
                                <td className="w-50px">
                                  <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                                    <i className="fas fa-minus-circle fs-3"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <Form.Item>
                          <button type="button" className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" data-kt-stepper-action="next" onClick={() => add()}>
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
            {'Tạo mới'}
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
