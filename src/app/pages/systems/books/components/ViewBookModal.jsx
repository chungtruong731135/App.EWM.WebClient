import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Spin, Checkbox, InputNumber, DatePicker, Upload } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import dayjs from 'dayjs';

import * as authHelper from '@/app/modules/auth/core/AuthHelpers';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { requestGET, requestPOST_NEW, requestPUT_NEW, API_URL, FILE_URL, requestPOST, requestUploadFile } from '@/utils/baseAPI';
import ImageUpload from '@/app/components/ImageUpload';
import { handleImage } from '@/utils/utils';
import { removeAccents } from '@/utils/slug';
import TDSelect from '@/app/components/TDSelect';
import TDEditorNew from '@/app/components/TDEditorNew';
import { Card } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined } from '@ant-design/icons';
import './styles/CustomScroll.css';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Dragger } = Upload;

const ModalItem = props => {
  const dispatch = useDispatch();
  const dataModal = useSelector(state => state.modal.dataModal);
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const [btnLoading, setBtnLoading] = useState(false);
  const [loadding, setLoadding] = useState(false);
  const [bookPages, setBookPages] = useState([]);
  const { isModalPreview, setIsModalPreview } = props;

  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);

  const handleCancel = () => {
    setIsModalPreview(false);
  };

  const onFinish = async () => {
    handleCancel();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadding(true);
        const res = await requestPOST(
          `api/v1/bookpages/search`,
          _.assign({
            pageNumber: 1,
            pageSize: 1000,
            orderBy: ['pageNo'],
            bookId: id,
          })
        );

        if (res?.data) {
          setBookPages(res?.data ?? []);
          setLoadding(false);
        }
      } catch (error) {
        console.log(error);
        setLoadding(false);
      }
    };

    fetchData();
    return () => {};
  }, []);

  useEffect(() => {
    const handleWheelZoom = event => {
      if (event.ctrlKey) {
        event.preventDefault();
        setZoom(prevZoom => Math.min(Math.max(prevZoom + (event.deltaY > 0 ? -0.1 : 0.1), 0.5), 2));
      }
    };
    document.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => document.removeEventListener('wheel', handleWheelZoom);
  }, []);

  return (
    <Modal show={isModalPreview} fullscreen={'lg'} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Xem sách</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        <Spin spinning={loadding}>
          <>
            {bookPages.length > 0 && (
              <>
                <div className=" items-center p-4 overflow-y h-screen ms-3 ">
                  <div className="d-flex justify-content-center  items-center row  " style={{ background: 'tranparent' }}>
                    {bookPages
                      .filter(i => i.isActive == true)
                      .map((page, index) => (
                        <div className="col-12 align-center mb-6 " style={{ background: '' }} key={index}>
                          <img
                            src={page.cover.includes('https://') || page.cover.includes('http://') ? page.cover : FILE_URL + `${page.cover.startsWith('/') ? page.cover.substring(1) : page.cover}`}
                            alt={`Page ${index + 1}`}
                            //style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s' }}
                            style={{ width: '100%', height: '100%' }}
                            className="max-w-full h-auto"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </>
        </Spin>
      </Modal.Body>
    </Modal>
  );
};

export default ModalItem;
