/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';

import ItemsList from './components/ItemsList';
import { requestPOST } from '@/utils/baseAPI';
import TDSelect from '@/app/components/TDSelect';

const UsersPage = () => {
  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Trước kỳ thi'}</h3>
          {/* <div className="card-toolbar">
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {
                dispatch(
                  actionsModal.setDataModal({ ...null, readOnly: false })
                );
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div> */}
        </div>
        <div className="row g-5 my-2">
          <div className="col-xl-4 col-lg-6 px-5">
            <div className="btn-group me-2 w-100">
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
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold w-100px">Khoá học:</span>
            <div className="ms-2 w-100">
              <TDSelect
                showSearch
                reload={true}
                placeholder="Chọn khoá học"
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/v1/courses/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                    type: 3,
                  });
                  return res?.data?.map(item => ({
                    ...item,
                    label: `${item.title}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                  height: 'auto',
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
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold w-100px">CTV/Đại lý:</span>
            <div className="ms-2 w-100">
              <TDSelect
                reload
                showSearch
                placeholder=""
                fetchOptions={async keyword => {
                  const res = await requestPOST(`api/users/search`, {
                    pageNumber: 1,
                    pageSize: 20,
                    keyword: keyword,
                    types: [4, 5],
                    isActive: true, 
                  });
                  return res.data.map(item => ({
                    ...item,
                    label: `${item.fullName} - ${item.userName}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: '100%',
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, userId: current?.id });
                  } else {
                    setDataSearch({ ...dataSearch, userId: null });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} path="danh-sach-mua-khoa-hoc" type={null} />
      </div>
    </>
  );
};

export default UsersPage;
