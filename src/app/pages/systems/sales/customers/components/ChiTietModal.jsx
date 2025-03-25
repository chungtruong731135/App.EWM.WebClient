import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { Form, Input, Select, Spin, Checkbox, DatePicker, TreeSelect } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import dayjs from 'dayjs';

import * as actionsModal from '@/setup/redux/modal/Actions';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import TDSelect from '@/app/components/TDSelect';

import { requestPOST, requestPOST_NEW, requestGET, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import ImageUpload from '@/app/components/ImageUpload';
import { Genders } from '@/app/data/datas';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [image, setImage] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/users/${id}`);

      var _data = res ?? null;
      if (_data) {
        _data.province = _data?.provinceCode
          ? {
              value: _data?.provinceCode ?? null,
              label: _data?.provinceName ?? null,
            }
          : null;
        _data.dateOfBirth = _data?.dateOfBirth ? dayjs(_data?.dateOfBirth) : null;
        setImage(handleImage(res?.imageUrl ?? '', FILE_URL));
        form.setFieldsValue({ ..._data });
      }
      /* if (res) {
        res.dateOfBirth = res?.dateOfBirth ? dayjs(res?.dateOfBirth) : null;
        form.setFieldsValue(res);
      } */
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

      if (image.length > 0) {
        body.imageUrl = image[0]?.response?.data[0]?.url ?? image[0].path;
      } else {
        body.imageUrl = null;
      }
      const res = id ? await requestPUT_NEW(`api/users/student/${id}`, body) : await requestPOST_NEW(`api/users/create-student`, body);
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
                <div className="col col-xl-4">
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
                <div className="col col-xl-8">
                  <div className="row">
                    <div className="col-xl-12">
                      <FormItem label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <Input placeholder="Họ và tên" />
                      </FormItem>
                    </div>
                    <div className="col-xl-6">
                      <FormItem label="Ngày sinh" name="dateOfBirth">
                        <DatePicker placeholder="Ngày sinh" format="DD/MM/YYYY" style={{ width: '100%' }} />
                      </FormItem>
                    </div>
                    <div className="col-xl-6">
                      <FormItem label="Giới tính" name="gender">
                        <Select placeholder="Chọn giới tính" style={{ width: '100%' }} allowClear options={Genders} />
                      </FormItem>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-4 col-lg-6">
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
                <div className="col-xl-4 col-lg-6">
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

                <div className="col-xl-4 col-lg-6">
                  <FormItem label="Địa chỉ" name="address">
                    <Input placeholder="Địa chỉ" />
                  </FormItem>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <FormItem label="Địa bàn" name="province">
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/locations/search`, {
                          pageNumber: 1,
                          pageSize: 100,
                          isActive: true,
                          keyword: keyword,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item.name}`,
                          value: item.code,
                        }));
                      }}
                      style={{
                        width: '100%',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('provinceCode', current?.code);
                          form.setFieldValue('provinceName', current?.name);
                        } else {
                          form.setFieldValue('provinceCode', null);
                          form.setFieldValue('provinceName', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <FormItem label="Email/Số điện thoại đăng nhập" name="userName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="Tên tài khoản" autoComplete="" />
                  </FormItem>
                </div>
                {id ? (
                  <></>
                ) : (
                  <>
                    <div className="col-xl-4 col-lg-6">
                      <FormItem label="Mật khẩu" name="password" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <Input.Password
                          placeholder="Mật khẩu"
                          size="small"
                          iconRender={visible =>
                            visible ? (
                              <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                <i className="fa fa-eye"></i>
                              </div>
                            ) : (
                              <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                <i className="fa fa-eye-slash"></i>
                              </div>
                            )
                          }
                        />
                      </FormItem>
                    </div>
                    <div className="col-xl-4 col-lg-6">
                      <FormItem
                        label="Nhập lại mật khẩu"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: 'Không được để trống!' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Không khớp với mật khẩu đã nhập!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          size="small"
                          placeholder="Nhập lại mật khẩu"
                          iconRender={visible =>
                            visible ? (
                              <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                <i className="fa fa-eye"></i>
                              </div>
                            ) : (
                              <div className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1">
                                <i className="fa fa-eye-slash"></i>
                              </div>
                            )
                          }
                        />
                      </FormItem>
                    </div>
                  </>
                )}
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
