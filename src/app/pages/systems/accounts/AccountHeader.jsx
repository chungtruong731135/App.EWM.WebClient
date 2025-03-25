/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { KTIcon, toAbsoluteUrl } from '@/_metronic/helpers';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FILE_URL } from '@/utils/baseAPI';
import dayjs from 'dayjs';

import * as actionsGlobal from '@/setup/redux/global/Actions';

const UsersPage = () => {
  const random = useSelector(state => state.modal.random);
  const dispatch = useDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();
  let location = useLocation();

  const [dataUser, setDataUser] = useState(null);
  const [dataThongKe, setDataThongKe] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await requestGET(`api/users/${userId}`);
        setDataUser(res);
        dispatch(actionsGlobal.setUserDetails(res));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        dispatch(actionsGlobal.setUserDetails(null));
      }
    };

    const fetchThongKeUser = async () => {
      try {
        setLoading(true);
        const res = await requestPOST(`api/v1/users/thong-ke-thong-tin`, { userId: userId });
        setDataThongKe(res?.data ?? null);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
    fetchThongKeUser();

    return () => {};
  }, [random, userId]);

  return (
    <>
      <div className="card mb-5">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                if (location?.state?.pathname) {
                  navigate(location?.state?.pathname, { replace: true });
                } else {
                  navigate(-1);
                }
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0 mb-lg-0">{'Thông tin người dùng'}</h3>
          </div>
          <div className="card-toolbar">
            {/*  <button className="btn btn-primary btn-sm py-2 me-2">
              <span>
                <i className="fas fa-save me-2"></i>
                <span className="">Lưu cấu hình</span>
              </span>
            </button> */}
          </div>
        </div>
        <div className="card-body pt-9 pb-0">
          <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
            <div className="me-7 mb-4">
              <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                <img
                  src={
                    dataUser?.imageUrl
                      ? dataUser?.imageUrl.includes('https://') || dataUser?.imageUrl.includes('http://')
                        ? dataUser?.imageUrl
                        : FILE_URL + `${dataUser?.imageUrl.startsWith('/') ? dataUser?.imageUrl.substring(1) : dataUser?.imageUrl}`
                      : toAbsoluteUrl('media/images/avatar-empty.jpg')
                  }
                  alt={dataUser?.fullName}
                />
                <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px"></div>
              </div>
            </div>

            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-gray-800 text-hover-primary fs-2 fw-bolder me-1">{dataUser?.fullName}</span>
                    <span>
                      <KTIcon iconName="verify" className="fs-1 text-primary" />
                    </span>
                    {/* <span className="btn btn-sm btn-light-success fw-bolder ms-2 fs-8 py-1 px-3" data-bs-toggle="modal" data-bs-target="#kt_modal_upgrade_plan">
                      Upgrade to Pro
                    </span> */}
                  </div>

                  <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                    {dataUser?.gender && (
                      <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                        <KTIcon iconName="profile-circle" className="fs-4 me-1" />
                        {dataUser?.gender}
                      </span>
                    )}
                    {dataUser?.phoneNumber && (
                      <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                        <KTIcon iconName="phone" className="fs-4 me-1" />
                        {dataUser?.phoneNumber}
                      </span>
                    )}
                    {dataUser?.email && (
                      <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                        <KTIcon iconName="sms" className="fs-4 me-1" />
                        {dataUser?.email}
                      </span>
                    )}
                    {dataUser?.dateOfBirth && (
                      <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                        <KTIcon iconName="calendar" className="fs-4 me-1" />
                        {dataUser?.dateOfBirth ? dayjs(dataUser.dateOfBirth).format('DD/MM/YYYY') : ''}
                      </span>
                    )}
                    {dataUser?.address && (
                      <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                        <KTIcon iconName="geolocation-home" className="fs-4 me-1" />
                        {dataUser?.address}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex my-4"></div>
              </div>

              <div className="d-flex flex-wrap flex-stack">
                <div className="d-flex flex-column flex-grow-1 pe-8">
                  <div className="d-flex flex-wrap">
                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <KTIcon iconName="faceid" className="fs-3 text-success me-2" />
                        <div className="fs-2 fw-bolder">{dataThongKe?.soLanDangNhap ?? 0}</div>
                      </div>

                      <div className="fw-bold fs-6 text-gray-500">Số lần đăng nhập</div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <KTIcon iconName="book-square" className="fs-3 text-danger me-2" />
                        <div className="fs-2 fw-bolder">{dataThongKe?.soLanLamDe ?? 0}</div>
                      </div>

                      <div className="fw-bold fs-6 text-gray-500">Số lần làm đề</div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <KTIcon iconName="subtitle" className="fs-3 text-success me-2" />
                        <div className="fs-2 fw-bolder">{dataThongKe?.soLuongKhoaHocDangKy ?? 0}</div>
                      </div>

                      <div className="fw-bold fs-6 text-gray-500">Số khoá học</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex overflow-auto h-55px">
            <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap">
              <li className="nav-item">
                <Link className={`nav-link text-active-primary me-6 ` + (location.pathname.includes('overview') && 'active')} to={`/system/account/${userId}/overview`}>
                  Tổng quan
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link text-active-primary me-6 ` + (location.pathname.includes('courses') && 'active')} to={`/system/account/${userId}/courses`}>
                  Khoá học
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link text-active-primary me-6 ` + (location.pathname.includes('loginlogs') && 'active')} to={`/system/account/${userId}/loginlogs`}>
                  Nhật ký đăng nhập
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
