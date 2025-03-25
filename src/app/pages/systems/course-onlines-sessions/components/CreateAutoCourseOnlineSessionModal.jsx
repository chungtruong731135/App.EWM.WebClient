import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, InputNumber, DatePicker } from 'antd';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST_NEW, requestPUT_NEW, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import TDModal from '@/app/components/TDModal';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const dataModal = useSelector(state => state.modal.courseOnlineClassSessionDetail);
  const modalVisible = useSelector(state => state.modal.autoCourseOnlineClassSessionDetailModalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (dataModal?.courseClassId) {
      form.setFieldsValue({
        courseClassId: dataModal?.courseClassId,
        courseClass: {
          value: dataModal?.courseClassId,
          label: dataModal?.courseClassName,
        },
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataModal]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setAutoCourseOnlineClassSessionDetailModalVisible(false));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };

      body.startTime = `${dayjs(body.startTime).format('YYYY-MM-DD')}T${dayjs(body.startTime).format('HH:mm:ss')}`;
      body.endTime = `${dayjs(body.endTime).format('YYYY-MM-DD')}T${dayjs(body.endTime).format('HH:mm:ss')}`;

      body.meetingNumber = body?.meetingNumber?.replace(/\s/g, '') ?? '';
      body.zoomPassword = body?.zoomPassword?.replace(/\s/g, '') ?? '';

      // console.log(body);
      const res = await requestPOST_NEW(`api/v1/courseclasses/auto-gen`, body);

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
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
    <TDModal
      title={'Thêm buổi học'}
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
            <button type="button" className="btn btn-sm btn-primary rounded-1 py-2 px-5 ms-2" onClick={handleSubmit} disabled={btnLoading}>
              <i className="fa fa-save"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </button>
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
                <FormItem label="Khoá học" name="courseClass" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <TDSelect
                    reload
                    showSearch
                    placeholder=""
                    disabled={dataModal?.courseClassId ? true : false}
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/courseclasses/search`, {
                        pageNumber: 1,
                        pageSize: 100,
                        keyword: keyword,
                      });
                      return res?.data?.map(item => ({
                        ...item,
                        label: `${item.name}`,
                        value: item.id,
                      }));
                    }}
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                    onChange={(value, current) => {
                      if (value) {
                        form.setFieldValue('courseClassId', current?.id);
                      } else {
                        form.setFieldValue('courseClassId', null);
                      }
                    }}
                  />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Số lượng buổi học cần tạo" name="amount">
                  <InputNumber placeholder="" min={0} />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Tên tiền tố buổi học" name="name">
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Thời gian bắt đầu" name="startTime" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <DatePicker showTime={true} format={'DD/MM/YYYY HH:mm'} />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem
                  label="Thời gian kết thúc"
                  name="endTime"
                  rules={[
                    { required: true, message: 'Không được để trống!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('startTime') < value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu!'));
                      },
                    }),
                  ]}
                >
                  <DatePicker showTime={true} format={'DD/MM/YYYY HH:mm'} />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Lặp lại buổi học sau (ngày)" name="numberOfDay">
                  <InputNumber placeholder="" min={0} />
                </FormItem>
              </div>

              <div className="col-xl-12">
                <FormItem label="Nội dung buổi học" name="content">
                  <TextArea rows={4} placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-12">
                <FormItem label="Ghi chú" name="description">
                  <TextArea rows={4} placeholder="" />
                </FormItem>
              </div>

              <div className="col-xl-6 col-lg-6">
                <FormItem label="meetingNumber" name="meetingNumber">
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="zoomPassword" name="zoomPassword">
                  <Input placeholder="" />
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
