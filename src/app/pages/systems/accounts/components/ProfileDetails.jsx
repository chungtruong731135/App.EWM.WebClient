import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const UsersPage = () => {
  const userDetails = useSelector(state => state.global.userDetails);

  return (
    <>
      <div className="card mb-5 mb-xl-10">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 my-3">{'Thông tin cơ bản'}</h3>
          <div className="card-toolbar"></div>
        </div>
        <div className="card-body pt-9 pb-0">
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Họ và tên</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900">{userDetails?.fullName}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Tài khoản đăng nhập</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900">{userDetails?.userName}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Số điện thoại liên hệ</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900">{userDetails?.phoneNumber}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Email liên hệ</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900">{userDetails?.email}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Giới tính</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900">{userDetails?.gender}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Ngày sinh</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900"> {userDetails?.dateOfBirth ? dayjs(userDetails.dateOfBirth).format('DD/MM/YYYY') : ''}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Địa chỉ</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900">{userDetails?.address}</span>
            </div>
          </div>
          <div className="row mb-3 td-row-dashed">
            <label className="col-lg-4 fw-bold text-muted">Ngày tham gia</label>
            <div className="col-lg-8">
              <span className="fw-bold fs-6 text-gray-900"> {userDetails?.createdOn ? dayjs(userDetails.createdOn).format('DD/MM/YYYY') : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
