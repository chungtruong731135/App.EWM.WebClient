/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actionsModal from '@/setup/redux/modal/Actions';

import ItemsList from './components/ItemsList';
import TDSelect from '@/app/components/TDSelect';
import { requestPOST } from '@/utils/baseAPI';
import { CheckRole } from '@/utils/utils';
import { useAuth } from '@/app/modules/auth';

import ModalCopyData from './components/ModalCopyData';

const UsersPage = props => {
  const { type } = props;
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const currentPermissions = currentUser?.permissions;
  const [dataSearch, setDataSearch] = useState(null);

  const [modalCopyVisible, setModalCopyVisible] = useState(false);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Lớp học online'}</h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-xl-250px w-lg-200px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập từ khoá tìm kiếm"
                onChange={e => {
                  setDataSearch({
                    ...dataSearch,
                    keyword: e.target.value,
                  });
                }}
              />
            </div>
            <div className="btn-group mx-2 align-items-center w-xl-400px w-lg-350px">
              <span className="fw-bold  w-100px">Khoá học:</span>
              <div className="ms-2 w-100">
                <TDSelect
                  reload={true}
                  showSearch
                  placeholder="Chọn khoá học"
                  fetchOptions={async keyword => {
                    const res = await requestPOST(`api/v1/courseonlines/search`, {
                      pageNumber: 1,
                      pageSize: 100,
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
                  }}
                  onChange={(value, current) => {
                    if (value) {
                      setDataSearch({ ...dataSearch, courseId: current?.id });
                    } else {
                      setDataSearch({ ...dataSearch, courseId: null });
                    }
                  }}
                />
              </div>
            </div>
            {CheckRole(currentPermissions, ['Permissions.CourseClasses.Manage']) ? (
              <>
                <button
                  className="btn btn-info btn-sm py-2 me-2"
                  onClick={() => {
                    setModalCopyVisible(true);
                  }}
                >
                  <span>
                    <i className="fas fa-copy"></i>
                    <span className="ms-1">Sao chép</span>
                  </span>
                </button>
                <button
                  className="btn btn-primary btn-sm py-2 me-2"
                  onClick={() => {
                    dispatch(actionsModal.setCourseOnlineClassDetail({ ...null, readOnly: false }));
                    dispatch(actionsModal.setCourseOnlineClassDetailModalVisible(true));
                  }}
                >
                  <span>
                    <i className="fas fa-plus me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} type={type} />
      </div>
      <ModalCopyData modalVisible={modalCopyVisible} setModalVisible={setModalCopyVisible} />
    </>
  );
};

export default UsersPage;
