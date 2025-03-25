import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';
import dayjs from 'dayjs';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/userpapers/${id}`);
      var _data = res?.data ?? null;
      if (_data) {
        _data.createdOn = _data?.createdOn ? dayjs(_data?.createdOn).format('DD/MM/YYYY HH:mm') : null;
        _data.examinat = _data?.examinatId
          ? {
              value: _data?.examinatId,
              label: _data?.examinatTitle,
            }
          : null;

        form.setFieldsValue(_data);
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
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    dispatch(actionsModal.setModalVisible(false));
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/userpapers/${id}`, formData) : await requestPOST_NEW(`api/v1/userpapers`, formData);

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
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Họ tên" name="fullName">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số điện thoại" name="phoneNumber">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Email" name="email">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Địa chỉ" name="address">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại tư vấn" name="paperType">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Nguồn" name="type">
                    <Select
                      allowClear
                      placeholder="Chọn"
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 'FacebookAds',
                          label: 'FacebookAds',
                        },
                        {
                          value: 'Fanpage',
                          label: 'Fanpage',
                        },
                        {
                          value: 'Zalo',
                          label: 'Zalo',
                        },
                        {
                          value: 'Hotline',
                          label: 'Hotline',
                        },
                        {
                          value: 'Hệ thống CodeMath',
                          label: 'Hệ thống CodeMath',
                        },
                        {
                          value: 'Khác',
                          label: 'Khác',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                {/* <div className="col-xl-6 col-lg-6">
                  <FormItem label="Khối lớp" name="gradeName">
                    <Input placeholder="" />
                  </FormItem>
                </div> */}
                {/* <div className="col-xl-6 col-lg-6">
                  <FormItem label="Kỳ thi" name="examinat">
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder="Chọn kỳ thi"
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/examinats/search`, {
                          pageNumber: 1,
                          pageSize: 100,
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
                          form.setFieldValue('examinatId', current?.id);
                        } else {
                          form.setFieldValue('examinatId', null);
                        }
                      }}
                    />
                  </FormItem>
                </div> */}
                {/* <div className="col-xl-6 col-lg-6">
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.courseId !== currentValues.courseId
                    }
                  >
                    {({ getFieldValue }) => (
                      <FormItem
                        label="Khoá học"
                        name="course"
                        rules={[
                          { required: true, message: "Không được để trống!" },
                        ]}
                      >
                        <TDSelect
                          reload
                          showSearch
                          placeholder=""
                          fetchOptions={async (keyword) => {
                            const res = await requestPOST(
                              `api/v1/courses/search`,
                              {
                                pageNumber: 1,
                                pageSize: 1000,
                                examinatId: getFieldValue("examinatId"),
                                keyword: keyword,
                              }
                            );
                            return res?.data?.map((item) => ({
                              ...item,
                              label: `${item.title}`,
                              value: item.id,
                            }));
                          }}
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                          onChange={(value, current) => {
                            if (value) {
                              form.setFieldValue("courseId", current?.id);
                            } else {
                              form.setFieldValue("courseId", null);
                            }
                          }}
                        />
                      </FormItem>
                    )}
                  </Form.Item>
                </div> */}

                {id ? (
                  <div className="col-xl-6 col-lg-6">
                    <FormItem label="Thời gian đăng ký" name="createdOn">
                      <Input disabled placeholder="" />
                    </FormItem>
                  </div>
                ) : (
                  <></>
                )}
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Nội dung" name="content">
                    <TDEditorNew
                      data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                      onChange={value => {
                        form.setFieldValue('content', value);
                      }}
                    />
                  </FormItem>
                </div>
                {/* <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú của khách sau khi tư vấn" name="note">
                    <TDEditorNew
                      data={form.getFieldValue('note') ? form.getFieldValue('note') : ''}
                      onChange={value => {
                        form.setFieldValue('note', value);
                      }}
                    />
                  </FormItem>
                </div> */}
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save me-2"></i>
            {id ? 'Lưu' : 'Tạo mới'}
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
