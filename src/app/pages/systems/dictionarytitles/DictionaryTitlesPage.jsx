/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input } from "antd";
import Collapse from "react-bootstrap/Collapse";

import * as actionsModal from "@/setup/redux/modal/Actions";

import ItemsList from "./components/ItemsList";

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
            {"Danh mục sổ tay"}
          </h3>
          <div className="card-toolbar">
            <div className="btn-group me-2 w-200px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập từ khoá tìm kiếm"
                onChange={(e) => {
                  setDataSearch({ ...dataSearch, keyword: e.target.value });
                }}
              />
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
        <div>
          <Collapse in={open}>
            <div className="card card-body">
              <Form form={form} autoComplete="off">
                <div className="row">
                  <div className="col-xl-6 col-lg-6">
                    <FormItem label="Từ khoá" name="keyword">
                      <Input placeholder="" />
                    </FormItem>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-2"
                      onClick={TimKiem}
                    >
                      <span>
                        <i className="fas fa-search"></i>
                        <span className="">Tìm kiếm</span>
                      </span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm m-btn m-btn--icon py-2 me-2"
                      onClick={() => {
                        form.resetFields();
                        setDataSearch(null);
                        dispatch(actionsModal.setDataSearch(null));
                      }}
                    >
                      <span>
                        <i className="fas fa-sync"></i>
                        <span className="">Tải lại</span>
                      </span>
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </Collapse>
        </div>
        <ItemsList dataSearch={dataSearch} />
      </div>
    </>
  );
};

export default UsersPage;
