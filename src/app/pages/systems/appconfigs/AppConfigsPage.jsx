/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPOST, requestPOST_NEW } from '@/utils/baseAPI';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { Form, Input, Spin, Tabs } from 'antd';
import * as actionsModal from '@/setup/redux/modal/Actions';

import TabChung from './components/TabChung';
import TabKhoaHocOnline from './components/TabKhoaHocOnline';
import TabThanhToan from './components/TabThanhToan';
import TabThongBao from './components/TabThongBao';
import TabMailServer from './components/TabMailServer';

const UsersPage = () => {
  const random = useSelector(state => state.modal.random);
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(`api/v1/appconfigs/search`, {
          pageNumber: 1,
          pageSize: 1000,
        });

        if (res && res.data) {
          const myObj = (res?.data ?? []).reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});

          form.setFieldsValue({ ...myObj });
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {};
  }, [random]);

  const onFinish = async () => {
    const values = await form.validateFields();
    setBtnLoading(true);
    try {
      var arrSettings = Object.entries(values).map(([key, value]) => ({
        key,
        value: value || '',
      }));

      const res = await requestPOST_NEW(`api/v1/appconfigs/createall`, {
        data: arrSettings,
      });

      if (res.status === 200) {
        toast.success('Cập nhật thành công!');
        dispatch(actionsModal.setRandom());
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
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0 mb-lg-2">{'Cấu hình hệ thống'}</h3>
          <div className="card-toolbar">
            <button className="btn btn-primary btn-sm py-2 me-2" onClick={onFinish}>
              <span>
                <i className="fas fa-save me-2"></i>
                <span className="">Lưu cấu hình</span>
              </span>
            </button>
          </div>
        </div>
        <div className="card-body card-dashboard px-3 py-3">
          <Spin spinning={loading}>
            <Form form={form} layout="vertical" autoComplete="off">
              <Tabs
                className="nav nav-tabs nav-line-tabs mb-5 fs-6"
                defaultActiveKey="1"
                items={[
                  {
                    label: `Chung`,
                    key: '1',
                    children: <TabChung />,
                  },
                  {
                    label: `Khoá học`,
                    key: '2',
                    children: <TabKhoaHocOnline />,
                  },
                  {
                    label: `Thanh toán`,
                    key: '3',
                    children: <TabThanhToan />,
                  },
                  {
                    label: `Thông báo`,
                    key: '4',
                    children: <TabThongBao />,
                  },
                  {
                    label: `Mail Server`,
                    key: '5',
                    children: <TabMailServer />,
                  },
                ]}
              />
            </Form>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
