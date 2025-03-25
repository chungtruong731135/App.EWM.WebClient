import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { Form, Input, Select, Spin, DatePicker, InputNumber, Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';

import { requestPOST_NEW, requestGET, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import ImageUpload from '@/app/components/ImageUpload';
import TDEditorNew from '@/app/components/TDEditorNew';
import { Genders } from '@/app/data/datas';

const FormItem = Form.Item;

const { Option } = Select;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const types = [
    { id: 0, name: 'Giáo viên' },
    { id: 1, name: 'Chuyên gia tư vấn' },
  ];

  const [loadding, setLoadding] = useState(false);
  const [image, setImage] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/teachers/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.dateOfBirth = _data?.dateOfBirth ? dayjs(_data.dateOfBirth) : null;

        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
        form.setFieldsValue({ ..._data });
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
    setButtonLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      formData.type = 1;
      if (id) {
        formData.id = id;
      }

      if (image.length > 0) {
        formData.avatar = image[0]?.response?.data[0]?.url ?? image[0].path;
      } else {
        formData.avatar = null;
      }
      const res = id ? await requestPUT_NEW(`api/v1/teachers/${id}`, formData) : await requestPOST_NEW(`api/v1/teachers`, formData);
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
        console.log(final_arr);
        toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setButtonLoading(false);
  };

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết giáo viên</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off">
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
                    <div className="col-xl-6">
                      <FormItem label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Không được để trống!' }]}>
                        <Input placeholder="" />
                      </FormItem>
                    </div>
                    <div className="col-xl-6">
                      <FormItem label="Mã giáo viên" name="code">
                        <Input placeholder="" />
                      </FormItem>
                    </div>
                    <div className="col-xl-6 col-lg-6">
                      <FormItem label="Giới tính" name="gender">
                        <Select placeholder="Chọn giới tính" style={{ width: '100%' }} allowClear options={Genders} />
                      </FormItem>
                    </div>
                    <div className="col-xl-6 col-lg-6">
                      <FormItem label="Loại giáo viên" name="type">
                        <Select placeholder="Loại giáo viên" filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                          {types.map(item => {
                            return (
                              <Option key={item.id} value={item.id}>
                                {item.name}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày sinh" name="dateOfBirth">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số điện thoại" name="phoneNumber">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Công việc" name="jobTitle">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Nơi công tác" name="workplace">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Kinh nghiệm làm việc" name="experience">
                    <TDEditorNew
                      data={form.getFieldValue('experience') ? form.getFieldValue('experience') : ''}
                      onChange={value => {
                        form.setFieldValue('experience', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Mô tả" name="description">
                    <TDEditorNew
                      data={form.getFieldValue('description') ? form.getFieldValue('description') : ''}
                      onChange={value => {
                        form.setFieldValue('description', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <FormItem label="Mức độ ưu tiên" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <FormItem label=" " name="isPublic" valuePropName="checked">
                    <Checkbox>Hiển thị trên trang chủ</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-4 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa fa-save"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
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
