import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Checkbox, Select } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST, requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';
import { removeAccents } from '@/utils/slug';
import TDEditorNew from '@/app/components/TDEditorNew';
import TDSelect from '@/app/components/TDSelect';
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
      const res = await requestGET(`api/v1/messagecustomers/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
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

      const res = id ? await requestPUT_NEW(`api/v1/messagecustomers/${id}`, formData) : await requestPOST_NEW(`api/v1/messagecustomers`, formData);

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
            <Form form={form} layout="vertical" initialValues={{ sendToAll: true, isActive: true }} autoComplete="off">
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Tiêu đề" name="subject" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại gửi" name="type" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      placeholder="Chọn loại gửi"
                      style={{ width: '100%' }}
                      allowClear
                      options={[
                        {
                          value: 'Email',
                          label: 'Email',
                        },
                        {
                          value: 'ZaloOA',
                          label: 'ZaloOA',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="sendToAll" valuePropName="checked">
                    <Checkbox>Gửi tất cả</Checkbox>
                  </FormItem>
                </div>
                <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) =>
                    getFieldValue('type') == 'Email' ? (
                      <>
                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Nội dung" name="content" rules={[{ required: true, message: 'Không được để trống!' }]}>
                            <TDEditorNew
                              data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                              onChange={value => {
                                form.setFieldValue('content', value);
                              }}
                            />
                          </FormItem>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-xl-12 col-lg-12">
                          <FormItem label="Nội dung" name="content" rules={[{ required: true, message: 'Không được để trống!' }]}>
                            <Input.TextArea rows={4} placeholder="" />
                          </FormItem>
                        </div>
                      </>
                    )
                  }
                </FormItem>

                <FormItem noStyle shouldUpdate={(prevValues, currentValues) => prevValues.sendToAll !== currentValues.sendToAll}>
                  {({ getFieldValue }) =>
                    !getFieldValue('sendToAll') ? (
                      <FormItem label="Khách hàng nhận" name="users">
                        <TDSelect
                          reload
                          mode="multiple"
                          showSearch
                          placeholder=""
                          fetchOptions={async keyword => {
                            const res = await requestPOST(`api/users/search`, {
                              pageNumber: 1,
                              pageSize: 50,
                              isActive: true,
                              keyword: keyword,
                              types: [1, 2],
                            });
                            return res.data.map(item => ({
                              ...item,
                              label: `${item.fullName}`,
                              value: item.id,
                            }));
                          }}
                          optionRender={option => <TDTableColumnHoTen showMenu={false} dataUser={{ type: 1, fullName: option.data?.fullName, imageUrl: option.data?.imageUrl, userName: option.data?.userName }} />}
                          style={{
                            width: '100%',
                            height: 'auto',
                          }}
                        />
                      </FormItem>
                    ) : null
                  }
                </FormItem>
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
