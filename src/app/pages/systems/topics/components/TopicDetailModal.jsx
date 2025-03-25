import React, { useState, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import TDEditorNew from '@/app/components/TDEditorNew';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestPOST, requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import TDModal from '@/app/components/TDModal';
import FileUploadButton from '@/app/components/FileUploadButton';
import FileUpload from '@/app/components/FileUpload';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import { handleImage } from '@/utils/utils';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();

  const dataModal = useSelector(state => state.modal.topicDetail);
  const modalVisible = useSelector(state => state.modal.topicDetailModalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/topics/${id}`);
      var _data = res?.data ?? null;
      if (_data) {
        _data.course = {
          value: _data?.courseId,
          label: _data?.courseTitle,
        };

        if (_data?.tournaments) {
          let temp = [];

          (_data?.tournaments ?? []).map((i, index) => {
            temp.push({
              value: i.id,
              label: i.name,
            });
          });
          _data.tournaments = temp;
        } else {
          _data.tournaments = [];
        }
        if (_data?.fileUrls) {
          var temp = JSON.parse(_data?.fileUrls ?? "[]")
          _data.fileUrls = temp?.map(i => ({
            fileName: i?.fileName,
            fileList: handleImage(i?.fileUrl ?? '', FILE_URL)
          }))

        }
        form.setFieldsValue(_data);
      }
      setLoading(false);
    };
    if (id) {
      fetchData();
    } else if (dataModal?.courseId) {
      form.setFieldsValue({
        courseId: dataModal?.courseId,
        course: {
          value: dataModal?.courseId,
          label: dataModal?.courseTitle,
        },
      });
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataModal]);

  const handleCancel = () => {
    form.resetFields();
    /*  props.setDataModal(null);
    props.setModalVisible(false); */
    dispatch(actionsModal.setTopicDetailModalVisible(false));
    dispatch(actionsModal.setTopicDetail(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      var formData = form.getFieldsValue(true);

      if (id) {
        formData.id = id;
      }

      if (formData?.tournaments) {
        formData.tournamentIds = formData?.tournaments?.map(i => i.value)?.join('##');
      } else {
        formData.tournamentIds = null;
      }
      if (formData?.fileUrls?.length > 0) {
        var temp = []
        formData?.fileUrls?.forEach(i => {
          var file = i?.fileList[0]
          temp.push({
            fileName: i?.fileName,
            fileUrl: file?.response?.data[0]?.url || file?.path
          })
        });
        formData.fileUrls = JSON.stringify(temp)
      } else {
        formData.fileUrls = null
      }
      const res = id ? await requestPUT_NEW(`api/v1/topics/${id}`, formData) : await requestPOST_NEW(`api/v1/topics`, formData);

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
      title={id ? 'Chi tiết chủ đề' : 'Tạo mới chủ đề'}
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
              <i className="fa fa-save me-2"></i>
              {id ? 'Lưu' : 'Tạo mới'}
            </button>
          </div>
          <div className="d-flex justify-content-center  align-items-center">
            <button type="button" className="btn btn-sm btn-secondary rounded-1 py-2 px-5 ms-2" onClick={handleCancel}>
              <i className="fa fa-times me-2"></i>Đóng
            </button>
          </div>
        </>
      }
    >
      <Spin spinning={loading}>
        {!loading && (
          <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Tên" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Input
                    placeholder=""
                    onChange={e => {
                      if (!id) {
                        form.setFieldValue('code', removeAccents(e.target.value));
                      }
                    }}
                  />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Mã" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                  <Input placeholder="" />
                </FormItem>
              </div>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Khoá học" name="course">
                  <TDSelect
                    reload
                    showSearch
                    placeholder=""
                    fetchOptions={async keyword => {
                      const res = await requestPOST(`api/v1/courses/search`, {
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
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.examinatId !== currentValues.examinatId}>
                {({ getFieldValue }) => (
                  <div className="col-xl-6 col-lg-6">
                    <FormItem label="Thuộc vòng thi" name="tournaments">
                      <TDSelect
                        reload
                        mode="multiple"
                        placeholder=""
                        fetchOptions={async keyword => {
                          const res = await requestPOST(`api/v1/tournamentrelationships/search`, {
                            pageNumber: 1,
                            pageSize: 1000,
                            categoryGroupCode: 'VongThi',
                            relationshipId: getFieldValue('courseId'),
                          });
                          return res?.data?.map(item => ({
                            ...item,
                            label: `${item.tournamentName}`,
                            value: item.tournamentId,
                          }));
                        }}
                        style={{
                          width: '100%',
                          height: 'auto',
                        }}
                      />
                    </FormItem>
                  </div>
                )}
              </Form.Item>
              <div className="col-xl-6 col-lg-6">
                <FormItem label="Mức độ ưu tiên" name="sortOrder">
                  <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-3">
                <FormItem label="" name="isActive" valuePropName="checked">
                  <Checkbox>Hoạt động</Checkbox>
                </FormItem>
              </div>
              <div className="col-xl-3 col-lg-3">
                <FormItem label="" name="isTrial" valuePropName="checked">
                  <Checkbox>Cho phép học thử</Checkbox>
                </FormItem>
              </div>
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Ghi chú" name="description">
                  <TDEditorNew
                    data={form.getFieldValue('description') ? form.getFieldValue('description') : ''}
                    onChange={value => {
                      form.setFieldValue('description', value);
                    }}
                  />
                </FormItem>
              </div>

              <div className="col-xl-12">
                <Form.Item label="Danh sách tài liệu">
                  <Form.List name="fileUrls">
                    {(fields, { add, remove }) => (
                      <>
                        <table className="table gs-3 gy-3 gx-3 table-rounded table-striped border">
                          <thead>
                            <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
                              <th>STT</th>
                              <th>Tên tài liệu</th>
                              <th>Đính kèm</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="w-50px text-center pt-5">{index + 1}</td>
                                <td className=" ">
                                  <Form.Item {...restField} name={[name, 'fileName']} noStyle>
                                    <Input placeholder="" />
                                  </Form.Item>
                                </td>
                                <td className=''>
                                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.fileUrls !== currentValues.fileUrls}>
                                    {({ getFieldValue }) => (
                                      <Form.Item noStyle>
                                        <FileUploadButton
                                          URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                                          fileList={form.getFieldValue(['fileUrls', name, 'fileList'])}
                                          onChange={info => {
                                            form.setFieldValue(['fileUrls', name, 'fileList'], info?.fileList)
                                          }}
                                          headers={{
                                            Authorization: `Bearer ${token}`,
                                          }}
                                          maxCount={1}
                                        />
                                      </Form.Item>
                                    )}
                                  </Form.Item>
                                </td>
                                <td className="w-50px">
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
                </Form.Item>
              </div>
            </div>
          </Form>
        )}
      </Spin>
    </TDModal>
  );
};

export default ModalItem;
