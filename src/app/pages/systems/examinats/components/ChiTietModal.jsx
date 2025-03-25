import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, Checkbox, InputNumber } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import { removeAccents } from '@/utils/slug';
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
  const [imageHomeUrl, setImageHomeUrl] = useState([]);
  const [imageHomeHoverUrl, setImageHomeHoverUrl] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/examinats/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        form.setFieldsValue({ ..._data });
        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
        setImageHomeUrl(handleImage(_data?.imageHomeUrl ?? '', FILE_URL));
        setImageHomeHoverUrl(handleImage(_data?.imageHomeHoverUrl ?? '', FILE_URL));
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
    try {
      setBtnLoading(true);
      const values = await form.validateFields();
      let arrImage = [];
      image?.forEach(i => {
        if (i?.response) {
          arrImage.push(i?.response.data[0].url);
        } else {
          arrImage.push(i?.path);
        }
      });
      let arrImageHomeUrl = [];
      imageHomeUrl?.forEach(i => {
        if (i?.response) {
          arrImageHomeUrl.push(i?.response.data[0].url);
        } else {
          arrImageHomeUrl.push(i?.path);
        }
      });
      let arrImageHomeHoverUrl = [];
      imageHomeHoverUrl?.forEach(i => {
        if (i?.response) {
          arrImageHomeHoverUrl.push(i?.response.data[0].url);
        } else {
          arrImageHomeHoverUrl.push(i?.path);
        }
      });

      form.setFieldsValue({ avatar: arrImage.join('##'), imageHomeUrl: arrImageHomeUrl.join('##'), imageHomeHoverUrl: arrImageHomeHoverUrl.join('##') });

      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/examinats/${id}`, formData) : await requestPOST_NEW(`api/v1/examinats`, formData);

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
                  <FormItem label="Tên kỳ thi" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                  <FormItem label="Mã kỳ thi" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Địa điểm tổ chức" name="location">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thời gian tổ chức" name="time">
                    <Input placeholder="" />
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

                <div className="col col-xl-6">
                  <FormItem label="Ảnh trang chủ">
                    <ImageUpload
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={imageHomeUrl}
                      onChange={e => setImageHomeUrl(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col col-xl-6">
                  <FormItem label="Ảnh trang chủ khi hover">
                    <ImageUpload
                      URL={`${API_URL}/api/v1/attachments/public`}
                      fileList={imageHomeHoverUrl}
                      onChange={e => setImageHomeHoverUrl(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
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
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số khóa học" name="courses">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số bài giảng" name="lessons">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số đề thi" name="exams">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số tài liệu" name="papers">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số học viên" name="users">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Số suất ưu đãi" name="preferentialNumber">
                    <InputNumber placeholder="" min={0} max={10000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mức độ ưu tiên" name="sortOrder">
                    <InputNumber defaultValue={0} placeholder="" min={0} max={1000} style={{ width: '100%' }} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="published" valuePropName="checked">
                    <Checkbox>Phát hành</Checkbox>
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label=" " name="isOutstanding" valuePropName="checked">
                    <Checkbox>Là kỳ thi nổi bật</Checkbox>
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
