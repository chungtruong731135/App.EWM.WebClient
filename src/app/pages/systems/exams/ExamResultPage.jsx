/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Select } from "antd";
import Collapse from "react-bootstrap/Collapse";

import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsResultList from "./components/ItemsResultList";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestGET } from "@/utils/baseAPI";

const FormItem = Form.Item;

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();

  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const [dataSearch, setDataSearch] = useState(null);
  const [dataExam, setDataExam] = useState(null);
  useEffect(() => {
    const fetchData = async (id) => {
      const res = await requestGET(`api/v1/exams/${id}`);
      setDataExam(res?.data ?? null);
    };
    var examId = searchParams.get("examId");
    // var courseId = searchParams.get("courseId");
    if (examId) {
      fetchData(examId);
      setDataSearch({ ...dataSearch, examId: examId });
    }
  }, [searchParams]);
  const TimKiem = () => {
    const formData = form.getFieldsValue(true);
    setDataSearch(formData);
  };

  return (
    <>
      <div className="card card-xl-stretch mb-xl-3">
        <div className="px-3 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a
              className="btn btn-icon btn-active-light-primary btn-sm me-1 rounded-circle"
              data-toggle="m-tooltip"
              title="Trở về"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa fa-arrow-left fs-2 text-gray-600"></i>
            </a>
            <h3 className="card-title fw-bolder text-header-td fs-2 mb-0">
              Kết quả - {dataExam?.title}
            </h3>
          </div>
        </div>
      </div>
      <div className="card card-xl-stretch mb-xl-9">
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex flex-column">
            <div className="fs-5 text-gray-800">
              Tổng số người tham gia thi:{" "}
              <span className="fw-bold text-danger">0</span>
            </div>
            <div className="fs-5 text-gray-800 ">
              Tổng số người đạt điểm max:{" "}
              <span className="fw-bold text-danger">0</span>
            </div>
          </div>
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
            <div className="btn-group align-items-center mx-3">
              <span className="fw-bold">Kết quả thi:</span>
              <div className="ms-2 w-xl-200px w-lg-150px">
                <Select
                  placeholder="Chọn"
                  style={{ width: "100%" }}
                  options={[
                    {
                      value: "",
                      label: "Tất cả",
                    },
                    {
                      value: "1",
                      label: "Đạt",
                    },
                    {
                      value: "2",
                      label: "Không đạt",
                    },
                  ]}
                />
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm py-2 me-2"
              onClick={() => {}}
            >
              <span>
                <i className="fas fa-print me-2"></i>
                <span className="">In danh sách</span>
              </span>
            </button>
          </div>
        </div>
        <div></div>
        <ItemsResultList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
