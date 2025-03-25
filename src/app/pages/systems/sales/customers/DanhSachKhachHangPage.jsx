/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/DanhSachKhachHangList';
import { useAuth } from '@/app/modules/auth';
import { CheckRole } from '@/utils/utils';

const UsersPage = props => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;
  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách khách hàng'}</h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-200px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Tìm kiếm nhanh trong danh sách"
                onChange={e => {
                  setDataSearch({
                    ...dataSearch,
                    keyword: e.target.value,
                  });
                }}
              />
            </div>
            {(CheckRole(currentPermissions, ['Permissions.Users.Manage']) || CheckRole(currentPermissions, ['Permissions.Students.Manage'])) && (
              <button
                className="btn btn-primary btn-sm py-2 me-2"
                onClick={() => {
                  dispatch(actionsModal.setDataModal({ ...null, readOnly: false }));
                  dispatch(actionsModal.setModalVisible(true));
                }}
              >
                <span>
                  <i className="fas fa-plus  me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            )}
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
