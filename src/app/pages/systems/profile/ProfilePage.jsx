import { useState, useEffect } from 'react';
import { DatePicker, Form, Input, Select, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { getAuth, useAuth } from '@/app/modules/auth';
import { handleImage } from '@/utils/utils';
import { FILE_URL, requestPUT_NEW, API_URL } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { Genders } from '@/app/data/datas';

const UsersPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const { token } = getAuth();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      var temp = { ...currentUser };
      temp.dateOfBirth = temp?.dateOfBirth ? dayjs(temp?.dateOfBirth) : null;
      temp.fullName = temp?.fullName || temp?.firstName + ' ' + temp?.lastName;
      setImage(handleImage(temp?.imageUrl ?? '', FILE_URL));
      form.setFieldsValue(temp);
    }
    return () => {};
  }, [currentUser]);

  const onFinish = async () => {
    var check = await form.validateFields();
    if (check) {
      setButtonLoading(true);
      try {
        var formData = form.getFieldsValue(true);
        if (image.length > 0) {
          formData.imageUrl = image[0]?.response?.data[0]?.url ?? image[0].path;
        } else {
          formData.imageUrl = null;
        }
        const res = await requestPUT_NEW('api/personal/profile', formData);
        if (res.status === 200) {
          toast.success('Cập nhật thông tin thành công !');
        } else {
          toast.error('Cập nhật không thành công, vui lòng kiểm tra lại thông tin!');
        }
      } catch (error) {
        toast.error('Thao tác không thành công, vui lòng thử lại!');
        console.log(error);
      }
      setButtonLoading(false);
    }
  };
  const handleSubmit = () => {
    form.submit();
  };
  const onFinishFailed = error => {
    console.log(error);
  };
  const validatePhoneNumber = (rule, value, callback) => {
    const phoneNumberRegex = /^\d{10}$/;

    if (value && !phoneNumberRegex.test(value)) {
      callback('Vui lòng nhập đúng định dạng số điện thoại !');
    } else {
      callback();
    }
  };
  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thông tin tài khoản'}</h3>
          <div className="d-flex align-items-center">
            <button className="btn btn-primary btn-sm m-btn m-btn--icon me-2" onClick={handleSubmit}>
              <span>
                <i className="fas fa-save"></i>
                <span className="ms-2">Cập nhật thông tin</span>
              </span>
            </button>
          </div>
        </div>
        <div className="card-body card-dashboard">
          <Spin spinning={buttonLoading}>
            <Form form={form} name="profile" layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <div className="row">
                <div className="col-xl-3">
                  <Form.Item label="Ảnh đại diện">
                    <ImageUpload
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={image}
                      onChange={e => setImage(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-9">
                  <div className="row">
                    <div className="col-xl-6">
                      <Form.Item name="userName" label="Tên đăng nhập">
                        <Input placeholder="Tên đăng nhập" disabled />
                      </Form.Item>
                    </div>

                    <div className="col-xl-6">
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng điền đẩy đủ thông tin!',
                            whitespace: true,
                          },
                        ]}
                      >
                        <Input placeholder="Họ và tên" />
                      </Form.Item>
                    </div>

                    <div className="col-xl-6">
                      <Form.Item name="email" label="Email">
                        <Input placeholder="Email" />
                      </Form.Item>
                    </div>

                    <div className="col-xl-6">
                      <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                          {
                            validator: validatePhoneNumber,
                          },
                        ]}
                      >
                        <Input placeholder="Số điện thoại" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item name="dateOfBirth" label="Ngày sinh">
                        <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item name="gender" label="Giới tính">
                        <Select placeholder="Chọn giới tính" style={{ width: '100%' }} allowClear options={Genders} />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item name="address" label="Đia chỉ">
                        <Input placeholder="Địa chỉ" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-6">
                      <Form.Item label="Mã giới thiệu cá nhân" name="myRefCode">
                        <Input placeholder="Mã giới thiệu cá nhân" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
