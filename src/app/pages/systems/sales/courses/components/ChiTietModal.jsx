import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Spin, Checkbox, InputNumber, DatePicker } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL, requestPOST } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';

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
      const res = await requestGET(`api/v1/courses/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.expirationDate = _data?.expirationDate ? dayjs(_data?.expirationDate) : null;
        _data.examination = _data?.examinatId
          ? {
              value: _data?.examinatId,
              label: _data?.examinatTitle,
            }
          : null;
        // _data.teacher = _data?.teacherId
        //   ? {
        //       value: _data?.teacherId,
        //       label: _data?.teacherName,
        //     }
        //   : null;
        _data.teacher = _data?.teacherId
          ? {
              value: _data?.teacherId,
              label: _data?.teacherName,
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
        form.setFieldsValue({ ..._data });
        setImage(handleImage(_data?.avatar ?? '', FILE_URL));
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
    dispatch(actionsModal.setDataModal(null));
  };

  const onFinish = async () => {
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);
      var body = { ...formData };
      let arrImage = [];
      image?.forEach(i => {
        if (i?.response) {
          arrImage.push(i?.response.data[0].url);
        } else {
          arrImage.push(i.path);
        }
      });

      body.avatar = arrImage?.join('##');
      if (body?.grades?.length > 0) {
        body.gradeIds = body?.grades?.map(i => i.value)?.join('##');
      } else {
        body.gradeIds = null;
      }
      if (id) {
        body.id = id;
      }

      const res = id ? await requestPUT_NEW(`api/v1/courses/${id}`, body) : await requestPOST_NEW(`api/v1/courses`, body);

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
            <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish} disabled={true}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Tiêu đề" name="title" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                  <FormItem label="Mã khoá học" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
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
                      // onChange={(value, current) => {
                      //   if (value) {
                      //     form.setFieldValue("grades", current);
                      //   } else {
                      //     form.setFieldValue("grades", null);
                      //   }
                      // }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giáo viên" name="teacher">
                    <TDSelect
                      reload
                      showSearch
                      placeholder=""
                      fetchOptions={async keyword => {
                        const res = await requestPOST(`api/v1/teachers/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return res?.data?.map(item => ({
                          ...item,
                          label: `${item.fullName}`,
                          value: item.id,
                        }));
                      }}
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      onChange={(value, current) => {
                        if (value) {
                          form.setFieldValue('teacherId', current?.id);
                        } else {
                          form.setFieldValue('teacherId', null);
                        }
                      }}
                    />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá tiền" name="price">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá khuyến mại" name="promotePrice">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá tiền học chương trình" name="programPrice">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Giá tiền luyện đề" name="examPrice">
                    <InputNumber placeholder="" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Ngày hết hạn khuyến mãi" name="expirationDate">
                    <DatePicker placeholder="" format={'DD/MM/YYYY'} />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mô tả" name="description">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Lợi ích" name="benefit">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Mục tiêu" name="target">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Thời gian học" name="studyTime">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Cấu trúc" name="structure">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <FormItem label="Hỗ trợ" name="support">
                    <TextArea rows={4} placeholder="" />
                  </FormItem>
                </div>
                <div className="col-xl-6 col-lg-6">
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
                  <FormItem label="" name="isPublic" valuePropName="checked">
                    <Checkbox>Hiển thị trang chủ</Checkbox>
                  </FormItem>
                  <FormItem label="" name="isActive" valuePropName="checked">
                    <Checkbox>Sử dụng</Checkbox>
                  </FormItem>
                </div>
              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {/* <div className="d-flex justify-content-center  align-items-center">
          <Button
            className="btn-sm btn-primary rounded-1 py-2 px-5  ms-2"
            onClick={handleSubmit}
            disabled={btnLoading}
          >
            <i className="fa fa-save"></i>
            {id ? "Lưu" : "Tạo mới"}
          </Button>
        </div> */}
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
