/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Select } from "antd";
import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsList from "./components/ItemsList";

const employeeStatus = [
  {
    name: "Tất cả",
    id: -1,
  },
  {
    name: "Đang hoạt động",
    id: 0,
  },
  {
    name: "Chưa kích hoạt",
    id: 1,
  },
];

const UsersPage = (props) => {
  const dispatch = useDispatch();

  const [dataSearch, setDataSearch] = useState({ type: props?.type ?? null });

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
            {"Người dùng hệ thống"}
          </h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-200px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Tìm kiếm nhanh trong danh sách"
                onChange={(e) => {
                  setDataSearch({
                    ...dataSearch,
                    keyword: e.target.value,
                  });
                }}
              />
            </div>
            <div className="btn-group align-items-center mx-3 w-300px  ">
              <span className="fw-bold w-50px">Trạng thái:</span>
              <div className="ms-2 w-100">
                <Select
                  defaultValue={-1}
                  placeholder=""
                  style={{ width: "100%" }}
                  options={(employeeStatus || []).map((d) => ({
                    value: d?.id,
                    label: d?.name,
                  }))}
                  onChange={(value, current) => {
                    if (value == 0 || value == 1) {
                      setDataSearch({
                        ...dataSearch,
                        isActive:
                          current?.value == -1
                            ? null
                            : current?.value == 0
                            ? true
                            : false,
                      });
                    } else {
                      setDataSearch({ ...dataSearch, isActive: null });
                    }
                  }}
                />
              </div>
            </div>
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
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
