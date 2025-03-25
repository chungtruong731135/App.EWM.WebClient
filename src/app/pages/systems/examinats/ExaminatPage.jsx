/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsList from "./components/ItemsList";
import ModalCopyData from "./components/ModalCopyData";

const UsersPage = () => {
  const dispatch = useDispatch();
  const [modalCopyVisible, setModalCopyVisible] = useState(false);

  const [dataSearch, setDataSearch] = useState(null);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
            {"Kỳ thi"}
          </h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-xl-250px w-lg-200px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập từ khoá tìm kiếm"
                onChange={(e) => {
                  setDataSearch({
                    ...dataSearch,
                    keyword: e.target.value,
                  });
                }}
              />
            </div>
            {/*             <button
              className="btn btn-info btn-sm py-2 me-2"
              onClick={() => {
                setModalCopyVisible(true);
              }}
            >
              <span>
                <i className="fas fa-copy"></i>
                <span className="ms-1">Sao chép</span>
              </span>
            </button> */}
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
                <i className="fas fa-plus  me-2"></i>
                <span className="ms-1">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>
        <div></div>
        <ItemsList dataSearch={dataSearch} />
        {modalCopyVisible ? (
          <ModalCopyData
            modalVisible={modalCopyVisible}
            setModalVisible={setModalCopyVisible}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default UsersPage;
