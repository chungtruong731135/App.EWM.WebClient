/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input } from 'antd';
import TDEditorNew from '@/app/components/TDEditorNew';
import { requestPOST_NEW } from '@/utils/baseAPI';
import { toast } from 'react-toastify';
import CopyToClipboard from 'react-copy-to-clipboard';

const FormItem = Form.Item;

const UsersPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);

  const [goiY, setGoiY] = useState(null);

  const onFinish = async () => {
    const values = await form.validateFields();
    setBtnLoading(true);
    try {
      const formData = form.getFieldsValue(true);

      const res = await requestPOST_NEW(`api/v1/questions/tool-ho-tro`, formData);

      if (res.status === 200) {
        setGoiY(res?.data?.message ?? '');
        toast.success('Cập nhật thành công!');
      } else {
        toast.error('Thất bại, vui lòng thử lại! ');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setBtnLoading(false);
  };

  const onFinishFailed = error => {
    toast.error('Thất bại, vui lòng thử lại! ');
  };

  const handleSubmit = () => {
    form.submit();
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Hỗ trợ lấy gợi ý cho câu hỏi tiếng anh'}</h3>
          <div className="card-toolbar">
            {/* <button className="btn btn-primary btn-sm py-2 me-2" onClick={() => {}}>
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button> */}
          </div>
        </div>
        <div className="card-body p-12">
          <Form form={form} layout="vertical" autoComplete="off" onFinishFailed={onFinishFailed} onFinish={onFinish}>
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <FormItem label="Nội dung" name="noiDung">
                  <TDEditorNew
                    data={form.getFieldValue('noiDung') ? form.getFieldValue('noiDung') : ''}
                    onChange={value => {
                      form.setFieldValue('noiDung', value);
                    }}
                  />
                </FormItem>
              </div>
              <div className="col-xl-12 col-lg-12">
                <div className="mb-0">
                  <label className="form-label fs-6 fw-bold text-gray-700">Kết quả</label>
                  <CopyToClipboard
                    text={goiY}
                    onCopy={() => {
                      toast.info(`Đã sao chép: ${goiY}`);
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between btn p-0 border border-dashed border-gray-300 rounded px-7 py-3 mb-6">
                      <div>{goiY}</div>
                      <i className="fas fa-copy" />
                    </div>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </Form>
          <div className="text-center mb-1">
            <button className="btn btn-sm btn-primary me-2" onClick={handleSubmit}>
              Lấy gợi ý{' '}
            </button>

            <button className="btn btn-sm btn-light">Xoá </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
