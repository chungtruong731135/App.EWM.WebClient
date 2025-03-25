import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../app/modules/auth';
import { Languages } from './Languages';
import { toAbsoluteUrl } from '../../../helpers';

import { FILE_URL } from '@/utils/baseAPI';
import ModalChangePassword from '@/app/components/ModalChangePassword';

const HeaderUserMenu: FC = () => {
  const { currentUser, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalChangePassVisible, setModalChangePassVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px" data-kt-menu="true">
      <div className="menu-item px-3">
        <div className="menu-content d-flex align-items-center px-3">
          <div className="symbol symbol-50px me-5">
            <img alt="Logo" src={currentUser?.imageUrl ? `${toAbsoluteUrl(FILE_URL + currentUser?.imageUrl)}` : toAbsoluteUrl('media/images/avatar-empty.jpg')} />
          </div>

          <div className="d-flex flex-column">
            <div className="fw-bolder d-flex align-items-center fs-5">
              {currentUser?.fullName || currentUser?.firstName + ' ' + currentUser?.lastName}
              <span className="badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2">Pro</span>
            </div>
            <a href="#" className="fw-bold text-muted text-hover-primary fs-7">
              {currentUser?.userName}
            </a>
          </div>
        </div>
      </div>

      <div className="separator my-2"></div>

      <div className="menu-item px-5">
        <a
          className="menu-link px-5"
          onClick={() => {
            navigate('/system/myprofile');
          }}
        >
          <span className="menu-text">Thông tin cá nhân</span>
        </a>
      </div>

      <div className="menu-item px-5">
        <a className="menu-link px-5" onClick={() => setModalChangePassVisible(true)}>
          <span className="menu-text">Đổi mật khẩu</span>
        </a>
      </div>

      <div className="menu-item px-5">
        <a onClick={logout} className="menu-link px-5">
          Đăng xuất
        </a>
      </div>
      {modalChangePassVisible ? <ModalChangePassword modalVisible={modalChangePassVisible} setModalVisible={setModalChangePassVisible} /> : <></>}
    </div>
  );
};

export { HeaderUserMenu };
