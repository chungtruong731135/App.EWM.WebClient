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
import TDEditorNew from '@/app/components/TDEditorNew';
import { useNavigate, useParams } from 'react-router-dom';

const FormItem = Form.Item;
const { TextArea } = Input;

const ModalItem = props => {
  const dispatch = useDispatch();
  const { token } = authHelper.getAuth();
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const { bookId } = useParams();

  const [form] = Form.useForm();
  const [image, setImage] = useState([]);

  const [loadding, setLoadding] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      const res = await requestGET(`api/v1/bookauthors/${id}`);

      var _data = res?.data ?? null;
      if (_data) {
        _data.publishDate = _data?.publishDate ? dayjs(_data.publishDate) : null;
        // _data.articlecatalog = _data?.articlecatalogId
        //   ? {
        //     value: _data?.articlecatalogId ?? null,
        //     label: _data?.articlecatalogName ?? null,
        //   }
        //   : null;
        form.setFieldsValue({ ..._data });
        setImage(handleImage(_data?.cover ?? '', FILE_URL));
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
      let arrImage = [];
      image.forEach(i => {
        if (i.response) {
          arrImage.push(i.response.data[0].url);
        } else {
          arrImage.push(i.path);
        }
      });

      form.setFieldsValue({ cover: arrImage.join('##') });

      const formData = form.getFieldsValue(true);
      if (id) {
        formData.id = id;
      }
      formData.bookId = bookId;

      const res = id ? await requestPUT_NEW(`api/v1/bookauthors/${id}`, formData) : await requestPOST_NEW(`api/v1/bookauthors`, formData);

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
            <Form form={form} layout="vertical" /* initialValues={initData} */ autoComplete="off">
              <div className="row">
                <div className="col col-xl-6">
                  <FormItem label="Tên tác giả" name="name">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                <div className="col col-xl-6">
                  <FormItem label="Chức vụ" name="role">
                    <Input placeholder="" />
                  </FormItem>
                </div>
                {id && (
                  <div className="col-xl-6 col-lg-6">
                    <FormItem label=" " name="isActive" valuePropName="checked">
                      <Checkbox>Phát hành</Checkbox>
                    </FormItem>
                  </div>
                )}
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
