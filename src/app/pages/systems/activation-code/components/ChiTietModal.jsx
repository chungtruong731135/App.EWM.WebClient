import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Select, Spin, DatePicker } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import TDSelect from '@/app/components/TDSelect';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, requestPOST } from '@/utils/baseAPI';
import TDTableColumnHoTen from '@/app/components/TDTableColumnHoTen';

const FormItem = Form.Item;

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
      const res = await requestGET(`api/v1/activationcodes/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.user = _data?.userId
          ? {
              value: _data?.userId ?? null,
              label: _data?.userFullName ?? null,
            }
          : null;
        _data.course = _data?.courseId
          ? {
              value: _data?.courseId ?? null,
              label: _data?.courseTitle ?? null,
            }
          : null;
        _data.expireDate = _data?.expireDate ? dayjs(_data?.expireDate) : null;

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
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/activationcodes/${id}`, formData) : await requestPOST_NEW(`api/v1/activationcodes`, formData);

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
                      onChange={() => {
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
                  <FormItem label="Khoá học" name="course" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/courses/search`, {
                          pageNumber: 1,
                          pageSize: 100,
                          type: 3,
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

                {/* <div className="col-xl-6 col-lg-6">
                  <FormItem
                    label="Giá"
                    name={"price"}
                    rules={[
                      {
                        required: true,
                        message: "Không được để trống!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder=""
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </FormItem>
                </div> */}
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày hết hạn" name="expireDate">
                    <DatePicker format={'DD/MM/YYYY'} style={{ width: '100%' }} disabledDate={d => d.isBefore(dayjs().format('YYYY-MM-DD'))} />
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú" name="description">
                    <Input placeholder="" />
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {dataModal?.status == 1 || dataModal?.status == 0 || dataModal?.status == undefined ? (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
              <i className="fa fa-save me-2"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </Button>
          </div>
        ) : (
          <></>
        )}
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
