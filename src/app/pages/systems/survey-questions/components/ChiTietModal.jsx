import React, { useState, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber, Tabs } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';

import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

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
      const res = await requestGET(`api/v1/surveyquestions/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        form.setFieldsValue({ ..._data });
        setImage(handleImage(_data?.imageUrl ?? '', FILE_URL));
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

      var body = { ...formData };

      if (body?.type == 1 && body?.options?.length > 0) {
        var temp = [];
        body?.options?.map((i, ind) => {
          i.order = ind + 1;
          temp.push(i);
        });
        body.options = temp;
      } else {
        body.options = null;
      }

      const res = id ? await requestPUT_NEW(`api/v1/surveyquestions/${id}`, body) : await requestPOST_NEW(`api/v1/surveyquestions`, body);

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

  const RenderTabQuestion = () => (
    <div className="row">
      <div className="col-xl-12 col-lg-12">
        <FormItem label="Tiêu đề câu hỏi" name="title">
          <Input placeholder="" />
        </FormItem>
      </div>

      <div className="col-xl-6 col-lg-6">
        <FormItem label="Loại câu hỏi" name="type" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={0}>
          <Select
            style={{ width: '100%' }}
            options={[
              {
                value: 1,
                label: 'Chọn đáp án',
              },
              {
                value: 0,
                label: 'Tự luận',
              },
            ]}
          />
        </FormItem>
      </div>

      <div className="col-xl-12 col-lg-12">
        <FormItem label="Nội dung" name="content">
          <TextArea rows={4} placeholder="" />
        </FormItem>
      </div>
    </div>
  );
  const RenderTabAnswer = () => (
    <div className="min-h-300px">
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
        {({ getFieldValue }) =>
          getFieldValue('type') == 1 ? (
            <div className="row">
              <div className="col-xl-12">
                <FormItem label="Phương án lựa chọn">
                  <Form.List name="options">
                    {(fields, { add, remove }) => (
                      <>
                        <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                          <thead>
                            <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                              <th>STT</th>
                              <th>Nội dung</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="w-50px text-center pt-5">{index + 1}</td>
                                <td>
                                  <Form.Item {...restField} name={[name, 'content']} noStyle>
                                    <TextArea rows={2} placeholder="Phương án" />
                                  </Form.Item>
                                </td>
                                <td className="w-50px  pt-5">
                                  <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                                    <i className="fas fa-minus-circle fs-3"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <Form.Item>
                          <button type="button" className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden" data-kt-stepper-action="next" onClick={() => add()}>
                            Thêm
                            <i className="ki-duotone ki-plus fs-3 ms-1 me-0">
                              <span className="path1" />
                              <span className="path2" />
                            </i>{' '}
                          </button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </FormItem>
              </div>
            </div>
          ) : (
            <div className="row"></div>
          )
        }
      </Form.Item>
    </div>
  );

  return (
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                {({ getFieldValue }) => (
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    items={[
                      {
                        label: `Nội dung`,
                        key: '1',
                        children: <RenderTabQuestion />,
                      },
                      {
                        label: `Lựa chọn`,
                        key: '2',
                        children: <RenderTabAnswer />,
                        disabled: getFieldValue('type') == 0,
                      },
                    ]}
                  />
                )}
              </Form.Item>
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
