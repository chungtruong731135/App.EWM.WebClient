import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Checkbox, InputNumber, DatePicker, Select } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, FILE_URL } from '@/utils/baseAPI';
import { CheckRole, handleImage } from '@/utils/utils';
import { useAuth } from '@/app/modules/auth';
import TDModal from '@/app/components/TDModal';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/courseonlineprograms/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.startDate = _data?.startDate ? dayjs(_data?.startDate) : null;
        _data.endDate = _data?.endDate ? dayjs(_data?.endDate) : null;

        form.setFieldsValue({ ..._data });
        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
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
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };

      if (id) {
        body.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/courseonlineprograms/${id}`, body) : await requestPOST_NEW(`api/v1/courseonlineprograms`, body);

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
  const onFinishFailed = error => {
    console.log(error);
  };
  const handleSubmit = () => {
    form.submit();
  };
  return (
    <TDModal
      title={id ? 'Chi tiết chương trình tuyển sinh' : 'Tạo mới chương trình tuyển sinh'}
      show={modalVisible}
      fullscreen={'lg-down'}
      size={'xl'}
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
      footer={
        <>
          <div className="d-flex justify-content-center  align-items-center">
            {CheckRole(currentPermissions, ['Permissions.CourseOnlinePrograms.Manage']) && (
              <button type="button" className="btn btn-sm btn-primary rounded-1 py-2 px-5 ms-2" onClick={handleSubmit} disabled={btnLoading}>
                <i className="fa fa-save"></i>
                {id ? 'Lưu' : 'Tạo mới'}
              </button>
            )}
          </div>
          <div className="d-flex justify-content-center  align-items-center">
            <button type="button" className="btn btn-sm btn-secondary rounded-1 py-2 px-5 ms-2" onClick={handleCancel}>
              <i className="fa fa-times"></i>Đóng
            </button>
          </div>
        </>
      }
    >
      <Spin spinning={loadding}>
        {!loadding && (
          <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Tên chương trình" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Mã chương trình" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="URL Id Google Docs" name="sheetUrlId">
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Trạng thái" name="status" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Select
                    style={{ width: '100%' }}
                    options={[
                      {
                        value: 0,
                        label: 'Đang tuyển sinh',
                      },
                      {
                        value: 1,
                        label: 'Kết thúc',
                      },
                      {
                        value: 2,
                        label: 'Chưa tuyển sinh',
                      },
                      {
                        value: 3,
                        label: 'Tạm dừng',
                      },
                    ]}
                    onChange={() => {
                      form.setFieldValue('config', []);
                    }}
                  />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Mức độ ưu tiên" name="sortOrder">
                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Ngày bắt đầu" name="startDate">
                  <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Ngày kết thúc" name="endDate">
                  <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Đối tượng" name="targetAudience">
                  <TextArea rows={4} placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Địa điểm" name="location">
                  <TextArea rows={4} placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Mô tả" name="description">
                  <TextArea rows={4} placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Nội dung chi tiết chương trình" name="content">
                  <TDEditorNew
                    data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                    onChange={value => {
                      form.setFieldValue('content', value);
                    }}
                  />
                </FormItem>
              </div>

              <div className="col-xl-6 col-lg-6">
                <FormItem label="" name="isActive" valuePropName="checked">
                  <Checkbox>Sử dụng</Checkbox>
                </FormItem>
              </div>
            </div>
          </Form>
        )}
      </Spin>
    </TDModal>
  );
};

export default ModalItem;
