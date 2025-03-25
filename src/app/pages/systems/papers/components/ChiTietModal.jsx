import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Checkbox, InputNumber, Radio } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL, requestPOST } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import FileUpload from '@/app/components/FileUpload';
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
  const [fileList, setFileList] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);
  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [typeVideo, setTypeVideo] = useState(0);
  const [typeVideoPreView, setTypeVideoPreView] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/papers/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.examination = _data?.examinatId
          ? {
              value: _data?.examinatId,
              label: _data?.examinatTitle,
            }
          : null;
        _data.typePaper = _data?.typePaperId
          ? {
              value: _data?.typePaperId,
              label: _data?.typePaperName,
            }
          : null;
        if (_data?.gradeIds?.length > 0) {
          let temp = [];
          let tmpIds = _data?.gradeIds?.split('##');
          let tmpNames = _data?.gradeNames?.split('##');
          tmpIds?.map((i, index) => {
            temp.push({
              value: i,
              label: tmpNames[index],
            });
          });
          _data.grades = temp;
        }

        if (_data?.courseIds?.length > 0) {
          let temp = [];
          let tmpIds = _data?.courseIds?.split('##');
          let tmpNames = _data?.courseTitles?.split('##');
          tmpIds?.map((i, index) => {
            temp.push({
              value: i,
              label: tmpNames[index],
            });
          });
          _data.courses = temp;
        }

        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
        setFileList(handleImage(_data?.file ?? '', FILE_URL));
        setFilePreview(handleImage(_data?.previewFile ?? '', FILE_URL));
        setVideoList(handleImage(_data?.sourceVideo ?? '', FILE_URL));
        setVideoPreview(handleImage(_data?.previewVideo ?? '', FILE_URL));
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
      var body = { ...formData };
      if (image?.length > 0) {
        let item = image[0];
        body.avatar = item?.response?.data[0]?.url || item?.path;
      } else {
        body.avatar = null;
      }
      if (fileList?.length > 0) {
        let item = fileList[0];
        body.file = item?.response?.data[0]?.url || item?.path;
      } else {
        body.file = null;
      }
      if (filePreview?.length > 0) {
        let item = filePreview[0];
        body.previewFile = item?.response?.data[0]?.url || item?.path;
      } else {
        body.previewFile = null;
      }
      if (typeVideo == 0) {
        let item = videoList?.length > 0 ? videoList[0] : null;
        body.sourceVideo = item?.response?.data[0]?.url || item?.path;
      }
      if (typeVideoPreView == 0) {
        let item = videoPreview?.length > 0 ? videoList[0] : null;
        body.previewVideo = item?.response?.data[0]?.url || item?.path;
      }
      body.gradeIds = body?.grades?.length > 0 ? body?.grades?.map(i => i.value)?.join('##') : null;
      body.courseIds = body?.courses?.length > 0 ? body?.courses?.map(i => i.value)?.join('##') : null;
      if (id) {
        body.id = id;
      }
      const res = id ? await requestPUT_NEW(`api/v1/papers/${id}`, body) : await requestPOST_NEW(`api/v1/papers`, body);

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
        <Spin spinning={loadding}>
          {!loadding && (
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tiêu đề" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                  <FormItem label="Kỳ thi" name="examination">
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
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
                        height: 'auto',
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
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Khối lớp" name="grades">
                    <TDSelect
                      reload
                      mode="multiple"
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/categories/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          categoryGroupCode: 'KhoiLop',
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
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Khóa học" name="courses">
                    <TDSelect
                      reload
                      mode="multiple"
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/courses/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
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
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Loại tài liệu" name="typePaper">
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/categories/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          categoryGroupCode: 'LoaiTaiLieu',
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
                        height: 'auto',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('typePaperId', current?.id);
                        } else {
                          form.setFieldValue('typePaperId', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Mô tả">
                    <TDEditorNew
                      data={form.getFieldValue('description') ? form.getFieldValue('description') : ''}
                      onChange={value => {
                        form.setFieldValue('description', value);
                      }}
                    />
                  </FormItem>
                </div>

                <div className="col col-xl-12">
                  <FormItem label="Ảnh đại diện">
                    <ImageUpload
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={image}
                      onChange={e => setImage(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </FormItem>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Dung lượng file" name="capacity">
                    <Input placeholder="" disabled />
                  </FormItem>
                </div>
                {/* <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số tải xuống" name="downloadNumbers">
                    <InputNumber placeholder="" min={0} />
                  </FormItem>
                </div> */}
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thứ tự" name="sortOrder">
                    <InputNumber placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="File tài liệu">
                    <FileUpload
                      maxCount={1}
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={fileList}
                      onChange={e => {
                        if (e?.fileList?.length > 0) {
                          let item = e?.fileList[0];
                          form.setFieldValue('capacity', item?.size);
                        }
                        setFileList(e.fileList);
                      }}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="File tài liệu xem trước">
                    <FileUpload
                      maxCount={1}
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={filePreview}
                      onChange={e => setFilePreview(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
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
                    <Form.Item name="sourceVideo">
                      <Input placeholder="" />
                    </Form.Item>
                  )}
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Video xem trước">
                    <Radio.Group onChange={e => setTypeVideoPreView(e.target.value)} value={typeVideoPreView}>
                      <Radio value={0}>Đính kèm</Radio>
                      <Radio value={1}>Đường dẫn</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {typeVideoPreView == 0 ? (
                    <Form.Item>
                      <FileUpload
                        maxCount={1}
                        accept="video/*"
                        URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/videos`}
                        fileList={videoPreview}
                        onChange={e => {
                          if (e?.file?.status === 'error') {
                            toast.warning('Dung lượng quá lớn');
                          }
                          setVideoPreview(e.fileList);
                        }}
                        headers={{
                          Authorization: `Bearer ${token}`,
                        }}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="previewVideo">
                      <Input placeholder="" />
                    </Form.Item>
                  )}
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isFree" valuePropName="checked">
                    <Checkbox>Là tài liệu miễn phí</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isActive" valuePropName="checked">
                    <Checkbox>Sử dụng</Checkbox>
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
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
