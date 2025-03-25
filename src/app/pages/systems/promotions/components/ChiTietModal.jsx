import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber, DatePicker } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import TDSelect from '@/app/components/TDSelect';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, requestPOST } from '@/utils/baseAPI';

const FormItem = Form.Item;
const { TextArea } = Input;

const ModalItem = props => {
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
      const res = await requestGET(`api/v1/promotions/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.typePromotion = _data?.typePromotionId
          ? {
              value: _data?.typePromotionId ?? null,
              label: _data?.typePromotionName ?? null,
            }
          : null;
        _data.startDate = _data?.startDate ? dayjs(_data?.startDate) : null;
        _data.endDate = _data?.endDate ? dayjs(_data?.endDate) : null;

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
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/promotions/${id}`, formData) : await requestPOST_NEW(`api/v1/promotions`, formData);

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
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tiêu đề" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                {id ? (
                  <></>
                ) : (
                  <div className="col-xl-6 col-lg-6">
                    <FormItem label=" " name="isAuto" valuePropName="checked">
                      <Checkbox>Mã tự sinh</Checkbox>
                    </FormItem>
                  </div>
                )}
                <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isAuto !== currentValues.isAuto}>
                  {({ getFieldValue }) =>
                    getFieldValue('isAuto') != true ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Mã khuyến mãi" name="promotionCode" rules={[{ required: true, message: 'Không được để trống!' }]}>
                            <Input placeholder="" disabled={id} />
                          </FormItem>
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </FormItem>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Hình thức" name="type" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          value: 0,
                          label: 'Trừ theo %',
                        },
                        {
                          value: 1,
                          label: 'Trừ trực tiếp giá',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại khuyến mãi" name="typePromotion">
                    <TDSelect
                      reload={true}
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/categories/search`, {
                          pageNumber: 1,
                          pageSize: 100,
                          isActive: true,
                          categoryGroupCode: 'LoaiKhuyenMai',
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
                          form.setFieldValue('typePromotionId', current?.id);
                          form.setFieldValue('typePromotionName', current?.name);
                        } else {
                          form.setFieldValue('typePromotionId', null);
                          form.setFieldValue('typePromotionName', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá trị" name="value" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber placeholder="" min={0} max={1000000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Lượt sử dụng tối đa" name="maxUsage" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <InputNumber placeholder="" min={0} max={1000000} style={{ width: '100%' }} />
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
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isPublic" valuePropName="checked">
                    <Checkbox>Mã công khai</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Ghi chú" name="description">
                    <TextArea rows={4} placeholder="" />
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
