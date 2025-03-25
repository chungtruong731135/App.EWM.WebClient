import { useState } from "react";
import { useDispatch } from "react-redux";

import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsList from "./components/ItemsList";
import TDSelect from "@/app/components/TDSelect";
import { requestPOST } from "@/utils/baseAPI";

import ModalCopyData from "./components/ModalCopyData";

const UsersPage = () => {
  const dispatch = useDispatch();
  const [dataSearch, setDataSearch] = useState(null);
  const [modalCopyVisible, setModalCopyVisible] = useState(false);

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
            {"Khóa học"}
          </h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-xl-250px w-lg-200px mb-lg-2">
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
            <div className="btn-group align-items-center mx-3 mb-lg-2">
              <span className="fw-bold">Kỳ thi:</span>
              <TDSelect
                reload={true}
                placeholder="Chọn kỳ thi"
                fetchOptions={async (keyword) => {
                  const res = await requestPOST(`api/v1/examinats/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                  });
                  return res?.data?.map((item) => ({
                    ...item,
                    label: `${item.title}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: 250,
                  marginLeft: 20,
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({ ...dataSearch, examinatId: current?.id });
                  } else {
                    setDataSearch({ ...dataSearch, examinatId: null });
                  }
                }}
              />
            </div>
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
                dispatch(
                  actionsModal.setCourseDetail({ ...null, readOnly: false })
                );
                dispatch(actionsModal.setCourseDetailModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
          </div>
        </div>

        <ItemsList dataSearch={dataSearch} />
      </div>
      {modalCopyVisible ? (
        <ModalCopyData
          modalVisible={modalCopyVisible}
          setModalVisible={setModalCopyVisible}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default UsersPage;
