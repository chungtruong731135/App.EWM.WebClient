/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Select } from "antd";
import Collapse from "react-bootstrap/Collapse";

import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsList from "./components/ItemsList";
import TDSelect from "@/app/components/TDSelect";
import { requestPOST } from "@/utils/baseAPI";

const FormItem = Form.Item;

const UsersPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const [dataSearch, setDataSearch] = useState(null);

  const TimKiem = () => {
    const formData = form.getFieldsValue(true);
    setDataSearch(formData);
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
          <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
            {"Đề thi"}
          </h3>
          <div className="card-toolbar">
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
          </div>
        </div>
        <div className="row g-5 my-2">
          <div className="col-xl-4 col-lg-6 px-5">
            <div className="btn-group me-2 w-100">
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
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold w-100px">Kỳ thi:</span>
            <div className="ms-2 w-100">
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
                  width: "100%",
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
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Khối lớp:</span>
            <div className="ms-2 w-100">
              <TDSelect
                reload
                mode="multiple"
                placeholder="Chọn khối lớp"
                fetchOptions={async (keyword) => {
                  const res = await requestPOST(`api/v1/categories/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    categoryGroupCode: "KhoiLop",
                  });
                  return res?.data?.map((item) => ({
                    ...item,
                    label: `${item.name}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: "100%",
                  height: "auto",
                }}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      gradeIds: current?.map((i) => i?.id),
                    });
                  } else {
                    setDataSearch({ ...dataSearch, gradeIds: null });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Cấp độ:</span>
            <div className="ms-2 w-100 ">
              <TDSelect
                reload={true}
                showSearch
                placeholder="Chọn cấp độ"
                fetchOptions={async (keyword) => {
                  const res = await requestPOST(`api/v1/examareas/search`, {
                    pageNumber: 1,
                    pageSize: 100,
                    keyword: keyword,
                  });
                  return res?.data?.map((item) => ({
                    ...item,
                    label: `${item.name}`,
                    value: item.id,
                  }));
                }}
                style={{
                  width: "100%",
                }}
                value={dataSearch?.examAreaId ?? null}
                onChange={(value, current) => {
                  if (value) {
                    setDataSearch({
                      ...dataSearch,
                      examAreaId: current?.id,
                    });
                  } else {
                    setDataSearch({ ...dataSearch, examAreaId: null });
                  }
                }}
              />
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 btn-group align-items-center px-5">
            <span className="fw-bold  w-100px">Loại kỳ thi:</span>
            <div className="ms-2 w-100 ">
              <Select
                allowClear
                placeholder="Chọn"
                style={{ width: "100%" }}
                options={[
                  {
                    value: 0,
                    label: "Đề luyện tập theo chương trình học",
                  },
                  {
                    value: 1,
                    label: "Đề thi thử",
                  },
                  {
                    value: 2,
                    label: "Đề kiểm tra kiến thức",
                  },
                  {
                    value: 3,
                    label: "Đề luyện thi, đánh giá (Hệ thống tạo tự động)",
                  },
                  {
                    value: 4,
                    label: "Đề luyện theo chuyên đề (Hệ thống tạo tự động)",
                  },
                ]}
                onChange={(value) => {
                  setDataSearch({
                    ...dataSearch,
                    type: value,
                  });
                }}
              />
            </div>
          </div>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
