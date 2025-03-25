/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as actionsModal from '@/setup/redux/modal/Actions';
import { Form, Spin } from 'antd';
import { Tab, Tabs } from 'react-bootstrap';
//import {toAbsoluteUrl} from '@/utils/AssetHelpers';

import { requestGET } from '@/utils/baseAPI';

import ProfileSidebar from './components/ProfileSidebar';
import ProfileOverview from './components/ProfileOverview';
import ProfileApplications from './components/ProfileApplications';
import ProfileEmployeeInfo from './components/ProfileEmployeeInfo';
import ProfileUserInfo from './components/ProfileUserInfo';
import ModalItem from './components/ChiTietModal';

const UserViewPage = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalVisible = useSelector(state => state.modal.modalVisible);
  const random = useSelector(state => state.modal.random);

  const [form] = Form.useForm();

  const [data, setData] = useState(null);
  const { id } = useParams();
  const [key, setKey] = useState('overview');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await requestGET(`api/v1/employees/${id}`);

      if (res && res.data) {
        setData(res.data);
      }
      setLoading(false);
    };
    if (id) {
      fetchData();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, random]);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 border-bottom1 border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">{`Thông tin nhân viên`}</h3>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-2"
              onClick={() => {
                //onFinish();
                dispatch(actionsModal.setDataModal(data));
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-user-pen me-2"></i>
                <span className="">Sửa thông tin</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" autoComplete="off">
          {/*begin::Layout*/}
          <div className="d-flex flex-column flex-lg-row">
            {/*begin::Sidebar*/}
            <ProfileSidebar dataUserDetails={data} />
            {/*end::Sidebar*/}

            {/*begin::Content*/}
            <div className="flex-lg-row-fluid ms-lg-5">
              <Tabs id="controlled-tab-example" activeKey={key} onSelect={k => setKey(k)} className="nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-semibold mb-8">
                <Tab eventKey="overview" title="Thông tin chung">
                  <ProfileOverview dataUserDetails={data} />
                </Tab>
                <Tab eventKey="employee-info" title="Thông tin nhân viên">
                  <ProfileEmployeeInfo dataUserDetails={data} />
                </Tab>
                <Tab eventKey="user-info" title="Thông tin người dùng">
                  <ProfileUserInfo dataUserDetails={data} />
                </Tab>
                <Tab eventKey="applications" title="Ứng dụng">
                  <ProfileApplications dataUserDetails={data} />
                </Tab>
                <Tab eventKey="user-group" title="Nhóm" disabled>
                  <ProfileSidebar dataUserDetails={data} />
                </Tab>
              </Tabs>

              {/*end:::Tab content*/}
            </div>
            {/*end::Content*/}
          </div>
          {/*end::Layout*/}
        </Form>
      </Spin>
      {modalVisible ? <ModalItem /> : <></>}
    </>
  );
};

export default UserViewPage;
