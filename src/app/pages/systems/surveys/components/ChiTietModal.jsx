import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Checkbox, Select, DatePicker } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';

import { requestGET, requestPOST_NEW, requestPUT_NEW, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';
import dayjs from 'dayjs';
import { Survey_SourceType } from '@/app/data/datas';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = () => {
  const dispatch = useDispatch();

  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/surveytemplates/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.startDate = _data?.startDate ? dayjs(_data?.startDate) : null;
        _data.endDate = _data?.endDate ? dayjs(_data?.endDate) : null;
        _data.surveyCategory = _data?.surveyCategoryId
          ? {
              value: _data?.surveyCategoryId ?? null,
              label: _data?.surveyCategoryName ?? null,
            }
          : null;

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
    setBtnLoading(true);
    try {
      const values = await form.validateFields();
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      if (formData?.sources?.length > 0) {
        formData.sourceIds = formData?.sources?.map(i => i.value)?.join('#');
      } else {
        formData.sourceIds = null;
      }
      if (formData?.supervisors?.length > 0) {
        formData.supervisorIds = formData?.supervisors?.map(i => i.value)?.join('#');
      } else {
        formData.supervisorIds = null;
      }

      const res = id ? await requestPUT_NEW(`api/v1/surveytemplates/${id}`, formData) : await requestPOST_NEW(`api/v1/surveytemplates`, formData);

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
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Tên nhóm khảo sát" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mã" name="code">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại khảo sát" name="surveyCategory">
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/categories/search`, {
                          pageNumber: 1,
                          pageSize: 100,
                          isActive: true,
                          categoryGroupCode: 'LoaiKhaoSat',
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
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('surveyCategoryId', current?.id);
                          form.setFieldValue('surveyCategoryName', current?.name);
                        } else {
                          form.setFieldValue('surveyCategoryId', null);
                          form.setFieldValue('surveyCategoryName', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Trạng thái" name="status" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Chưa bắt đầu',
                        },
                        {
                          value: 1,
                          label: 'Đang hoạt động',
                        },
                        {
                          value: 2,
                          label: 'Đã kết thúc',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
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
                  <FormItem label="Ghi chú" name="description">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Nguồn người dùng" name="sourceType" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={Survey_SourceType}
                      onChange={() => {
                        form.setFieldValue('sources', null);
                      }}
                    />
                  </FormItem>
                </div>
                <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.sourceType !== currentValues.sourceType}>
                  {({ getFieldValue }) =>
                    getFieldValue('sourceType') == 'CourseOffline' ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Khoá học" name="sources">
                            <TDSelect
                              reload
                              mode="multiple"
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
                                  isActive: true,
                                  type: 1,
                                });
                                return res?.data?.map(item => ({
                                  ...item,
                                  label: `${item.title}`,
                                  value: item.id,
                                }));
                              }}
                              style={{
                                width: '100%',
                                height: 'auto',
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : getFieldValue('sourceType') == 'CourseOnline' ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Khoá học" name="sources">
                            <TDSelect
                              reload
                              mode="multiple"
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
                                  isActive: true,
                                  type: 0,
                                });
                                return res?.data?.map(item => ({
                                  ...item,
                                  label: `${item.title}`,
                                  value: item.id,
                                }));
                              }}
                              style={{
                                width: '100%',
                                height: 'auto',
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : getFieldValue('sourceType') == 'CourseClass' ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Lớp học" name="sources">
                            <TDSelect
                              //fieldNames={{ label: 'name', value: 'id' }}
                              reload
                              mode="multiple"
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courseclasses/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
                                  isActive: true,
                                });
                                return res?.data?.map(item => ({
                                  ...item,
                                  label: `${item.name} - ${item?.courseTitle}`,
                                  value: item.id,
                                }));
                              }}
                              style={{
                                width: '100%',
                                height: 'auto',
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : getFieldValue('sourceType') == 'OnlineProgram' ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Chương trình tuyển sinh" name="sources">
                            <TDSelect
                              reload
                              mode="multiple"
                              showSearch
                              placeholder=""
                              fetchOptions={async keyword => {
                                const res = await requestPOST(`api/v1/courseonlineprograms/search`, {
                                  pageNumber: 1,
                                  pageSize: 1000,
                                  keyword: keyword,
                                  isActive: true,
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
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </FormItem>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Người phụ trách" name="supervisors">
                    <TDSelect
                      reload
                      mode="multiple"
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
                          keyword: keyword,
                          types: [0, 3, 4, 5],
                        });
                        return res.data.map(item => ({
                          ...item,
                          label: `${item.fullName} - ${item.userName}`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
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
