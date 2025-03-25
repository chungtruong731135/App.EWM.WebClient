import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Select, Spin, Checkbox, InputNumber, Radio } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { removeAccents } from '@/utils/slug';

import FileUpload from '@/app/components/FileUpload';
import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
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

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [typeFile, setTypeFile] = useState(0);
  const [typeVideo, setTypeVideo] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/questionlevelItems/${id}`);
      var _data = res?.data ?? null;
      if (_data) {
        _data.questionLevel = _data?.questionLevelId
          ? {
              value: _data?.questionLevelId,
              label: _data?.questionLevelName,
            }
          : null;

        form.setFieldsValue({ ..._data });
        setFileList(handleImage(_data?.fileUrls ?? '', FILE_URL));
        setVideoList(handleImage(_data?.videoUrls ?? '', FILE_URL));
      }
      setLoading(false);
    };
    if (id) {
      fetchData();
    } else if (dataModal?.questionLevelId) {
      form.setFieldsValue({
        questionLevelId: dataModal?.questionLevelId,
      });
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
      var body = { ...formData };
      if (typeFile == 0) {
        let arrFile = [];
        fileList?.forEach(i => {
          if (i?.response) {
            arrFile.push(i?.response?.data[0]?.url);
          } else {
            arrFile.push(i?.path);
          }
        });
        body.fileUrls = arrFile?.join('##');
      }
      if (typeVideo == 0) {
        let arrVideo = [];
        videoList?.forEach(i => {
          if (i?.response) {
            arrVideo.push(i?.response?.data[0]?.url);
          } else {
            arrVideo.push(i?.path);
          }
        });

        body.videoUrls = arrVideo?.join('##');
      }
      if (id) {
        body.id = id;
      }
      const res = id ? await requestPUT_NEW(`api/v1/questionlevelItems/${id}`, body) : await requestPOST_NEW(`api/v1/questionlevelItems`, body);

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
    <Modal show={modalVisible} fullscreen={'lg-down'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          {!loading && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tiêu đề" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại" name="type" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        {
                          label: 'Video bài học',
                          value: 'Video',
                        },
                        {
                          label: 'File bài học',
                          value: 'Article',
                        },
                        {
                          label: 'Bài tập',
                          value: 'Exercise',
                        },
                      ]}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Nội dung" name="content">
                    <TDEditorNew
                      data={form.getFieldValue('content') ? form.getFieldValue('content') : ''}
                      onChange={value => {
                        form.setFieldValue('content', value);
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Mô tả thêm" name="subTitle">
                    <TDEditorNew
                      data={form.getFieldValue('subTitle') ? form.getFieldValue('subTitle') : ''}
                      onChange={value => {
                        form.setFieldValue('subTitle', value);
                      }}
                    />
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mức độ ưu tiên" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Hoạt động</Checkbox>
                  </FormItem>
                </div>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) =>
                    getFieldValue('type') == 'Exercise' || getFieldValue('type') == 'Quiz' || getFieldValue('type') == 'UnitTest' ? (
                      <>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Thời gian làm bài" name="duration">
                            <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Tổng số câu hỏi" name="totalQuestion">
                            <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                          </FormItem>
                        </div>
                        <div className="col-xl-6 col-lg-6">
                          <FormItem label="Tổng số điểm" name="totalScore">
                            <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                          </FormItem>
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) =>
                    getFieldValue('type') == 'Article' ? (
                      <>
                        <div className="col-xl-12">
                          <Form.Item label="File">
                            <Radio.Group onChange={e => setTypeFile(e.target.value)} value={typeFile}>
                              <Radio value={0}>Đính kèm</Radio>
                              <Radio value={1}>Đường dẫn</Radio>
                            </Radio.Group>
                          </Form.Item>
                          {typeFile == 0 ? (
                            <Form.Item>
                              <FileUpload
                                maxCount={1}
                                URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                                fileList={fileList}
                                onChange={e => setFileList(e.fileList)}
                                headers={{
                                  Authorization: `Bearer ${token}`,
                                }}
                              />
                            </Form.Item>
                          ) : (
                            <Form.Item name="fileUrls">
                              <Input placeholder="" />
                            </Form.Item>
                          )}
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
                  {({ getFieldValue }) =>
                    getFieldValue('type') == 'Video' || getFieldValue('type') == 'Article' ? (
                      <>
                        <div className="col-xl-12">
                          <Form.Item label="Video">
                            <Radio.Group onChange={e => setTypeVideo(e.target.value)} value={typeVideo}>
                              <Radio value={0}>Đính kèm</Radio>
                              <Radio value={1}>Đường dẫn</Radio>
                            </Radio.Group>
                          </Form.Item>
                          {typeVideo == 0 ? (
                            <Form.Item>
                              <FileUpload
                                maxCount={1}
                                accept="video/*"
                                URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/videos`}
                                fileList={videoList}
                                onChange={e => {
                                  if (e?.file?.status === 'error') {
                                    toast.warning('Dung lượng quá lớn');
                                  }
                                  setVideoList(e.fileList);
                                }}
                                headers={{
                                  Authorization: `Bearer ${token}`,
                                }}
                              />
                            </Form.Item>
                          ) : (
                            <Form.Item name="videoUrls">
                              <Input placeholder="" />
                            </Form.Item>
                          )}
                        </div>
                      </>
                    ) : (
                      <></>
                    )
                  }
                </Form.Item>
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
