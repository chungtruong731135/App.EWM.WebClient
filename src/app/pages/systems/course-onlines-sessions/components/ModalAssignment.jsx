import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Form, Input, Spin, DatePicker, Upload } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPUT_NEW, API_URL, FILE_URL } from '@/utils/baseAPI';
import { handleImage } from '@/utils/utils';
import FileUpload from '@/app/components/FileUpload';
import HeaderTitle from '@/app/components/HeaderTitle';
import TDEditorNew from '@/app/components/TDEditorNew';

const FormItem = Form.Item;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const { modalVisible, setModalVisible } = props;
  const dataModal = useSelector(state => state.modal.dataModal);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [fileReply, setFileReply] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/classsessionassignments/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.createdOn = _data?.createdOn ? dayjs(_data?.createdOn) : null;
        setFileList(handleImage(_data?.files ?? '', FILE_URL));
        setFileReply(handleImage(_data?.teacherFiles ?? '', FILE_URL));

        form.setFieldsValue({ ..._data });
      }

      setLoading(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
  }, [id]);

  const handleCancel = () => {
    form.resetFields();

    setModalVisible(false);
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      if (id && (formData?.score || formData?.comment)) {
        let arrFile = [];
        fileReply.forEach(i => {
          if (i?.response) {
            arrFile.push(i?.response?.data[0]?.url);
          } else {
            arrFile.push(i?.path);
          }
        });
        var body = {
          id: id,
          score: formData?.score,
          comment: formData?.comment ?? '',
          teacherFiles: arrFile?.join('##'),
        };
        const res = await requestPUT_NEW(`api/v1/classsessionassignments/teachers/${id}`, body);

        if (res.status === 200) {
          toast.success('Cập nhật thành công!');
          dispatch(actionsModal.setRandom());
        } else {
          const errors = Object.values(res?.data?.errors ?? {});
          let final_arr = [];
          errors.forEach(item => {
            final_arr = _.concat(final_arr, item);
          });
          toast.error('Thất bại, vui lòng thử lại! ' + final_arr.join(' '));
        }
      } else {
        toast.success('Cập nhật thành công!');
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
                  <FormItem label="Họ và tên" name="studentFullName">
                    <Input placeholder="" disabled />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tài khoản" name="studentUserName">
                    <Input placeholder="" disabled />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thời gian nộp" name="createdOn">
                    <DatePicker disabled format={'DD/MM/YYYY HH:mm'} placeholder="" />
                  </FormItem>
                </div>

                <div className="col-xl-12">
                  <FormItem label="File bài tập" name="content">
                    <Upload disabled fileList={fileList} listType="picture" />
                  </FormItem>
                </div>
              </div>
              <HeaderTitle title="Nhận xét, chấm điểm" />
              <div className="row mt-2">
                <div className="col-xl-12">
                  <FormItem label="Điểm" name="score">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-12">
                  <Form.Item label="Đính kèm">
                    <FileUpload
                      URL={`${API_URL}/api/v1/attachments/public/${import.meta.env.VITE_APP_SYSTEM_TYPE}/files`}
                      fileList={fileReply}
                      onChange={e => setFileReply(e.fileList)}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-12">
                  <FormItem label="Nhận xét" name="comment">
                    <TDEditorNew
                      data={form.getFieldValue('comment') ? form.getFieldValue('comment') : ''}
                      onChange={value => {
                        form.setFieldValue('comment', value);
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
          <Button className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2" onClick={handleSubmit} disabled={btnLoading}>
            <i className="fa fa-save"></i>
            {'Lưu'}
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
