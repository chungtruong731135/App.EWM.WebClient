import React, { useState, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW } from '@/utils/baseAPI';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';

const QUESTION_TYPES = [
  { value: 0, label: 'Cấu hình cơ bản' },
  { value: 1, label: 'Cấu hình nâng cao' },
];

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
      const res = await requestGET(`api/v1/examareas/${id}`);

      if (res && res.data) {
        var _data = res?.data ?? null;
        if (_data?.examinatIds?.length > 0) {
          let temp = [];
          let tmpIds = _data?.examinatIds?.split('#');
          let tmpNames = _data?.examinatNames?.split('#');
          try {
            tmpIds?.map((i, index) => {
              temp.push({
                value: i,
                label: tmpNames[index],
              });
            });
          } catch (error) {
            /* empty */
          }

          _data.examinats = temp;
        }
        try {
          _data.config = _data.config ? JSON.parse(_data.config) : [];
        } catch (error) {
          /* empty */
        }
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
      var body = { ...formData };

      if (id) {
        body.id = id;
      }

      if (body?.examinats?.length > 0) {
        body.examinatIds = body?.examinats?.map(i => i.value)?.join('#');
      } else {
        body.examinatIds = null;
      }

      if (body?.config?.length > 0) {
        try {
          let config = body?.config;

          body.config = JSON.stringify(config);
        } catch (error) {
          /* empty */
        }
      } else {
        body.config = null;
      }

      const res = id ? await requestPUT_NEW(`api/v1/examareas/${id}`, body) : await requestPOST_NEW(`api/v1/examareas`, body);

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
                  <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input
                      placeholder=""
                      onChange={e => {
                        if (!id) {
                          form.setFieldValue('code', removeAccents(e.target.value));
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mã" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mức độ ưu tiên" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label=" " name="isShowSuggestion" valuePropName="checked">
                    <Checkbox>Hiển thị gợi ý</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label=" " name="isShowVietnamese" valuePropName="checked">
                    <Checkbox>Hiển thị tiêu đề tiếng Việt</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thuộc kỳ thi" name="examinats">
                    <TDSelect
                      reload
                      showSearch
                      mode="multiple"
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/examinats/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
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
                        height: 'auto',
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Thời gian làm bài" name="duration">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} addonAfter="Phút" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tổng số câu hỏi" name="totalQuestion">
                    <InputNumber placeholder="" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Điểm số ban đầu" name="startScore">
                    <InputNumber placeholder="" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Điểm số tối đa" name="totalScore">
                    <InputNumber placeholder="" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label=" " name="isCustom" valuePropName="checked" initialValue={false} style={{ marginBottom: 10 }}>
                    <Checkbox>Tuỳ chỉnh cấu trúc đề</Checkbox>
                  </Form.Item>
                </div>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isCustom !== currentValues.isCustom}>
                  {({ getFieldValue }) =>
                    getFieldValue('isCustom') ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <Form.Item label="Loại cấu trúc đề" name="configType" rules={[{ required: true, message: 'Không được để trống!' }]} initialValue={0}>
                            <Select style={{ width: '100%' }} options={QUESTION_TYPES} />
                          </Form.Item>
                        </div>
                        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.configType !== currentValues.configType}>
                          {({ getFieldValue }) =>
                            getFieldValue('configType') == 1 ? (
                              <div className="col-xl-12">
                                <Form.List name="config">
                                  {(fields, { add, remove }) => (
                                    <>
                                      <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                                        <thead>
                                          <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                                            <th>Phần thi</th>
                                            <th>Từ câu</th>
                                            <th>Đến câu</th>
                                            <th>Thời gian làm bài</th>
                                            <th>Tổng số điểm</th>
                                            <th>Số điểm tối thiểu</th>
                                            <th>Ghi chú</th>
                                            <th></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {fields.map(({ key, name, ...restField }, index) => (
                                            <tr key={key}>
                                              <td className="w-30">
                                                <Form.Item
                                                  {...restField}
                                                  name={[name, 'skill']}
                                                  noStyle
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <Input placeholder="Phần thi" />
                                                </Form.Item>
                                              </td>

                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'from']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'to']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'time']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'totalScore']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'minimumScore']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item name={[name, 'description']}>
                                                  <Input placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-10 text-center">
                                                <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                                                  <i className="fas fa-minus-circle fs-3"></i>
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>

                                      <Form.Item>
                                        <button
                                          type="button"
                                          className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                                          data-kt-stepper-action="next"
                                          onClick={() => {
                                            if (fields?.length == 0) {
                                              add({
                                                from: 0,
                                              });
                                            } else {
                                              add({
                                                from: form.getFieldValue(['config', fields.length - 1, 'to']) + 1,
                                              });
                                            }
                                          }}
                                        >
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
                              </div>
                            ) : (
                              <div className="col-xl-12">
                                <Form.List name="config">
                                  {(fields, { add, remove }) => (
                                    <>
                                      <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                                        <thead>
                                          <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                                            <th>Từ</th>
                                            <th>Đến</th>
                                            <th>Điểm khi làm đúng</th>
                                            <th>Điểm khi làm sai</th>
                                            <th>Điểm khi không làm</th>
                                            <th>Ghi chú</th>
                                            <th></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {fields.map(({ key, name, ...restField }, index) => (
                                            <tr key={key}>
                                              <td className="w-30">
                                                <Form.Item
                                                  {...restField}
                                                  name={[name, 'from']}
                                                  noStyle
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>

                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'to']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'score']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'scoreWrong']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item
                                                  name={[name, 'scoreNull']}
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message: 'Không được để trống!',
                                                    },
                                                  ]}
                                                >
                                                  <InputNumber placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-30">
                                                <Form.Item name={[name, 'description']}>
                                                  <Input placeholder="" style={{ width: '100%' }} />
                                                </Form.Item>
                                              </td>
                                              <td className="w-10 text-center">
                                                <button className="btn btn-icon btn-sm h-3 btn-color-gray-400 btn-active-color-danger" onClick={() => remove(name)}>
                                                  <i className="fas fa-minus-circle fs-3"></i>
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>

                                      <Form.Item>
                                        <button
                                          type="button"
                                          className="border-dashed btn btn-outline btn-flex btn-color-muted btn-active-color-primary overflow-hidden"
                                          data-kt-stepper-action="next"
                                          onClick={() => {
                                            if (fields?.length == 0) {
                                              add({
                                                from: 0,
                                              });
                                            } else {
                                              add({
                                                from: form.getFieldValue(['config', fields.length - 1, 'to']) + 1,
                                              });
                                            }
                                          }}
                                        >
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
                              </div>
                            )
                          }
                        </Form.Item>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Ghi chú" name="description">
                    <Input.TextArea rows={4} placeholder="" />
                  </Form.Item>
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
