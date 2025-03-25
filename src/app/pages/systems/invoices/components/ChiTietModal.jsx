import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DatePicker, Form, Input, InputNumber, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as actionsModal from '@/setup/redux/modal/Actions';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import { requestGET, requestPOST_NEW, requestPUT_NEW, FILE_URL, requestPOST, API_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import TDSelect from '@/app/components/TDSelect';
import FileUpload from '@/app/components/FileUpload';

const FormItem = Form.Item;
const { TextArea } = Input;
const ModalItem = () => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/distributorinvoices/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.user = _data?.userId
          ? {
              label: `${_data?.fullName} - ${_data?.userName}`,
              value: _data?.userId,
            }
          : null;
        _data.paymentDate = _data?.paymentDate ? dayjs(_data?.paymentDate) : null;
        setFileList(handleImage(_data?.files ?? '', FILE_URL));

        form.setFieldsValue({ ..._data });
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

    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      if (fileList?.length > 0) {
        let item = fileList[0];
        formData.files = item?.response?.data[0]?.url || item?.path;
      } else {
        formData.files = null;
      }

      const res = id ? await requestPUT_NEW(`api/v1/distributorinvoices/${id}`, formData) : await requestPOST_NEW(`api/v1/distributorinvoices`, formData);

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
    <Modal show={modalVisible} size="lg" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Cộng tác viên/Đại lý" name="type" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Đại lý',
                        },
                        {
                          value: 1,
                          label: 'Cộng tác viên',
                        },
                        {
                          value: 2,
                          label: 'Khác',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                    {({ getFieldValue }) =>
                      getFieldValue('type') == 2 ? (
                        <></>
                      ) : (
                        <FormItem label="Tài khoản" name="user" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                          />
                        </FormItem>
                      )
                    }
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Loại khoá học" name="courseType">
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Khóa học online web',
                        },
                        {
                          value: 1,
                          label: 'Khóa học online zoom',
                        },
                        {
                          value: 2,
                          label: 'Khóa học offline',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Số tiền" name="amount">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Thời gian" name="paymentDate" initialValue={dayjs()}>
                    <DatePicker showTime format={'DD/MM/YYYY HH:mm'} />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Tài liệu đính kèm">
                    <FileUpload
                      maxCount={1}
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={fileList}
                      onChange={e => setFileList(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú" name="description">
                    <TextArea rows={4} />
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
            <i className="fa fa-save"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
            <i className="fa fa-times"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalItem;
