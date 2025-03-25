import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Form, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';

import { requestGET, requestPUT_NEW, requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';

const FormItem = Form.Item;

const ModalItem = props => {
  const { modalVisible, setModalVisible, dataModal } = props;
  const dispatch = useDispatch();

  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/courseexams/${id}`);

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
    setModalVisible(false);
  };

  const onFinish = async () => {
    const values = await form.validateFields();
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      if (formData?.courseOnlinePrograms?.length > 0) {
        formData.courseOnlineProgramIds = formData?.courseOnlinePrograms?.map(i => i.value);
      } else {
        formData.courseOnlineProgramIds = null;
      }
      if (formData?.courseClasses?.length > 0) {
        formData.courseClassIds = formData?.courseClasses?.map(i => i.value);
      } else {
        formData.courseClassIds = null;
      }

      const res = await requestPUT_NEW(`api/v1/courseexams/${id}`, formData);

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
                  <FormItem label="Chương trình học" name="courseOnlinePrograms">
                    <TDSelect
                      //fieldNames={{ label: 'name', value: 'id' }}
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
                          label: `${item.name} `,
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
                <div className="col-xl-12 col-lg-12">
                  <FormItem label="Lớp học" name="courseClasses">
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
